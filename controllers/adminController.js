const mongoose = require('mongoose');
const asyncHandler = require('../middleware/asyncHandler');
const ErrorResponse = require('../utils/ErrorResponse');
const logger = require('../utils/logger');
const User = require('../models/User');
const Batch = require('../models/Batch');
const Module = require('../models/Module');
const Hall = require('../models/Hall');
const Lecturer = require('../models/Lecturer');
const Timetable = require('../models/Timetable');
const TimeSlotChangeRequest = require('../models/TimeSlotChangeRequest');
const { 
  getAvailableDays, 
  calculateSessions, 
  isHallSuitable, 
  checkTimeConflicts 
} = require('../utils/timetableUtils');
const {
  validateBeforeGeneration: validationValidateBeforeGeneration,
  checkAdvancedConflicts,
  analyzeStudentWorkload,
  reserveExamPreparationTime
} = require('../utils/validationUtils');

// Get all batches
exports.getBatches = asyncHandler(async (req, res) => {
  try {
    const batches = await Batch.find()
      .populate('modules', 'module_name credit_hours')
      .sort({ batch_name: 1 });

    res.status(200).json({
      success: true,
      data: batches
    });
  } catch (error) {
    console.error('Error fetching batches:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching batches',
      error: error.message
    });
  }
});

// Add a new user (student or lecturer)
exports.addUser = asyncHandler(async (req, res) => {
  const { username, password, email, role, name, ...additionalInfo } = req.body;
  
  // Create base user object
  const userObj = {
    username,
    email,
    role,
    name
  };

  // Only add password for non-lecturer users
  if (role !== 'lecturer') {
    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required for non-lecturer users'
      });
    }
    userObj.password = password;
  }

  const user = await User.create(userObj);

  if (role === 'lecturer') {
    if (!additionalInfo.department || !additionalInfo.rank || !additionalInfo.phone_number) {
      await User.findByIdAndDelete(user._id);
      return res.status(400).json({
        success: false,
        message: 'Department, rank, and phone number are required for lecturers'
      });
    }

    await Lecturer.create({
      user: user._id,
      name: name,
      email: email,
      rank: additionalInfo.rank,
      phone_number: additionalInfo.phone_number,
      department: additionalInfo.department,
      specialization: additionalInfo.specialization || []
    });
  }

  res.status(201).json({
    success: true,
    data: user
  });
});

// Add a new batch
exports.addBatch = asyncHandler(async (req, res) => {
  try {
    console.log('Received batch data:', req.body);
    
    // Validate required fields
    const { batch_name, department, academic_year, num_of_students, semester, weekend_or_weekday, modules, group_count } = req.body;
    
    if (!batch_name || !department || !academic_year || !num_of_students || !semester || !weekend_or_weekday) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate semester range
    if (semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be between 1 and 8'
      });
    }

    // Check if batch name already exists
    const existingBatch = await Batch.findOne({ batch_name });
    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: 'A batch with this name already exists'
      });
    }

    // Generate a unique batch code
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const batchCode = `BATCH${year}${randomNum}`;
    
    // Create the batch
    const batch = await Batch.create({
      batch_name,
      department,
      academic_year: Number(academic_year),
      num_of_students: Number(num_of_students),
      semester: Number(semester),
      weekend_or_weekday,
      modules: modules || [],
      group_count: Number(group_count) || 1,
      batch_code: batchCode
    });

    console.log('Batch created successfully:', batch);

    res.status(201).json({
      success: true,
      data: batch,
      message: `Batch created successfully. Batch Code: ${batchCode}`
    });
  } catch (error) {
    console.error('Error creating batch:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        details: validationErrors
      });
    }

    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'A batch with this name or code already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating batch',
      details: error.message
    });
  }
});

// Add a new hall
exports.addHall = asyncHandler(async (req, res) => {
  const hall = await Hall.create(req.body);
  res.status(201).json({
    success: true,
    data: hall
  });
});

// @desc    Add a new module
// @route   POST /api/admin/modules
// @access  Private/Admin
exports.addModule = asyncHandler(async (req, res) => {
  try {
    const { module_name, credit_hours, specialization, is_lab, lecturer_ids, batch_ids } = req.body;

    // Validate input
    if (!module_name || !credit_hours || !specialization || !lecturer_ids || !batch_ids) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Verify lecturers exist
    const lecturers = await Lecturer.find({ _id: { $in: lecturer_ids } });
    if (lecturers.length !== lecturer_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more lecturer IDs are invalid'
      });
    }

    // Verify batches exist
    const batches = await Batch.find({ _id: { $in: batch_ids } });
    if (batches.length !== batch_ids.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more batch IDs are invalid'
      });
    }

    // Create the module
    const module = await Module.create({
      module_name,
      credit_hours,
      specialization,
      is_lab: is_lab || false,
      lecturers: lecturer_ids
    });

    // Update batches with the new module
    await Promise.all(batch_ids.map(async (batchId) => {
      await Batch.findByIdAndUpdate(
        batchId,
        { $addToSet: { modules: module._id } },
        { new: true }
      );
    }));

    // Update module with batch references
    module.batches = batch_ids;
    await module.save();

    // Fetch the complete module data with populated references
    const populatedModule = await Module.findById(module._id)
      .populate('lecturers')
      .populate('batches');

    res.status(201).json({
      success: true,
      data: populatedModule
    });

  } catch (error) {
    console.error('Error adding module:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding module',
      error: error.message
    });
  }
});

// @desc    Get modules with lecturer and batch information
// @route   GET /api/admin/modules
// @access  Private/Admin
exports.getModules = asyncHandler(async (req, res) => {
  const modules = await Module.find()
    .populate('lecturers', 'name rank specialization')
    .populate('batches', 'batch_name department');

  res.status(200).json({
    success: true,
    data: modules
  });
});

// @desc    Get all timetable entries
// @route   GET /api/admin/timetable
// @access  Private/Admin
exports.getTimetable = asyncHandler(async (req, res) => {
  try {
    const timetable = await Timetable.find()
      .populate({
        path: 'batch',
        select: 'batch_name',
        options: { lean: true }
      })
      .populate({
        path: 'module',
        select: 'module_name credit_hours',
        populate: {
          path: 'lecturers',
          model: 'Lecturer',
          select: 'name',
          options: { lean: true }
        },
        options: { lean: true }
      })
      .populate({
        path: 'lecturer',
        select: 'name',
        options: { lean: true }
      })
      .populate({
        path: 'hall',
        select: 'hall_name',
        options: { lean: true }
      })
      .sort({ day: 1, timeSlot: 1 })
      .lean();

    // Format the response to include lecturer name from module
    const formattedTimetable = timetable.map(entry => {
      const timetableEntry = entry;
      const lecturerName = timetableEntry.module?.lecturers?.[0]?.name || 'Unknown Lecturer';
      
      return {
        ...timetableEntry,
        module_name: timetableEntry.module?.module_name || 'Unknown Module',
        batch_name: timetableEntry.batch?.batch_name || 'Unknown Batch',
        hall_name: timetableEntry.hall?.hall_name || 'Unknown Hall',
        lecturer: lecturerName
      };
    });

    // Log the response for debugging
    console.log('Sending timetable response:', {
      success: true,
      count: formattedTimetable.length,
      data: formattedTimetable
    });

    // Ensure we're sending an array
    res.status(200).json({
      success: true,
      count: formattedTimetable.length,
      data: Array.isArray(formattedTimetable) ? formattedTimetable : Object.values(formattedTimetable)
    });
  } catch (error) {
    console.error('Error in getTimetable:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timetable',
      error: error.message
    });
  }
});

// @desc    Generate timetable
// @route   POST /api/admin/timetable/generate
// @access  Private/Admin
exports.generateTimetable = asyncHandler(async (req, res) => {
  try {
    // Clear existing timetable entries
    await Timetable.deleteMany({});
    console.log('Cleared existing timetable entries');

    // Fetch all required data with proper population
    const batches = await Batch.find()
      .populate({
        path: 'modules',
        select: 'module_name credit_hours is_lab',
        populate: {
          path: 'lecturers',
          model: 'Lecturer',
          select: 'name _id specialization'
        }
      });

    const halls = await Hall.find().sort({ capacity: -1 });
    const lecturers = await Lecturer.find().populate('user', 'name');

    // Basic validation
    if (!batches || batches.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No batches found. Please add batches first.'
      });
    }

    if (!halls || halls.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No halls found. Please add halls first.'
      });
    }

    // Validate that all batches have modules
    const batchesWithoutModules = batches.filter(batch => !batch.modules || batch.modules.length === 0);
    if (batchesWithoutModules.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Some batches have no modules assigned',
        details: batchesWithoutModules.map(batch => batch.batch_name)
      });
    }

    // Validate that all modules have lecturers
    const modulesWithoutLecturers = batches.some(batch => 
      batch.modules.some(module => !module.lecturers || module.lecturers.length === 0)
    );
    if (modulesWithoutLecturers) {
      return res.status(400).json({
        success: false,
        message: 'Some modules have no lecturers assigned'
      });
    }

    // Pre-generation validation
    const validationIssues = await validationValidateBeforeGeneration(batches, halls);
    if (validationIssues.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed before generation',
        issues: validationIssues
      });
    }

    const generatedEntries = [];
    const existingSlots = [];

    // Process each batch
    for (const batch of batches) {
      console.log(`Processing batch: ${batch.batch_name}`);
      
      // Get available days based on batch type
      const availableDays = getAvailableDays(batch);
      
      // Process each module for this batch
      for (const module of batch.modules) {
        console.log(`Processing module: ${module.module_name}`);
        
        // Calculate sessions needed
        const { totalSessions, regularSessions, hasPartialSession, sessionsPerWeek } = calculateSessions(module);
        
        // Get group count based on batch size and hall capacity
        const groupCount = Math.ceil(batch.num_of_students / halls[0].capacity);
        
        // Process each group
        for (let groupNum = 1; groupNum <= groupCount; groupNum++) {
          console.log(`Processing group ${groupNum} for ${module.module_name}`);
          
          let scheduledSessions = 0;
          let attempts = 0;
          const maxAttempts = 100; // Prevent infinite loops
          
          while (scheduledSessions < sessionsPerWeek && attempts < maxAttempts) {
            // Try each day
            for (const day of availableDays) {
              // Try each time slot
              for (const timeSlot of ['08:00-10:00', '10:00-12:00', '13:00-15:00', '15:00-17:00']) {
                // Find suitable lecturer
                const lecturer = module.lecturers.find(l => 
                  !existingSlots.some(s => 
                    s.lecturer._id.equals(l._id) && 
                    s.day === day && 
                    s.timeSlot === timeSlot
                  )
                );

                if (!lecturer) continue;

                // Find suitable hall
                const hall = halls.find(h => 
                  h.capacity >= Math.ceil(batch.num_of_students / groupCount) &&
                  !existingSlots.some(s => 
                    s.hall._id.equals(h._id) && 
                    s.day === day && 
                    s.timeSlot === timeSlot
                  )
                );

                if (!hall) continue;

                // Create proposed slot
                const proposedSlot = {
                  batch: batch._id,
                  module: module._id,
                  lecturer: lecturer._id,
                  hall: hall._id,
                  day,
                  timeSlot,
                  group: groupNum,
                  week: 1
                };

                // Check for conflicts
                const conflicts = checkAdvancedConflicts(proposedSlot, existingSlots);
                
                if (!conflicts.hasConflict) {
                  try {
                    // Create timetable entry
                    const entry = await Timetable.create(proposedSlot);
                    generatedEntries.push(entry);
                    existingSlots.push(proposedSlot);
                    scheduledSessions++;
                    console.log(`Scheduled ${module.module_name} for ${batch.batch_name} Group ${groupNum} with lecturer ${lecturer.name}`);
                    break;
                  } catch (error) {
                    console.error('Error creating timetable entry:', error);
                    continue;
                  }
                } else {
                  console.log(`Conflict detected for ${module.module_name}: ${conflicts.reasons.join(', ')}`);
                }
              }
              if (scheduledSessions >= sessionsPerWeek) break;
            }
            attempts++;
          }

          if (scheduledSessions < sessionsPerWeek) {
            console.log(`Warning: Could not schedule all sessions for ${module.module_name} Group ${groupNum}`);
          }
        }
      }
    }

    if (generatedEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Could not generate any timetable entries. Please check the constraints and try again.'
      });
    }

    // Apply exam preparation time
    const finalTimetable = reserveExamPreparationTime(generatedEntries);

    // Fetch the complete timetable with populated references
    const populatedEntries = await Timetable.find()
      .populate('batch', 'batch_name')
      .populate({
        path: 'module',
        select: 'module_name credit_hours',
        populate: {
          path: 'lecturers',
          model: 'Lecturer',
          select: 'name'
        }
      })
      .populate('lecturer', 'name')
      .populate('hall', 'hall_name')
      .sort({ day: 1, timeSlot: 1 });

    // Format the response
    const formattedEntries = populatedEntries.map(entry => {
      const timetableEntry = entry.toObject();
      const lecturerName = timetableEntry.module?.lecturers?.[0]?.name || 'Unknown Lecturer';
      
      return {
        ...timetableEntry,
        module_name: timetableEntry.module?.module_name || 'Unknown Module',
        batch_name: timetableEntry.batch?.batch_name || 'Unknown Batch',
        hall_name: timetableEntry.hall?.hall_name || 'Unknown Hall',
        lecturer: lecturerName
      };
    });

    res.status(200).json({
      success: true,
      count: generatedEntries.length,
      data: formattedEntries
    });

  } catch (error) {
    console.error('Error in timetable generation:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating timetable',
      error: error.message,
      stack: error.stack
    });
  }
});

// @desc    Update timetable slot
// @route   PUT /api/admin/timetable/:id
// @access  Private/Admin
exports.updateTimetableSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, timeSlot } = req.body;

    // Find the slot to update
    const slot = await Timetable.findById(id)
      .populate('batch', 'batch_name')
      .populate('module', 'module_name')
      .populate('lecturer', 'user')
      .populate('hall', 'hall_name');

    if (!slot) {
      return res.status(404).json({ message: 'Timetable slot not found' });
    }

    // Check for conflicts
    const conflicts = await Timetable.find({
      _id: { $ne: id },
      day,
      timeSlot,
      week: slot.week
    }).populate('batch', 'batch_name')
      .populate('module', 'module_name')
      .populate('lecturer', 'user')
      .populate('hall', 'hall_name');

    if (conflicts.length > 0) {
      const conflict = conflicts[0];
      let conflictType = '';
      let conflictData = {};

      if (conflict.batch?._id.equals(slot.batch?._id) && conflict.group === slot.group) {
        conflictType = 'BATCH_CONFLICT';
        conflictData = {
          batchName: conflict.batch?.batch_name,
          group: conflict.group,
          moduleName: conflict.module?.module_name
        };
      } else if (conflict.lecturer?._id.equals(slot.lecturer?._id)) {
        conflictType = 'LECTURER_CONFLICT';
        conflictData = {
          lecturerName: conflict.lecturer?.user?.name,
          moduleName: conflict.module?.module_name
        };
      } else if (conflict.hall?._id.equals(slot.hall?._id)) {
        conflictType = 'HALL_CONFLICT';
        conflictData = {
          hallName: conflict.hall?.hall_name,
          moduleName: conflict.module?.module_name
        };
      }

      return res.status(409).json({
        message: 'Conflict detected',
        type: conflictType,
        ...conflictData
      });
    }

    // Update the slot
    slot.day = day;
    slot.timeSlot = timeSlot;
    await slot.save();

    res.json(slot);
  } catch (error) {
    console.error('Error in updateTimetableSlot:', error);
    res.status(500).json({ message: 'Error updating timetable slot' });
  }
};

// Update a batch
exports.updateBatch = asyncHandler(async (req, res) => {
  try {
    const { batch_name, department, academic_year, num_of_students, semester, weekend_or_weekday, modules, group_count } = req.body;
    
    // Validate required fields
    if (!batch_name || !department || !academic_year || !num_of_students || !semester || !weekend_or_weekday) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate semester range
    if (semester < 1 || semester > 8) {
      return res.status(400).json({
        success: false,
        message: 'Semester must be between 1 and 8'
      });
    }

    const batch = await Batch.findByIdAndUpdate(
      req.params.id,
      {
        batch_name,
        department,
        academic_year: Number(academic_year),
        num_of_students: Number(num_of_students),
        semester: Number(semester),
        weekend_or_weekday,
        modules: modules || [],
        group_count: Number(group_count) || 1
      },
      { new: true, runValidators: true }
    );

    if (!batch) {
      return res.status(404).json({
        success: false,
        message: 'Batch not found'
      });
    }

    res.status(200).json({
      success: true,
      data: batch
    });
  } catch (error) {
    console.error('Error updating batch:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error updating batch',
      details: error.errors
    });
  }
});

// Delete a batch
exports.deleteBatch = asyncHandler(async (req, res) => {
  const batch = await Batch.findByIdAndDelete(req.params.id);

  if (!batch) {
    return res.status(404).json({
      success: false,
      message: 'Batch not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Batch deleted successfully'
  });
});

// @desc    Get all time slot change requests
// @route   GET /api/admin/change-requests
// @access  Private/Admin
exports.getChangeRequests = asyncHandler(async (req, res) => {
  try {
    const requests = await TimeSlotChangeRequest.find()
      .populate({
        path: 'timetableEntry',
        populate: [
          { path: 'batch' },
          { path: 'hall' },
          { path: 'module' }
        ]
      })
      .populate({
        path: 'lecturer',
        populate: { path: 'user', select: 'name email' }
      })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching change requests:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching change requests',
      error: error.message
    });
  }
});

// Add this function before handleChangeRequest
const checkAllConflicts = async (timetableEntryId, requestedDay, requestedTimeSlot) => {
  try {
    // Check for existing entries in the requested time slot
    const existingEntry = await Timetable.findOne({
      day: requestedDay,
      timeSlot: requestedTimeSlot,
      _id: { $ne: timetableEntryId }
    }).populate('module batch hall');

    if (existingEntry) {
      return {
        hasConflict: true,
        conflictDetails: {
          module: existingEntry.module?.module_name,
          batch: existingEntry.batch?.batch_name,
          hall: existingEntry.hall?.hall_name
        }
      };
    }

    return { hasConflict: false };
  } catch (error) {
    console.error('Error checking conflicts:', error);
    throw error;
  }
};

// Update the handleChangeRequest function
exports.handleChangeRequest = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    const changeRequest = await TimeSlotChangeRequest.findById(id)
      .populate('timetableEntry')
      .populate('timetableEntry.module')
      .populate('timetableEntry.batch')
      .populate('timetableEntry.hall');

    if (!changeRequest) {
      return res.status(404).json({
        success: false,
        message: 'Change request not found'
      });
    }

    if (changeRequest.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'This request has already been processed'
      });
    }

    if (status === 'Approved') {
      // Check for conflicts before approving
      const conflictCheck = await checkAllConflicts(
        changeRequest.timetableEntry._id,
        changeRequest.requestedDay,
        changeRequest.requestedTimeSlot
      );

      if (conflictCheck.hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'Cannot approve request due to scheduling conflict',
          conflictDetails: conflictCheck.conflictDetails
        });
      }

      // Update the timetable entry
      changeRequest.timetableEntry.day = changeRequest.requestedDay;
      changeRequest.timetableEntry.timeSlot = changeRequest.requestedTimeSlot;
      await changeRequest.timetableEntry.save();
    }

    // Update the change request status
    changeRequest.status = status;
    if (rejectionReason) {
      changeRequest.rejectionReason = rejectionReason;
    }
    await changeRequest.save();

    res.json({
      success: true,
      message: `Request ${status.toLowerCase()} successfully`,
      data: changeRequest
    });
  } catch (error) {
    console.error('Error handling change request:', error);
    res.status(500).json({
      success: false,
      message: 'Error handling change request',
      error: error.message
    });
  }
});

// Function to validate relationships between batches and modules
async function validateRelationships(Batch, Module) {
  const issues = [];

  // Check if all batches have modules assigned
  const batchesWithoutModules = await Batch.find({ modules: { $size: 0 } });
  if (batchesWithoutModules.length > 0) {
    issues.push({
      type: 'Batch',
      message: 'Some batches have no modules assigned',
      details: batchesWithoutModules.map(batch => batch.batch_name)
    });
  }

  // Check if all modules have lecturers assigned
  const modulesWithoutLecturers = await Module.find({ lecturers: { $size: 0 } });
  if (modulesWithoutLecturers.length > 0) {
    issues.push({
      type: 'Module',
      message: 'Some modules have no lecturers assigned',
      details: modulesWithoutLecturers.map(module => module.module_name)
    });
  }

  return issues;
}

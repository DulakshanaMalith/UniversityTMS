const TimetableError = require('../errors/TimetableError');

// Get program requirements based on department and semester
const getProgramRequirements = (program) => {
  // This is a placeholder - you should implement this based on your actual program requirements
  // For now, return an empty array to prevent validation errors
  return [];
};

// Convert time string to minutes for easier comparison
const convertTimeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Check if two halls are in the same building
const areHallsNear = (hall1, hall2) => {
  return hall1.building === hall2.building;
};

// Check if two time slots are adjacent
const areTimesAdjacent = (slot1, slot2) => {
  const [start1, end1] = slot1.split('-');
  const [start2, end2] = slot2.split('-');
  
  return end1 === start2 || end2 === start1;
};

// Validate curriculum requirements
const validateCurriculum = (batch) => {
  // Skip curriculum validation for now since we don't have program requirements
  return true;
};

// Analyze student workload
const analyzeStudentWorkload = (timetable) => {
  const studentSchedule = {};
  const warnings = [];
  
  timetable.forEach(entry => {
    const batchKey = `${entry.batch}_${entry.group}`;
    studentSchedule[batchKey] = studentSchedule[batchKey] || {};
    studentSchedule[batchKey][entry.day] = (studentSchedule[batchKey][entry.day] || 0) + 2;
  });

  // Check for overloaded days
  Object.entries(studentSchedule).forEach(([batchGroup, days]) => {
    Object.entries(days).forEach(([day, hours]) => {
      if (hours > 6) {
        warnings.push({
          batchGroup,
          day,
          hours,
          message: `Overloaded schedule: ${hours} hours`
        });
      }
    });
  });

  return warnings;
};

// Pre-generation validation
const validateBeforeGeneration = async (batches, halls, modules) => {
  const errors = [];

  // 1. Check all modules have lecturers assigned
  const unassignedModules = modules.filter(m => !m.lecturer);
  if (unassignedModules.length > 0) {
    errors.push({
      type: 'UNASSIGNED_MODULES',
      message: `Unassigned lecturers for modules: ${
        unassignedModules.map(m => m.module_name).join(', ')
      }`,
      modules: unassignedModules
    });
  }

  // 2. Verify hall capacities match requirements
  batches.forEach(batch => {
    const requiredCapacity = Math.ceil(batch.num_of_students / batch.group_count);
    if (!halls.some(h => h.capacity >= requiredCapacity)) {
      errors.push({
        type: 'INSUFFICIENT_HALL_CAPACITY',
        message: `No suitable hall for batch ${batch.batch_name}`,
        batch: batch._id,
        requiredCapacity
      });
    }
  });

  // 3. Check credit hours fit available slots
  batches.forEach(batch => {
    const totalHours = batch.modules.reduce((sum, m) => sum + m.credit_hours, 0);
    const availableSlots = (batch.weekend_or_weekday === 'Weekend' ? 2 : 5) * 4;
    if (totalHours > availableSlots * 2) {
      errors.push({
        type: 'INSUFFICIENT_SLOTS',
        message: `Batch ${batch.batch_name} requires ${totalHours} hours but only ${
          availableSlots * 2
        } available`,
        batch: batch._id,
        totalHours,
        availableSlots: availableSlots * 2
      });
    }
  });

  // 4. Validate curriculum requirements (skipped for now)
  // batches.forEach(batch => {
  //   try {
  //     validateCurriculum(batch);
  //   } catch (error) {
  //     errors.push({
  //       type: 'CURRICULUM_VIOLATION',
  //       message: error.message,
  //       batch: batch._id
  //     });
  //   }
  // });

  if (errors.length > 0) {
    throw new TimetableError(
      'Pre-generation validation failed',
      { errors }
    );
  }
};

// Advanced conflict detection
const checkAdvancedConflicts = (proposedSlot, timetable) => {
  // 1. Lecturer time-between-classes (minimum 1 hour)
  const lecturerSlots = timetable.filter(e => 
    e.lecturer.equals(proposedSlot.lecturer) && 
    e.day === proposedSlot.day
  );
  
  const hasLecturerConflict = lecturerSlots.some(slot => {
    const timeBetween = Math.abs(
      convertTimeToMinutes(slot.time_slot.split('-')[0]) - 
      convertTimeToMinutes(proposedSlot.time_slot.split('-')[0])
    );
    return timeBetween < 60; // 1 hour minimum
  });

  // 2. Student travel time between distant halls
  const batchSlots = timetable.filter(e => 
    e.batch.equals(proposedSlot.batch) &&
    e.day === proposedSlot.day
  );
  
  const hasTravelConflict = batchSlots.some(slot => {
    if (slot.time_slot === proposedSlot.time_slot) return true;
    if (!areHallsNear(slot.hall, proposedSlot.hall)) {
      return areTimesAdjacent(slot.time_slot, proposedSlot.time_slot);
    }
    return false;
  });

  return {
    hasConflict: hasLecturerConflict || hasTravelConflict,
    lecturerConflict: hasLecturerConflict,
    travelConflict: hasTravelConflict
  };
};

// Reserve exam preparation time
const reserveExamPreparationTime = (timetable) => {
  const lastTeachingWeek = 16; // Assuming 16 weeks per semester
  
  return timetable.map(entry => {
    if (entry.week >= lastTeachingWeek - 2) {
      return {
        ...entry,
        isExamPreparation: true,
        time_slot: '09:00-12:00' // Standard exam prep slot
      };
    }
    return entry;
  });
};

module.exports = {
  validateBeforeGeneration,
  checkAdvancedConflicts,
  analyzeStudentWorkload,
  reserveExamPreparationTime
}; 
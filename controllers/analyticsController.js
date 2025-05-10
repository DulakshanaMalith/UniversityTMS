const Timetable = require('../models/Timetable');
const Hall = require('../models/Hall');
const Lecturer = require('../models/Lecturer');

// Hall Utilization
exports.hallUsage = async (req, res) => {
  try {
    const usage = await Timetable.aggregate([
      { $group: { _id: '$hall', count: { $sum: 1 } } },
      { $lookup: { from: 'halls', localField: '_id', foreignField: '_id', as: 'hall' } },
      { $unwind: '$hall' },
      { $project: { _id: 0, hall: '$hall.hall_name', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: usage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Lecturer Load
exports.lecturerLoad = async (req, res) => {
  try {
    const load = await Timetable.aggregate([
      { $group: { _id: '$lecturer', count: { $sum: 1 } } },
      { $lookup: { from: 'lecturers', localField: '_id', foreignField: '_id', as: 'lecturer' } },
      { $unwind: '$lecturer' },
      { $project: { _id: 0, lecturer: '$lecturer.name', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: load });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Time Slot Popularity
exports.timeslotPopularity = async (req, res) => {
  try {
    const slots = await Timetable.aggregate([
      { $group: { _id: '$timeSlot', count: { $sum: 1 } } },
      { $project: { _id: 0, timeSlot: '$_id', count: 1 } },
      { $sort: { timeSlot: 1 } }
    ]);
    res.json({ success: true, data: slots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Batch Load
exports.batchLoad = async (req, res) => {
  try {
    const load = await Timetable.aggregate([
      { $group: { _id: '$batch', count: { $sum: 1 } } },
      { $lookup: { from: 'batches', localField: '_id', foreignField: '_id', as: 'batch' } },
      { $unwind: '$batch' },
      { $project: { _id: 0, batch: '$batch.batch_name', count: 1 } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: load });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 
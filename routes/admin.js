const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  addUser,
  addBatch,
  addHall,
  addModule,
  generateTimetable,
  getTimetable,
  getBatches,
  updateBatch,
  deleteBatch,
  updateTimetableSlot,
  getChangeRequests,
  handleChangeRequest
} = require('../controllers/adminController');
const {
  validateTimetableGeneration,
  validateTimetableSlotUpdate,
  validateChangeRequestResponse
} = require('../middleware/validation');
const Lecturer = require('../models/Lecturer');
const Module = require('../models/Module');
const Hall = require('../models/Hall');
const Batch = require('../models/Batch');

const router = express.Router();

// Protect and authorize all routes
router.use(protect);
router.use(authorize('admin'));

// User routes
router.post('/users', addUser);

// Batch routes
router.get('/batches', getBatches);
router.post('/batches', addBatch);
router.put('/batches/:id', updateBatch);
router.delete('/batches/:id', deleteBatch);

// Hall routes
router.post('/halls', addHall);

// Module routes
router.route('/modules')
  .get(async (req, res) => {
    try {
      const modules = await Module.find().populate('lecturers', 'name department');
      res.json({
        success: true,
        modules: modules
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error fetching modules',
        error: error.message
      });
    }
  })
  .post(addModule);

// Timetable routes
router.get('/timetable', getTimetable);
router.post('/timetable/generate', validateTimetableGeneration, generateTimetable);
router.put('/timetable/:id', validateTimetableSlotUpdate, updateTimetableSlot);

// Change request routes
router.get('/change-requests', getChangeRequests);
router.put('/change-requests/:id', validateChangeRequestResponse, handleChangeRequest);

// Lecturer routes
router.route('/lecturers')
  .get(async (req, res) => {
    try {
      const lecturers = await Lecturer.find().select('name email department rank specialization');
      res.json({
        success: true,
        data: lecturers
      });
    } catch (error) {
      res.status(500).json({ 
        success: false,
        message: 'Error fetching lecturers',
        error: error.message 
      });
    }
  })
  .post(async (req, res) => {
    try {
      const { name, email, phone_number, department, rank, specialization } = req.body;
      const lecturer = await Lecturer.create({
        name,
        email,
        phone_number,
        department,
        rank,
        specialization: Array.isArray(specialization) ? specialization : [specialization]
      });
      res.status(201).json(lecturer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route('/lecturers/:id')
  .get(async (req, res) => {
    try {
      const lecturer = await Lecturer.findById(req.params.id).populate('user', 'name email');
      if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });
      res.json(lecturer);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const lecturer = await Lecturer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });
      res.json(lecturer);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const lecturer = await Lecturer.findByIdAndDelete(req.params.id);
      if (!lecturer) return res.status(404).json({ message: 'Lecturer not found' });
      res.json({ message: 'Lecturer deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Hall routes
router.route('/halls')
  .get(async (req, res) => {
    try {
      const halls = await Hall.find();
      res.json(halls);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

router.route('/halls/:id')
  .get(async (req, res) => {
    try {
      const hall = await Hall.findById(req.params.id);
      if (!hall) return res.status(404).json({ message: 'Hall not found' });
      res.json(hall);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const hall = await Hall.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!hall) return res.status(404).json({ message: 'Hall not found' });
      res.json(hall);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const hall = await Hall.findByIdAndDelete(req.params.id);
      if (!hall) return res.status(404).json({ message: 'Hall not found' });
      res.json({ message: 'Hall deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Module routes
router.route('/modules/:id')
  .get(async (req, res) => {
    try {
      const module = await Module.findById(req.params.id)
        .populate('lecturers', 'name department')
        .populate('batches', 'batch_name');
      if (!module) return res.status(404).json({ message: 'Module not found' });
      res.json(module);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const module = await Module.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!module) return res.status(404).json({ message: 'Module not found' });
      res.json(module);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const module = await Module.findByIdAndDelete(req.params.id);
      if (!module) return res.status(404).json({ message: 'Module not found' });
      res.json({ message: 'Module deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

// Batch routes
router.route('/batches')
  .get(async (req, res) => {
    try {
      const batches = await Batch.find().populate('modules', 'module_name module_code credit_hours');
      res.json(batches);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .post(async (req, res) => {
    try {
      const batch = await Batch.create(req.body);
      res.status(201).json(batch);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

router.route('/batches/:id')
  .get(async (req, res) => {
    try {
      const batch = await Batch.findById(req.params.id).populate('modules', 'module_name module_code credit_hours');
      if (!batch) return res.status(404).json({ message: 'Batch not found' });
      res.json(batch);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  })
  .put(async (req, res) => {
    try {
      const batch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('modules', 'module_name module_code credit_hours');
      if (!batch) return res.status(404).json({ message: 'Batch not found' });
      res.json(batch);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  })
  .delete(async (req, res) => {
    try {
      const batch = await Batch.findByIdAndDelete(req.params.id);
      if (!batch) return res.status(404).json({ message: 'Batch not found' });
      res.json({ message: 'Batch deleted successfully' });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

module.exports = router;

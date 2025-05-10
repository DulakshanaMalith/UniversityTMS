const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Login route
router.post('/login', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// Get current user
router.get('/me', auth, authController.getCurrentUser);

// Register student route
router.post('/register/student', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('batch').notEmpty().withMessage('Batch is required'),
  body('group').notEmpty().withMessage('Group is required')
], authController.registerStudent);

module.exports = router;

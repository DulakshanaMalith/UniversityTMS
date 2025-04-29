const express = require('express');
const { login, getMe, registerStudent, verifyRegistrationCode } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { body } = require('express-validator');

const router = express.Router();

router.post('/login', [
  body('role').notEmpty().withMessage('Role is required'),
  body().custom((value, { req }) => {
    if (req.body.role === 'lecturer') {
      if (!req.body.name) throw new Error('Name is required for lecturer login');
      if (!req.body.email) throw new Error('Email is required for lecturer login');
    } else {
      if (!req.body.username) throw new Error('Username is required');
      if (!req.body.password) throw new Error('Password is required');
    }
    return true;
  })
], login);

router.get('/me', auth.protect, getMe);

router.post('/register/student', [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('name').notEmpty().withMessage('Name is required'),
  body('batch').notEmpty().withMessage('Batch is required'),
  body('group').notEmpty().withMessage('Group is required')
], registerStudent);

router.get('/verify-registration-code/:code', verifyRegistrationCode);

module.exports = router;

const Feedback = require('../models/Feedback');
const User = require('../models/User');

// Submit feedback (any user)
exports.submitFeedback = async (req, res) => {
  try {
    const { message, type, email } = req.body;
    const user = req.user ? req.user._id : null;
    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }
    const feedback = await Feedback.create({
      user,
      email,
      message,
      type
    });
    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all feedback (admin)
exports.getAllFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find().populate('user', 'name email role').sort('-createdAt');
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update feedback status/response (admin)
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const feedback = await Feedback.findByIdAndUpdate(id, { status }, { new: true });
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found.' });
    }
    res.json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}; 
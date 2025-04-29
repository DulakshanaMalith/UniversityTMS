const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Lecturer = require('../models/Lecturer');

exports.protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authorized to access this route' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Try to find user in User collection first
    let user = await User.findById(decoded.id).select('-password');
    
    // If not found in User collection, try Lecturer collection
    if (!user) {
      user = await Lecturer.findById(decoded.id);
      if (user) {
        // Add role to lecturer object
        user = user.toObject();
        user.role = 'lecturer';
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized to access this route' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

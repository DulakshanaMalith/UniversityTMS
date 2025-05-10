class TimetableError extends Error {
  constructor(message, context) {
    super(message);
    this.name = 'TimetableError';
    this.context = context;
    this.timestamp = new Date();
    
    // Maintain proper stack trace
    Error.captureStackTrace(this, this.constructor);
  }
  
  toJSON() {
    return {
      error: this.message,
      context: this.context,
      timestamp: this.timestamp
    };
  }
}

module.exports = TimetableError; 
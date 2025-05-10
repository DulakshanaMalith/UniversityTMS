const morgan = require('morgan');
const logger = require('../utils/logger');

// Create custom Morgan token for request body
morgan.token('body', (req) => {
  const sanitizedBody = { ...req.body };
  
  // Remove sensitive information
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
  
  return JSON.stringify(sanitizedBody);
});

// Create custom Morgan token for response body
morgan.token('response-body', (req, res) => {
  const sanitizedBody = res.locals.responseBody ? { ...res.locals.responseBody } : {};
  
  // Remove sensitive information
  if (sanitizedBody.token) sanitizedBody.token = '[REDACTED]';
  if (sanitizedBody.password) sanitizedBody.password = '[REDACTED]';
  
  return JSON.stringify(sanitizedBody);
});

// Custom format string
const morganFormat = ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms :body :response-body';

// Middleware to capture response body
const captureResponseBody = (req, res, next) => {
  const oldWrite = res.write;
  const oldEnd = res.end;
  const chunks = [];

  res.write = function (chunk) {
    chunks.push(chunk);
    return oldWrite.apply(res, arguments);
  };

  res.end = function (chunk) {
    if (chunk) chunks.push(chunk);
    const body = Buffer.concat(chunks).toString('utf8');
    try {
      res.locals.responseBody = JSON.parse(body);
    } catch (e) {
      res.locals.responseBody = body;
    }
    oldEnd.apply(res, arguments);
  };

  next();
};

// Request logging middleware
const requestLogger = [
  captureResponseBody,
  morgan(morganFormat, {
    stream: logger.stream,
    skip: (req) => req.url === '/health' // Skip health check endpoints
  })
];

module.exports = requestLogger;

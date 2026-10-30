const path = require('path');
const winston = require('winston');

const logDirectory = path.join(__dirname, '..', 'logs');

const lineFormat = winston.format.printf(
  ({ timestamp, level, message, stack }) => `${timestamp} [${level.toUpperCase()}] ${stack || message}`
);

const transports = [new winston.transports.Console({ level: 'info' })];
if (!process.env.VERCEL) {
  transports.push(
    new winston.transports.File({ filename: path.join(logDirectory, 'app.log'), maxsize: 5 * 1024 * 1024, maxFiles: 5 }),
    new winston.transports.File({ filename: path.join(logDirectory, 'error.log'), level: 'error', maxsize: 5 * 1024 * 1024, maxFiles: 5 })
  );
}

const logger = winston.createLogger({
  level: 'http',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    lineFormat
  ),
  transports,
});

module.exports = logger;

const logger = require('../logger');

function errorHandler(error, req, res, next) {
  logger.error(`${req.method} ${req.originalUrl} failed: ${error.stack || error}`);
  res.status(500).json({ message: 'Something went wrong on the server. Please try again.' });
}

module.exports = errorHandler;

const path = require('path');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./config');
const logger = require('./logger');
const createSessionMiddleware = require('./middleware/session');
const errorHandler = require('./middleware/errorHandler');
const { requireAuthApi, requireAuthPage } = require('./middleware/auth');
const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const metaRoutes = require('./routes/meta');

const PUBLIC_DIRECTORY = path.join(__dirname, '..', 'public');

function createApp() {
  const app = express();

  if (config.isProduction) app.set('trust proxy', 1);

  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'style-src': ["'self'", 'https://fonts.googleapis.com'],
          'font-src': ["'self'", 'https://fonts.gstatic.com'],
          'upgrade-insecure-requests': null,
        },
      },
    })
  );
  app.use(
    morgan(':remote-addr :method :url :status :res[content-length] - :response-time ms', {
      stream: { write: (line) => logger.http(line.trim()) },
    })
  );
  app.use(express.json({ limit: '10kb' }));
  app.use(createSessionMiddleware());

  app.use('/api/auth', authRoutes);
  app.use('/api/meta', requireAuthApi, metaRoutes);
  app.use('/api/employees', requireAuthApi, employeeRoutes);
  app.use('/api', (req, res) => res.status(404).json({ message: 'Not found.' }));

  app.get(['/', '/index.html'], requireAuthPage, (req, res) => {
    res.sendFile(path.join(PUBLIC_DIRECTORY, 'index.html'));
  });
  app.use(express.static(PUBLIC_DIRECTORY, { index: false }));

  app.use(errorHandler);
  return app;
}

module.exports = createApp;

const config = require('./config');
const logger = require('./logger');
const pool = require('./db');
const createApp = require('./app');

async function start() {
  try {
    await pool.query('SELECT 1');
  } catch (error) {
    logger.error(`Cannot connect to MySQL at ${config.db.host}:${config.db.port} (${error.code || error.message}). Check your .env settings and that MySQL is running.`);
    process.exit(1);
  }

  const server = createApp().listen(config.port, () => {
    logger.info(`PeopleDesk running at http://localhost:${config.port} (session timeout ${config.session.timeoutMinutes} min)`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

process.on('unhandledRejection', (reason) =>
  logger.error(`Unhandled promise rejection: ${reason && reason.stack ? reason.stack : reason}`)
);

start();

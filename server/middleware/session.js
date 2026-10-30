const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const config = require('../config');

function createSessionMiddleware() {
  const store = new MySQLStore({
    ...config.db,
    expiration: config.session.timeoutMs,
    clearExpired: true,
    checkExpirationInterval: 5 * 60 * 1000,
    createDatabaseTable: true,
  });

  return session({
    name: config.session.cookieName,
    secret: config.session.secret,
    store,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.isProduction,
      maxAge: config.session.timeoutMs,
    },
  });
}

module.exports = createSessionMiddleware;

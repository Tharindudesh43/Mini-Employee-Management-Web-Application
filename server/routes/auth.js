const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const pool = require('../db');
const config = require('../config');
const logger = require('../logger');

const router = express.Router();

const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 10);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Login rate limit reached for ${req.ip}`);
    res.status(429).json({ message: 'Too many login attempts. Try again in 15 minutes.' });
  },
});

router.post('/login', loginLimiter, async (req, res, next) => {
  try {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
      return res.status(400).json({ message: 'Enter your username and password.' });
    }

    const [rows] = await pool.query('SELECT id, username, password_hash FROM users WHERE username = ?', [username]);
    const user = rows[0];
    const passwordMatches = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);

    if (!user || !passwordMatches) {
      logger.warn(`Failed login for "${username}" from ${req.ip}`);
      return res.status(401).json({ message: 'Incorrect username or password.' });
    }

    req.session.regenerate((regenerateError) => {
      if (regenerateError) return next(regenerateError);

      req.session.userId = user.id;
      req.session.username = user.username;

      req.session.save((saveError) => {
        if (saveError) return next(saveError);
        logger.info(`User "${user.username}" logged in from ${req.ip}`);
        return res.json({ username: user.username });
      });
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res, next) => {
  const username = req.session.username;
  req.session.destroy((error) => {
    if (error) return next(error);
    res.clearCookie(config.session.cookieName);
    if (username) logger.info(`User "${username}" logged out`);
    return res.json({ message: 'Logged out.' });
  });
});

router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: 'Not logged in.' });
  }
  return res.json({ username: req.session.username, sessionTimeoutMinutes: config.session.timeoutMinutes });
});

module.exports = router;

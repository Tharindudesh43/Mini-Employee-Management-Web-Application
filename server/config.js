require('dotenv').config({ quiet: true });

const required = ['DB_USER', 'DB_NAME', 'SESSION_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Missing settings in .env: ${missing.join(', ')}. Copy .env.example to .env and fill it in.`);
  process.exit(1);
}

const timeoutMinutes = Number(process.env.SESSION_TIMEOUT_MINUTES) || 15;

module.exports = {
  port: Number(process.env.PORT) || 3000,
  isProduction: process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL),
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    ...(process.env.DB_SSL === 'true' ? { ssl: { rejectUnauthorized: false } } : {}),
  },
  session: {
    secret: process.env.SESSION_SECRET,
    cookieName: 'peopledesk.sid',
    timeoutMinutes,
    timeoutMs: timeoutMinutes * 60 * 1000,
  },
  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD,
  },
};

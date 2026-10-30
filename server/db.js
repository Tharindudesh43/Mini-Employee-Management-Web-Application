const mysql = require('mysql2/promise');
const config = require('./config');

const pool = mysql.createPool({
  ...config.db,
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_POOL_LIMIT) || 10,
  charset: 'utf8mb4',
});

module.exports = pool;

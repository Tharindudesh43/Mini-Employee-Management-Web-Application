const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const config = require('../config');
const { DEPARTMENTS } = require('../constants');

const SAMPLE_NAMES = [
  'Leanne Graham', 'Ervin Howell', 'Clementine Bauch', 'Patricia Lebsack', 'Chelsey Dietrich',
  'Dennis Schulist', 'Kurtis Weissnat', 'Nicholas Runolfsdottir', 'Glenna Reichert', 'Clementina DuBuque',
  'Amara Perera', 'Kasun Fernando', 'Nadia Rahman', 'Ishan Wijesinghe', 'Priya Nathan',
  'Rohan Silva', 'Meera Krishnan', 'Dilan Jayasuriya', 'Sara Thomas', 'Arjun Selvam',
  'Hana Yusuf', 'Lakshmi Devi', 'Ruwan Gunawardena', 'Anika Das', 'Joel Mathews',
  'Faris Ahmed', 'Zoya Khan',
];

const SAMPLE_EMPLOYEES = SAMPLE_NAMES.map((name, index) => [
  name,
  `${name.toLowerCase().replace(/[^a-z ]/g, '').split(' ').join('.')}@peopledesk.example`,
  `+94 77 ${String(index + 1).padStart(3, '0')} ${String(((index + 1) * 7919) % 10000).padStart(4, '0')}`,
  DEPARTMENTS[index % DEPARTMENTS.length],
  index % 5 === 3 ? 'Inactive' : 'Active',
]);

async function main() {
  if (!config.admin.password || config.admin.password.length < 8) {
    throw new Error('Set ADMIN_PASSWORD in .env (at least 8 characters) before running setup.');
  }

  const { database, ...serverOptions } = config.db;

  const server = await mysql.createConnection(serverOptions);
  await server.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
  await server.end();

  const db = await mysql.createConnection({ ...config.db, multipleStatements: true });

  const schema = fs.readFileSync(path.join(__dirname, '..', '..', 'database', 'schema.sql'), 'utf8');
  await db.query(schema);

  const [phoneColumn] = await db.query(
    "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'employees' AND COLUMN_NAME = 'phone'"
  );
  if (phoneColumn.length === 0) {
    await db.query('ALTER TABLE employees ADD COLUMN phone VARCHAR(20) NULL AFTER email');
    console.log('Added the phone column to employees.');
  }
  console.log('Tables are ready.');

  const [[{ userCount }]] = await db.query('SELECT COUNT(*) AS userCount FROM users');
  if (userCount === 0) {
    const hash = await bcrypt.hash(config.admin.password, 12);
    await db.query('INSERT INTO users (username, password_hash) VALUES (?, ?)', [config.admin.username, hash]);
    console.log(`Created login account "${config.admin.username}".`);
  } else {
    console.log('Login account already exists, skipped.');
  }

  const [[{ employeeCount }]] = await db.query('SELECT COUNT(*) AS employeeCount FROM employees');
  if (employeeCount === 0) {
    await db.query('INSERT INTO employees (name, email, phone, department, status) VALUES ?', [SAMPLE_EMPLOYEES]);
    console.log(`Added ${SAMPLE_EMPLOYEES.length} sample employees.`);
  } else {
    console.log('Employees already exist, skipped sample data.');
  }

  await db.end();
  console.log('Setup finished. Start the app with: npm start');
}

main().catch((error) => {
  console.error(`Setup failed: ${error.message}`);
  process.exit(1);
});

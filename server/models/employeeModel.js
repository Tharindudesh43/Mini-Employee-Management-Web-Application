const pool = require('../db');

const COLUMNS = 'id, name, email, phone, department, status';

function toEmployee(row) {
  return {
    id: row.id,
    employeeCode: `EMP-${String(row.id).padStart(3, '0')}`,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    department: row.department,
    status: row.status,
  };
}

function buildFilter({ search, status }) {
  const conditions = [];
  const params = [];

  if (search) {
    const pattern = `%${search.replace(/[\\%_]/g, '\\$&')}%`;
    conditions.push('(name LIKE ? OR email LIKE ?)');
    params.push(pattern, pattern);
  }
  if (status) {
    conditions.push('status = ?');
    params.push(status);
  }

  return { where: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '', params };
}

async function findById(id) {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM employees WHERE id = ?`, [id]);
  return rows[0] ? toEmployee(rows[0]) : null;
}

async function findPage({ page, pageSize, search, status }) {
  const { where, params } = buildFilter({ search, status });

  const [[{ total }]] = await pool.query(`SELECT COUNT(*) AS total FROM employees ${where}`, params);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);

  const [rows] = await pool.query(
    `SELECT ${COLUMNS} FROM employees ${where} ORDER BY id LIMIT ? OFFSET ?`,
    [...params, pageSize, (currentPage - 1) * pageSize]
  );

  return {
    data: rows.map(toEmployee),
    pagination: { page: currentPage, pageSize, total, totalPages },
  };
}

async function getCounts() {
  const [[counts]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'Active'), 0) AS active,
            COALESCE(SUM(status = 'Inactive'), 0) AS inactive
     FROM employees`
  );
  return { total: Number(counts.total), active: Number(counts.active), inactive: Number(counts.inactive) };
}

async function create({ name, email, phone, department, status }) {
  const [result] = await pool.query(
    'INSERT INTO employees (name, email, phone, department, status) VALUES (?, ?, ?, ?, ?)',
    [name, email, phone || null, department, status]
  );
  return findById(result.insertId);
}

async function update(id, { name, email, phone, department, status }) {
  await pool.query(
    'UPDATE employees SET name = ?, email = ?, phone = ?, department = ?, status = ? WHERE id = ?',
    [name, email, phone || null, department, status, id]
  );
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM employees WHERE id = ?', [id]);
}

module.exports = { findById, findPage, getCounts, create, update, remove };

const express = require('express');
const logger = require('../logger');
const employees = require('../models/employeeModel');
const { validateEmployeeBody, parseId } = require('../validators/employeeValidator');
const { STATUSES, PAGE_SIZES, DEFAULT_PAGE_SIZE } = require('../constants');

const router = express.Router();

const DUPLICATE_EMAIL_MESSAGE = 'Another employee already uses this email address.';

function sendDuplicateEmail(res) {
  return res.status(409).json({ message: DUPLICATE_EMAIL_MESSAGE, errors: { email: DUPLICATE_EMAIL_MESSAGE } });
}

function sendValidationErrors(res, errors) {
  return res.status(400).json({ message: 'Please correct the highlighted fields.', errors });
}

function parseListQuery(query) {
  const requestedSize = parseInt(query.pageSize, 10);
  return {
    page: Math.max(1, parseInt(query.page, 10) || 1),
    pageSize: PAGE_SIZES.includes(requestedSize) ? requestedSize : DEFAULT_PAGE_SIZE,
    search: String(query.search || '').trim().slice(0, 100),
    status: STATUSES.includes(query.status) ? query.status : null,
  };
}

router.get('/', async (req, res, next) => {
  try {
    const [pageResult, counts] = await Promise.all([
      employees.findPage(parseListQuery(req.query)),
      employees.getCounts(),
    ]);
    res.json({ ...pageResult, counts });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { values, errors } = validateEmployeeBody(req.body);
    if (Object.keys(errors).length > 0) return sendValidationErrors(res, errors);

    const employee = await employees.create(values);
    logger.info(`"${req.session.username}" created employee ${employee.employeeCode} (${employee.email})`);
    return res.status(201).json(employee);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendDuplicateEmail(res);
    return next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid employee id.' });

    const { values, errors } = validateEmployeeBody(req.body);
    if (Object.keys(errors).length > 0) return sendValidationErrors(res, errors);
    if (!(await employees.findById(id))) {
      return res.status(404).json({ message: 'This employee no longer exists.' });
    }

    const employee = await employees.update(id, values);
    logger.info(`"${req.session.username}" updated employee ${employee.employeeCode}`);
    return res.json(employee);
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return sendDuplicateEmail(res);
    return next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid employee id.' });

    const existing = await employees.findById(id);
    if (!existing) return res.status(404).json({ message: 'This employee no longer exists.' });

    await employees.remove(id);
    logger.info(`"${req.session.username}" deleted employee ${existing.employeeCode} (${existing.email})`);
    return res.status(204).end();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;

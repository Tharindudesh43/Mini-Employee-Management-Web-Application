const { DEPARTMENTS, STATUSES } = require('../constants');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]+$/;

function validateEmployeeBody(body) {
  const values = {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    phone: String(body.phone || '').trim(),
    department: String(body.department || ''),
    status: String(body.status || 'Active'),
  };
  const errors = {};

  if (values.name.length < 2 || values.name.length > 100) {
    errors.name = 'Enter a name between 2 and 100 characters.';
  }
  if (!EMAIL_PATTERN.test(values.email) || values.email.length > 150) {
    errors.email = 'Enter a valid email address.';
  }
  const phoneDigits = values.phone.replace(/\D/g, '');
  if (values.phone && (!PHONE_PATTERN.test(values.phone) || phoneDigits.length < 7 || phoneDigits.length > 15 || values.phone.length > 20)) {
    errors.phone = 'Enter a valid phone number.';
  }
  if (!DEPARTMENTS.includes(values.department)) {
    errors.department = 'Choose a department from the list.';
  }
  if (!STATUSES.includes(values.status)) {
    errors.status = 'Status must be Active or Inactive.';
  }

  return { values, errors };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

module.exports = { validateEmployeeBody, parseId };

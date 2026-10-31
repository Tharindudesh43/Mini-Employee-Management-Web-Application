const { DEPARTMENTS, STATUSES } = require('../constants');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;
const PHONE_MAX_LENGTH = 20;

function normalizePhone(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

function getPhoneError(phone) {
  if (!phone) return '';

  if (/[^\d\s\-()+]/.test(phone)) {
    return 'Use only digits, spaces, hyphens, brackets and a + at the start.';
  }
  if (phone.lastIndexOf('+') > 0) {
    return 'The + sign can only be at the very start, for example +94 77 123 4567.';
  }
  if (!areBracketsBalanced(phone)) {
    return 'Check the brackets: every ( needs a matching ).';
  }

  const digitCount = phone.replace(/\D/g, '').length;
  if (digitCount < PHONE_MIN_DIGITS) return `Too short: enter at least ${PHONE_MIN_DIGITS} digits.`;
  if (digitCount > PHONE_MAX_DIGITS) return `Too long: use at most ${PHONE_MAX_DIGITS} digits.`;
  if (phone.length > PHONE_MAX_LENGTH) return `Too long: use at most ${PHONE_MAX_LENGTH} characters, including spaces.`;

  return '';
}

function areBracketsBalanced(text) {
  let depth = 0;
  for (const character of text) {
    if (character === '(') depth += 1;
    if (character === ')') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function validateEmployeeBody(body) {
  const values = {
    name: String(body.name || '').trim(),
    email: String(body.email || '').trim().toLowerCase(),
    phone: normalizePhone(body.phone),
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
  const phoneError = getPhoneError(values.phone);
  if (phoneError) errors.phone = phoneError;
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
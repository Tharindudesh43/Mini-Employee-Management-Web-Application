const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const PHONE_MIN_DIGITS = 7;
const PHONE_MAX_DIGITS = 15;
const PHONE_MAX_LENGTH = 20;

export function validateEmployee(values, existingEmployees, editingId = null) {
  const errors = {};
  const name = values.name.trim();
  const email = values.email.trim().toLowerCase();

  if (!name) {
    errors.name = 'Enter the employee’s full name.';
  } else if (name.length < 2) {
    errors.name = 'The name must be at least 2 characters long.';
  }

  if (!email) {
    errors.email = 'Enter an email address.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address, for example name@company.com.';
  } else if (isEmailTaken(email, existingEmployees, editingId)) {
    errors.email = 'Another employee already uses this email address.';
  }

  const phoneError = getPhoneError(normalizePhone(values.phone));
  if (phoneError) errors.phone = phoneError;

  if (!values.department) {
    errors.department = 'Choose a department.';
  }

  return errors;
}

export function normalizePhone(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ');
}

export function getPhoneError(phone) {
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

function isEmailTaken(email, employees, editingId) {
  return employees.some(
    (employee) => employee.id !== editingId && employee.email.toLowerCase() === email
  );
}
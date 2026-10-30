const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_PATTERN = /^\+?[0-9\s\-()]+$/;

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

  const phone = (values.phone ?? '').trim();
  if (phone && !isValidPhone(phone)) {
    errors.phone = 'Enter a valid phone number, for example +94 77 123 4567.';
  }

  if (!values.department) {
    errors.department = 'Choose a department.';
  }

  return errors;
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '');
  return PHONE_PATTERN.test(phone) && digits.length >= 7 && digits.length <= 15;
}

function isEmailTaken(email, employees, editingId) {
  return employees.some(
    (employee) => employee.id !== editingId && employee.email.toLowerCase() === email
  );
}

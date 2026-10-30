import * as api from './api.js';
import { validateEmployee } from './validation.js';

const FIELDS = ['name', 'email', 'phone', 'department'];

const dialog = document.getElementById('employee-dialog');
const form = document.getElementById('employee-form');
const title = document.getElementById('form-title');
const saveButton = document.getElementById('save-btn');
const departmentSelect = document.getElementById('field-department');

let editingId = null;
let options = { getEmployees: () => [], onSaved: () => {}, onError: () => {} };

function showErrors(errors) {
  FIELDS.forEach((field) => {
    const message = errors[field] ?? '';
    document.getElementById(`error-${field}`).textContent = message;
    form.elements[field].setAttribute('aria-invalid', message ? 'true' : 'false');
  });
}

function currentErrors() {
  return Object.fromEntries(
    FIELDS.map((field) => [field, document.getElementById(`error-${field}`).textContent])
  );
}

function readValues() {
  return {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim().toLowerCase(),
    phone: form.elements.phone.value.trim(),
    department: form.elements.department.value,
    status: form.elements.status.value,
  };
}

export function openEmployeeForm(employee = null) {
  editingId = employee ? employee.id : null;
  title.textContent = employee ? 'Edit employee' : 'Add employee';
  form.reset();
  showErrors({});

  form.elements.name.value = employee?.name ?? '';
  form.elements.email.value = employee?.email ?? '';
  form.elements.phone.value = employee?.phone ?? '';
  form.elements.department.value = employee?.department ?? '';
  form.elements.status.value = employee?.status ?? 'Active';

  dialog.showModal();
  form.elements.name.focus();
}

async function handleSubmit(event) {
  event.preventDefault();
  const values = readValues();
  const errors = validateEmployee(values, options.getEmployees(), editingId);

  if (Object.keys(errors).length > 0) {
    showErrors(errors);
    form.elements[Object.keys(errors)[0]].focus();
    return;
  }

  saveButton.disabled = true;
  try {
    const isEditing = editingId !== null;
    const saved = isEditing ? await api.updateEmployee(editingId, values) : await api.createEmployee(values);
    dialog.close();
    await options.onSaved({ employee: saved, isEditing });
  } catch (error) {
    if (Object.keys(error.fields ?? {}).length > 0) showErrors(error.fields);
    else options.onError(error);
  } finally {
    saveButton.disabled = false;
  }
}

export function initEmployeeForm(departments, callbacks) {
  options = { ...options, ...callbacks };

  departmentSelect.replaceChildren(
    new Option('Select a department', ''),
    ...departments.map((name) => new Option(name, name))
  );

  form.addEventListener('submit', handleSubmit);
  document.getElementById('cancel-form-btn').addEventListener('click', () => dialog.close());
  FIELDS.forEach((field) =>
    form.elements[field].addEventListener('input', () => showErrors({ ...currentErrors(), [field]: '' }))
  );
}

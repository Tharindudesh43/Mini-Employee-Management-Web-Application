import * as api from './api.js';

const dialog = document.getElementById('confirm-dialog');
const message = document.getElementById('confirm-message');
const deleteButton = document.getElementById('confirm-delete-btn');

let pendingId = null;
let options = { onDeleted: () => {}, onError: () => {} };

export function openDeleteDialog(employee) {
  pendingId = employee.id;
  message.textContent = `Delete ${employee.name} (${employee.employeeCode})? This cannot be undone.`;
  dialog.showModal();
}

async function confirmDelete() {
  deleteButton.disabled = true;
  try {
    await api.deleteEmployee(pendingId);
    dialog.close();
    await options.onDeleted();
  } catch (error) {
    dialog.close();
    await options.onError(error);
  } finally {
    pendingId = null;
    deleteButton.disabled = false;
  }
}
export function initDeleteDialog(callbacks) {
  options = { ...options, ...callbacks };
  document.getElementById('confirm-cancel-btn').addEventListener('click', () => dialog.close());
  deleteButton.addEventListener('click', confirmDelete);
}

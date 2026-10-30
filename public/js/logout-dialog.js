import * as api from './api.js';

const dialog = document.getElementById('logout-dialog');
const confirmButton = document.getElementById('logout-confirm-btn');

export function openLogoutDialog() {
  dialog.showModal();
}

async function confirmLogout() {
  confirmButton.disabled = true;
  try {
    await api.logout();
  } finally {
    window.location.href = '/login.html';
  }
}

export function initLogoutDialog() {
  document.getElementById('logout-cancel-btn').addEventListener('click', () => dialog.close());
  confirmButton.addEventListener('click', confirmLogout);
}

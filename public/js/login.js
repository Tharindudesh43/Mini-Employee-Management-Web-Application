import { login, getCurrentUser } from './api.js';

const form = document.getElementById('login-form');
const errorBox = document.getElementById('login-error');
const loginButton = document.getElementById('login-btn');

if (new URLSearchParams(window.location.search).has('expired')) {
  document.getElementById('expired-notice').hidden = false;
}

function showError(message) {
  errorBox.textContent = message;
  errorBox.hidden = false;
}

getCurrentUser()
  .then(() => { window.location.href = '/'; })
  .catch(() => {});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorBox.hidden = true;

  const username = form.elements.username.value.trim();
  const password = form.elements.password.value;

  if (!username || !password) {
    showError('Enter your username and password.');
    return;
  }

  loginButton.disabled = true;
  try {
    await login(username, password);
    window.location.href = '/';
  } catch (error) {
    showError(error.message);
    form.elements.password.value = '';
    form.elements.password.focus();
  } finally {
    loginButton.disabled = false;
  }
});

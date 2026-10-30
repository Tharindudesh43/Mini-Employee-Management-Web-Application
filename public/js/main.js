import * as api from './api.js';
import * as store from './store.js';
import { initEmployeeForm, openEmployeeForm } from './employee-form.js';
import { initDeleteDialog, openDeleteDialog } from './delete-dialog.js';
import {
  renderStats, renderTable, renderPagination, showSkeleton, setBusy, showError, showToast, disposeRenderer,
} from './render.js';
import { initNavigation } from './navigation.js';
import { initBackToTop } from './back-to-top.js';
import { initLogoutDialog, openLogoutDialog } from './logout-dialog.js';
import { debounce, getInitials } from './utils.js';

const SEARCH_DELAY_MS = 300;

const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');
const rowsBody = document.getElementById('employee-rows');
const pagination = document.getElementById('pagination');
const pageSizeSelect = document.getElementById('page-size');

let activeRequest = null;
let hasContent = false;
let isFormReady = false;


function refresh() {
  renderStats(store.getCounts());
  renderTable(store.getEmployees(), store.hasFilters());
  renderPagination(store.getPagination());
}

async function loadEmployees() {
  if (activeRequest) activeRequest.abort();
  const controller = new AbortController();
  activeRequest = controller;

  if (hasContent) setBusy(true);
  else showSkeleton();

  try {
    store.setResult(await api.fetchEmployees(store.getParams(), controller.signal));
    refresh();
    hasContent = true;
  } catch (error) {
    if (error.name === 'AbortError') return;
    hasContent = false;
    showError(error.message);
  } finally {
    if (activeRequest === controller) {
      activeRequest = null;
      setBusy(false);
    }
  }
}

const loadAfterTyping = debounce(loadEmployees, SEARCH_DELAY_MS);

async function showCurrentUser() {
  try {
    const { username } = await api.getCurrentUser();
    document.getElementById('user-name').textContent = username;
    document.getElementById('user-avatar').textContent = getInitials(username);
  } catch {
    window.location.href = '/login.html?expired=1';
  }
}


async function handleEmployeeSaved({ employee, isEditing }) {
  if (!isEditing) store.setPage(Number.MAX_SAFE_INTEGER);
  await loadEmployees();
  showToast(isEditing ? 'Employee updated.' : `${employee.name} added.`);
}

async function handleEmployeeDeleted() {
  await loadEmployees();
  showToast('Employee deleted.');
}

async function handleDeleteFailed(error) {
  showToast(error.message);
  if (error.status === 404) await loadEmployees();
}


function bindTableEvents() {
  rowsBody.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const employee = store.getEmployee(button.dataset.id);
    if (!employee) return;
    if (button.dataset.action === 'edit') openEmployeeForm(employee);
    if (button.dataset.action === 'delete') openDeleteDialog(employee);
  });

  pagination.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-page]');
    if (!button || button.disabled) return;
    store.setPage(Number(button.dataset.page));
    loadEmployees();
    document.getElementById('employees').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function bindToolbarEvents() {
  searchInput.addEventListener('input', () => {
    store.setQuery(searchInput.value);
    loadAfterTyping();
  });
  statusFilter.addEventListener('change', () => {
    store.setStatusFilter(statusFilter.value);
    loadEmployees();
  });
  pageSizeSelect.addEventListener('change', () => {
    store.setPageSize(Number(pageSizeSelect.value));
    loadEmployees();
  });

  document.getElementById('add-employee-btn').addEventListener('click', () => openEmployeeForm());
  document.getElementById('retry-btn').addEventListener('click', loadDashboard);
  document.getElementById('refresh-btn').addEventListener('click', async () => {
    await loadEmployees();
    if (hasContent) showToast('Employee list refreshed.');
  });
}

function bindSessionEvents() {
  document.getElementById('logout-btn').addEventListener('click', openLogoutDialog);

  window.addEventListener('pagehide', () => {
    loadAfterTyping.cancel();
    if (activeRequest) activeRequest.abort();
    disposeRenderer();
  });
}

async function prepareForm() {
  if (isFormReady) return;
  const { departments } = await api.fetchMeta();
  initEmployeeForm(departments, {
    getEmployees: store.getEmployees,
    onSaved: handleEmployeeSaved,
    onError: (error) => showToast(error.message),
  });
  isFormReady = true;
}

async function loadDashboard() {
  try {
    await prepareForm();
  } catch (error) {
    showError(error.message);
    return;
  }
  await loadEmployees();
}

initNavigation();
initBackToTop();
initLogoutDialog();
bindToolbarEvents();
bindTableEvents();
bindSessionEvents();
initDeleteDialog({ onDeleted: handleEmployeeDeleted, onError: handleDeleteFailed });
showCurrentUser();
loadDashboard();

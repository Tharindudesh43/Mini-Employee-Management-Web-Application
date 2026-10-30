import { getAvatarTone, getInitials, getPageItems } from './utils.js';

const elements = {
  stats: document.getElementById('stats'),
  total: document.getElementById('stat-total'),
  active: document.getElementById('stat-active'),
  inactive: document.getElementById('stat-inactive'),
  rows: document.getElementById('employee-rows'),
  tableWrap: document.getElementById('table-wrap'),
  progress: document.getElementById('progress'),
  liveStatus: document.getElementById('live-status'),
  error: document.getElementById('error'),
  errorMessage: document.getElementById('error-message'),
  empty: document.getElementById('empty'),
  emptyTitle: document.getElementById('empty-title'),
  emptyMessage: document.getElementById('empty-message'),
  pagination: document.getElementById('pagination'),
  pageInfo: document.getElementById('page-info'),
  pageButtons: document.getElementById('page-buttons'),
  pageSize: document.getElementById('page-size'),
  toast: document.getElementById('toast'),
};

const SKELETON_ROWS = 6;
let toastTimer;

export function escapeHtml(value) {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}


export function renderStats({ total, active, inactive }) {
  elements.total.textContent = total;
  elements.active.textContent = active;
  elements.inactive.textContent = inactive;
  elements.stats.classList.remove('is-loading');
  elements.stats.setAttribute('aria-busy', 'false');
}

export function renderTable(employees, filtersApplied) {
  elements.error.hidden = true;

  const isEmpty = employees.length === 0;
  elements.empty.hidden = !isEmpty;
  elements.tableWrap.hidden = isEmpty;

  if (isEmpty) {
    elements.emptyTitle.textContent = filtersApplied ? 'No matching employees' : 'No employees yet';
    elements.emptyMessage.textContent = filtersApplied
      ? 'Try a different name or email, or clear the status filter.'
      : 'Select “Add employee” to create the first record.';
    elements.rows.replaceChildren();
    return;
  }

  elements.rows.innerHTML = employees.map(createRow).join('');
}

function formatEmail(email) {
  return escapeHtml(email).replace('@', '<wbr>@');
}

function createRow(employee) {
  const name = escapeHtml(employee.name);
  const isActive = employee.status === 'Active';

  return `
    <tr>
      <td data-label="Employee ID" class="table__id">${escapeHtml(employee.employeeCode)}</td>
      <td data-label="Name">
        <div class="person">
          <span class="avatar avatar--${getAvatarTone(employee.name)}" aria-hidden="true">${escapeHtml(getInitials(employee.name))}</span>
          <span class="table__name">${name}</span>
        </div>
      </td>
      <td data-label="Email" class="table__email">${formatEmail(employee.email)}</td>
      <td data-label="Department">${escapeHtml(employee.department)}</td>
      <td data-label="Status">
        <span class="badge ${isActive ? 'badge--active' : 'badge--inactive'}"><span class="badge__dot"></span>${escapeHtml(employee.status)}</span>
      </td>
      <td class="table__actions-cell">
        <div class="table__actions">
          <button type="button" class="btn btn--ghost btn--small" data-action="edit" data-id="${employee.id}" aria-label="Edit ${name}">Edit</button>
          <button type="button" class="btn btn--ghost btn--small btn--text-danger" data-action="delete" data-id="${employee.id}" aria-label="Delete ${name}">Delete</button>
        </div>
      </td>
    </tr>`;
}

export function showSkeleton() {
  const widths = ['w-60', 'w-80', 'w-100', 'w-70', 'w-50'];
  const row = `<tr class="skeleton-row" aria-hidden="true">${widths
    .map((width) => `<td><span class="skeleton ${width}"></span></td>`)
    .join('')}<td></td></tr>`;

  elements.error.hidden = true;
  elements.empty.hidden = true;
  elements.pagination.hidden = true;
  elements.tableWrap.hidden = false;
  elements.rows.innerHTML = row.repeat(SKELETON_ROWS);
  elements.stats.classList.add('is-loading');
  elements.stats.setAttribute('aria-busy', 'true');
  announce('Loading employees');
}

export function setBusy(isBusy) {
  elements.progress.hidden = !isBusy;
  elements.tableWrap.classList.toggle('is-busy', isBusy);
  elements.empty.classList.toggle('is-busy', isBusy);
  if (isBusy) announce('Updating employees');
}

export function showError(message) {
  elements.empty.hidden = true;
  elements.tableWrap.hidden = true;
  elements.pagination.hidden = true;
  elements.stats.classList.remove('is-loading');
  elements.stats.setAttribute('aria-busy', 'false');
  elements.errorMessage.textContent = message;
  elements.error.hidden = false;
}

function announce(message) {
  elements.liveStatus.textContent = message;
}

export function renderPagination({ page, pageSize, total, totalPages }) {
  elements.pagination.hidden = total === 0;
  if (total === 0) return;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);
  elements.pageInfo.textContent = `Showing ${first}–${last} of ${total}`;
  elements.pageSize.value = String(pageSize);

  const pageButton = (number) =>
    `<button type="button" class="page-btn${number === page ? ' is-current' : ''}" data-page="${number}"
      ${number === page ? 'aria-current="page"' : ''} aria-label="Page ${number}">${number}</button>`;

  const items = getPageItems(page, totalPages)
    .map((item) => (item === '…' ? '<span class="page-gap" aria-hidden="true">…</span>' : pageButton(item)))
    .join('');

  elements.pageButtons.innerHTML = `
    <button type="button" class="page-btn page-btn--wide" data-page="${page - 1}" ${page === 1 ? 'disabled' : ''}>Previous</button>
    ${items}
    <button type="button" class="page-btn page-btn--wide" data-page="${page + 1}" ${page === totalPages ? 'disabled' : ''}>Next</button>`;
}

export function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add('toast--visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => elements.toast.classList.remove('toast--visible'), 2800);
}

export function disposeRenderer() {
  clearTimeout(toastTimer);
}

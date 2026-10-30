const state = {
  employees: [],
  counts: { total: 0, active: 0, inactive: 0 },
  pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  query: '',
  status: 'all',
  page: 1,
  pageSize: 10,
};

export function setResult({ data, pagination, counts }) {
  state.employees = data;
  state.pagination = pagination;
  state.counts = counts;
  state.page = pagination.page;
  state.pageSize = pagination.pageSize;
}

export const getEmployees = () => state.employees;
export const getCounts = () => state.counts;
export const getPagination = () => state.pagination;
export const getEmployee = (id) => state.employees.find((employee) => employee.id === Number(id));
export const hasFilters = () => Boolean(state.query) || state.status !== 'all';

export function getParams() {
  return { page: state.page, pageSize: state.pageSize, search: state.query, status: state.status };
}

export function setQuery(query) {
  state.query = query.trim();
  state.page = 1;
}

export function setStatusFilter(status) {
  state.status = status;
  state.page = 1;
}

export function setPageSize(pageSize) {
  state.pageSize = pageSize;
  state.page = 1;
}

export function setPage(page) {
  state.page = page;
}

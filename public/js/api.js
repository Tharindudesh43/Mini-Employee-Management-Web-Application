export class ApiError extends Error {
  constructor(message, status = 0, fields = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`/api${path}`, {
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Cannot reach the server. Check your connection and try again.');
  }

  if (response.status === 401 && !path.startsWith('/auth/')) {
    window.location.href = '/login.html?expired=1';
    throw new ApiError('Your session has expired.', 401);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message || `Request failed with status ${response.status}.`, response.status, data?.errors);
  }
  return data;
}

export const login = (username, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });

export const logout = () => request('/auth/logout', { method: 'POST' });
export const getCurrentUser = () => request('/auth/me');

export const fetchMeta = () => request('/meta');

export function fetchEmployees({ page, pageSize, search, status }, signal) {
  const query = new URLSearchParams({ page, pageSize });
  if (search) query.set('search', search);
  if (status && status !== 'all') query.set('status', status);
  return request(`/employees?${query}`, { signal });
}
export const createEmployee = (values) => request('/employees', { method: 'POST', body: JSON.stringify(values) });
export const updateEmployee = (id, values) => request(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(values) });
export const deleteEmployee = (id) => request(`/employees/${id}`, { method: 'DELETE' });

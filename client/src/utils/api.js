const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('hostel_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('hostel_token', token);
  } else {
    localStorage.removeItem('hostel_token');
  }
}

export function getSavedUser() {
  const user = localStorage.getItem('hostel_user');
  return user ? JSON.parse(user) : null;
}

export function setSavedUser(user) {
  if (user) {
    localStorage.setItem('hostel_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('hostel_user');
  }
}

export async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An error occurred during network request');
  }

  return data;
}

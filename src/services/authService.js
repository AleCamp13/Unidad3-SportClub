import { apiRequest } from './apiClient'

function authHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

export function login(credentials) {
  return apiRequest('/auth/login', { method: 'POST', body: credentials })
}

export function register(payload) {
  const { full_name, email, password, birth_date, metadata } = payload
  return apiRequest('/auth/register', {
    method: 'POST',
    body: { full_name, email, password, birth_date, metadata },
  })
}

export function getCurrentUser(token) {
  return apiRequest('/auth/me', { headers: authHeaders(token) })
}

export function updateProfile(token, payload) {
  return apiRequest('/auth/me', {
    method: 'PUT',
    headers: authHeaders(token),
    body: payload,
  })
}

export function changePassword(token, payload) {
  return apiRequest('/auth/me/password', {
    method: 'PUT',
    headers: authHeaders(token),
    body: payload,
  })
}

import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function listUsers(token, filters = {}) {
  const query = filters.role ? `?role=${encodeURIComponent(filters.role)}` : ''
  return apiRequest(`/users${query}`, { headers: bearerHeaders(token) })
}

export function getUser(token, id) {
  return apiRequest(`/users/${id}`, { headers: bearerHeaders(token) })
}

export function createUser(token, payload) {
  return apiRequest('/users', {
    method: 'POST',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function updateUser(token, id, payload) {
  return apiRequest(`/users/${id}`, {
    method: 'PUT',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function deleteUser(token, id) {
  return apiRequest(`/users/${id}`, {
    method: 'DELETE',
    headers: bearerHeaders(token),
  })
}

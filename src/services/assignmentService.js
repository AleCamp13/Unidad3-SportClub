import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function listAssignments(token) {
  return apiRequest('/sport-rooms', { headers: bearerHeaders(token) })
}

export function getAssignment(token, id) {
  return apiRequest(`/sport-rooms/${id}`, { headers: bearerHeaders(token) })
}

export function createAssignment(token, payload) {
  return apiRequest('/sport-rooms', {
    method: 'POST',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function updateAssignment(token, id, payload) {
  return apiRequest(`/sport-rooms/${id}`, {
    method: 'PUT',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function deleteAssignment(token, id) {
  return apiRequest(`/sport-rooms/${id}`, {
    method: 'DELETE',
    headers: bearerHeaders(token),
  })
}

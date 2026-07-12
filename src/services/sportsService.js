import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function listSports(token) {
  return apiRequest('/sports', { headers: bearerHeaders(token) })
}

export function getSport(token, id) {
  return apiRequest(`/sports/${id}`, { headers: bearerHeaders(token) })
}

export function createSport(token, payload) {
  return apiRequest('/sports', {
    method: 'POST',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function updateSport(token, id, payload) {
  return apiRequest(`/sports/${id}`, {
    method: 'PUT',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function changeSportStatus(token, id, status) {
  return apiRequest(`/sports/${id}/status`, {
    method: 'PATCH',
    headers: bearerHeaders(token),
    body: { status },
  })
}

export function deleteSport(token, id) {
  return apiRequest(`/sports/${id}`, {
    method: 'DELETE',
    headers: bearerHeaders(token),
  })
}

import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function getMyReservations(token) {
  return apiRequest('/reservations/my-reservations', { headers: bearerHeaders(token) })
}

export function createReservation(token, payload) {
  return apiRequest('/reservations', {
    method: 'POST',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function cancelReservation(token, id) {
  return apiRequest(`/reservations/${id}/cancel`, {
    method: 'PATCH',
    headers: bearerHeaders(token),
  })
}

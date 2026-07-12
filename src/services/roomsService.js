import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function listRooms(token) {
  return apiRequest('/rooms', { headers: bearerHeaders(token) })
}

export function getRoom(token, id) {
  return apiRequest(`/rooms/${id}`, { headers: bearerHeaders(token) })
}

export function createRoom(token, payload) {
  return apiRequest('/rooms', {
    method: 'POST',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function updateRoom(token, id, payload) {
  return apiRequest(`/rooms/${id}`, {
    method: 'PUT',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function deleteRoom(token, id) {
  return apiRequest(`/rooms/${id}`, {
    method: 'DELETE',
    headers: bearerHeaders(token),
  })
}

import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function listSchedules(token) {
  return apiRequest('/class-schedules', { headers: bearerHeaders(token) })
}

export function getSchedule(token, id) {
  return apiRequest(`/class-schedules/${id}`, { headers: bearerHeaders(token) })
}

export function createSchedule(token, payload) {
  return apiRequest('/class-schedules', {
    method: 'POST',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function updateSchedule(token, id, payload) {
  return apiRequest(`/class-schedules/${id}`, {
    method: 'PUT',
    headers: bearerHeaders(token),
    body: payload,
  })
}

export function deleteSchedule(token, id) {
  return apiRequest(`/class-schedules/${id}`, {
    method: 'DELETE',
    headers: bearerHeaders(token),
  })
}

import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function getCoachDashboard(token) {
  return apiRequest('/coach/dashboard', { headers: bearerHeaders(token) })
}

export function getCoachClasses(token) {
  return apiRequest('/coach/my-classes', { headers: bearerHeaders(token) })
}

export function getCoachSchedules(token) {
  return apiRequest('/coach/my-schedules', { headers: bearerHeaders(token) })
}

export function getCoachRooms(token) {
  return apiRequest('/coach/my-rooms', { headers: bearerHeaders(token) })
}

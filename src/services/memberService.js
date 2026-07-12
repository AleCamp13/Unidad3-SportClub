import { apiRequest } from './apiClient'
import { bearerHeaders } from './serviceAuth'

export function getMemberDashboard(token) {
  return apiRequest('/member/dashboard', { headers: bearerHeaders(token) })
}

export function getAvailableClasses(token) {
  return apiRequest('/member/classes', { headers: bearerHeaders(token) })
}

export function getAvailableClass(token, id) {
  return apiRequest(`/member/classes/${id}`, { headers: bearerHeaders(token) })
}

export function getAvailableSports(token) {
  return apiRequest('/member/sports', { headers: bearerHeaders(token) })
}

export function getAvailableRooms(token) {
  return apiRequest('/member/rooms', { headers: bearerHeaders(token) })
}

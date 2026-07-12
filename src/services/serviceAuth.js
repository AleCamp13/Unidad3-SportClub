export function bearerHeaders(token) {
  return { Authorization: `Bearer ${token}` }
}

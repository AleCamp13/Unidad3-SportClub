export function normalizeFieldErrors(errors) {
  if (!errors || typeof errors !== 'object') return {}
  return Object.fromEntries(Object.entries(errors).map(([field, message]) => [
    field,
    Array.isArray(message) ? message.join(' ') : String(message),
  ]))
}

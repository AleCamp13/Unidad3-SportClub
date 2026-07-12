const STATUS_LABELS = {
  active: 'Activo',
  inactive: 'Inactivo',
  cancelled: 'Cancelado',
  pending: 'Pendiente',
  completed: 'Completado',
}

export function formatDate(value) {
  if (!value) return '—'

  const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return '—'

  const [, year, month, day] = match
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
  const isValid = date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() === Number(month) - 1
    && date.getUTCDate() === Number(day)

  return isValid ? `${day}-${month}-${year}` : '—'
}

export function formatTime(value) {
  const match = String(value || '').match(/^(\d{2}):(\d{2})/)
  return match ? `${match[1]}:${match[2]}` : '—'
}

export function formatStatus(value) {
  if (!value) return '—'
  if (STATUS_LABELS[value]) return STATUS_LABELS[value]

  const humanized = String(value).replaceAll('_', ' ')
  return humanized.charAt(0).toUpperCase() + humanized.slice(1)
}

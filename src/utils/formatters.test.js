import { formatDate, formatStatus, formatTime } from './formatters'

describe('formatters', () => {
  it('formats ISO calendar dates without shifting the day by timezone', () => {
    expect(formatDate('2026-07-11')).toBe('11-07-2026')
  })

  it('returns a placeholder for missing or invalid dates', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate('not-a-date')).toBe('—')
  })

  it('formats API time values to hours and minutes', () => {
    expect(formatTime('09:30:00')).toBe('09:30')
    expect(formatTime('')).toBe('—')
  })

  it('translates known statuses and humanizes unknown values', () => {
    expect(formatStatus('active')).toBe('Activo')
    expect(formatStatus('cancelled')).toBe('Cancelado')
    expect(formatStatus('pending_review')).toBe('Pending review')
  })
})

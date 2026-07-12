import {
  getActiveScheduleIds,
  groupActiveReservationsByDay,
  summarizeReservations,
  validateReservation,
} from './reservationUtils'

const reservations = [
  { id: 1, class_schedule_id: 10, status: 'active', classSchedule: { day_of_week: 2 } },
  { id: 2, class_schedule_id: 11, status: 'cancelled', classSchedule: { day_of_week: 4 } },
  { id: 3, class_schedule_id: 12, status: 'active', classSchedule: { day_of_week: 2 } },
]

describe('validateReservation', () => {
  it('normalizes the selected schedule and optional observation', () => {
    expect(validateReservation({ class_schedule_id: '12', observation: ' Primera clase ' })).toEqual({
      isValid: true,
      errors: {},
      data: { class_schedule_id: 12, observation: 'Primera clase' },
    })
  })

  it('rejects an invalid schedule and an observation over 255 characters', () => {
    const result = validateReservation({ class_schedule_id: '', observation: 'x'.repeat(256) })

    expect(result.errors.class_schedule_id).toMatch(/horario/i)
    expect(result.errors.observation).toMatch(/255/i)
  })
})

describe('reservation summaries', () => {
  it('returns only active schedule IDs for duplicate prevention', () => {
    expect([...getActiveScheduleIds(reservations)]).toEqual([10, 12])
  })

  it('derives activity counts from API reservations', () => {
    expect(summarizeReservations(reservations)).toEqual({
      total: 3, active: 2, cancelled: 1, activeDays: 1,
    })
  })

  it('builds a seven-day calendar containing active reservations only', () => {
    const calendar = groupActiveReservationsByDay(reservations)

    expect(calendar).toHaveLength(7)
    expect(calendar[1]).toMatchObject({ day: 2, label: 'Martes' })
    expect(calendar[1].reservations).toHaveLength(2)
    expect(calendar[3].reservations).toHaveLength(0)
  })
})

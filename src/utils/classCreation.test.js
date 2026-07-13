import { findReusableAssignment, validateClassCreation } from './classCreation'

describe('validateClassCreation', () => {
  it('normalizes assignment references and schedule values', () => {
    expect(validateClassCreation({
      sport_id: '2',
      room_id: '3',
      coach_id: '4',
      observation: ' Grupo inicial ',
      day_of_week: '2',
      start_time: '09:00',
      end_time: '10:30',
      status: true,
    })).toEqual({
      isValid: true,
      errors: {},
      assignment: {
        sport_id: 2,
        room_id: 3,
        coach_id: 4,
        observation: 'Grupo inicial',
        status: true,
      },
      schedule: {
        day_of_week: 2,
        start_time: '09:00',
        end_time: '10:30',
        status: true,
      },
    })
  })

  it('combines assignment and schedule validation errors', () => {
    const result = validateClassCreation({
      sport_id: '',
      room_id: '0',
      coach_id: 'x',
      observation: 'a'.repeat(256),
      day_of_week: '8',
      start_time: '18:00',
      end_time: '17:00',
      status: true,
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(expect.objectContaining({
      sport_id: expect.any(String),
      room_id: expect.any(String),
      coach_id: expect.any(String),
      observation: expect.any(String),
      day_of_week: expect.any(String),
      end_time: expect.any(String),
    }))
  })
})

describe('findReusableAssignment', () => {
  it('returns only an active assignment matching sport, room, and coach', () => {
    const inactiveMatch = { id: 7, sport_id: 2, room_id: 3, coach_id: 4, status: false }
    const activeMatch = { id: 8, sport_id: '2', room_id: '3', coach_id: '4', status: true }

    expect(findReusableAssignment([
      inactiveMatch,
      { id: 9, sport_id: 2, room_id: 3, coach_id: 5, status: true },
      activeMatch,
    ], { sport_id: 2, room_id: 3, coach_id: 4 })).toBe(activeMatch)
  })
})

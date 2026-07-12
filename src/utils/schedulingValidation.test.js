import { validateAssignment, validateSchedule } from './schedulingValidation'

describe('validateAssignment', () => {
  it('converts select values to numeric foreign keys', () => {
    expect(validateAssignment({
      sport_id: '2', room_id: '3', coach_id: '4', observation: ' Grupo inicial ', status: true,
    })).toEqual({
      isValid: true,
      errors: {},
      data: { sport_id: 2, room_id: 3, coach_id: 4, observation: 'Grupo inicial', status: true },
    })
  })

  it('rejects missing references and excessive observations', () => {
    const result = validateAssignment({
      sport_id: '', room_id: '0', coach_id: 'x', observation: 'a'.repeat(256), status: true,
    })

    expect(result.errors.sport_id).toMatch(/deporte/i)
    expect(result.errors.room_id).toMatch(/sala/i)
    expect(result.errors.coach_id).toMatch(/entrenador/i)
    expect(result.errors.observation).toMatch(/255/i)
  })
})

describe('validateSchedule', () => {
  it('normalizes numeric fields and valid 24-hour times', () => {
    expect(validateSchedule({
      sport_room_id: '8', day_of_week: '2', start_time: '09:00', end_time: '10:30', status: true,
    })).toEqual({
      isValid: true,
      errors: {},
      data: { sport_room_id: 8, day_of_week: 2, start_time: '09:00', end_time: '10:30', status: true },
    })
  })

  it('requires a valid assignment, weekday, and time range', () => {
    const result = validateSchedule({
      sport_room_id: '', day_of_week: '8', start_time: '18:00', end_time: '17:00', status: true,
    })

    expect(result.errors.sport_room_id).toMatch(/asignación/i)
    expect(result.errors.day_of_week).toMatch(/día/i)
    expect(result.errors.end_time).toMatch(/posterior/i)
  })

  it('rejects malformed times before comparing them', () => {
    const result = validateSchedule({
      sport_room_id: '1', day_of_week: '1', start_time: '25:00', end_time: 'mañana', status: true,
    })

    expect(result.errors.start_time).toMatch(/hora válida/i)
    expect(result.errors.end_time).toMatch(/hora válida/i)
  })
})

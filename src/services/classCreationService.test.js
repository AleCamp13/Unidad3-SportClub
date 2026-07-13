import * as assignmentService from './assignmentService'
import * as scheduleService from './scheduleService'
import { ClassCreationError, createClass } from './classCreationService'

vi.mock('./assignmentService', () => ({ createAssignment: vi.fn() }))
vi.mock('./scheduleService', () => ({ createSchedule: vi.fn() }))

const VALIDATED = {
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
    end_time: '10:00',
    status: true,
  },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createClass', () => {
  it('reuses an active matching assignment and creates only the schedule', async () => {
    const assignment = { id: 8, ...VALIDATED.assignment }
    const schedule = { id: 12, sport_room_id: 8, ...VALIDATED.schedule }
    scheduleService.createSchedule.mockResolvedValue(schedule)

    const result = await createClass('jwt-token', VALIDATED, [assignment])

    expect(assignmentService.createAssignment).not.toHaveBeenCalled()
    expect(scheduleService.createSchedule).toHaveBeenCalledWith('jwt-token', {
      ...VALIDATED.schedule,
      sport_room_id: 8,
    })
    expect(result).toEqual({ assignment, schedule, reusedAssignment: true })
  })

  it('creates an assignment before creating the schedule when no match exists', async () => {
    const assignment = { id: 9, ...VALIDATED.assignment }
    const schedule = { id: 13, sport_room_id: 9, ...VALIDATED.schedule }
    assignmentService.createAssignment.mockResolvedValue(assignment)
    scheduleService.createSchedule.mockResolvedValue(schedule)

    const result = await createClass('jwt-token', VALIDATED, [])

    expect(assignmentService.createAssignment).toHaveBeenCalledWith('jwt-token', VALIDATED.assignment)
    expect(scheduleService.createSchedule).toHaveBeenCalledWith('jwt-token', {
      ...VALIDATED.schedule,
      sport_room_id: 9,
    })
    expect(result).toEqual({ assignment, schedule, reusedAssignment: false })
  })

  it('preserves API error details when schedule creation fails after creating an assignment', async () => {
    const assignment = { id: 9, ...VALIDATED.assignment }
    const apiError = Object.assign(new Error('Horario duplicado'), {
      errors: { schedule: 'Ya existe un horario activo.' },
      status: 409,
    })
    assignmentService.createAssignment.mockResolvedValue(assignment)
    scheduleService.createSchedule.mockRejectedValue(apiError)

    const creation = createClass('jwt-token', VALIDATED, [])

    await expect(creation).rejects.toBeInstanceOf(ClassCreationError)
    await expect(creation).rejects.toMatchObject({
      name: 'ClassCreationError',
      message: 'Horario duplicado',
      errors: { schedule: 'Ya existe un horario activo.' },
      status: 409,
      assignmentCreated: true,
      cause: apiError,
    })
  })
})

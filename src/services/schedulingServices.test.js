import { apiRequest } from './apiClient'
import * as assignmentService from './assignmentService'
import * as scheduleService from './scheduleService'

vi.mock('./apiClient', () => ({ apiRequest: vi.fn() }))

const AUTH = { Authorization: 'Bearer jwt-token' }

beforeEach(() => {
  apiRequest.mockResolvedValue([])
})

describe('assignmentService', () => {
  it('supports assignment CRUD with the sport-room contract', async () => {
    const payload = { sport_id: 2, room_id: 3, coach_id: 4, observation: 'Grupo inicial', status: true }

    await assignmentService.listAssignments('jwt-token')
    await assignmentService.createAssignment('jwt-token', payload)
    await assignmentService.updateAssignment('jwt-token', 8, { observation: 'Grupo avanzado' })
    await assignmentService.deleteAssignment('jwt-token', 8)

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/sport-rooms', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/sport-rooms', {
      method: 'POST', headers: AUTH, body: payload,
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/sport-rooms/8', {
      method: 'PUT', headers: AUTH, body: { observation: 'Grupo avanzado' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/sport-rooms/8', {
      method: 'DELETE', headers: AUTH,
    })
  })
})

describe('scheduleService', () => {
  it('supports schedule CRUD with numeric day and assignment fields', async () => {
    const payload = {
      sport_room_id: 8, day_of_week: 2, start_time: '09:00', end_time: '10:00', status: true,
    }

    await scheduleService.listSchedules('jwt-token')
    await scheduleService.createSchedule('jwt-token', payload)
    await scheduleService.updateSchedule('jwt-token', 12, { start_time: '10:00', end_time: '11:00' })
    await scheduleService.deleteSchedule('jwt-token', 12)

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/class-schedules', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/class-schedules', {
      method: 'POST', headers: AUTH, body: payload,
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/class-schedules/12', {
      method: 'PUT', headers: AUTH, body: { start_time: '10:00', end_time: '11:00' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/class-schedules/12', {
      method: 'DELETE', headers: AUTH,
    })
  })
})

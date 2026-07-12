import { apiRequest } from './apiClient'
import * as coachService from './coachService'
import * as memberService from './memberService'
import * as reservationService from './reservationService'

vi.mock('./apiClient', () => ({ apiRequest: vi.fn() }))

const AUTH = { Authorization: 'Bearer jwt-token' }

beforeEach(() => {
  apiRequest.mockResolvedValue([])
})

describe('coachService', () => {
  it('uses every documented coach endpoint', async () => {
    await coachService.getCoachDashboard('jwt-token')
    await coachService.getCoachClasses('jwt-token')
    await coachService.getCoachSchedules('jwt-token')
    await coachService.getCoachRooms('jwt-token')

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/coach/dashboard', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/coach/my-classes', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/coach/my-schedules', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/coach/my-rooms', { headers: AUTH })
  })
})

describe('memberService', () => {
  it('uses dashboard, classes, detail, sports, and rooms endpoints', async () => {
    await memberService.getMemberDashboard('jwt-token')
    await memberService.getAvailableClasses('jwt-token')
    await memberService.getAvailableClass('jwt-token', 8)
    await memberService.getAvailableSports('jwt-token')
    await memberService.getAvailableRooms('jwt-token')

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/member/dashboard', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/member/classes', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/member/classes/8', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/member/sports', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(5, '/member/rooms', { headers: AUTH })
  })
})

describe('reservationService', () => {
  it('lists, creates, and cancels reservations with exact payloads', async () => {
    const payload = { class_schedule_id: 12, observation: 'Primera clase' }

    await reservationService.getMyReservations('jwt-token')
    await reservationService.createReservation('jwt-token', payload)
    await reservationService.cancelReservation('jwt-token', 21)

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/reservations/my-reservations', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/reservations', {
      method: 'POST', headers: AUTH, body: payload,
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/reservations/21/cancel', {
      method: 'PATCH', headers: AUTH,
    })
  })
})

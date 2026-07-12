import { apiRequest } from './apiClient'
import * as roomsService from './roomsService'
import * as sportsService from './sportsService'
import * as usersService from './usersService'

vi.mock('./apiClient', () => ({ apiRequest: vi.fn() }))

const AUTH = { Authorization: 'Bearer jwt-token' }

beforeEach(() => {
  apiRequest.mockResolvedValue([])
})

describe('usersService', () => {
  it('lists users with an optional role filter and bearer token', async () => {
    await usersService.listUsers('jwt-token', { role: 'coach' })

    expect(apiRequest).toHaveBeenCalledWith('/users?role=coach', { headers: AUTH })
  })

  it('creates, updates, and deletes users with the exact backend contract', async () => {
    const payload = {
      full_name: 'Ana Pérez',
      email: 'ana@example.cl',
      password: '12345678',
      role: 'coach',
      birth_date: '1992-03-12',
      must_change_password: true,
      metadata: { sports: [{ name: 'Tenis', frequency_per_week: 2 }] },
    }

    await usersService.createUser('jwt-token', payload)
    await usersService.updateUser('jwt-token', 7, { full_name: 'Ana Pérez Soto' })
    await usersService.deleteUser('jwt-token', 7)

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/users', {
      method: 'POST', headers: AUTH, body: payload,
    })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/users/7', {
      method: 'PUT', headers: AUTH, body: { full_name: 'Ana Pérez Soto' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/users/7', {
      method: 'DELETE', headers: AUTH,
    })
  })
})

describe('sportsService', () => {
  it('supports sport CRUD and the dedicated status endpoint', async () => {
    const payload = { name: 'Natación', objective: 'Mejorar resistencia', duration: 60, status: true }

    await sportsService.listSports('jwt-token')
    await sportsService.createSport('jwt-token', payload)
    await sportsService.updateSport('jwt-token', 3, { duration: 75 })
    await sportsService.changeSportStatus('jwt-token', 3, false)
    await sportsService.deleteSport('jwt-token', 3)

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/sports', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/sports', {
      method: 'POST', headers: AUTH, body: payload,
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/sports/3', {
      method: 'PUT', headers: AUTH, body: { duration: 75 },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/sports/3/status', {
      method: 'PATCH', headers: AUTH, body: { status: false },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(5, '/sports/3', {
      method: 'DELETE', headers: AUTH,
    })
  })
})

describe('roomsService', () => {
  it('supports room CRUD without changing the backend field names', async () => {
    const payload = {
      name: 'Sala Norte',
      description: 'Sala para entrenamiento funcional',
      capacity: 24,
      location: 'Piso 2',
      image_url: 'https://example.cl/sala.jpg',
      observation: 'Acceso por escalera',
      status: true,
    }

    await roomsService.listRooms('jwt-token')
    await roomsService.createRoom('jwt-token', payload)
    await roomsService.updateRoom('jwt-token', 4, { status: false })
    await roomsService.deleteRoom('jwt-token', 4)

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/rooms', { headers: AUTH })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/rooms', {
      method: 'POST', headers: AUTH, body: payload,
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/rooms/4', {
      method: 'PUT', headers: AUTH, body: { status: false },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(4, '/rooms/4', {
      method: 'DELETE', headers: AUTH,
    })
  })
})

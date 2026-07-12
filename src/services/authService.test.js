import { apiRequest } from './apiClient'
import {
  changePassword,
  getCurrentUser,
  login,
  register,
  updateProfile,
} from './authService'

vi.mock('./apiClient', () => ({
  apiRequest: vi.fn(),
}))

describe('authService', () => {
  it('sends the login credentials and returns the unwrapped session', async () => {
    const session = { token: 'jwt-token', user: { id: 1, role: 'admin' } }
    apiRequest.mockResolvedValue(session)

    await expect(login({ email: 'admin1@demo.cl', password: '12345678' })).resolves.toEqual(session)
    expect(apiRequest).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: { email: 'admin1@demo.cl', password: '12345678' },
    })
  })

  it('registers only the supported user fields without a role', async () => {
    const payload = {
      full_name: 'Ana Perez',
      email: 'ana@example.cl',
      password: '12345678',
      birth_date: '2000-05-10',
      metadata: { sports: [{ name: 'tenis', frequency_per_week: 2 }] },
      role: 'admin',
      confirm_password: '12345678',
    }

    await register(payload)

    expect(apiRequest).toHaveBeenCalledWith('/auth/register', {
      method: 'POST',
      body: {
        full_name: 'Ana Perez',
        email: 'ana@example.cl',
        password: '12345678',
        birth_date: '2000-05-10',
        metadata: { sports: [{ name: 'tenis', frequency_per_week: 2 }] },
      },
    })
  })

  it('sends the Bearer token through apiClient for every protected auth request', async () => {
    await getCurrentUser('jwt-token')
    await updateProfile('jwt-token', { full_name: 'Nombre Actualizado' })
    await changePassword('jwt-token', {
      current_password: '12345678',
      new_password: '87654321',
      confirm_password: '87654321',
    })

    const authorization = { Authorization: 'Bearer jwt-token' }
    expect(apiRequest).toHaveBeenNthCalledWith(1, '/auth/me', { headers: authorization })
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/auth/me', {
      method: 'PUT',
      headers: authorization,
      body: { full_name: 'Nombre Actualizado' },
    })
    expect(apiRequest).toHaveBeenNthCalledWith(3, '/auth/me/password', {
      method: 'PUT',
      headers: authorization,
      body: {
        current_password: '12345678',
        new_password: '87654321',
        confirm_password: '87654321',
      },
    })
  })
})

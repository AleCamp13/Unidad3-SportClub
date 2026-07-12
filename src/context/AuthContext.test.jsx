import { act, render, screen, waitFor } from '@testing-library/react'
import { ApiError } from '../services/apiClient'
import * as authService from '../services/authService'
import { AuthProvider } from './AuthContext'
import useAuth from '../hooks/useAuth'

vi.mock('../services/authService')

function AuthProbe() {
  const auth = useAuth()
  return (
    <div>
      <span>{auth.isRestoring ? 'restaurando' : 'listo'}</span>
      <span>{auth.user?.full_name || 'sin usuario'}</span>
      <button type="button" onClick={() => auth.login({ email: 'user1@demo.cl', password: '12345678' })}>
        login
      </button>
      <button type="button" onClick={() => auth.register({ email: 'new@example.cl' })}>
        registro
      </button>
      <button type="button" onClick={auth.logout}>logout</button>
    </div>
  )
}

function renderProvider() {
  return render(<AuthProvider><AuthProbe /></AuthProvider>)
}

describe('AuthProvider', () => {
  it('does not authenticate from an orphaned stored user without a token', async () => {
    localStorage.clear()
    localStorage.setItem('sportclub_user', JSON.stringify({ id: 1, full_name: 'Usuario huérfano', role: 'user' }))

    renderProvider()

    expect(await screen.findByText('sin usuario')).toBeInTheDocument()
    expect(localStorage.getItem('sportclub_user')).toBeNull()
    expect(authService.getCurrentUser).not.toHaveBeenCalled()
  })

  it('restores a saved session only after validating its token with /auth/me', async () => {
    localStorage.clear()
    localStorage.setItem('sportclub_token', 'saved-token')
    localStorage.setItem('sportclub_user', JSON.stringify({ id: 1, full_name: 'Nombre antiguo', role: 'user' }))
    authService.getCurrentUser.mockResolvedValue({ id: 1, full_name: 'Nombre vigente', role: 'user' })

    renderProvider()

    expect(screen.getByText('restaurando')).toBeInTheDocument()
    expect(authService.getCurrentUser).toHaveBeenCalledWith('saved-token')
    expect(await screen.findByText('Nombre vigente')).toBeInTheDocument()
    expect(screen.getByText('listo')).toBeInTheDocument()
    expect(JSON.parse(localStorage.getItem('sportclub_user')).full_name).toBe('Nombre vigente')
  })

  it('clears an expired saved session after /auth/me returns 401', async () => {
    localStorage.clear()
    localStorage.setItem('sportclub_token', 'expired-token')
    localStorage.setItem('sportclub_user', JSON.stringify({ id: 1, role: 'user' }))
    authService.getCurrentUser.mockRejectedValue(new ApiError('Token inválido.', { status: 401 }))

    renderProvider()

    expect(await screen.findByText('sin usuario')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('listo')).toBeInTheDocument())
    expect(localStorage.getItem('sportclub_token')).toBeNull()
    expect(localStorage.getItem('sportclub_user')).toBeNull()
  })

  it('persists login, leaves registration unauthenticated, and clears logout', async () => {
    localStorage.clear()
    authService.login.mockResolvedValue({
      token: 'new-token',
      user: { id: 3, full_name: 'Demo User 1', role: 'user' },
    })
    authService.register.mockResolvedValue({ id: 8, role: 'user' })
    renderProvider()
    await waitFor(() => expect(screen.getByText('listo')).toBeInTheDocument())

    await act(async () => screen.getByRole('button', { name: 'registro' }).click())
    expect(screen.getByText('sin usuario')).toBeInTheDocument()
    expect(localStorage.getItem('sportclub_token')).toBeNull()

    await act(async () => screen.getByRole('button', { name: 'login' }).click())
    expect(await screen.findByText('Demo User 1')).toBeInTheDocument()
    expect(localStorage.getItem('sportclub_token')).toBe('new-token')

    act(() => screen.getByRole('button', { name: 'logout' }).click())
    expect(screen.getByText('sin usuario')).toBeInTheDocument()
    expect(localStorage.getItem('sportclub_token')).toBeNull()
  })
})

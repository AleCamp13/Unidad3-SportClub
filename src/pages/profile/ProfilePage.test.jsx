import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import * as authService from '../../services/authService'
import ProfilePage from './ProfilePage'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/authService')

const currentUser = {
  id: 3,
  full_name: 'Demo User 1',
  email: 'user1@demo.cl',
  role: 'user',
  birth_date: '2000-01-10',
  metadata: { sports: [{ name: 'football', frequency_per_week: 3 }] },
}

function renderProfile(overrides = {}) {
  const auth = {
    user: currentUser,
    token: 'jwt-token',
    refreshUser: vi.fn().mockResolvedValue({ ...currentUser, full_name: 'Nombre Actualizado' }),
    ...overrides,
  }
  useAuth.mockReturnValue(auth)
  render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <ProfilePage />
    </MemoryRouter>,
  )
  return auth
}

describe('ProfilePage', () => {
  it('updates the profile and refreshes auth context immediately', async () => {
    const user = userEvent.setup()
    authService.updateProfile.mockResolvedValue({ ...currentUser, full_name: 'Nombre Actualizado' })
    const auth = renderProfile()

    const nameInput = screen.getByLabelText('Nombre completo')
    await user.clear(nameInput)
    await user.type(nameInput, 'Nombre Actualizado')
    await user.click(screen.getByRole('button', { name: 'Guardar perfil' }))

    await waitFor(() => expect(authService.updateProfile).toHaveBeenCalledWith('jwt-token', expect.objectContaining({
      full_name: 'Nombre Actualizado',
      email: 'user1@demo.cl',
    })))
    expect(auth.refreshUser).toHaveBeenCalledTimes(1)
    expect(await screen.findByText('Perfil actualizado correctamente.')).toBeInTheDocument()
  })

  it('validates and changes the password with the exact backend payload', async () => {
    const user = userEvent.setup()
    authService.changePassword.mockResolvedValue(null)
    renderProfile()

    await user.type(screen.getByLabelText('Contraseña actual'), '12345678')
    await user.type(screen.getByLabelText('Nueva contraseña'), '87654321')
    await user.type(screen.getByLabelText('Confirmar nueva contraseña'), '87654321')
    await user.click(screen.getByRole('button', { name: 'Actualizar contraseña' }))

    await waitFor(() => expect(authService.changePassword).toHaveBeenCalledWith('jwt-token', {
      current_password: '12345678',
      new_password: '87654321',
      confirm_password: '87654321',
    }))
    expect(await screen.findByText('Contraseña actualizada correctamente.')).toBeInTheDocument()
    expect(screen.getByLabelText('Contraseña actual')).toHaveValue('')
  })
})

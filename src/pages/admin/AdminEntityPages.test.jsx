import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import useAuth from '../../hooks/useAuth'
import { ApiError } from '../../services/apiClient'
import * as roomsService from '../../services/roomsService'
import * as sportsService from '../../services/sportsService'
import * as usersService from '../../services/usersService'
import AdminRoomsPage from './AdminRoomsPage'
import AdminSportsPage from './AdminSportsPage'
import AdminUsersPage from './AdminUsersPage'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/roomsService')
vi.mock('../../services/sportsService')
vi.mock('../../services/usersService')
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

beforeEach(() => {
  useAuth.mockReturnValue({
    token: 'jwt-token',
    user: { id: 5, full_name: 'Demo Admin 1', role: 'admin' },
  })
  Swal.fire.mockResolvedValue({ isConfirmed: true })
})

describe('AdminUsersPage', () => {
  it('loads users, protects the current account, deletes another user, and refreshes', async () => {
    const user = userEvent.setup()
    const initialUsers = [
      { id: 5, full_name: 'Demo Admin 1', email: 'admin1@demo.cl', role: 'admin', birth_date: '1990-09-01' },
      { id: 7, full_name: 'Ana Pérez', email: 'ana@example.cl', role: 'coach', birth_date: '1992-03-12' },
    ]
    usersService.listUsers
      .mockResolvedValueOnce(initialUsers)
      .mockResolvedValueOnce(initialUsers.slice(0, 1))
    usersService.deleteUser.mockResolvedValue(null)

    render(<AdminUsersPage />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando usuarios')
    expect(await screen.findByText('Ana Pérez')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Eliminar Demo Admin 1' })).toBeDisabled()

    await user.click(screen.getByRole('button', { name: 'Eliminar Ana Pérez' }))

    expect(Swal.fire).toHaveBeenCalledWith(expect.objectContaining({
      icon: 'warning', showCancelButton: true,
    }))
    await waitFor(() => expect(usersService.deleteUser).toHaveBeenCalledWith('jwt-token', 7))
    await waitFor(() => expect(usersService.listUsers).toHaveBeenCalledTimes(2))
    expect(screen.queryByText('Ana Pérez')).not.toBeInTheDocument()
  })

  it('edits a user and refreshes the table', async () => {
    const user = userEvent.setup()
    const current = {
      id: 5, full_name: 'Demo Admin 1', email: 'admin1@demo.cl', role: 'admin',
      birth_date: '1990-09-01', must_change_password: false, metadata: { sports: [] },
    }
    usersService.listUsers
      .mockResolvedValueOnce([current])
      .mockResolvedValueOnce([{ ...current, full_name: 'Alejandra Admin' }])
    usersService.updateUser.mockResolvedValue({ ...current, full_name: 'Alejandra Admin' })

    render(<AdminUsersPage />)
    await user.click(await screen.findByRole('button', { name: 'Editar Demo Admin 1' }))
    await user.clear(screen.getByLabelText('Nombre completo'))
    await user.type(screen.getByLabelText('Nombre completo'), 'Alejandra Admin')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(usersService.updateUser).toHaveBeenCalledWith('jwt-token', 5, {
      full_name: 'Alejandra Admin',
      email: 'admin1@demo.cl',
      role: 'admin',
      birth_date: '1990-09-01',
      must_change_password: false,
      metadata: { sports: [] },
    }))
    expect(await screen.findByText('Alejandra Admin')).toBeInTheDocument()
  })
})

describe('AdminSportsPage', () => {
  it('confirms a status change through SweetAlert and refreshes without reloading the browser', async () => {
    const user = userEvent.setup()
    sportsService.listSports
      .mockResolvedValueOnce([{ id: 3, name: 'Natación', objective: 'Resistencia', duration: 60, status: true }])
      .mockResolvedValueOnce([{ id: 3, name: 'Natación', objective: 'Resistencia', duration: 60, status: false }])
    sportsService.changeSportStatus.mockResolvedValue({ id: 3, status: false })

    render(<AdminSportsPage />)
    await user.click(await screen.findByRole('button', { name: 'Desactivar Natación' }))

    await waitFor(() => expect(sportsService.changeSportStatus).toHaveBeenCalledWith('jwt-token', 3, false))
    await waitFor(() => expect(sportsService.listSports).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Inactivo')).toBeInTheDocument()
  })
})

describe('AdminRoomsPage', () => {
  it('shows a recoverable API error and retries the list request', async () => {
    const user = userEvent.setup()
    roomsService.listRooms
      .mockRejectedValueOnce(new ApiError('No fue posible conectar con el servidor.'))
      .mockResolvedValueOnce([{ id: 4, name: 'Sala Norte', description: 'Sala funcional', capacity: 24, status: true }])

    render(<AdminRoomsPage />)

    expect(await screen.findByText('No fue posible conectar con el servidor.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar' }))

    expect(await screen.findByText('Sala Norte')).toBeInTheDocument()
    expect(roomsService.listRooms).toHaveBeenCalledTimes(2)
  })

  it('shows an empty state with a working create action', async () => {
    const user = userEvent.setup()
    roomsService.listRooms
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ id: 4, name: 'Sala Norte', description: 'Sala funcional', capacity: 1, status: true }])
    roomsService.createRoom.mockResolvedValue({ id: 4 })

    render(<AdminRoomsPage />)

    expect(await screen.findByText('No hay salas registradas')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Crear primera sala' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('Nueva sala')
    await user.type(screen.getByLabelText('Nombre de la sala'), 'Sala Norte')
    await user.type(screen.getByLabelText('Descripción'), 'Sala funcional')
    await user.click(screen.getByRole('button', { name: 'Guardar sala' }))

    await waitFor(() => expect(roomsService.createRoom).toHaveBeenCalledWith('jwt-token', {
      name: 'Sala Norte', description: 'Sala funcional', capacity: 1,
      location: '', image_url: '', observation: '', status: true,
    }))
    expect(await screen.findByText('Sala Norte')).toBeInTheDocument()
  })
})

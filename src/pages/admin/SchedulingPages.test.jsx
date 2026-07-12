import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Swal from 'sweetalert2'
import useAuth from '../../hooks/useAuth'
import { ApiError } from '../../services/apiClient'
import * as assignmentService from '../../services/assignmentService'
import * as roomsService from '../../services/roomsService'
import * as scheduleService from '../../services/scheduleService'
import * as sportsService from '../../services/sportsService'
import * as usersService from '../../services/usersService'
import AdminAssignmentsPage from './AdminAssignmentsPage'
import AdminSchedulesPage from './AdminSchedulesPage'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/assignmentService')
vi.mock('../../services/roomsService')
vi.mock('../../services/scheduleService')
vi.mock('../../services/sportsService')
vi.mock('../../services/usersService')
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

const assignment = {
  id: 8,
  sport_id: 2,
  room_id: 3,
  coach_id: 4,
  observation: 'Grupo inicial',
  status: true,
  sport: { id: 2, name: 'Yoga', status: true },
  room: { id: 3, name: 'Sala Yoga', status: true },
  coach: { id: 4, full_name: 'Demo Coach 2', role: 'coach' },
  schedules: [],
}
const schedule = {
  id: 12,
  sport_room_id: 8,
  day_of_week: 2,
  start_time: '09:00:00',
  end_time: '10:00:00',
  status: true,
  sportRoom: assignment,
}

beforeEach(() => {
  useAuth.mockReturnValue({ token: 'jwt-token', user: { id: 5, role: 'admin' } })
  sportsService.listSports.mockResolvedValue([assignment.sport])
  roomsService.listRooms.mockResolvedValue([assignment.room])
  usersService.listUsers.mockResolvedValue([assignment.coach])
  Swal.fire.mockResolvedValue({ isConfirmed: true })
})

describe('AdminAssignmentsPage', () => {
  it('loads real references, creates an assignment, and refreshes the joined table', async () => {
    const user = userEvent.setup()
    assignmentService.listAssignments.mockResolvedValueOnce([]).mockResolvedValueOnce([assignment])
    assignmentService.createAssignment.mockResolvedValue({ id: 8 })

    render(<AdminAssignmentsPage />)
    const createButton = await screen.findByRole('button', { name: 'Nueva asignación' })
    await waitFor(() => expect(createButton).toBeEnabled())
    await user.click(createButton)
    await user.selectOptions(screen.getByLabelText('Deporte'), '2')
    await user.selectOptions(screen.getByLabelText('Sala'), '3')
    await user.selectOptions(screen.getByLabelText('Entrenador'), '4')
    await user.type(screen.getByLabelText('Observación'), 'Grupo inicial')
    await user.click(screen.getByRole('button', { name: 'Guardar asignación' }))

    await waitFor(() => expect(assignmentService.createAssignment).toHaveBeenCalledWith('jwt-token', {
      sport_id: 2, room_id: 3, coach_id: 4, observation: 'Grupo inicial', status: true,
    }))
    expect(await screen.findByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('Sala Yoga')).toBeInTheDocument()
    expect(screen.getByText('Demo Coach 2')).toBeInTheDocument()
    expect(usersService.listUsers).toHaveBeenCalledWith('jwt-token', { role: 'coach' })
    expect(assignmentService.listAssignments).toHaveBeenCalledTimes(2)
  })

  it('confirms deletion and refreshes the assignment list', async () => {
    const user = userEvent.setup()
    assignmentService.listAssignments.mockResolvedValueOnce([assignment]).mockResolvedValueOnce([])
    assignmentService.deleteAssignment.mockResolvedValue(null)

    render(<AdminAssignmentsPage />)
    await user.click(await screen.findByRole('button', { name: 'Eliminar Yoga · Sala Yoga · Demo Coach 2' }))

    await waitFor(() => expect(assignmentService.deleteAssignment).toHaveBeenCalledWith('jwt-token', 8))
    expect(assignmentService.listAssignments).toHaveBeenCalledTimes(2)
    expect(await screen.findByText('No hay asignaciones registradas')).toBeInTheDocument()
  })

  it('surfaces a reference-loading error and retries it', async () => {
    const user = userEvent.setup()
    assignmentService.listAssignments.mockResolvedValue([])
    sportsService.listSports
      .mockRejectedValueOnce(new ApiError('No fue posible cargar deportes.'))
      .mockResolvedValueOnce([assignment.sport])

    render(<AdminAssignmentsPage />)

    expect(await screen.findByText('No fue posible cargar deportes.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Reintentar referencias' }))
    await waitFor(() => expect(sportsService.listSports).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('button', { name: 'Nueva asignación' })).toBeEnabled()
  })
})

describe('AdminSchedulesPage', () => {
  it('renders joined schedule values, edits a time, and refreshes', async () => {
    const user = userEvent.setup()
    assignmentService.listAssignments.mockResolvedValue([assignment])
    scheduleService.listSchedules
      .mockResolvedValueOnce([schedule])
      .mockResolvedValueOnce([{ ...schedule, end_time: '11:00:00' }])
    scheduleService.updateSchedule.mockResolvedValue({ ...schedule, end_time: '11:00:00' })

    render(<AdminSchedulesPage />)

    expect(await screen.findByText('Martes')).toBeInTheDocument()
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Editar Yoga · Sala Yoga · Martes 09:00' }))
    await user.clear(screen.getByLabelText('Hora de término'))
    await user.type(screen.getByLabelText('Hora de término'), '11:00')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(scheduleService.updateSchedule).toHaveBeenCalledWith('jwt-token', 12, {
      sport_room_id: 8, day_of_week: 2, start_time: '09:00', end_time: '11:00', status: true,
    }))
    expect(await screen.findByText('09:00 - 11:00')).toBeInTheDocument()
    expect(scheduleService.listSchedules).toHaveBeenCalledTimes(2)
  })
})

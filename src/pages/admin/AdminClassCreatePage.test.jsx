import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { ClassCreationError, createClass } from '../../services/classCreationService'
import * as assignmentService from '../../services/assignmentService'
import * as roomsService from '../../services/roomsService'
import * as sportsService from '../../services/sportsService'
import * as usersService from '../../services/usersService'
import AdminClassCreatePage from './AdminClassCreatePage'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/assignmentService')
vi.mock('../../services/classCreationService', async (importOriginal) => {
  const actual = await importOriginal()
  return { ...actual, createClass: vi.fn() }
})
vi.mock('../../services/roomsService')
vi.mock('../../services/sportsService')
vi.mock('../../services/usersService')

const activeReferences = {
  sports: [
    { id: 2, name: 'Yoga', status: true },
    { id: 8, name: 'Boxeo', status: false },
  ],
  rooms: [
    { id: 3, name: 'Sala Yoga', status: true },
    { id: 9, name: 'Sala cerrada', status: false },
  ],
  coaches: [
    { id: 4, full_name: 'Demo Coach 2', role: 'coach', status: true },
    { id: 7, full_name: 'Coach inactivo', role: 'coach', status: false },
  ],
  assignments: [{ id: 12, sport_id: 2, room_id: 3, coach_id: 4, status: true }],
}

function mockReferences(references = activeReferences) {
  sportsService.listSports.mockResolvedValue(references.sports)
  roomsService.listRooms.mockResolvedValue(references.rooms)
  usersService.listUsers.mockResolvedValue(references.coaches)
  assignmentService.listAssignments.mockResolvedValue(references.assignments)
}

function renderPage() {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AdminClassCreatePage />
    </MemoryRouter>,
  )
}

async function fillRequiredFields(user) {
  await user.selectOptions(screen.getByLabelText('Deporte'), '2')
  await user.selectOptions(screen.getByLabelText('Sala'), '3')
  await user.selectOptions(screen.getByLabelText('Entrenador'), '4')
  await user.selectOptions(screen.getByLabelText(/D.a de la semana/), '3')
  await user.type(screen.getByLabelText('Hora de inicio'), '18:00')
  await user.type(screen.getByLabelText(/Hora de t.rmino/), '18:50')
}

beforeEach(() => {
  useAuth.mockReturnValue({ token: 'jwt-token' })
})

describe('AdminClassCreatePage', () => {
  it('loads active references and submits normalized class data', async () => {
    const user = userEvent.setup()
    mockReferences()
    createClass.mockResolvedValue({ assignment: { id: 12 }, schedule: { id: 20 }, reusedAssignment: true })

    renderPage()

    expect(await screen.findByRole('option', { name: 'Yoga' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Boxeo' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Sala cerrada' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Coach inactivo' })).not.toBeInTheDocument()

    await fillRequiredFields(user)
    await user.type(screen.getByLabelText(/Observaci.n/), ' Grupo guiado ')
    await user.click(screen.getByRole('button', { name: 'Crear clase' }))

    await waitFor(() => expect(createClass).toHaveBeenCalledWith('jwt-token', {
      isValid: true,
      errors: {},
      assignment: {
        sport_id: 2, room_id: 3, coach_id: 4, observation: 'Grupo guiado', status: true,
      },
      schedule: {
        day_of_week: 3, start_time: '18:00', end_time: '18:50', status: true,
      },
    }, activeReferences.assignments))
    expect(await screen.findByRole('alert')).toHaveTextContent('Clase creada')
    expect(screen.getByLabelText('Deporte')).toHaveValue('')
  })

  it('shows validation errors without creating a class', async () => {
    const user = userEvent.setup()
    mockReferences()

    renderPage()

    await screen.findByRole('option', { name: 'Yoga' })
    await user.click(screen.getByRole('button', { name: 'Crear clase' }))

    expect(await screen.findByText(/Selecciona un deporte v.lido/)).toBeInTheDocument()
    expect(createClass).not.toHaveBeenCalled()
  })

  it('explains when the assignment persisted but scheduling failed', async () => {
    const user = userEvent.setup()
    mockReferences()
    createClass.mockRejectedValue(new ClassCreationError(new Error('El horario ya existe.'), { assignmentCreated: true }))

    renderPage()

    await screen.findByRole('option', { name: 'Yoga' })
    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Crear clase' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(/vinculaci.n qued. guardada, pero el horario no pudo crearse. Reintenta el horario/)
  })

  it('refreshes assignments before retrying a schedule failure after assignment persistence', async () => {
    const user = userEvent.setup()
    const refreshedAssignments = [{ id: 18, sport_id: 2, room_id: 3, coach_id: 4, status: true }]
    mockReferences({ ...activeReferences, assignments: [] })
    assignmentService.listAssignments
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(refreshedAssignments)
    createClass
      .mockRejectedValueOnce(new ClassCreationError(new Error('El horario ya existe.'), { assignmentCreated: true }))
      .mockResolvedValueOnce({ assignment: refreshedAssignments[0], schedule: { id: 21 }, reusedAssignment: true })

    renderPage()

    await screen.findByRole('option', { name: 'Yoga' })
    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Crear clase' }))

    await waitFor(() => expect(assignmentService.listAssignments).toHaveBeenCalledTimes(2))
    expect(await screen.findByRole('alert')).toHaveTextContent(/vinculaci.n qued. guardada, pero el horario no pudo crearse. Reintenta el horario/)
    await user.click(screen.getByRole('button', { name: 'Crear clase' }))

    await waitFor(() => expect(createClass).toHaveBeenCalledTimes(2))
    expect(createClass).toHaveBeenNthCalledWith(2, 'jwt-token', expect.any(Object), refreshedAssignments)
  })

  it('refreshes assignments after creating a class before another same-resource submission', async () => {
    const user = userEvent.setup()
    const refreshedAssignments = [{ id: 22, sport_id: 2, room_id: 3, coach_id: 4, status: true }]
    mockReferences({ ...activeReferences, assignments: [] })
    assignmentService.listAssignments
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(refreshedAssignments)
    createClass
      .mockResolvedValueOnce({ assignment: refreshedAssignments[0], schedule: { id: 23 }, reusedAssignment: false })
      .mockResolvedValueOnce({ assignment: refreshedAssignments[0], schedule: { id: 24 }, reusedAssignment: true })

    renderPage()

    await screen.findByRole('option', { name: 'Yoga' })
    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Crear clase' }))

    await waitFor(() => expect(assignmentService.listAssignments).toHaveBeenCalledTimes(2))
    expect(screen.getByLabelText('Deporte')).toHaveValue('')
    await fillRequiredFields(user)
    await user.click(screen.getByRole('button', { name: 'Crear clase' }))

    await waitFor(() => expect(createClass).toHaveBeenCalledTimes(2))
    expect(createClass).toHaveBeenNthCalledWith(2, 'jwt-token', expect.any(Object), refreshedAssignments)
  })
})

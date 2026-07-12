import { render, screen } from '@testing-library/react'
import useAuth from '../../hooks/useAuth'
import * as coachService from '../../services/coachService'
import CoachClassesPage from './CoachClassesPage'
import CoachDashboardPage from './CoachDashboardPage'
import CoachRoomsPage from './CoachRoomsPage'
import CoachSchedulesPage from './CoachSchedulesPage'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/coachService')

const coachClass = {
  id: 1,
  sport: { id: 2, name: 'Yoga', objective: 'Mejorar flexibilidad', duration: 45 },
  room: { id: 3, name: 'Sala Yoga', location: 'Segundo piso', capacity: 20 },
  coach: { id: 4, email: 'coach2@demo.cl', role: 'coach' },
  schedules: [{ id: 12, day_of_week: 2, start_time: '09:00:00', end_time: '10:00:00', status: true }],
}
const coachSchedule = { ...coachClass.schedules[0], sportRoom: coachClass }

beforeEach(() => {
  useAuth.mockReturnValue({
    token: 'coach-token',
    user: { id: 4, full_name: 'Demo Coach 2', email: 'coach2@demo.cl', role: 'coach' },
  })
})

describe('CoachDashboardPage', () => {
  it('renders API totals and the next assigned class', async () => {
    coachService.getCoachDashboard.mockResolvedValue({
      total_classes: 1, total_schedules: 1, total_rooms: 1, next_class: coachSchedule,
    })

    render(<CoachDashboardPage />)

    expect(await screen.findByRole('heading', { name: 'Panel de entrenador' })).toBeInTheDocument()
    expect(screen.getByLabelText('1 clase asignada')).toBeInTheDocument()
    expect(screen.getByLabelText('1 horario activo')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Próxima clase' })).toBeInTheDocument()
    expect(screen.getByText('Yoga')).toBeInTheDocument()
  })
})

describe('CoachClassesPage', () => {
  it('renders joined classes and their active schedules', async () => {
    coachService.getCoachClasses.mockResolvedValue([coachClass])

    render(<CoachClassesPage />)

    expect(await screen.findByRole('heading', { name: 'Mis clases' })).toBeInTheDocument()
    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText('Sala Yoga')).toBeInTheDocument()
    expect(screen.getByText('Martes · 09:00 - 10:00')).toBeInTheDocument()
  })
})

describe('CoachSchedulesPage', () => {
  it('renders the coach weekly schedule from the API', async () => {
    coachService.getCoachSchedules.mockResolvedValue([coachSchedule])

    render(<CoachSchedulesPage />)

    expect(await screen.findByRole('heading', { name: 'Mi horario' })).toBeInTheDocument()
    expect(screen.getByText('Martes')).toBeInTheDocument()
    expect(screen.getByText('09:00 - 10:00')).toBeInTheDocument()
    expect(screen.getByText('Sala Yoga')).toBeInTheDocument()
  })
})

describe('CoachRoomsPage', () => {
  it('renders assigned rooms from /coach/my-rooms', async () => {
    coachService.getCoachRooms.mockResolvedValue([{
      id: 3,
      name: 'Sala Yoga',
      description: 'Sala para yoga',
      capacity: 20,
      location: 'Segundo piso',
      observation: 'Usar colchonetas',
      status: true,
      sport: coachClass.sport,
    }])

    render(<CoachRoomsPage />)

    expect(await screen.findByRole('heading', { name: 'Mis salas' })).toBeInTheDocument()
    expect(screen.getByText('Sala Yoga')).toBeInTheDocument()
    expect(screen.getByText('Cupo 20')).toBeInTheDocument()
    expect(screen.getAllByText('Yoga')).toHaveLength(2)
  })
})

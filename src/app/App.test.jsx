import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as authService from '../services/authService'
import * as assignmentService from '../services/assignmentService'
import * as coachService from '../services/coachService'
import * as memberService from '../services/memberService'
import * as reservationService from '../services/reservationService'
import * as roomsService from '../services/roomsService'
import * as sportsService from '../services/sportsService'
import * as usersService from '../services/usersService'
import App from './App'

vi.mock('../services/authService')
vi.mock('../services/assignmentService')
vi.mock('../services/coachService')
vi.mock('../services/memberService')
vi.mock('../services/reservationService')
vi.mock('../services/roomsService')
vi.mock('../services/sportsService')
vi.mock('../services/usersService')

function renderApp(path = '/') {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[path]}
    >
      <App />
    </MemoryRouter>,
  )
}

function saveSession(user) {
  localStorage.setItem('sportclub_token', 'saved-token')
  localStorage.setItem('sportclub_user', JSON.stringify(user))
  authService.getCurrentUser.mockResolvedValue(user)
}

describe('application routes', () => {
  it('redirects unauthenticated root and protected routes to login', async () => {
    localStorage.clear()
    renderApp('/user/dashboard')

    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.queryByText('Panel de usuario')).not.toBeInTheDocument()
  })

  it('restores the session and redirects root to the matching role dashboard', async () => {
    localStorage.clear()
    saveSession({ id: 1, full_name: 'Demo Admin 1', email: 'admin1@demo.cl', role: 'admin' })
    renderApp('/')

    expect(await screen.findByRole('heading', { name: 'Panel de administración' })).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mi perfil' })).toHaveAttribute('href', '/profile')
    expect(screen.getByText('Demo Admin 1')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Gestionar usuarios' })).toHaveAttribute('href', '/admin/users')
    expect(screen.getByRole('link', { name: 'Organizar horarios' })).toHaveAttribute('href', '/admin/schedules')
  })

  it('redirects an authenticated user away from another role dashboard', async () => {
    localStorage.clear()
    saveSession({ id: 3, full_name: 'Demo User 1', email: 'user1@demo.cl', role: 'user' })
    renderApp('/admin/dashboard')

    expect(await screen.findByRole('heading', { name: 'Acceso no autorizado' })).toBeInTheDocument()
    expect(screen.queryByText('Panel de administración')).not.toBeInTheDocument()
  })

  it('exposes the administrative CRUD routes in the admin navigation', async () => {
    localStorage.clear()
    saveSession({ id: 5, full_name: 'Demo Admin 1', email: 'admin1@demo.cl', role: 'admin' })
    usersService.listUsers.mockResolvedValue([])
    renderApp('/admin/users')

    expect(await screen.findByRole('heading', { name: 'Usuarios' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute('href', '/admin/users')
    expect(screen.getByRole('link', { name: 'Deportes' })).toHaveAttribute('href', '/admin/sports')
    expect(screen.getByRole('link', { name: 'Salas' })).toHaveAttribute('href', '/admin/rooms')
  })

  it('exposes assignment and schedule administration to admins', async () => {
    localStorage.clear()
    saveSession({ id: 5, full_name: 'Demo Admin 1', email: 'admin1@demo.cl', role: 'admin' })
    assignmentService.listAssignments.mockResolvedValue([])
    sportsService.listSports.mockResolvedValue([])
    roomsService.listRooms.mockResolvedValue([])
    usersService.listUsers.mockResolvedValue([])
    renderApp('/admin/assignments')

    expect(await screen.findByRole('heading', { name: 'Asignaciones' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Asignaciones' })).toHaveAttribute('href', '/admin/assignments')
    expect(screen.getByRole('link', { name: 'Horarios' })).toHaveAttribute('href', '/admin/schedules')
  })

  it('exposes classes and reservations only in member navigation', async () => {
    localStorage.clear()
    saveSession({ id: 1, full_name: 'Demo User 1', email: 'user1@demo.cl', role: 'user' })
    memberService.getAvailableClasses.mockResolvedValue([])
    memberService.getAvailableSports.mockResolvedValue([])
    memberService.getAvailableRooms.mockResolvedValue([])
    reservationService.getMyReservations.mockResolvedValue([])
    renderApp('/user/classes')

    expect(await screen.findByRole('heading', { name: 'Clases disponibles' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Clases' })).toHaveAttribute('href', '/user/classes')
    expect(screen.getByRole('link', { name: 'Mis reservas' })).toHaveAttribute('href', '/user/reservations')
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument()
  })

  it('exposes assigned work only in coach navigation', async () => {
    localStorage.clear()
    saveSession({ id: 4, full_name: 'Demo Coach 2', email: 'coach2@demo.cl', role: 'coach' })
    coachService.getCoachSchedules.mockResolvedValue([])
    renderApp('/coach/schedules')

    expect(await screen.findByRole('heading', { name: 'Mi horario' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Mis clases' })).toHaveAttribute('href', '/coach/classes')
    expect(screen.getByRole('link', { name: 'Mi horario' })).toHaveAttribute('href', '/coach/schedules')
    expect(screen.getByRole('link', { name: 'Mis salas' })).toHaveAttribute('href', '/coach/rooms')
    expect(screen.queryByRole('link', { name: 'Mis reservas' })).not.toBeInTheDocument()
  })

  it('renders a Spanish not-found state for unknown routes', async () => {
    localStorage.clear()
    renderApp('/ruta-inexistente')

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import * as authService from '../services/authService'
import * as usersService from '../services/usersService'
import App from './App'

vi.mock('../services/authService')
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

  it('renders a Spanish not-found state for unknown routes', async () => {
    localStorage.clear()
    renderApp('/ruta-inexistente')

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })
})

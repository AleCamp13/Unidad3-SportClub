import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import ProtectedRoute from './ProtectedRoute'
import RoleRoute from './RoleRoute'

vi.mock('../hooks/useAuth')

function renderRoutes(element) {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={['/privado']}
    >
      <Routes>
        <Route path="/privado" element={element} />
        <Route path="/login" element={<h1>Ingresar</h1>} />
        <Route path="/unauthorized" element={<h1>Sin autorización</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('route guards', () => {
  it('waits for restoration and redirects guests to login without rendering protected content', () => {
    useAuth.mockReturnValue({ isRestoring: true, user: null })
    const view = renderRoutes(<ProtectedRoute><h1>Contenido privado</h1></ProtectedRoute>)
    expect(screen.getByText('Restaurando sesión')).toBeInTheDocument()
    expect(screen.queryByText('Contenido privado')).not.toBeInTheDocument()

    useAuth.mockReturnValue({ isRestoring: false, user: null })
    view.rerender(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={['/privado']}
      >
        <Routes>
          <Route path="/privado" element={<ProtectedRoute><h1>Contenido privado</h1></ProtectedRoute>} />
          <Route path="/login" element={<h1>Ingresar</h1>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Ingresar' })).toBeInTheDocument()
  })

  it('allows matching roles and redirects mismatched roles to unauthorized', () => {
    useAuth.mockReturnValue({ user: { role: 'coach' } })
    const view = renderRoutes(<RoleRoute allowedRoles={['coach']}><h1>Panel coach</h1></RoleRoute>)
    expect(screen.getByRole('heading', { name: 'Panel coach' })).toBeInTheDocument()

    view.unmount()
    useAuth.mockReturnValue({ user: { role: 'user' } })
    renderRoutes(<RoleRoute allowedRoles={['admin']}><h1>Panel admin</h1></RoleRoute>)
    expect(screen.getByRole('heading', { name: 'Sin autorización' })).toBeInTheDocument()
    expect(screen.queryByText('Panel admin')).not.toBeInTheDocument()
  })
})

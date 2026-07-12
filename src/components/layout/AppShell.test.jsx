import { render, screen } from '@testing-library/react'
import { LayoutDashboard } from 'lucide-react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppShell from './AppShell'

describe('AppShell accessibility', () => {
  it('provides a keyboard skip link and identifies the current navigation item', () => {
    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={['/dashboard']}
      >
        <Routes>
          <Route
            element={(
              <AppShell
                navItems={[{ to: '/dashboard', label: 'Panel', icon: LayoutDashboard }]}
                onLogout={() => {}}
                role="member"
                roleLabel="Membresia"
                user={{ full_name: 'Ana Perez' }}
              />
            )}
          >
            <Route path="/dashboard" element={<h1>Panel del socio</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Saltar al contenido principal' }))
      .toHaveAttribute('href', '#main-content')
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByRole('main')).toHaveAttribute('tabindex', '-1')
    expect(screen.getByRole('link', { name: 'Panel' })).toHaveAttribute('aria-current', 'page')
  })
})

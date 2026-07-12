import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

describe('App shell', () => {
  it('renders the operational home inside accessible navigation landmarks', () => {
    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={['/']}
      >
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Navegación principal' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Centro de operaciones' })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'SportClub' })).toHaveAttribute('src', '/assets/img/logo.png')
  })

  it('renders a Spanish not-found state for unknown routes', () => {
    render(
      <MemoryRouter
        future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
        initialEntries={['/ruta-inexistente']}
      >
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })
})

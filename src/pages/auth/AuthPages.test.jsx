import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import LoginPage from './LoginPage'
import RegisterPage from './RegisterPage'

vi.mock('../../hooks/useAuth')

function renderPage(path, element) {
  return render(
    <MemoryRouter
      future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
      initialEntries={[path]}
    >
      <Routes>
        <Route path={path} element={element} />
        <Route path="/user/dashboard" element={<h1>Panel usuario</h1>} />
        {path !== '/login' && <Route path="/login" element={<LoginPage />} />}
      </Routes>
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  it('validates inline and redirects to the authenticated role dashboard', async () => {
    const user = userEvent.setup()
    const login = vi.fn().mockResolvedValue({ role: 'user' })
    useAuth.mockReturnValue({ login })
    renderPage('/login', <LoginPage />)

    await user.click(screen.getByRole('button', { name: 'Ingresar' }))
    expect(await screen.findByText('Correo electrónico es obligatorio.')).toBeInTheDocument()
    expect(screen.getByText('Contraseña es obligatorio.')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Correo electrónico'), 'user1@demo.cl')
    await user.type(screen.getByLabelText('Contraseña'), '12345678')
    await user.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(login).toHaveBeenCalledWith({ email: 'user1@demo.cl', password: '12345678' })
    expect(await screen.findByRole('heading', { name: 'Panel usuario' })).toBeInTheDocument()
  })
})

describe('RegisterPage', () => {
  it('submits normalized user data and returns to login without creating a session', async () => {
    const user = userEvent.setup()
    const register = vi.fn().mockResolvedValue({ id: 9, role: 'user' })
    useAuth.mockReturnValue({ register })
    renderPage('/register', <RegisterPage />)

    await user.type(screen.getByLabelText('Nombre completo'), 'Ana Perez')
    await user.type(screen.getByLabelText('Correo electrónico'), 'ANA@EXAMPLE.CL')
    await user.type(screen.getByLabelText('Fecha de nacimiento'), '2000-05-10')
    await user.type(screen.getByLabelText('Contraseña'), '12345678')
    await user.type(screen.getByLabelText('Confirmar contraseña'), '12345678')
    await user.type(screen.getByLabelText('Deporte'), 'Tenis')
    await user.clear(screen.getByLabelText('Frecuencia semanal'))
    await user.type(screen.getByLabelText('Frecuencia semanal'), '2')
    await user.click(screen.getByRole('button', { name: 'Crear cuenta' }))

    await waitFor(() => expect(register).toHaveBeenCalledWith({
      full_name: 'Ana Perez',
      email: 'ana@example.cl',
      password: '12345678',
      birth_date: '2000-05-10',
      metadata: { sports: [{ name: 'Tenis', frequency_per_week: 2 }] },
    }))
    expect(await screen.findByRole('heading', { name: 'Iniciar sesión' })).toBeInTheDocument()
    expect(screen.getByText('Cuenta creada correctamente. Ya puedes iniciar sesión.')).toBeInTheDocument()
  })
})

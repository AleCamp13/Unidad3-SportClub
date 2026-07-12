import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../../services/apiClient'
import RoomFormModal from './RoomFormModal'
import SportFormModal from './SportFormModal'
import UserFormModal from './UserFormModal'

describe('UserFormModal', () => {
  it('shows inline create errors instead of submitting an invalid user', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<UserFormModal onHide={vi.fn()} onSubmit={onSubmit} show />)

    await user.click(screen.getByRole('button', { name: 'Guardar usuario' }))

    expect(await screen.findByText(/nombre completo debe tener al menos/i)).toBeInTheDocument()
    expect(screen.getByText(/correo electrónico válido/i)).toBeInTheDocument()
    expect(screen.getByText(/contraseña debe tener al menos/i)).toBeInTheDocument()
    expect(screen.getByLabelText('Nombre completo')).toHaveAttribute('aria-invalid', 'true')
    expect(screen.getByLabelText('Nombre completo'))
      .toHaveAccessibleDescription(/nombre completo debe tener al menos/i)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('prefills edit data and omits an unchanged password', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(
      <UserFormModal
        initialValue={{
          id: 7,
          full_name: 'Ana Pérez',
          email: 'ana@example.cl',
          role: 'coach',
          birth_date: '1992-03-12',
          must_change_password: false,
          metadata: { sports: [{ name: 'Tenis', frequency_per_week: 2 }] },
        }}
        onHide={vi.fn()}
        onSubmit={onSubmit}
        show
      />,
    )

    expect(screen.getByLabelText('Nombre completo')).toHaveValue('Ana Pérez')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      full_name: 'Ana Pérez',
      email: 'ana@example.cl',
      role: 'coach',
      birth_date: '1992-03-12',
      must_change_password: false,
      metadata: { sports: [{ name: 'Tenis', frequency_per_week: 2 }] },
    }))
  })

  it('keeps the modal open and maps backend errors to the form', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new ApiError('El correo ya existe.', {
      status: 409,
      errors: { email: 'Usa un correo distinto.' },
    }))
    render(
      <UserFormModal
        initialValue={{
          id: 7, full_name: 'Ana Pérez', email: 'ana@example.cl', role: 'coach',
          birth_date: '', must_change_password: false, metadata: { sports: [] },
        }}
        onHide={vi.fn()}
        onSubmit={onSubmit}
        show
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('El correo ya existe.')
    expect(screen.getByText('Usa un correo distinto.')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('SportFormModal', () => {
  it('submits a normalized sport payload', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(<SportFormModal onHide={vi.fn()} onSubmit={onSubmit} show />)

    await user.type(screen.getByLabelText('Nombre del deporte'), 'Natación')
    await user.type(screen.getByLabelText('Objetivo'), 'Mejorar resistencia')
    await user.clear(screen.getByLabelText('Duración en minutos'))
    await user.type(screen.getByLabelText('Duración en minutos'), '60')
    await user.click(screen.getByRole('button', { name: 'Guardar deporte' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      name: 'Natación', objective: 'Mejorar resistencia', duration: 60, status: true,
    }))
  })
})

describe('RoomFormModal', () => {
  it('submits all room fields using backend names', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(<RoomFormModal onHide={vi.fn()} onSubmit={onSubmit} show />)

    await user.type(screen.getByLabelText('Nombre de la sala'), 'Sala Norte')
    await user.type(screen.getByLabelText('Descripción'), 'Sala para entrenamiento funcional')
    await user.clear(screen.getByLabelText('Capacidad'))
    await user.type(screen.getByLabelText('Capacidad'), '24')
    await user.type(screen.getByLabelText('Ubicación'), 'Piso 2')
    await user.type(screen.getByLabelText('URL de imagen'), 'https://example.cl/sala.jpg')
    await user.type(screen.getByLabelText('Observación'), 'Acceso lateral')
    await user.click(screen.getByRole('button', { name: 'Guardar sala' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      name: 'Sala Norte',
      description: 'Sala para entrenamiento funcional',
      capacity: 24,
      location: 'Piso 2',
      image_url: 'https://example.cl/sala.jpg',
      observation: 'Acceso lateral',
      status: true,
    }))
  })
})

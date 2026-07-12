import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../../services/apiClient'
import AssignmentFormModal from './AssignmentFormModal'
import ScheduleFormModal from './ScheduleFormModal'

const sports = [
  { id: 2, name: 'Yoga', status: true },
  { id: 5, name: 'Crossfit', status: false },
]
const rooms = [{ id: 3, name: 'Sala Yoga', status: true }]
const coaches = [{ id: 4, full_name: 'Demo Coach 2', role: 'coach' }]
const assignments = [{
  id: 8,
  status: true,
  sport: { name: 'Yoga' },
  room: { name: 'Sala Yoga' },
  coach: { full_name: 'Demo Coach 2' },
}]

describe('AssignmentFormModal', () => {
  it('hydrates selects and submits numeric reference IDs', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(
      <AssignmentFormModal
        coaches={coaches}
        onHide={vi.fn()}
        onSubmit={onSubmit}
        rooms={rooms}
        show
        sports={sports}
      />,
    )

    expect(screen.getByRole('option', { name: 'Crossfit (inactivo)' })).toBeDisabled()
    await user.selectOptions(screen.getByLabelText('Deporte'), '2')
    await user.selectOptions(screen.getByLabelText('Sala'), '3')
    await user.selectOptions(screen.getByLabelText('Entrenador'), '4')
    await user.type(screen.getByLabelText('Observación'), 'Grupo inicial')
    await user.click(screen.getByRole('button', { name: 'Guardar asignación' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      sport_id: 2, room_id: 3, coach_id: 4, observation: 'Grupo inicial', status: true,
    }))
  })

  it('blocks creation when required references are missing', () => {
    render(
      <AssignmentFormModal coaches={[]} onHide={vi.fn()} onSubmit={vi.fn()} rooms={[]} show sports={[]} />,
    )

    expect(screen.getByRole('alert')).toHaveTextContent(/crea al menos un deporte, una sala y un entrenador/i)
    expect(screen.getByRole('button', { name: 'Guardar asignación' })).toBeDisabled()
  })
})

describe('ScheduleFormModal', () => {
  it('shows joined assignment labels and submits a valid schedule', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(<ScheduleFormModal assignments={assignments} onHide={vi.fn()} onSubmit={onSubmit} show />)

    expect(screen.getByRole('option', { name: 'Yoga · Sala Yoga · Demo Coach 2' })).toBeInTheDocument()
    await user.selectOptions(screen.getByLabelText('Asignación'), '8')
    await user.selectOptions(screen.getByLabelText('Día de la semana'), '2')
    await user.type(screen.getByLabelText('Hora de inicio'), '09:00')
    await user.type(screen.getByLabelText('Hora de término'), '10:00')
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      sport_room_id: 8, day_of_week: 2, start_time: '09:00', end_time: '10:00', status: true,
    }))
  })

  it('keeps duplicate API errors visible and does not close the modal', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new ApiError('Ya existe un horario igual para esta asignación.', { status: 409 }))
    render(
      <ScheduleFormModal
        assignments={assignments}
        initialValue={{ id: 12, sport_room_id: 8, day_of_week: 2, start_time: '09:00:00', end_time: '10:00:00', status: true }}
        onHide={vi.fn()}
        onSubmit={onSubmit}
        show
      />,
    )

    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya existe un horario igual para esta asignación.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

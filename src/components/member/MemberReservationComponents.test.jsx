import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ApiError } from '../../services/apiClient'
import MemberActivity from './MemberActivity'
import ReservationModal from './ReservationModal'

const classInfo = {
  sport: { name: 'Yoga' },
  room: { name: 'Sala Yoga' },
  coach: { email: 'coach2@demo.cl' },
}
const schedule = { id: 12, day_of_week: 2, start_time: '09:00:00', end_time: '10:00:00' }

describe('ReservationModal', () => {
  it('shows the selected real schedule and submits its backend ID', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue()
    render(<ReservationModal classInfo={classInfo} onHide={vi.fn()} onSubmit={onSubmit} schedule={schedule} show />)

    expect(screen.getByText('Yoga')).toBeInTheDocument()
    expect(screen.getByText(/Martes · 09:00 - 10:00/)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Observación opcional'), 'Primera clase')
    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      class_schedule_id: 12, observation: 'Primera clase',
    }))
  })

  it('keeps duplicate reservation errors visible', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockRejectedValue(new ApiError('Ya tienes una reserva activa para este horario.', { status: 409 }))
    render(<ReservationModal classInfo={classInfo} onHide={vi.fn()} onSubmit={onSubmit} schedule={schedule} show />)

    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Ya tienes una reserva activa para este horario.')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('MemberActivity', () => {
  it('renders summary and weekly calendar from active API reservations', () => {
    const reservations = [
      {
        id: 1, class_schedule_id: 12, status: 'active',
        classSchedule: { day_of_week: 2, start_time: '09:00:00', sportRoom: classInfo },
      },
      { id: 2, class_schedule_id: 13, status: 'cancelled', classSchedule: { day_of_week: 4 } },
    ]

    render(<MemberActivity reservations={reservations} />)

    expect(screen.getByRole('heading', { name: 'Resumen de actividad' })).toBeInTheDocument()
    expect(screen.getByLabelText('1 reserva activa')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Calendario semanal' })).toBeInTheDocument()
    expect(screen.getByLabelText('Martes: 1 reserva activa')).toHaveTextContent('Yoga')
    expect(screen.getByLabelText('Jueves: sin reservas activas')).not.toHaveTextContent('Yoga')
  })
})

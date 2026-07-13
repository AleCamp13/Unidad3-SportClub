import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Swal from 'sweetalert2'
import useAuth from '../../hooks/useAuth'
import * as memberService from '../../services/memberService'
import * as reservationService from '../../services/reservationService'
import MemberClassDetailPage from './MemberClassDetailPage'
import MemberClassesPage from './MemberClassesPage'
import MemberDashboardPage from './MemberDashboardPage'
import MemberReservationsPage from './MemberReservationsPage'

vi.mock('../../hooks/useAuth')
vi.mock('../../services/memberService')
vi.mock('../../services/reservationService')
vi.mock('sweetalert2', () => ({ default: { fire: vi.fn() } }))

const classInfo = {
  id: 1,
  sport_id: 2,
  room_id: 3,
  coach_id: 4,
  status: true,
  sport: { id: 2, name: 'Yoga', objective: 'Mejorar flexibilidad', duration: 45, status: true },
  room: { id: 3, name: 'Sala Yoga', location: 'Segundo piso', capacity: 20, status: true },
  coach: { id: 4, email: 'coach2@demo.cl', role: 'coach' },
  schedules: [
    { id: 1, day_of_week: 2, start_time: '09:00:00', end_time: '10:00:00', status: true },
    { id: 2, day_of_week: 4, start_time: '09:00:00', end_time: '10:00:00', status: true },
  ],
}

function reservation(id, schedule, status = 'active') {
  return {
    id,
    class_schedule_id: schedule.id,
    status,
    observation: null,
    classSchedule: { ...schedule, sportRoom: classInfo },
  }
}

function renderPage(element, path = '/') {
  return render(
    <MemoryRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }} initialEntries={[path]}>
      {element}
    </MemoryRouter>,
  )
}

beforeEach(() => {
  useAuth.mockReturnValue({
    token: 'user-token',
    user: { id: 1, full_name: 'Demo User 1', email: 'user1@demo.cl', role: 'user' },
  })
  memberService.getAvailableClasses.mockResolvedValue([classInfo])
  memberService.getAvailableSports.mockResolvedValue([classInfo.sport])
  memberService.getAvailableRooms.mockResolvedValue([classInfo.room])
  Swal.fire.mockResolvedValue({ isConfirmed: true })
})

describe('MemberClassesPage', () => {
  it('blocks duplicate schedules, reserves a free schedule, and refreshes API state', async () => {
    const user = userEvent.setup()
    const firstReservation = reservation(21, classInfo.schedules[0])
    const secondReservation = reservation(22, classInfo.schedules[1])
    reservationService.getMyReservations
      .mockResolvedValueOnce([firstReservation])
      .mockResolvedValueOnce([firstReservation, secondReservation])
    reservationService.createReservation.mockResolvedValue(secondReservation)

    renderPage(<MemberClassesPage />)

    expect(await screen.findByRole('button', { name: 'Reservado: Yoga, Martes 09:00' })).toBeDisabled()
    expect(screen.queryByRole('img', { name: 'Clase de Yoga en SportClub' })).not.toBeInTheDocument()
    expect(document.querySelector('.class-offering__media img'))
      .toHaveAttribute('src', '/assets/sports/yoga.webp')
    await user.click(screen.getByRole('button', { name: 'Reservar Yoga, Jueves 09:00' }))
    await user.click(screen.getByRole('button', { name: 'Confirmar reserva' }))

    await waitFor(() => expect(reservationService.createReservation).toHaveBeenCalledWith('user-token', {
      class_schedule_id: 2,
    }))
    expect(await screen.findByRole('button', { name: 'Reservado: Yoga, Jueves 09:00' })).toBeDisabled()
    expect(reservationService.getMyReservations).toHaveBeenCalledTimes(2)
    expect(localStorage.getItem('reservations')).toBeNull()
    expect(memberService.getAvailableSports).toHaveBeenCalledWith('user-token')
    expect(memberService.getAvailableRooms).toHaveBeenCalledWith('user-token')
  })
})

describe('MemberReservationsPage', () => {
  it('cancels only an active owned reservation and refreshes summaries', async () => {
    const user = userEvent.setup()
    const active = reservation(21, classInfo.schedules[0])
    const cancelled = reservation(20, classInfo.schedules[1], 'cancelled')
    reservationService.getMyReservations
      .mockResolvedValueOnce([active, cancelled])
      .mockResolvedValueOnce([{ ...active, status: 'cancelled' }, cancelled])
    reservationService.cancelReservation.mockResolvedValue({ ...active, status: 'cancelled' })

    renderPage(<MemberReservationsPage />)

    await user.click(await screen.findByRole('button', { name: 'Cancelar reserva Yoga · Martes 09:00' }))

    await waitFor(() => expect(reservationService.cancelReservation).toHaveBeenCalledWith('user-token', 21))
    expect(reservationService.getMyReservations).toHaveBeenCalledTimes(2)
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Cancelar reserva Yoga · Martes 09:00' })).not.toBeInTheDocument())
    expect(screen.getByLabelText('0 reservas activas')).toBeInTheDocument()
  })

  it('rebooks a cancelled reservation with the same schedule and refreshes reservations', async () => {
    const user = userEvent.setup()
    const cancelled = reservation(20, classInfo.schedules[1], 'cancelled')
    const rebooked = reservation(23, classInfo.schedules[1])
    reservationService.getMyReservations
      .mockResolvedValueOnce([cancelled])
      .mockResolvedValueOnce([rebooked])
    reservationService.createReservation.mockResolvedValue(rebooked)

    renderPage(<MemberReservationsPage />)

    await user.click(await screen.findByRole('button', { name: /Reservar nuevamente Yoga.*Jueves 09:00/ }))

    await waitFor(() => expect(reservationService.createReservation).toHaveBeenCalledWith('user-token', {
      class_schedule_id: 2,
    }))
    expect(reservationService.getMyReservations).toHaveBeenCalledTimes(2)
  })

  it('disables rebooking when an active reservation already uses the schedule', async () => {
    const cancelled = reservation(20, classInfo.schedules[1], 'cancelled')
    const active = reservation(21, classInfo.schedules[1])
    reservationService.getMyReservations.mockResolvedValue([cancelled, active])

    renderPage(<MemberReservationsPage />)

    expect(await screen.findByRole('button', { name: /Ya reservada Yoga.*Jueves 09:00/ })).toBeDisabled()
  })

  it('disables rebooking while the request is pending and ignores a second click', async () => {
    const user = userEvent.setup()
    const cancelled = reservation(20, classInfo.schedules[1], 'cancelled')
    const rebooked = reservation(23, classInfo.schedules[1])
    let resolveCreateReservation
    const pendingCreateReservation = new Promise((resolve) => {
      resolveCreateReservation = resolve
    })
    reservationService.getMyReservations.mockResolvedValue([cancelled])
    reservationService.createReservation.mockReturnValue(pendingCreateReservation)

    renderPage(<MemberReservationsPage />)

    const button = await screen.findByRole('button', { name: /Reservar nuevamente Yoga.*Jueves 09:00/ })
    await user.click(button)
    await user.click(button)

    expect(reservationService.createReservation).toHaveBeenCalledTimes(1)
    expect(button).toBeDisabled()
    expect(button).toHaveTextContent('Reservando...')

    resolveCreateReservation(rebooked)
    await waitFor(() => expect(reservationService.getMyReservations).toHaveBeenCalledTimes(2))
  })
})

describe('MemberDashboardPage', () => {
  it('renders backend availability and API-derived activity', async () => {
    memberService.getMemberDashboard.mockResolvedValue({
      available_classes: 1,
      available_sports: 5,
      available_rooms: 5,
      available_schedules: 2,
      next_classes: [classInfo],
    })
    reservationService.getMyReservations.mockResolvedValue([reservation(21, classInfo.schedules[0])])

    renderPage(<MemberDashboardPage />)

    expect(await screen.findByRole('heading', { name: 'Mi SportClub' })).toBeInTheDocument()
    expect(screen.getByLabelText('1 clase disponible')).toBeInTheDocument()
    expect(screen.getByLabelText('2 horarios disponibles')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Resumen de actividad' })).toBeInTheDocument()
    expect(screen.getByLabelText('Martes: 1 reserva activa')).toHaveTextContent('Yoga')
  })
})

describe('MemberClassDetailPage', () => {
  it('loads a class through the detail endpoint', async () => {
    memberService.getAvailableClass.mockResolvedValue(classInfo)
    reservationService.getMyReservations.mockResolvedValue([])

    renderPage(
      <Routes><Route path="/user/classes/:id" element={<MemberClassDetailPage />} /></Routes>,
      '/user/classes/1',
    )

    expect(await screen.findByRole('heading', { name: 'Yoga', level: 1 })).toBeInTheDocument()
    expect(memberService.getAvailableClass).toHaveBeenCalledWith('user-token', '1')
    expect(screen.getByRole('button', { name: 'Reservar Yoga, Martes 09:00' })).toBeEnabled()
  })
})

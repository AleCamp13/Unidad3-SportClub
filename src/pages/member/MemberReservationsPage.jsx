import { useCallback, useMemo, useRef, useState } from 'react'
import { Badge, Button, ButtonGroup } from 'react-bootstrap'
import { CalendarX2, Clock3, MapPin, RotateCcw, UserRound } from 'lucide-react'
import MemberActivity from '../../components/member/MemberActivity'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as reservationService from '../../services/reservationService'
import { confirmAdminAction, showAdminError, showAdminSuccess } from '../../utils/adminAlerts'
import { formatTime } from '../../utils/formatters'
import { DAY_LABELS, getActiveScheduleIds } from '../../utils/reservationUtils'

function reservationDetails(reservation) {
  const schedule = reservation.classSchedule || {}
  const sportRoom = schedule.sportRoom || {}
  return {
    schedule,
    sportRoom,
    sportName: sportRoom.sport?.name || 'Clase no disponible',
    roomName: sportRoom.room?.name || 'Sala no disponible',
    coachName: sportRoom.coach?.full_name || sportRoom.coach?.email || 'Entrenador no disponible',
    dayName: DAY_LABELS[Number(schedule.day_of_week) - 1] || 'Día no disponible',
  }
}

export default function MemberReservationsPage() {
  const { token } = useAuth()
  const loadReservations = useCallback(() => reservationService.getMyReservations(token), [token])
  const { error, isLoading, items: reservations, reload } = useEntityList(loadReservations)
  const [filter, setFilter] = useState('all')
  const [rebookingScheduleIds, setRebookingScheduleIds] = useState(() => new Set())
  const rebookingScheduleIdsRef = useRef(new Set())
  const activeScheduleIds = useMemo(() => getActiveScheduleIds(reservations), [reservations])
  const filtered = filter === 'all' ? reservations : reservations.filter((item) => item.status === filter)

  const cancelReservation = async (reservation) => {
    const details = reservationDetails(reservation)
    const confirmed = await confirmAdminAction({
      title: 'Cancelar reserva',
      text: `Cancelarás ${details.sportName} del ${details.dayName} a las ${formatTime(details.schedule.start_time)}.`,
      confirmText: 'Sí, cancelar',
    })
    if (!confirmed) return

    try {
      await reservationService.cancelReservation(token, reservation.id)
      await reload()
      await showAdminSuccess('Reserva cancelada')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  const rebookReservation = async (reservation) => {
    const scheduleId = Number(reservation.class_schedule_id)
    if (rebookingScheduleIdsRef.current.has(scheduleId)) return

    rebookingScheduleIdsRef.current.add(scheduleId)
    setRebookingScheduleIds(new Set(rebookingScheduleIdsRef.current))
    try {
      await reservationService.createReservation(token, {
        class_schedule_id: scheduleId,
      })
      await reload()
      await showAdminSuccess('Reserva confirmada nuevamente')
    } catch (requestError) {
      await showAdminError(requestError)
    } finally {
      rebookingScheduleIdsRef.current.delete(scheduleId)
      setRebookingScheduleIds(new Set(rebookingScheduleIdsRef.current))
    }
  }

  return (
    <div className="workspace member-page">
      <div className="page-heading">
        <div><p className="page-context">Membresía</p><h1>Mis reservas</h1><p className="page-description">Consulta tus reservas activas y el historial de cancelaciones.</p></div>
      </div>

      {isLoading && <div className="member-page-state"><LoadingState label="Cargando tus reservas" /></div>}
      {!isLoading && error && <div className="member-page-state"><ErrorState message={error.message} onRetry={reload} /></div>}
      {!isLoading && !error && (
        <>
          <MemberActivity reservations={reservations} />
          <section className="reservation-history" aria-labelledby="reservation-history-title">
            <div className="reservation-history__heading">
              <div className="section-heading"><h2 id="reservation-history-title">Historial</h2><p>Solo las reservas activas pueden cancelarse.</p></div>
              <ButtonGroup aria-label="Filtrar reservas" size="sm">
                <Button active={filter === 'all'} onClick={() => setFilter('all')} variant="outline-secondary">Todas</Button>
                <Button active={filter === 'active'} onClick={() => setFilter('active')} variant="outline-secondary">Activas</Button>
                <Button active={filter === 'cancelled'} onClick={() => setFilter('cancelled')} variant="outline-secondary">Canceladas</Button>
              </ButtonGroup>
            </div>
            {filtered.length === 0 && <EmptyState description="No existen reservas para el filtro seleccionado." title="Sin resultados" />}
            <div className="reservation-list">
              {filtered.map((reservation) => {
                const details = reservationDetails(reservation)
                const scheduleId = Number(reservation.class_schedule_id)
                const isAlreadyBooked = activeScheduleIds.has(scheduleId)
                const isRebooking = rebookingScheduleIds.has(scheduleId)
                const label = `${details.sportName} · ${details.dayName} ${formatTime(details.schedule.start_time)}`
                return (
                  <article className="reservation-row" key={reservation.id}>
                    <div><strong>{details.sportName}</strong><span><Clock3 aria-hidden="true" size={15} />{details.dayName} · {formatTime(details.schedule.start_time)} - {formatTime(details.schedule.end_time)}</span></div>
                    <div><span><MapPin aria-hidden="true" size={15} />{details.roomName}</span><span><UserRound aria-hidden="true" size={15} />{details.coachName}</span></div>
                    <Badge bg={reservation.status === 'active' ? 'success' : 'secondary'}>{reservation.status === 'active' ? 'Activa' : 'Cancelada'}</Badge>
                    {reservation.status === 'active' && (
                      <Button aria-label={`Cancelar reserva ${label}`} onClick={() => cancelReservation(reservation)} size="sm" variant="outline-danger"><CalendarX2 aria-hidden="true" size={16} /> Cancelar</Button>
                    )}
                    {reservation.status === 'cancelled' && (
                      <Button
                        aria-busy={isRebooking}
                        aria-label={`${isRebooking ? 'Reservando nuevamente' : isAlreadyBooked ? 'Ya reservada' : 'Reservar nuevamente'} ${label}`}
                        disabled={isAlreadyBooked || isRebooking}
                        onClick={() => rebookReservation(reservation)}
                        size="sm"
                        variant="outline-primary"
                      >
                        <RotateCcw aria-hidden="true" size={16} /> {isRebooking ? 'Reservando...' : isAlreadyBooked ? 'Ya reservada' : 'Reservar nuevamente'}
                      </Button>
                    )}
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

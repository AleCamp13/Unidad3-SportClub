import { useCallback } from 'react'
import { CalendarClock, DoorOpen, Layers3 } from 'lucide-react'
import { ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAsyncData from '../../hooks/useAsyncData'
import useAuth from '../../hooks/useAuth'
import * as coachService from '../../services/coachService'
import { formatTime } from '../../utils/formatters'
import { DAY_LABELS } from '../../utils/reservationUtils'
import { getSportImage } from '../../utils/sportImages'

export default function CoachDashboardPage() {
  const { token, user } = useAuth()
  const loadDashboard = useCallback(() => coachService.getCoachDashboard(token), [token])
  const { data, error, isLoading, reload } = useAsyncData(loadDashboard, null)
  const nextAssignment = data?.next_class?.sportRoom
  const nextDay = DAY_LABELS[Number(data?.next_class?.day_of_week) - 1]

  return (
    <div className="workspace coach-page">
      <div className="page-heading">
        <div><p className="page-context">Hola, {user.full_name}</p><h1>Panel de entrenador</h1><p className="page-description">Tus asignaciones vigentes según la API del club.</p></div>
      </div>
      {isLoading && <div className="member-page-state"><LoadingState label="Cargando panel de entrenador" /></div>}
      {!isLoading && error && <div className="member-page-state"><ErrorState message={error.message} onRetry={reload} /></div>}
      {!isLoading && !error && data && (
        <>
          <section className="role-metrics role-metrics--coach" aria-label="Resumen del entrenador">
            <div aria-label={`${data.total_classes} ${data.total_classes === 1 ? 'clase asignada' : 'clases asignadas'}`}><Layers3 aria-hidden="true" size={22} /><strong>{data.total_classes}</strong><span>Clases</span></div>
            <div aria-label={`${data.total_schedules} ${data.total_schedules === 1 ? 'horario activo' : 'horarios activos'}`}><CalendarClock aria-hidden="true" size={22} /><strong>{data.total_schedules}</strong><span>Horarios</span></div>
            <div aria-label={`${data.total_rooms} ${data.total_rooms === 1 ? 'sala asignada' : 'salas asignadas'}`}><DoorOpen aria-hidden="true" size={22} /><strong>{data.total_rooms}</strong><span>Salas</span></div>
          </section>
          <section className="coach-next-class" aria-labelledby="coach-next-class-title">
            <div className="section-heading"><h2 id="coach-next-class-title">Próxima clase</h2><p>Primer horario activo informado por el backend.</p></div>
            {data.next_class ? (
              <div className="coach-next-class__detail">
                <img alt="" aria-hidden="true" src={getSportImage(nextAssignment?.sport?.name)} />
                <div><strong>{nextAssignment?.sport?.name || 'Clase no disponible'}</strong><span>{nextAssignment?.room?.name || 'Sala no disponible'}</span></div>
                <span>{nextDay || 'Día no disponible'} · {formatTime(data.next_class.start_time)} - {formatTime(data.next_class.end_time)}</span>
              </div>
            ) : <p className="field-empty-note">No tienes una próxima clase asignada.</p>}
          </section>
        </>
      )}
    </div>
  )
}

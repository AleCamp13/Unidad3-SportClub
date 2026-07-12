import { useCallback } from 'react'
import { Clock3, MapPin, UsersRound } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as coachService from '../../services/coachService'
import { formatTime } from '../../utils/formatters'
import { DAY_LABELS } from '../../utils/reservationUtils'

export default function CoachClassesPage() {
  const { token } = useAuth()
  const loadClasses = useCallback(() => coachService.getCoachClasses(token), [token])
  const { error, isLoading, items: classes, reload } = useEntityList(loadClasses)

  return (
    <div className="workspace coach-page">
      <div className="page-heading"><div><p className="page-context">Entrenamiento</p><h1>Mis clases</h1><p className="page-description">Deportes, salas y horarios que tienes asignados.</p></div></div>
      <section className="coach-list" aria-label="Clases asignadas">
        {isLoading && <LoadingState label="Cargando clases asignadas" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && classes.length === 0 && <EmptyState description="Cuando administración te asigne una clase aparecerá aquí." title="No tienes clases asignadas" />}
        {!isLoading && !error && classes.map((item) => (
          <article className="coach-class" key={item.id}>
            <div className="coach-class__title"><div><p className="page-context">{item.room?.name || 'Sala no disponible'}</p><h2>{item.sport?.name || 'Clase no disponible'}</h2><p>{item.sport?.objective || 'Objetivo no disponible.'}</p></div><span><UsersRound aria-hidden="true" size={16} />Cupo {item.room?.capacity || '—'}</span></div>
            <div className="coach-class__location"><MapPin aria-hidden="true" size={16} />{item.room?.location || 'Sin ubicación'}</div>
            <div className="coach-schedule-list">
              {item.schedules?.map((schedule) => (
                <span key={schedule.id}><Clock3 aria-hidden="true" size={16} />{DAY_LABELS[Number(schedule.day_of_week) - 1] || 'Día'} · {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
              ))}
              {!item.schedules?.length && <span className="field-empty-note">Sin horarios activos.</span>}
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

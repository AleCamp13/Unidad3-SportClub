import { useCallback } from 'react'
import { Table } from 'react-bootstrap'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as coachService from '../../services/coachService'
import { formatTime } from '../../utils/formatters'
import { DAY_LABELS } from '../../utils/reservationUtils'

export default function CoachSchedulesPage() {
  const { token } = useAuth()
  const loadSchedules = useCallback(() => coachService.getCoachSchedules(token), [token])
  const { error, isLoading, items: schedules, reload } = useEntityList(loadSchedules)

  return (
    <div className="workspace coach-page">
      <div className="page-heading"><div><p className="page-context">Entrenamiento</p><h1>Mi horario</h1><p className="page-description">Agenda semanal de tus clases activas.</p></div></div>
      <section className="entity-table-section" aria-label="Horario del entrenador">
        {isLoading && <LoadingState label="Cargando tu horario" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && schedules.length === 0 && <EmptyState description="Los horarios asignados aparecerán en esta agenda." title="No tienes horarios activos" />}
        {!isLoading && !error && schedules.length > 0 && (
          <Table className="entity-table" hover responsive>
            <thead><tr><th>Día</th><th>Horario</th><th>Deporte</th><th>Sala</th><th>Ubicación</th></tr></thead>
            <tbody>{schedules.map((schedule) => {
              const assignment = schedule.sportRoom || {}
              return <tr key={schedule.id}><td><strong>{DAY_LABELS[Number(schedule.day_of_week) - 1] || 'No disponible'}</strong></td><td className="time-range">{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</td><td>{assignment.sport?.name || 'No disponible'}</td><td>{assignment.room?.name || 'No disponible'}</td><td>{assignment.room?.location || 'Sin ubicación'}</td></tr>
            })}</tbody>
          </Table>
        )}
      </section>
    </div>
  )
}

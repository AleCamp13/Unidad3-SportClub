import { Badge, Button } from 'react-bootstrap'
import { CalendarDays, Clock3, MapPin, UserRound, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatTime } from '../../utils/formatters'
import { DAY_LABELS } from '../../utils/reservationUtils'

function coachLabel(coach) {
  return coach?.full_name || coach?.email || 'Entrenador no disponible'
}

export default function ClassOffering({ activeScheduleIds, classInfo, detailLink, onReserve }) {
  const sportName = classInfo.sport?.name || 'Clase no disponible'
  const schedules = Array.isArray(classInfo.schedules) ? classInfo.schedules : []

  return (
    <article className="class-offering">
      <header className="class-offering__header">
        <div>
          <p className="page-context">{classInfo.room?.name || 'Sala no disponible'}</p>
          <h2>{sportName}</h2>
          <p>{classInfo.sport?.objective || 'Objetivo no disponible.'}</p>
        </div>
        <Badge bg={classInfo.status === false ? 'secondary' : 'success'}>{classInfo.status === false ? 'Inactiva' : 'Disponible'}</Badge>
      </header>
      <div className="class-offering__facts">
        <span><Clock3 aria-hidden="true" size={16} />{classInfo.sport?.duration || '—'} min</span>
        <span><MapPin aria-hidden="true" size={16} />{classInfo.room?.location || 'Sin ubicación'}</span>
        <span><UsersRound aria-hidden="true" size={16} />Cupo {classInfo.room?.capacity || '—'}</span>
        <span><UserRound aria-hidden="true" size={16} />{coachLabel(classInfo.coach)}</span>
      </div>
      <div className="schedule-options" aria-label={`Horarios de ${sportName}`}>
        {schedules.length === 0 && <p className="field-empty-note">No hay horarios activos para esta clase.</p>}
        {schedules.map((schedule) => {
          const day = DAY_LABELS[Number(schedule.day_of_week) - 1] || 'Día no disponible'
          const reserved = activeScheduleIds.has(Number(schedule.id))
          return (
            <div className="schedule-option" key={schedule.id}>
              <span><CalendarDays aria-hidden="true" size={17} /><strong>{day}</strong></span>
              <span>{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</span>
              <Button
                aria-label={reserved ? `Reservado: ${sportName}, ${day} ${formatTime(schedule.start_time)}` : `Reservar ${sportName}, ${day} ${formatTime(schedule.start_time)}`}
                disabled={reserved}
                onClick={() => onReserve(classInfo, schedule)}
                size="sm"
                variant={reserved ? 'outline-secondary' : 'primary'}
              >
                {reserved ? 'Reservado' : 'Reservar'}
              </Button>
            </div>
          )
        })}
      </div>
      {detailLink && <Link className="class-offering__detail" to={detailLink}>Ver detalle de {sportName}</Link>}
    </article>
  )
}

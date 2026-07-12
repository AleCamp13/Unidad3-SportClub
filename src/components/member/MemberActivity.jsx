import { CalendarDays, CalendarCheck2, CalendarX2, Layers3 } from 'lucide-react'
import { formatTime } from '../../utils/formatters'
import { groupActiveReservationsByDay, summarizeReservations } from '../../utils/reservationUtils'

function classLabel(reservation) {
  const sportRoom = reservation.classSchedule?.sportRoom
  return sportRoom?.sport?.name || 'Clase no disponible'
}

export default function MemberActivity({ reservations }) {
  const summary = summarizeReservations(reservations)
  const calendar = groupActiveReservationsByDay(reservations)

  return (
    <div className="member-activity">
      <section className="activity-summary" aria-labelledby="activity-summary-title">
        <div className="section-heading">
          <h2 id="activity-summary-title">Resumen de actividad</h2>
          <p>Datos calculados desde tus reservas registradas.</p>
        </div>
        <div className="activity-metrics">
          <div aria-label={`${summary.total} reservas totales`}><Layers3 aria-hidden="true" size={20} /><strong>{summary.total}</strong><span>totales</span></div>
          <div aria-label={`${summary.active} ${summary.active === 1 ? 'reserva activa' : 'reservas activas'}`}><CalendarCheck2 aria-hidden="true" size={20} /><strong>{summary.active}</strong><span>{summary.active === 1 ? 'activa' : 'activas'}</span></div>
          <div aria-label={`${summary.cancelled} ${summary.cancelled === 1 ? 'reserva cancelada' : 'reservas canceladas'}`}><CalendarX2 aria-hidden="true" size={20} /><strong>{summary.cancelled}</strong><span>{summary.cancelled === 1 ? 'cancelada' : 'canceladas'}</span></div>
          <div aria-label={`${summary.activeDays} ${summary.activeDays === 1 ? 'día reservado' : 'días reservados'}`}><CalendarDays aria-hidden="true" size={20} /><strong>{summary.activeDays}</strong><span>{summary.activeDays === 1 ? 'día reservado' : 'días reservados'}</span></div>
        </div>
      </section>

      <section className="weekly-calendar" aria-labelledby="weekly-calendar-title">
        <div className="section-heading">
          <h2 id="weekly-calendar-title">Calendario semanal</h2>
          <p>Distribución recurrente de tus reservas activas.</p>
        </div>
        <div className="weekly-calendar__grid">
          {calendar.map((entry) => {
            const count = entry.reservations.length
            return (
              <div aria-label={`${entry.label}: ${count ? `${count} reserva${count === 1 ? '' : 's'} activa${count === 1 ? '' : 's'}` : 'sin reservas activas'}`} className={count ? 'calendar-day calendar-day--active' : 'calendar-day'} key={entry.day}>
                <strong>{entry.label.slice(0, 3)}</strong>
                {count === 0 && <span>Libre</span>}
                {entry.reservations.map((reservation) => (
                  <span className="calendar-event" key={reservation.id}>
                    {formatTime(reservation.classSchedule?.start_time)} {classLabel(reservation)}
                  </span>
                ))}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

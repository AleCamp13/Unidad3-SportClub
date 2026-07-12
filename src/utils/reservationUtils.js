const DAY_LABELS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']

export function validateReservation(input) {
  const errors = {}
  const scheduleId = Number(input.class_schedule_id)
  const observation = String(input.observation ?? '').trim()

  if (!Number.isInteger(scheduleId) || scheduleId < 1) {
    errors.class_schedule_id = 'Selecciona un horario de clase válido.'
  }
  if (observation.length > 255) {
    errors.observation = 'La observación no puede superar los 255 caracteres.'
  }

  const data = { class_schedule_id: scheduleId }
  if (observation) data.observation = observation

  return { isValid: Object.keys(errors).length === 0, errors, data }
}

export function getActiveScheduleIds(reservations) {
  return new Set((Array.isArray(reservations) ? reservations : [])
    .filter((reservation) => reservation.status === 'active')
    .map((reservation) => Number(reservation.class_schedule_id))
    .filter(Number.isInteger))
}

export function summarizeReservations(reservations) {
  const list = Array.isArray(reservations) ? reservations : []
  const active = list.filter((reservation) => reservation.status === 'active')
  const activeDays = new Set(active
    .map((reservation) => Number(reservation.classSchedule?.day_of_week))
    .filter((day) => day >= 1 && day <= 7))

  return {
    total: list.length,
    active: active.length,
    cancelled: list.filter((reservation) => reservation.status === 'cancelled').length,
    activeDays: activeDays.size,
  }
}

export function groupActiveReservationsByDay(reservations) {
  const active = (Array.isArray(reservations) ? reservations : [])
    .filter((reservation) => reservation.status === 'active')

  return DAY_LABELS.map((label, index) => {
    const day = index + 1
    return {
      day,
      label,
      reservations: active.filter((reservation) => Number(reservation.classSchedule?.day_of_week) === day),
    }
  })
}

export { DAY_LABELS }

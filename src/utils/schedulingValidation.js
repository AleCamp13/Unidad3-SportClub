const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/

function positiveInteger(value) {
  const number = Number(value)
  return Number.isInteger(number) && number > 0 ? number : null
}

export function validateAssignment(input) {
  const errors = {}
  const sportId = positiveInteger(input.sport_id)
  const roomId = positiveInteger(input.room_id)
  const coachId = positiveInteger(input.coach_id)
  const observation = String(input.observation ?? '').trim()

  if (!sportId) errors.sport_id = 'Selecciona un deporte válido.'
  if (!roomId) errors.room_id = 'Selecciona una sala válida.'
  if (!coachId) errors.coach_id = 'Selecciona un entrenador válido.'
  if (observation.length > 255) errors.observation = 'La observación no puede superar los 255 caracteres.'
  if (typeof input.status !== 'boolean') errors.status = 'Selecciona un estado válido.'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      sport_id: sportId,
      room_id: roomId,
      coach_id: coachId,
      observation,
      status: input.status,
    },
  }
}

export function validateSchedule(input) {
  const errors = {}
  const sportRoomId = positiveInteger(input.sport_room_id)
  const dayOfWeek = Number(input.day_of_week)
  const startTime = String(input.start_time ?? '')
  const endTime = String(input.end_time ?? '')
  const validStart = TIME_PATTERN.test(startTime)
  const validEnd = TIME_PATTERN.test(endTime)

  if (!sportRoomId) errors.sport_room_id = 'Selecciona una asignación válida.'
  if (!Number.isInteger(dayOfWeek) || dayOfWeek < 1 || dayOfWeek > 7) {
    errors.day_of_week = 'Selecciona un día entre lunes y domingo.'
  }
  if (!validStart) errors.start_time = 'Ingresa una hora válida en formato 24 horas.'
  if (!validEnd) errors.end_time = 'Ingresa una hora válida en formato 24 horas.'
  else if (validStart && startTime >= endTime) errors.end_time = 'La hora de término debe ser posterior a la hora de inicio.'
  if (typeof input.status !== 'boolean') errors.status = 'Selecciona un estado válido.'

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data: {
      sport_room_id: sportRoomId,
      day_of_week: dayOfWeek,
      start_time: startTime,
      end_time: endTime,
      status: input.status,
    },
  }
}

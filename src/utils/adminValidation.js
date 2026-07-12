import { validateBirthDate } from './validators'

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USER_ROLES = ['user', 'coach', 'admin']

function text(value) {
  return String(value ?? '').trim()
}

function normalizeSports(sports) {
  return (Array.isArray(sports) ? sports : []).map((sport) => ({
    name: text(sport?.name),
    frequency_per_week: Number(sport?.frequency_per_week),
  }))
}

function hasValidSports(sports) {
  return sports.every((sport) => (
    sport.name.length > 0
    && Number.isInteger(sport.frequency_per_week)
    && sport.frequency_per_week >= 0
  ))
}

function isHttpUrl(value) {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateAdminUser(input, { editing = false } = {}) {
  const errors = {}
  const fullName = text(input.full_name)
  const email = text(input.email).toLowerCase()
  const password = String(input.password ?? '')
  const confirmPassword = String(input.confirm_password ?? '')
  const role = input.role
  const birthDate = text(input.birth_date)
  const sports = normalizeSports(input.sports)

  if (fullName.length < 3) errors.full_name = 'El nombre completo debe tener al menos 3 caracteres.'
  else if (fullName.length > 150) errors.full_name = 'El nombre completo no puede superar los 150 caracteres.'

  if (!EMAIL_PATTERN.test(email)) errors.email = 'Ingresa un correo electrónico válido.'
  else if (email.length > 150) errors.email = 'El correo no puede superar los 150 caracteres.'

  if (!USER_ROLES.includes(role)) errors.role = 'Selecciona un rol válido.'
  if (birthDate) errors.birth_date = validateBirthDate(birthDate, { label: 'La fecha de nacimiento' })
  if (!errors.birth_date) delete errors.birth_date

  const requiresPassword = !editing || password.length > 0 || confirmPassword.length > 0
  if (requiresPassword && password.length < 8) {
    errors.password = 'La contraseña debe tener al menos 8 caracteres.'
  } else if (password.length > 255) {
    errors.password = 'La contraseña no puede superar los 255 caracteres.'
  }
  if (requiresPassword && !confirmPassword) {
    errors.confirm_password = 'Debes confirmar la contraseña.'
  } else if (requiresPassword && password !== confirmPassword) {
    errors.confirm_password = 'Las contraseñas no coinciden.'
  }

  if (!hasValidSports(sports)) {
    errors.sports = 'Cada deporte necesita nombre y una frecuencia semanal entera mayor o igual a 0.'
  }

  const data = {
    full_name: fullName,
    email,
    role,
    birth_date: birthDate || null,
    must_change_password: Boolean(input.must_change_password),
    metadata: { sports },
  }
  if (requiresPassword && !errors.password && !errors.confirm_password) data.password = password

  return { isValid: Object.keys(errors).length === 0, errors, data }
}

export function validateAdminSport(input) {
  const errors = {}
  const data = {
    name: text(input.name),
    objective: text(input.objective),
    duration: Number(input.duration),
    status: input.status,
  }

  if (data.name.length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres.'
  else if (data.name.length > 100) errors.name = 'El nombre no puede superar los 100 caracteres.'

  if (data.objective.length < 5) errors.objective = 'El objetivo debe tener al menos 5 caracteres.'
  else if (data.objective.length > 255) errors.objective = 'El objetivo no puede superar los 255 caracteres.'

  if (!Number.isInteger(data.duration) || data.duration < 1) {
    errors.duration = 'La duración debe ser un número entero mayor a 0.'
  }
  if (typeof data.status !== 'boolean') errors.status = 'Selecciona un estado válido.'

  return { isValid: Object.keys(errors).length === 0, errors, data }
}

export function validateAdminRoom(input) {
  const errors = {}
  const data = {
    name: text(input.name),
    description: text(input.description),
    capacity: Number(input.capacity),
    location: text(input.location),
    image_url: text(input.image_url),
    observation: text(input.observation),
    status: input.status,
  }

  if (data.name.length < 3) errors.name = 'El nombre debe tener al menos 3 caracteres.'
  else if (data.name.length > 100) errors.name = 'El nombre no puede superar los 100 caracteres.'

  if (data.description.length < 5) errors.description = 'La descripción debe tener al menos 5 caracteres.'
  else if (data.description.length > 255) errors.description = 'La descripción no puede superar los 255 caracteres.'

  if (!Number.isInteger(data.capacity) || data.capacity < 1) {
    errors.capacity = 'La capacidad debe ser un número entero mayor a 0.'
  }
  if (data.location.length > 150) errors.location = 'La ubicación no puede superar los 150 caracteres.'
  if (data.image_url.length > 255) errors.image_url = 'La URL no puede superar los 255 caracteres.'
  else if (!isHttpUrl(data.image_url)) errors.image_url = 'Ingresa una URL http o https válida.'
  if (data.observation.length > 255) errors.observation = 'La observación no puede superar los 255 caracteres.'
  if (typeof data.status !== 'boolean') errors.status = 'Selecciona un estado válido.'

  return { isValid: Object.keys(errors).length === 0, errors, data }
}

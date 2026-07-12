import { validateBirthDate, validateForm } from './validators'

const EMAIL_RULE = { label: 'Correo electrónico', required: true, trim: true, email: true }
const NAME_RULE = { label: 'Nombre completo', required: true, trim: true, minLength: 3, maxLength: 150 }
const BIRTH_DATE_RULE = {
  label: 'Fecha de nacimiento',
  required: true,
  trim: true,
  validate: validateBirthDate,
}

function normalizeSports(sports) {
  return (Array.isArray(sports) ? sports : []).map((sport) => ({
    name: String(sport?.name || '').trim(),
    frequency_per_week: Number(sport?.frequency_per_week),
  }))
}

function sportsError(sports, { required = false } = {}) {
  if (required && sports.length === 0) return 'Agrega al menos un deporte.'
  const invalid = sports.some(({ name, frequency_per_week }) => (
    !name || !Number.isInteger(frequency_per_week) || frequency_per_week < 0
  ))
  return invalid ? 'Cada deporte necesita un nombre y una frecuencia semanal válida.' : null
}

export function validateLogin(input) {
  return validateForm(input, {
    email: EMAIL_RULE,
    password: { label: 'Contraseña', required: true },
  })
}

export function validateRegistration(input) {
  const result = validateForm(input, {
    full_name: NAME_RULE,
    email: EMAIL_RULE,
    password: { label: 'Contraseña', required: true, minLength: 8, maxLength: 255 },
    confirm_password: {
      label: 'Confirmación de contraseña',
      required: true,
      validate: (value, data) => value === data.password ? null : 'Las contraseñas no coinciden.',
    },
    birth_date: BIRTH_DATE_RULE,
  })
  const sports = normalizeSports(input.sports)
  const error = sportsError(sports, { required: true })
  if (error) result.errors.sports = error

  return {
    isValid: Object.keys(result.errors).length === 0,
    errors: result.errors,
    data: {
      full_name: result.data.full_name,
      email: String(result.data.email || '').toLowerCase(),
      password: result.data.password,
      birth_date: result.data.birth_date,
      metadata: { sports },
    },
  }
}

export function validateProfile(input) {
  const result = validateForm(input, {
    full_name: NAME_RULE,
    email: EMAIL_RULE,
    birth_date: BIRTH_DATE_RULE,
  })
  const sports = normalizeSports(input.sports)
  const error = sportsError(sports)
  if (error) result.errors.sports = error

  return {
    isValid: Object.keys(result.errors).length === 0,
    errors: result.errors,
    data: {
      full_name: result.data.full_name,
      email: String(result.data.email || '').toLowerCase(),
      birth_date: result.data.birth_date,
      metadata: { ...(input.metadata || {}), sports },
    },
  }
}

export function validatePasswordChange(input) {
  return validateForm(input, {
    current_password: { label: 'Contraseña actual', required: true },
    new_password: { label: 'Nueva contraseña', required: true, minLength: 8, maxLength: 255 },
    confirm_password: {
      label: 'Confirmación de contraseña',
      required: true,
      validate: (value, data) => value === data.new_password ? null : 'Las contraseñas no coinciden.',
    },
  })
}

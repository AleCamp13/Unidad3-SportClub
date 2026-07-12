const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function localIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function validateBirthDate(value, { label = 'Fecha de nacimiento' } = {}) {
  if (!ISO_DATE_PATTERN.test(value)) return `${label} debe tener formato AAAA-MM-DD.`

  const parsed = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) {
    return `${label} no es una fecha válida.`
  }
  if (value > localIsoDate()) return `${label} no puede estar en el futuro.`

  return null
}

function normalizeValue(value, rules) {
  let normalizedValue = value
  if (rules.trim && typeof normalizedValue === 'string') normalizedValue = normalizedValue.trim()
  if (rules.number && normalizedValue !== '' && normalizedValue != null) {
    normalizedValue = Number(normalizedValue)
  }
  return normalizedValue
}

function validateValue(value, rules, label, data) {
  const isEmpty = value == null || value === ''

  if (rules.required && isEmpty) return `${label} es obligatorio.`
  if (isEmpty) return null
  if (rules.email && !EMAIL_PATTERN.test(value)) return `${label} debe ser un correo válido.`
  if (rules.number && !Number.isFinite(value)) return `${label} debe ser un número válido.`
  if (rules.min != null && value < rules.min) return `${label} debe ser mayor o igual a ${rules.min}.`
  if (rules.max != null && value > rules.max) return `${label} debe ser menor o igual a ${rules.max}.`
  if (rules.minLength != null && String(value).length < rules.minLength) {
    return `${label} debe tener al menos ${rules.minLength} caracteres.`
  }
  if (rules.validate) return rules.validate(value, data) || null

  return null
}

export function validateForm(input, schema) {
  const data = { ...input }
  const errors = {}

  for (const [field, rules] of Object.entries(schema)) {
    const normalizedValue = normalizeValue(input[field], rules)
    data[field] = normalizedValue
    const error = validateValue(normalizedValue, rules, rules.label || field, data)
    if (error) errors[field] = error
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    data,
  }
}

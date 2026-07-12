const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeValue(value, rules) {
  if (rules.trim && typeof value === 'string') return value.trim()
  if (rules.number && value !== '' && value != null) return Number(value)
  return value
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

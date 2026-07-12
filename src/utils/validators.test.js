import { validateForm } from './validators'

describe('validateForm', () => {
  it('returns normalized data and field errors without mutating the input', () => {
    const input = { fullName: '  ', email: ' correo-invalido ', capacity: '0' }
    const original = { ...input }

    const result = validateForm(input, {
      fullName: { label: 'Nombre', required: true, trim: true },
      email: { label: 'Correo', required: true, email: true, trim: true },
      capacity: { label: 'Capacidad', number: true, min: 1 },
    })

    expect(result).toEqual({
      isValid: false,
      errors: {
        fullName: 'Nombre es obligatorio.',
        email: 'Correo debe ser un correo válido.',
        capacity: 'Capacidad debe ser mayor o igual a 1.',
      },
      data: { fullName: '', email: 'correo-invalido', capacity: 0 },
    })
    expect(input).toEqual(original)
  })

  it('supports minimum length and custom validation', () => {
    const result = validateForm({ password: 'abc', endTime: '09:00' }, {
      password: { label: 'Contraseña', minLength: 6 },
      endTime: {
        label: 'Hora de término',
        validate: () => 'La hora de término debe ser posterior al inicio.',
      },
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual({
      password: 'Contraseña debe tener al menos 6 caracteres.',
      endTime: 'La hora de término debe ser posterior al inicio.',
    })
  })

  it('composes trimming and numeric conversion while preserving required whitespace', () => {
    const result = validateForm({ capacity: '   ', duration: ' 45 ' }, {
      capacity: { label: 'Capacidad', required: true, trim: true, number: true },
      duration: { label: 'Duración', trim: true, number: true },
    })

    expect(result).toEqual({
      isValid: false,
      errors: { capacity: 'Capacidad es obligatorio.' },
      data: { capacity: '', duration: 45 },
    })
  })
})

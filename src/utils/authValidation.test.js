import {
  validateLogin,
  validatePasswordChange,
  validateProfile,
  validateRegistration,
} from './authValidation'

describe('authentication validation', () => {
  it('requires valid login credentials', () => {
    expect(validateLogin({ email: 'correo-invalido', password: '' }).errors).toEqual({
      email: 'Correo electrónico debe ser un correo válido.',
      password: 'Contraseña es obligatorio.',
    })
  })

  it('validates all registration fields and sport metadata', () => {
    const result = validateRegistration({
      full_name: 'Al',
      email: 'correo-invalido',
      password: '123',
      confirm_password: '456',
      birth_date: '',
      sports: [{ name: '', frequency_per_week: -1 }],
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toEqual(expect.objectContaining({
      full_name: 'Nombre completo debe tener al menos 3 caracteres.',
      email: 'Correo electrónico debe ser un correo válido.',
      password: 'Contraseña debe tener al menos 8 caracteres.',
      confirm_password: 'Las contraseñas no coinciden.',
      birth_date: 'Fecha de nacimiento es obligatorio.',
      sports: 'Cada deporte necesita un nombre y una frecuencia semanal válida.',
    }))
  })

  it('normalizes a valid registration into the backend payload shape', () => {
    const result = validateRegistration({
      full_name: '  Ana Perez  ',
      email: '  ANA@EXAMPLE.CL ',
      password: '12345678',
      confirm_password: '12345678',
      birth_date: '2000-05-10',
      sports: [{ name: ' Tenis ', frequency_per_week: '2' }],
    })

    expect(result).toEqual({
      isValid: true,
      errors: {},
      data: {
        full_name: 'Ana Perez',
        email: 'ana@example.cl',
        password: '12345678',
        birth_date: '2000-05-10',
        metadata: { sports: [{ name: 'Tenis', frequency_per_week: 2 }] },
      },
    })
  })

  it('validates profile and password forms', () => {
    expect(validateProfile({ full_name: '', email: 'bad', birth_date: '', sports: [] }).isValid).toBe(false)
    expect(validatePasswordChange({
      current_password: '',
      new_password: '123',
      confirm_password: '456',
    }).errors).toEqual(expect.objectContaining({
      current_password: 'Contraseña actual es obligatorio.',
      new_password: 'Nueva contraseña debe tener al menos 8 caracteres.',
      confirm_password: 'Las contraseñas no coinciden.',
    }))
  })

  it('rejects impossible and future birth dates with actionable messages', () => {
    const validInput = {
      full_name: 'Ana Perez',
      email: 'ana@example.cl',
      password: '12345678',
      confirm_password: '12345678',
      sports: [{ name: 'Tenis', frequency_per_week: 2 }],
    }

    expect(validateRegistration({ ...validInput, birth_date: '2026-02-30' }).errors.birth_date)
      .toBe('Fecha de nacimiento no es una fecha válida.')
    expect(validateRegistration({ ...validInput, birth_date: '2999-01-01' }).errors.birth_date)
      .toBe('Fecha de nacimiento no puede estar en el futuro.')
    expect(validateProfile({
      full_name: 'Ana Perez', email: 'ana@example.cl', birth_date: '2999-01-01', sports: [],
    }).errors.birth_date).toBe('Fecha de nacimiento no puede estar en el futuro.')
  })
})

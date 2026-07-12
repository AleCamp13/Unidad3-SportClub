import { validateAdminRoom, validateAdminSport, validateAdminUser } from './adminValidation'

describe('validateAdminUser', () => {
  const validUser = {
    full_name: '  Ana Pérez  ',
    email: ' ANA@EXAMPLE.CL ',
    password: '12345678',
    confirm_password: '12345678',
    role: 'coach',
    birth_date: '1992-03-12',
    must_change_password: true,
    sports: [{ name: ' Tenis ', frequency_per_week: '2' }],
  }

  it('normalizes a complete create payload to the backend contract', () => {
    const result = validateAdminUser(validUser)

    expect(result).toEqual({
      isValid: true,
      errors: {},
      data: {
        full_name: 'Ana Pérez',
        email: 'ana@example.cl',
        password: '12345678',
        role: 'coach',
        birth_date: '1992-03-12',
        must_change_password: true,
        metadata: { sports: [{ name: 'Tenis', frequency_per_week: 2 }] },
      },
    })
  })

  it('allows an edit without replacing the password', () => {
    const result = validateAdminUser({ ...validUser, password: '', confirm_password: '' }, { editing: true })

    expect(result.isValid).toBe(true)
    expect(result.data).not.toHaveProperty('password')
  })

  it('rejects an invalid role, mismatched password, and malformed sport metadata', () => {
    const result = validateAdminUser({
      ...validUser,
      role: 'owner',
      confirm_password: '87654321',
      sports: [{ name: '', frequency_per_week: '-1' }],
    })

    expect(result.isValid).toBe(false)
    expect(result.errors.role).toMatch(/rol/i)
    expect(result.errors.confirm_password).toMatch(/coinciden/i)
    expect(result.errors.sports).toMatch(/deporte/i)
  })

  it('requires both password fields when creating a user', () => {
    const result = validateAdminUser({ ...validUser, password: '', confirm_password: '' })

    expect(result.errors.password).toMatch(/al menos 8/i)
    expect(result.errors.confirm_password).toMatch(/confirmar/i)
  })
})

describe('validateAdminSport', () => {
  it('normalizes a valid sport and requires positive integer duration', () => {
    expect(validateAdminSport({
      name: ' Natación ', objective: ' Mejorar resistencia ', duration: '60', status: true,
    })).toEqual({
      isValid: true,
      errors: {},
      data: { name: 'Natación', objective: 'Mejorar resistencia', duration: 60, status: true },
    })

    const invalid = validateAdminSport({ name: 'AB', objective: 'Corto', duration: '2.5', status: true })
    expect(invalid.errors.name).toBeTruthy()
    expect(invalid.errors.duration).toMatch(/entero/i)
  })
})

describe('validateAdminRoom', () => {
  it('normalizes a room payload including its optional fields', () => {
    const result = validateAdminRoom({
      name: ' Sala Norte ',
      description: ' Sala para funcional ',
      capacity: '24',
      location: ' Piso 2 ',
      image_url: ' https://example.cl/sala.jpg ',
      observation: ' Acceso lateral ',
      status: false,
    })

    expect(result).toEqual({
      isValid: true,
      errors: {},
      data: {
        name: 'Sala Norte', description: 'Sala para funcional', capacity: 24,
        location: 'Piso 2', image_url: 'https://example.cl/sala.jpg',
        observation: 'Acceso lateral', status: false,
      },
    })
  })

  it('rejects invalid capacity, short required values, and malformed image URL', () => {
    const result = validateAdminRoom({
      name: 'A', description: 'B', capacity: '0', image_url: 'sala.jpg', status: true,
    })

    expect(result.errors.name).toBeTruthy()
    expect(result.errors.description).toBeTruthy()
    expect(result.errors.capacity).toMatch(/mayor/i)
    expect(result.errors.image_url).toMatch(/URL/i)
  })
})

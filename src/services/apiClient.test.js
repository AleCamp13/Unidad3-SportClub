import { ApiError, apiRequest, getApiUrl } from './apiClient'

describe('getApiUrl', () => {
  it('uses the configured API URL without a trailing slash', () => {
    vi.stubEnv('VITE_API_URL', 'https://example.test/api/')

    expect(getApiUrl()).toBe('https://example.test/api')
  })

  it('falls back to /api when the environment variable is blank', () => {
    vi.stubEnv('VITE_API_URL', '   ')

    expect(getApiUrl()).toBe('/api')
  })
})

describe('apiRequest', () => {
  it('unwraps data from a successful API envelope', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: true,
      message: 'Listado disponible',
      data: [{ id: 1, name: 'Tenis' }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    await expect(apiRequest('/sports')).resolves.toEqual([{ id: 1, name: 'Tenis' }])
    const [url, requestOptions] = fetch.mock.calls[0]
    expect(url).toBe('/api/sports')
    expect(requestOptions.headers.get('Accept')).toBe('application/json')
  })

  it('throws an ApiError with server validation details', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      message: 'Datos inválidos',
      errors: { email: ['El correo ya existe'] },
    }), { status: 422, headers: { 'Content-Type': 'application/json' } })))

    await expect(apiRequest('/users')).rejects.toMatchObject({
      name: 'ApiError',
      status: 422,
      message: 'Datos inválidos',
      errors: { email: ['El correo ya existe'] },
    })
  })

  it('throws an ApiError when a successful response envelope reports failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({
      ok: false,
      message: 'La operación fue rechazada',
      errors: { sport: ['El deporte está inactivo'] },
    }), { status: 200, headers: { 'Content-Type': 'application/json' } })))

    await expect(apiRequest('/reservations')).rejects.toMatchObject({
      name: 'ApiError',
      status: 200,
      message: 'La operación fue rechazada',
      errors: { sport: ['El deporte está inactivo'] },
    })
  })

  it('normalizes network failures as ApiError instances', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))

    await expect(apiRequest('/sports')).rejects.toEqual(expect.objectContaining({
      name: 'ApiError',
      status: 0,
      message: 'No fue posible conectar con el servidor.',
    }))
  })

  it('handles non-JSON error responses without leaking parser errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockImplementation(() => Promise.resolve(new Response('Service unavailable', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' },
    }))))

    await expect(apiRequest('/sports')).rejects.toBeInstanceOf(ApiError)
    await expect(apiRequest('/sports')).rejects.toMatchObject({
      status: 503,
      message: 'Service unavailable',
      errors: null,
    })
  })
})

const DEFAULT_API_URL = '/api'

export class ApiError extends Error {
  constructor(message, { status = 0, errors = null, cause } = {}) {
    super(message, cause ? { cause } : undefined)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

export function getApiUrl() {
  const configuredUrl = import.meta.env.VITE_API_URL?.trim()
  return (configuredUrl || DEFAULT_API_URL).replace(/\/+$/, '') || DEFAULT_API_URL
}

function buildUrl(path) {
  const normalizedPath = String(path).replace(/^\/+/, '')
  return normalizedPath ? `${getApiUrl()}/${normalizedPath}` : getApiUrl()
}

async function readResponse(response) {
  if (response.status === 204) return null

  const contentType = response.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text || null
}

export async function apiRequest(path, options = {}) {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  let body = options.body
  if (body != null && typeof body !== 'string' && !(body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
    body = JSON.stringify(body)
  }

  let response
  try {
    response = await fetch(buildUrl(path), { ...options, headers, body })
  } catch (error) {
    throw new ApiError('No fue posible conectar con el servidor.', { cause: error })
  }

  const payload = await readResponse(response)

  if (!response.ok) {
    const message = typeof payload === 'string'
      ? payload
      : payload?.message || 'La solicitud no pudo completarse.'

    throw new ApiError(message, {
      status: response.status,
      errors: typeof payload === 'object' ? payload?.errors ?? null : null,
    })
  }

  if (payload && typeof payload === 'object' && Object.hasOwn(payload, 'data')) {
    return payload.data
  }

  return payload
}

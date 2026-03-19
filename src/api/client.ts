const API_ROOT = '/api/v1'

export class ApiError extends Error {
  status: number
  data?: unknown

  constructor(message: string, status: number, data?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

type ParseAs = 'blob' | 'json' | 'text'

interface RequestOptions {
  method?: string
  headers?: HeadersInit
  body?: BodyInit | FormData | object | null
  parseAs?: ParseAs
  query?: Record<string, number | string | undefined>
  skipAuthRedirect?: boolean
}

let tokenResolver: () => string | null = () => null
let unauthorizedHandler: (() => void) | null = null

export function configureApiClient(options: {
  getToken: () => string | null
  onUnauthorized?: () => void
}): void {
  tokenResolver = options.getToken
  unauthorizedHandler = options.onUnauthorized ?? null
}

function buildUrl(path: string, query?: RequestOptions['query']): string {
  const normalisedPath = path.startsWith('/') ? path : `${API_ROOT}/${path}`
  const url = new URL(normalisedPath, window.location.origin)

  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    })
  }

  return `${url.pathname}${url.search}`
}

async function parseError(response: Response): Promise<ApiError> {
  const contentType = response.headers.get('content-type') || ''
  let payload: unknown
  let message = `Request failed with status ${response.status}`

  if (contentType.includes('application/json')) {
    payload = await response.json()
    const candidate =
      typeof payload === 'object' &&
      payload !== null &&
      'error' in payload &&
      typeof payload.error === 'object' &&
      payload.error !== null &&
      'message' in payload.error
        ? payload.error.message
        : null

    if (typeof candidate === 'string' && candidate.trim().length > 0) {
      message = candidate
    }
  } else {
    const text = await response.text()
    payload = text

    if (text.trim().length > 0) {
      message = text
    }
  }

  return new ApiError(message, response.status, payload)
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers)
  const token = tokenResolver()
  const body =
    options.body != null &&
    typeof options.body === 'object' &&
    !(options.body instanceof Blob) &&
    !(options.body instanceof FormData) &&
    !(options.body instanceof URLSearchParams)
      ? JSON.stringify(options.body)
      : options.body

  if (body && !headers.has('Content-Type') && typeof body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(buildUrl(path, options.query), {
    method: options.method ?? 'GET',
    headers,
    body: body ?? undefined,
    credentials: 'same-origin',
  })

  if (!response.ok) {
    const error = await parseError(response)

    if (response.status === 401 && !options.skipAuthRedirect) {
      unauthorizedHandler?.()
    }

    throw error
  }

  if (response.status === 204) {
    return undefined as T
  }

  switch (options.parseAs ?? 'json') {
    case 'blob':
      return (await response.blob()) as T
    case 'text':
      return (await response.text()) as T
    default:
      return (await response.json()) as T
  }
}

export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return fallback
}

export class ApiError extends Error {
  status: number
  code?: string

  constructor(message: string, status: number, code?: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

interface ApiOptions extends Omit<RequestInit, 'body'> {
  body?: unknown
}

/**
 * Calls the Worker API. The browser always sends same-origin requests, which
 * is what the server requires for anything that changes state.
 */
export async function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options

  const response = await fetch(path, {
    credentials: 'same-origin',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  let payload: unknown = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const data = payload as { error?: string; code?: string } | null
    throw new ApiError(
      data?.error ?? `Request failed (${response.status})`,
      response.status,
      data?.code,
    )
  }

  return payload as T
}

export function apiUrl(path: string, params: Record<string, string | undefined> = {}): string {
  const url = new URL(path, window.location.origin)
  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value)
  }
  return url.toString()
}

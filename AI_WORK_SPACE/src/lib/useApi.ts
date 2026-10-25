import { useCallback, useEffect, useState } from 'react'

import { ApiError, api } from './api'

interface AsyncState<T> {
  data: T | null
  error: ApiError | Error | null
  loading: boolean
  reload: () => void
}

/** Small data-fetching hook: one request per key, with manual reload. */
export function useApi<T>(path: string | null, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<ApiError | Error | null>(null)
  const [loading, setLoading] = useState<boolean>(!!path)
  const [nonce, setNonce] = useState(0)

  const reload = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!path) {
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    setError(null)

    api<T>(path)
      .then((result) => {
        if (!cancelled) setData(result)
      })
      .catch((err: ApiError | Error) => {
        if (!cancelled) setError(err)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path, nonce, ...deps])

  return { data, error, loading, reload }
}

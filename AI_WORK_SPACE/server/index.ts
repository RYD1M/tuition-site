import { createFreebuffAuth } from '@freebuff/auth'
import type { FreebuffAuth } from '@freebuff/auth'

import { createApp } from './app'
import type { Env } from './db'

type Fetcher = (request: Request, env: Env) => Promise<Response>

interface Runtime {
  auth: FreebuffAuth
  fetcher: Fetcher
}

const runtimes = new Map<string, Runtime>()

function setup(env: Env): Runtime {
  const key = env.FREEBUFF_CLIENT_ID ?? ''
  const existing = runtimes.get(key)
  if (existing) return existing

  const isLoopback =
    env.APP_ORIGIN.startsWith('http://localhost') || env.APP_ORIGIN.startsWith('http://127.0.0.1')

  // One instance per isolate: it caches discovery and signing keys.
  const auth = createFreebuffAuth({
    clientId: env.FREEBUFF_CLIENT_ID,
    issuer: env.FREEBUFF_ISSUER,
    baseUrl: env.APP_ORIGIN,
    allowInsecureLocalhost: isLoopback,
  })

  const app = createApp(auth)

  const handler = auth.wrap(async (request: Request, e: Env) => {
    const { pathname } = new URL(request.url)

    if (pathname.startsWith('/api/')) return app.fetch(request, e)

    const response = await e.ASSETS.fetch(request)

    // Client-side routes haven't a file behind them: hand back the app shell.
    if (response.status === 404 && (request.method === 'GET' || request.method === 'HEAD')) {
      const shell = await e.ASSETS.fetch(new Request(new URL('/', request.url).toString(), request))
      if (shell.ok) return shell
    }
    return response
  })

  const runtime: Runtime = { auth, fetcher: handler }
  runtimes.set(key, runtime)
  return runtime
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return setup(env).fetcher(request, env)
  },
}

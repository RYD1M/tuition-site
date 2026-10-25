import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SignInWithFreebuff, useFreebuffUser } from '@freebuff/auth/react'

import { useLocale } from '../i18n'
import { Skeleton } from './ui'

/** The sign-in panel shown wherever a signed-out visitor hits a private page. */
export function SignInPrompt({ title, lead }: { title?: string; lead?: string }) {
  const { t } = useLocale()
  const location = useLocation()

  return (
    <div className="container page">
      <div className="panel" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center' }}>
        <h2>{title ?? t('signInTitle')}</h2>
        <p className="subtle" style={{ marginTop: 8 }}>
          {lead ?? t('signInLead')}
        </p>
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
          <SignInWithFreebuff className="btn btn-primary btn-lg" returnTo={location.pathname}>
            {t('signInWith')}
          </SignInWithFreebuff>
          <Link to="/tutions" className="btn btn-ghost btn-lg">
            {t('navBoard')}
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Blocks a route until the visitor is signed in; the server enforces it too. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, isLoading } = useFreebuffUser()
  const { t } = useLocale()

  if (isLoading) {
    return (
      <div className="container page">
        <Skeleton count={2} />
      </div>
    )
  }

  if (!user) return <SignInPrompt lead={t('mustSignIn')} />
  return <>{children}</>
}

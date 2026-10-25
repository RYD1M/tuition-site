import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { SignInWithFreebuff, SignOutButton, useFreebuffUser } from '@freebuff/auth/react'

import { useLocale } from '../i18n'
import { IconArrow, IconClose, IconMenu } from './icons'

export function Header() {
  const { t, lang, setLang } = useLocale()
  const { user, isLoading } = useFreebuffUser()
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  const links = (
    <>
      <NavLink to="/tutions" className={({ isActive }) => (isActive ? 'active' : undefined)}>
        {t('navBoard')}
      </NavLink>
      <NavLink to="/tutors" className={({ isActive }) => (isActive ? 'active' : undefined)}>
        {t('navTutors')}
      </NavLink>
      {user ? (
        <NavLink to="/me" className={({ isActive }) => (isActive ? 'active' : undefined)}>
          {t('navDashboard')}
        </NavLink>
      ) : null}
    </>
  )

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                <path d="M12 4 2.5 8.5 12 13l9.5-4.5Z" />
                <path d="M6.5 10.7V16c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-5.3" />
              </svg>
            </span>
            <span>
              {t('brand')}
              <br />
              <span className="brand-sub">{t('brandTag')}</span>
            </span>
          </Link>

          <nav className="nav" aria-label="primary">
            {links}
          </nav>

          <div className="header-actions">
            <div className="lang-toggle" role="group" aria-label={t('language')}>
              <button
                type="button"
                className={lang === 'bn' ? 'on' : undefined}
                onClick={() => setLang('bn')}
                aria-pressed={lang === 'bn'}
              >
                বাংলা
              </button>
              <button
                type="button"
                className={lang === 'en' ? 'on' : undefined}
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
              >
                EN
              </button>
            </div>

            {!isLoading && user ? (
              <>
                <Link to="/post" className="btn btn-primary btn-sm hide-sm">
                  {t('navPost')}
                </Link>
                <Link
                  to="/me"
                  className="row"
                  style={{ gap: 8 }}
                  title={user.name ?? user.email ?? ''}
                >
                  {user.picture ? (
                    <img className="avatar" src={user.picture} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="avatar avatar-fallback" aria-hidden="true">
                      {(user.name ?? user.email ?? '?').slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </Link>
                <SignOutButton className="btn btn-ghost btn-sm hide-sm" returnTo="/">
                  {t('signOut')}
                </SignOutButton>
              </>
            ) : isLoading ? null : (
              <SignInWithFreebuff className="btn btn-primary btn-sm" returnTo={location.pathname}>
                {t('signInWith')}
              </SignInWithFreebuff>
            )}

            <button
              type="button"
              className="btn btn-ghost btn-sm menu-btn"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? t('close') : t('menu')}
            >
              {open ? <IconClose width="18" height="18" /> : <IconMenu width="18" height="18" />}
            </button>
          </div>
        </div>

        {open ? (
          <nav className="mobile-nav" aria-label="mobile">
            <Link to="/tutions">{t('navBoard')}</Link>
            <Link to="/tutors">{t('navTutors')}</Link>
            <Link to="/post">{t('navPost')}</Link>
            {user ? <Link to="/me">{t('navDashboard')}</Link> : null}
            {!isLoading && !user ? (
              <SignInWithFreebuff returnTo={location.pathname}>{t('signInWith')}</SignInWithFreebuff>
            ) : null}
            {user ? (
              <SignOutButton returnTo="/">{t('signOut')}</SignOutButton>
            ) : null}
          </nav>
        ) : null}
      </div>
    </header>
  )
}

export function Footer() {
  const { t } = useLocale()
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ color: '#fff' }}>
              <span className="brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
                  <path d="M12 4 2.5 8.5 12 13l9.5-4.5Z" />
                  <path d="M6.5 10.7V16c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-5.3" />
                </svg>
              </span>
              <span>{t('brand')}</span>
            </div>
            <p style={{ marginTop: 12, maxWidth: 380 }}>{t('footerTag')}</p>
          </div>

          <div>
            <h4>{t('footerExplore')}</h4>
            <ul>
              <li>
                <Link to="/tutions">{t('navBoard')}</Link>
              </li>
              <li>
                <Link to="/tutors">{t('navTutors')}</Link>
              </li>
              <li>
                <Link to="/post">{t('navPost')}</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4>{t('footerForPeople')}</h4>
            <ul>
              <li>
                <Link to="/post">{t('footerStudent')}</Link>
              </li>
              <li>
                <Link to="/me?tab=profile">{t('footerTutor')}</Link>
              </li>
              <li>
                <Link to="/about">
                  {t('footerAbout')} <IconArrow width="13" height="13" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-note">
          <span>{t('footerNote')}</span>
          <span>
            {t('brand')} · {t('brandTag')}
          </span>
        </div>
      </div>
    </footer>
  )
}

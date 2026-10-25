import { Link } from 'react-router-dom'

import { useLocale } from '../i18n'

export default function About() {
  const { t } = useLocale()

  return (
    <div className="container page">
      <div className="panel" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="panel-title">
          <h1 style={{ fontSize: '1.7rem' }}>{t('footerAbout')}</h1>
        </div>

        <div className="stack">
          <p className="subtle">{t('footerTag')}</p>

          <div className="divider" />

          <div className="stack" style={{ gap: 10 }}>
            <h3>{t('why1Title')}</h3>
            <p className="subtle small">{t('why1Desc')}</p>
          </div>

          <div className="stack" style={{ gap: 10 }}>
            <h3>{t('why2Title')}</h3>
            <p className="subtle small">{t('why2Desc')}</p>
          </div>

          <div className="stack" style={{ gap: 10 }}>
            <h3>{t('why3Title')}</h3>
            <p className="subtle small">{t('why3Desc')}</p>
          </div>

          <div className="divider" />

          <p className="muted small">{t('footerNote')}</p>

          <div className="row wrap">
            <Link to="/post" className="btn btn-primary">
              {t('heroCtaPost')}
            </Link>
            <Link to="/tutors" className="btn btn-ghost">
              {t('navTutors')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

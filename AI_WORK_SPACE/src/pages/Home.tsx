import { Link } from 'react-router-dom'

import { RequestCard, TutorCard } from '../components/cards'
import { IconArrow, IconPlus } from '../components/icons'
import { SectionHead, Skeleton } from '../components/ui'
import { useLocale } from '../i18n'
import { useApi } from '../lib/useApi'
import type { PublicTutor, TuitionRequest } from '../../shared/types'

export default function Home() {
  const { t, num } = useLocale()
  const requests = useApi<{ total: number }>('/api/requests?limit=1')
  const tutors = useApi<{ total: number }>('/api/tutors?limit=1')
  const recent = useApi<{ items: TuitionRequest[] }>('/api/requests?limit=6')
  const topTutors = useApi<{ items: PublicTutor[] }>('/api/tutors?limit=3')

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <span className="free-pill">{t('freeForever')}</span>
          <h1>{t('heroTitle')}</h1>
          <p className="lead">{t('heroLead')}</p>

          <div className="hero-cta">
            <Link to="/post" className="btn btn-primary btn-lg">
              <IconPlus width="18" height="18" />
              {t('heroCtaPost')}
            </Link>
            <Link to="/tutions" className="btn btn-ghost btn-lg">
              {t('heroCtaBrowse')}
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>{requests.data ? num(requests.data.total) : '—'}</strong>
              <span>{t('statOpen')}</span>
            </div>
            <div>
              <strong>{tutors.data ? num(tutors.data.total) : '—'}</strong>
              <span>{t('statTutors')}</span>
            </div>
            <div>
              <strong>{num(64)}</strong>
              <span>{t('statDistricts')}</span>
            </div>
            <div>
              <strong>৳{num(0)}</strong>
              <span>{t('statCost')}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={t('howTitle')} lead={t('howLead')} />
          <div className="steps">
            <article className="step">
              <div className="step-num">১</div>
              <h3>{t('step1Title')}</h3>
              <p>{t('step1Desc')}</p>
            </article>
            <article className="step">
              <div className="step-num">২</div>
              <h3>{t('step2Title')}</h3>
              <p>{t('step2Desc')}</p>
            </article>
            <article className="step">
              <div className="step-num">৩</div>
              <h3>{t('step3Title')}</h3>
              <p>{t('step3Desc')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHead
            title={t('boardTitle')}
            lead={t('boardLead')}
            action={
              <Link to="/tutions" className="btn btn-ghost btn-sm">
                {t('loadMore')} <IconArrow width="15" height="15" />
              </Link>
            }
          />
          {recent.loading ? (
            <Skeleton count={3} />
          ) : (
            <div className="grid grid-3">
              {(recent.data?.items ?? []).map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section band">
        <div className="container">
          <SectionHead
            title={t('tutorsTitle')}
            lead={t('tutorsLead')}
            action={
              <Link to="/tutors" className="btn btn-ghost btn-sm">
                {t('loadMore')} <IconArrow width="15" height="15" />
              </Link>
            }
          />
          {topTutors.loading ? (
            <Skeleton count={3} />
          ) : (
            <div className="grid grid-3">
              {(topTutors.data?.items ?? []).map((tutor) => (
                <TutorCard key={tutor.sub} tutor={tutor} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHead title={t('whyTitle')} />
          <div className="steps">
            <article className="step">
              <h3>{t('why1Title')}</h3>
              <p>{t('why1Desc')}</p>
            </article>
            <article className="step">
              <h3>{t('why2Title')}</h3>
              <p>{t('why2Desc')}</p>
            </article>
            <article className="step">
              <h3>{t('why3Title')}</h3>
              <p>{t('why3Desc')}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section band" style={{ paddingBottom: 44 }}>
        <div className="container center" style={{ maxWidth: 640 }}>
          <h2>{t('ctaTitle')}</h2>
          <p className="subtle" style={{ marginTop: 8 }}>
            {t('ctaLead')}
          </p>
          <div style={{ marginTop: 20, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/post" className="btn btn-primary btn-lg">
              {t('ctaBtn')}
            </Link>
            <Link to="/me?tab=profile" className="btn btn-ghost btn-lg">
              {t('profileTitle')}
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}

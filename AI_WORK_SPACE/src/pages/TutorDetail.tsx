import { Link, useParams } from 'react-router-dom'

import { ErrorBox, Skeleton, Tag } from '../components/ui'
import { IconLock, IconPin } from '../components/icons'
import { useLocale } from '../i18n'
import { useApi } from '../lib/useApi'
import { CLASS_LEVELS, DAYS, DISTRICTS, MODES, SUBJECTS, TIME_SLOTS } from '../../shared/constants'
import type { PublicTutor } from '../../shared/types'

interface TutorResponse {
  tutor: PublicTutor
}

/**
 * A public tutor profile. Phone numbers are never sent to a visitor — the
 * only way to reach a tutor is to post a tuition that invites them, and the
 * number unlocks once they accept.
 */
export default function TutorDetail() {
  const { sub = '' } = useParams()
  const { t, label, money, num, date } = useLocale()

  const { data, loading, error } = useApi<TutorResponse>(
    sub ? `/api/tutors/${encodeURIComponent(sub)}` : null,
  )

  if (loading) {
    return (
      <div className="container page">
        <Skeleton count={3} />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="container page">
        <ErrorBox message={error instanceof Error ? error.message : t('genericError')} />
      </div>
    )
  }

  const tutor = data.tutor

  return (
    <div className="container page">
      <div className="breadcrumb">
        <Link to="/tutors" className="link">
          {t('navTutors')}
        </Link>
        <span>/</span>
        <span>{t('tutorProfile')}</span>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <div className="panel">
            <div className="row-between wrap" style={{ marginBottom: 14 }}>
              <div>
                <h1 style={{ fontSize: '1.5rem' }}>{tutor.display_name}</h1>
                <p className="muted small" style={{ marginTop: 6 }}>
                  {tutor.headline || tutor.qualification}
                </p>
              </div>
              <span className={tutor.open_to_offers ? 'badge badge-open' : 'badge badge-closed'}>
                {tutor.open_to_offers ? t('openToOffers') : t('closedToOffers')}
              </span>
            </div>

            <dl className="kv">
              <dt>{t('teaches')}</dt>
              <dd>
                <div className="tags">
                  {tutor.subjects.map((key) => (
                    <Tag key={key} tone="brand">
                      {label(SUBJECTS, key)}
                    </Tag>
                  ))}
                </div>
              </dd>

              <dt>{t('classLevel')}</dt>
              <dd>
                {tutor.class_levels.length
                  ? tutor.class_levels.map((key) => label(CLASS_LEVELS, key)).join(', ')
                  : '—'}
              </dd>

              <dt>{t('worksIn')}</dt>
              <dd className="row" style={{ gap: 6, flexWrap: 'wrap' }}>
                <IconPin width="15" height="15" />
                {tutor.districts.map((key) => label(DISTRICTS, key)).join(', ') || '—'}
              </dd>

              <dt>{t('mode')}</dt>
              <dd>{label(MODES, tutor.mode)}</dd>

              <dt>{t('fee')}</dt>
              <dd className="budget">
                {tutor.fee_amount ? `${money(tutor.fee_amount)}${t('perMonth')}` : t('feeUnspecified')}
              </dd>

              <dt>{t('availableDays')}</dt>
              <dd>
                {tutor.available_days.length
                  ? tutor.available_days.map((key) => label(DAYS, key)).join(', ')
                  : t('optional')}
              </dd>

              <dt>{t('availableTime')}</dt>
              <dd>
                <div className="tags">
                  {tutor.available_time.length ? (
                    tutor.available_time.map((key) => (
                      <Tag key={key}>{label(TIME_SLOTS, key)}</Tag>
                    ))
                  ) : (
                    <span>{t('optional')}</span>
                  )}
                </div>
              </dd>

              <dt>{t('experienceYears')}</dt>
              <dd>
                {tutor.experience_years !== null
                  ? `${num(tutor.experience_years)} ${t('yearsExp')}`
                  : '—'}
              </dd>

              {tutor.qualification ? (
                <>
                  <dt>{t('qualification')}</dt>
                  <dd>{tutor.qualification}</dd>
                </>
              ) : null}

              <dt>{t('postedAt')}</dt>
              <dd>{date(tutor.created_at)}</dd>
            </dl>

            {tutor.bio ? (
              <>
                <div className="divider" />
                <div className="stack-sm">
                  <span className="eyebrow">{t('bio')}</span>
                  <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{tutor.bio}</p>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <aside className="stack">
          <div className="panel stack">
            <span className="eyebrow">{t('contactTitle')}</span>

            <div className="locked">
              <IconLock width="16" height="16" />
              {t('tutorContactLead')}
            </div>

            <Link
              to={`/post?tutor=${encodeURIComponent(tutor.sub)}`}
              className="btn btn-primary btn-lg btn-block"
            >
              {t('inviteToTuition')}
            </Link>

            <Link to="/tutions" className="btn btn-ghost btn-block">
              {t('heroCtaBrowse')}
            </Link>

            <p className="tiny muted" style={{ margin: 0 }}>
              {t('step3Desc')}
            </p>
          </div>
        </aside>
      </div>
    </div>
  )
}

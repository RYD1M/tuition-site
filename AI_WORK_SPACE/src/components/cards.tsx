import { Link } from 'react-router-dom'

import { CLASS_LEVELS, DISTRICTS, MODES, SUBJECTS } from '../../shared/constants'
import type { PublicTutor, TuitionRequest } from '../../shared/types'
import { useLocale } from '../i18n'
import { IconArrow, IconClock, IconPin, IconUsers } from './icons'
import { Badge, Tag } from './ui'

export function RequestCard({ request }: { request: TuitionRequest }) {
  const { t, label, money, ago } = useLocale()

  return (
    <Link to={`/tutions/${request.id}`} className="card stack" style={{ gap: 10 }}>
      <div className="row-between wrap">
        <div className="tags">
          {request.subjects.map((key) => (
            <Tag key={key} tone="brand">
              {label(SUBJECTS, key)}
            </Tag>
          ))}
        </div>
        {request.status !== 'open' ? <Badge status={request.status} /> : null}
      </div>

      <div>
        <div className="card-title">
          {request.class_levels.map((key) => label(CLASS_LEVELS, key)).join(', ')}
        </div>
        <div className="card-meta">
          <span>
            <IconPin width="15" height="15" />
            {label(MODES, request.mode)}
            {request.area ? ` · ${request.area}` : ''}, {label(DISTRICTS, request.district)}
          </span>
          <span>
            <IconClock width="15" height="15" />
            {ago(request.created_at)}
          </span>
        </div>
      </div>

      <p
        className="subtle small"
        style={{
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {request.details}
      </p>

      <div className="card-foot">
        <span className="budget">
          {request.budget_amount ? `${money(request.budget_amount)}${t('perMonth')}` : t('negotiable')}
        </span>
        <span className="row" style={{ gap: 6, color: 'var(--ink-3)', fontSize: '0.85rem' }}>
          <IconUsers width="15" height="15" />
          {t('applicants')}: {request.application_count}
          <IconArrow width="14" height="14" />
        </span>
      </div>
    </Link>
  )
}

export function TutorCard({ tutor }: { tutor: PublicTutor }) {
  const { t, label, money } = useLocale()

  return (
    <Link to={`/tutors/${tutor.sub}`} className="card stack" style={{ gap: 10 }}>
      <div className="row" style={{ gap: 12, alignItems: 'flex-start' }}>
        <span
          className="avatar avatar-fallback"
          style={{ width: 44, height: 44, fontSize: '1.05rem' }}
          aria-hidden="true"
        >
          {tutor.display_name.slice(0, 1).toUpperCase()}
        </span>
        <div style={{ minWidth: 0 }}>
          <div className="card-title">{tutor.display_name}</div>
          <div className="muted small">{tutor.headline || tutor.qualification}</div>
        </div>
      </div>

      <div className="tags">
        {tutor.subjects.slice(0, 4).map((key) => (
          <Tag key={key}>{label(SUBJECTS, key)}</Tag>
        ))}
        {tutor.subjects.length > 4 ? <Tag>+{tutor.subjects.length - 4}</Tag> : null}
      </div>

      <div className="card-meta">
        <span>
          <IconPin width="15" height="15" />
          {tutor.districts.slice(0, 3).map((key) => label(DISTRICTS, key)).join(', ')}
          {tutor.districts.length > 3 ? ` +${tutor.districts.length - 3}` : ''}
        </span>
        <span>
          <IconClock width="15" height="15" />
          {tutor.experience_years !== null
            ? `${tutor.experience_years} ${t('yearsExp')}`
            : t('feeUnspecified')}
        </span>
      </div>

      <div className="card-foot">
        <span className="budget">
          {tutor.fee_amount ? `${money(tutor.fee_amount)}${t('perMonth')}` : t('feeUnspecified')}
        </span>
        <span className="link small">{t('viewProfile')}</span>
      </div>
    </Link>
  )
}

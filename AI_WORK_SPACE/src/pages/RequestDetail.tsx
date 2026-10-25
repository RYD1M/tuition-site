import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { SignInWithFreebuff, useFreebuffUser } from '@freebuff/auth/react'

import { IconCheck, IconLock, IconPhone, IconWhatsapp } from '../components/icons'
import { Badge, ErrorBox, Field, Skeleton, Tag } from '../components/ui'
import { useLocale } from '../i18n'
import { api, ApiError } from '../lib/api'
import { telHref, waHref } from '../lib/contact'
import { useApi } from '../lib/useApi'
import { CLASS_LEVELS, DAYS, DISTRICTS, MODES, SUBJECTS, TIME_SLOTS } from '../../shared/constants'
import type { ApplicationWithTutor, TuitionRequest } from '../../shared/types'

interface DetailResponse {
  request: TuitionRequest
  applications: ApplicationWithTutor[] | null
  application_count: number
  viewer_is_owner: boolean
}

export default function RequestDetail() {
  const { t } = useLocale()
  const { id = '' } = useParams()
  const { data, error, loading, reload } = useApi<DetailResponse>(
    id ? `/api/requests/${id}` : null,
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
        <ErrorBox message={error instanceof ApiError ? error.message : t('genericError')} />
      </div>
    )
  }

  return data.viewer_is_owner ? (
    <OwnerView data={data} reload={reload} />
  ) : (
    <PublicView data={data} reload={reload} />
  )
}

function Meta({ request }: { request: TuitionRequest }) {
  const { t, label, money, date, ago } = useLocale()
  return (
    <dl className="kv">
      <dt>{t('subject')}</dt>
      <dd>
        <div className="tags">
          {request.subjects.map((key) => (
            <Tag key={key} tone="brand">
              {label(SUBJECTS, key)}
            </Tag>
          ))}
        </div>
      </dd>

      <dt>{t('classLevel')}</dt>
      <dd>{request.class_levels.map((key) => label(CLASS_LEVELS, key)).join(', ')}</dd>

      <dt>{t('district')}</dt>
      <dd>
        {request.area ? `${request.area}, ` : ''}
        {label(DISTRICTS, request.district)}
      </dd>

      <dt>{t('mode')}</dt>
      <dd>{label(MODES, request.mode)}</dd>

      <dt>{t('days')}</dt>
      <dd>{request.days.length ? request.days.map((key) => label(DAYS, key)).join(', ') : '—'}</dd>

      <dt>{t('timeSlots')}</dt>
      <dd>
        {request.time_slots.length
          ? request.time_slots.map((key) => label(TIME_SLOTS, key)).join(', ')
          : '—'}
      </dd>

      <dt>{t('budget')}</dt>
      <dd className="budget">
        {request.budget_amount ? `${money(request.budget_amount)}${t('perMonth')}` : t('negotiable')}
      </dd>

      {request.start_date ? (
        <>
          <dt>{t('startDate')}</dt>
          <dd>{request.start_date}</dd>
        </>
      ) : null}

      <dt>{t('postedAt')}</dt>
      <dd>{date(request.created_at)}</dd>

      <dt>{t('status')}</dt>
      <dd>
        <Badge status={request.status} />
        <span className="muted small" style={{ marginLeft: 8 }}>
          {ago(request.created_at)}
        </span>
      </dd>
    </dl>
  )
}

function PublicView({ data, reload }: { data: DetailResponse; reload: () => void }) {
  const { t } = useLocale()
  const { user, isLoading } = useFreebuffUser()
  const request = data.request

  return (
    <div className="container page">
      <div className="breadcrumb">
        <Link to="/tutions" className="link">
          {t('backToBoard')}
        </Link>
        <span>/</span>
        <span>{t('requestDetail')}</span>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <div className="panel">
            <div className="row-between wrap" style={{ marginBottom: 14 }}>
              <h1 style={{ fontSize: '1.5rem' }}>{t('requestDetail')}</h1>
              <Badge status={request.status} />
            </div>
            <Meta request={request} />
          </div>

          <div className="panel">
            <h2>{t('about')}</h2>
            <p className="subtle" style={{ marginTop: 10, whiteSpace: 'pre-wrap' }}>
              {request.details}
            </p>
          </div>
        </div>

        <div className="stack">
          <ApplyPanel data={data} reload={reload} user={user} isLoading={isLoading} />
        </div>
      </div>
    </div>
  )
}

function ApplyPanel({
  data,
  reload,
  user,
  isLoading,
}: {
  data: DetailResponse
  reload: () => void
  user: { sub: string } | null
  isLoading: boolean
}) {
  const { t } = useLocale()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  if (isLoading) return <Skeleton count={1} />

  if (!user) {
    return (
      <div className="panel center">
        <h3>{t('signInTitle')}</h3>
        <p className="subtle small" style={{ marginTop: 8 }}>
          {t('signInLead')}
        </p>
        <div style={{ marginTop: 16 }}>
          <SignInWithFreebuff className="btn btn-primary btn-block" returnTo={`/tutions/${data.request.id}`}>
            {t('signInWith')}
          </SignInWithFreebuff>
        </div>
      </div>
    )
  }

  if (data.request.status !== 'open') {
    return (
      <div className="panel">
        <h3>{t('applyTitle')}</h3>
        <div style={{ marginTop: 12 }}>
          <ErrorBox message={t('applyClosed')} />
        </div>
      </div>
    )
  }

  async function submit() {
    setBusy(true)
    setFailure(null)
    setNotice(null)
    try {
      await api(`/api/requests/${data.request.id}/apply`, {
        method: 'POST',
        body: { message },
      })
      setNotice(t('applySuccess'))
      setMessage('')
      reload()
    } catch (err) {
      setFailure((err as ApiError).message || t('genericError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="panel">
      <h3>{t('applyTitle')}</h3>
      <p className="muted small" style={{ marginTop: 6 }}>
        {t('phoneLockedTutor')}
      </p>

      <div style={{ marginTop: 14 }}>
        <Field label={t('applyMessage')} hint={t('optional')}>
          <textarea
            className="textarea"
            style={{ minHeight: 92 }}
            maxLength={600}
            placeholder={t('applyMessagePh')}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </Field>
      </div>

      {failure ? (
        <div style={{ marginTop: 12 }}>
          <ErrorBox message={failure} />
        </div>
      ) : null}
      {notice ? (
        <div style={{ marginTop: 12 }}>
          <div className="success-box">{notice}</div>
        </div>
      ) : null}

      <div style={{ marginTop: 14 }}>
        <button
          type="button"
          className="btn btn-primary btn-block"
          disabled={busy}
          onClick={() => void submit()}
        >
          {busy ? <span className="spinner" /> : null}
          {t('applyBtn')}
        </button>
      </div>

      <div style={{ marginTop: 10 }} className="row wrap">
        <Link to="/me?tab=profile" className="link small">
          {t('profileTitle')}
        </Link>
        <Link to="/tutors" className="link small">
          {t('navTutors')}
        </Link>
      </div>
    </div>
  )
}

function OwnerView({ data, reload }: { data: DetailResponse; reload: () => void }) {
  const { t, label } = useLocale()
  const navigate = useNavigate()
  const [busy, setBusy] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const applications = data.applications ?? []
  const request = data.request

  async function act(key: string, path: string, method = 'POST', body?: unknown) {
    setBusy(key)
    setFailure(null)
    try {
      await api(path, { method, body })
      reload()
    } catch (err) {
      setFailure((err as ApiError).message || t('genericError'))
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    if (!window.confirm(t('deleteConfirm'))) return
    await act('delete', `/api/requests/${request.id}`, 'DELETE')
    navigate('/me')
  }

  return (
    <div className="container page">
      <div className="breadcrumb">
        <Link to="/me" className="link">
          {t('dashTitle')}
        </Link>
        <span>/</span>
        <span>{t('requestDetail')}</span>
      </div>

      <div className="detail-grid">
        <div className="stack">
          <div className="panel">
            <div className="row-between wrap" style={{ marginBottom: 14 }}>
              <h1 style={{ fontSize: '1.5rem' }}>{t('requestDetail')}</h1>
              <Badge status={request.status} />
            </div>
            <Meta request={request} />
            <div className="divider" />
            <p className="subtle" style={{ whiteSpace: 'pre-wrap' }}>
              {request.details}
            </p>
          </div>

          <div className="panel">
            <div className="panel-title">
              <h2>{t('ownerTitle')}</h2>
              <p className="muted small">{t('ownerLead')}</p>
            </div>

            {failure ? <ErrorBox message={failure} /> : null}

            <div className="stack">
              {applications.length === 0 ? (
                <div className="empty" style={{ padding: '28px 16px' }}>
                  <h3>{t('noApplicants')}</h3>
                  <p>{t('noApplicantsLead')}</p>
                </div>
              ) : (
                applications.map((application) => (
                  <article
                    key={application.id}
                    className={application.status === 'accepted' ? 'app-row accepted' : 'app-row'}
                  >
                    <div className="row-between wrap">
                      <div style={{ minWidth: 0 }}>
                        <div className="card-title">{application.tutor.name}</div>
                        <div className="muted small">{application.tutor.headline}</div>
                      </div>
                      <Badge status={application.status} />
                    </div>

                    {application.tutor.subjects.length > 0 ? (
                      <div className="tags">
                        {application.tutor.subjects.slice(0, 6).map((key) => (
                          <Tag key={key}>{label(SUBJECTS, key)}</Tag>
                        ))}
                      </div>
                    ) : null}

                    {application.tutor.qualification ? (
                      <p className="muted small">{application.tutor.qualification}</p>
                    ) : null}

                    {application.message ? (
                      <p className="subtle small">{application.message}</p>
                    ) : null}

                    {application.status === 'accepted' ? (
                      <ContactBlock
                        phone={application.tutor.phone ?? ''}
                        label={t('phoneRevealTutor')}
                        name={application.tutor.name}
                      />
                    ) : (
                      <div className="locked">
                        <IconLock width="16" height="16" />
                        {t('phoneLocked')}
                      </div>
                    )}

                    {application.status === 'pending' || application.status === 'invited' ? (
                      <div className="row wrap">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={busy === application.id}
                          onClick={() =>
                            void act(application.id, `/api/applications/${application.id}/accept`)
                          }
                        >
                          <IconCheck width="16" height="16" />
                          {t('acceptBtn')}
                        </button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          disabled={busy === application.id}
                          onClick={() =>
                            void act(application.id, `/api/applications/${application.id}/reject`)
                          }
                        >
                          {t('rejectBtn')}
                        </button>
                      </div>
                    ) : null}
                  </article>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="panel">
            <h3>{t('status')}</h3>
            <div className="stack" style={{ gap: 8, marginTop: 12 }}>
              {request.status === 'open' ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  disabled={busy === 'status'}
                  onClick={() =>
                    void act('status', `/api/requests/${request.id}`, 'PATCH', { status: 'filled' })
                  }
                >
                  {t('markFilled')}
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-ghost btn-block"
                  disabled={busy === 'status'}
                  onClick={() =>
                    void act('status', `/api/requests/${request.id}`, 'PATCH', { status: 'open' })
                  }
                >
                  {t('reopenPost')}
                </button>
              )}
              <button
                type="button"
                className="btn btn-danger btn-block"
                disabled={busy === 'delete'}
                onClick={() => void remove()}
              >
                {t('deletePost')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function ContactBlock({ phone, label, name }: { phone: string; label: string; name: string }) {
  const { t } = useLocale()

  if (!phone) {
    return (
      <div className="locked">
        <IconLock width="16" height="16" />
        {t('phoneMissing')}
      </div>
    )
  }

  return (
    <div className="reveal-box">
      <div className="tiny muted">{label}</div>
      <div className="row-between wrap">
        <div className="phone">{phone}</div>
        <div className="row" style={{ gap: 8 }}>
          <a className="btn btn-primary btn-sm" href={telHref(phone)}>
            <IconPhone width="15" height="15" />
            {t('callNow')}
          </a>
          <a
            className="btn btn-ghost btn-sm"
            href={waHref(phone)}
            target="_blank"
            rel="noreferrer noopener"
          >
            <IconWhatsapp width="15" height="15" />
            {t('whatsApp')}
          </a>
        </div>
      </div>
      <div className="tiny muted" style={{ marginTop: 6 }}>
        {name}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useFreebuffUser } from '@freebuff/auth/react'

import { SignInPrompt } from '../components/Auth'
import { Badge, EmptyState, ErrorBox, Skeleton, Tag } from '../components/ui'
import { IconLock, IconPhone, IconWhatsapp } from '../components/icons'
import { useLocale } from '../i18n'
import { telHref, waHref } from '../lib/contact'
import { api } from '../lib/api'
import { useApi } from '../lib/useApi'
import { CLASS_LEVELS, DISTRICTS, MODES, SUBJECTS } from '../../shared/constants'
import type { MeResponse, MyApplication, TuitionRequest } from '../../shared/types'
import TutorProfileForm from './TutorProfileForm'

type Tab = 'posts' | 'applications' | 'profile'

interface MyRequestRow {
  request: TuitionRequest
  applications: unknown[]
}

export default function Dashboard() {
  const { t } = useLocale()
  const { user, isLoading } = useFreebuffUser()
  const [params, setParams] = useSearchParams()

  const raw = params.get('tab')
  const tab: Tab = raw === 'applications' ? 'applications' : raw === 'profile' ? 'profile' : 'posts'

  const me = useApi<MeResponse>(user ? '/api/me' : null)

  if (isLoading) {
    return (
      <div className="container page">
        <Skeleton count={2} />
      </div>
    )
  }

  if (!user) return <SignInPrompt lead={t('mustSignIn')} />

  const counts = me.data?.counts

  return (
    <div className="container page">
      <div className="section-head">
        <h1>{t('dashTitle')}</h1>
        <p className="subtle">{t('dashLead')}</p>
      </div>

      {counts ? (
        <div className="stat-grid">
          <Stat label={t('statRequests')} value={counts.open_requests} />
          <Stat label={t('statSent')} value={counts.applications_sent} />
          <Stat label={t('statReceived')} value={counts.applications_received} />
        </div>
      ) : null}

      <div className="tabs">
        {(
          [
            ['posts', t('tabRequests')],
            ['applications', t('tabApplications')],
            ['profile', t('tabProfile')],
          ] as [Tab, string][]
        ).map(([key, text]) => (
          <button
            key={key}
            type="button"
            className={tab === key ? 'tab on' : 'tab'}
            aria-current={tab === key}
            onClick={() => setParams({ tab: key })}
          >
            {text}
          </button>
        ))}
      </div>

      {tab === 'posts' ? <MyPosts /> : null}
      {tab === 'applications' ? <MyApplications /> : null}
      {tab === 'profile' ? (
        <div className="stack">
          {!me.data?.tutor_profile ? (
            <div className="notice">{t('applyNeedProfile')}</div>
          ) : null}
          <TutorProfileForm />
        </div>
      ) : null}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  const { num } = useLocale()
  return (
    <div className="stat">
      <span className="stat-value">{num(value)}</span>
      <span className="stat-label">{label}</span>
    </div>
  )
}

function MyPosts() {
  const { t, label } = useLocale()
  const { user } = useFreebuffUser()
  const { data, error, loading } = useApi<{ items: MyRequestRow[] }>(
    user ? '/api/me/requests' : null,
  )

  if (loading) return <Skeleton count={3} />
  if (error) return <ErrorBox message={t('genericError')} />

  const items = data?.items ?? []
  if (items.length === 0) {
    return (
      <EmptyState
        title={t('noRequests')}
        lead={t('noRequestsLead')}
        action={
          <Link to="/post" className="btn btn-primary">
            {t('heroCtaPost')}
          </Link>
        }
      />
    )
  }

  return (
    <div className="stack">
      {items.map(({ request, applications }) => (
        <div key={request.id} className="panel stack">
          <div className="row-between wrap">
            <div className="tags">
              {request.subjects.map((key) => (
                <Tag key={key} tone="brand">
                  {label(SUBJECTS, key)}
                </Tag>
              ))}
            </div>
            <Badge status={request.status} />
          </div>

          <p className="muted small" style={{ margin: 0 }}>
            {request.class_levels.map((key) => label(CLASS_LEVELS, key)).join(', ')} ·{' '}
            {label(MODES, request.mode)} ·{' '}
            {request.district ? label(DISTRICTS, request.district) : ''}
          </p>

          <div className="row-between wrap">
            <span className="muted small">
              {t('applicants')}: {applications.length}
            </span>
            <Link to={`/tutions/${request.id}`} className="btn btn-ghost btn-sm">
              {t('viewDetails')}
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

function MyApplications() {
  const { t } = useLocale()
  const { user } = useFreebuffUser()
  const { data, error, loading, reload } = useApi<{ items: MyApplication[] }>(
    user ? '/api/me/applications' : null,
  )

  if (loading) return <Skeleton count={3} />
  if (error) return <ErrorBox message={t('genericError')} />

  const items = data?.items ?? []
  if (items.length === 0) {
    return (
      <EmptyState
        title={t('noApplications')}
        lead={t('noApplicationsLead')}
        action={
          <Link to="/tutions" className="btn btn-primary">
            {t('heroCtaBrowse')}
          </Link>
        }
      />
    )
  }

  return (
    <div className="stack">
      {items.map((application) => (
        <ApplicationRow key={application.id} application={application} onChanged={reload} />
      ))}
    </div>
  )
}

function ApplicationRow({
  application,
  onChanged,
}: {
  application: MyApplication
  onChanged: () => void
}) {
  const { t, money, label } = useLocale()
  const request = application.request
  const phone = application.student_phone ?? ''

  return (
    <div className={application.status === 'accepted' ? 'panel stack accepted' : 'panel stack'}>
      <div className="row-between wrap">
        <div className="tags">
          {request.subjects.map((key) => (
            <Tag key={key} tone="brand">
              {label(SUBJECTS, key)}
            </Tag>
          ))}
        </div>
        <Badge status={application.status} />
      </div>

      <p className="muted small" style={{ margin: 0 }}>
        {request.class_levels.map((key) => label(CLASS_LEVELS, key)).join(', ')} ·{' '}
        {label(MODES, request.mode)} ·{' '}
        {request.area ? `${request.area}, ` : ''}
        {label(DISTRICTS, request.district)} ·{' '}
        {request.budget_amount ? `${money(request.budget_amount)}${t('perMonth')}` : t('negotiable')}
      </p>

      {application.status === 'accepted' ? (
        phone ? (
          <div className="reveal-box">
            <div className="tiny muted">{t('phoneRevealStudent')}</div>
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
          </div>
        ) : (
          <div className="locked">
            <IconLock width="16" height="16" />
            {t('phoneMissing')}
          </div>
        )
      ) : (
        <div className="locked">
          <IconLock width="16" height="16" />
          {t('phoneLockedTutor')}
        </div>
      )}

      <div className="row-between wrap">
        <Link to={`/tutions/${request.id}`} className="link small">
          {t('viewDetails')}
        </Link>
        {application.status === 'pending' || application.status === 'invited' ? (
          <WithdrawButton id={application.id} onChanged={onChanged} />
        ) : null}
      </div>
    </div>
  )
}

function WithdrawButton({ id, onChanged }: { id: string; onChanged: () => void }) {
  const { t } = useLocale()
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  return (
    <div className="stack-sm" style={{ alignItems: 'flex-end' }}>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          setFailure(null)
          api(`/api/applications/${id}/withdraw`, { method: 'POST' })
            .then(onChanged)
            .catch(() => setFailure(t('genericError')))
            .finally(() => setBusy(false))
        }}
      >
        {busy ? <span className="spinner" /> : null}
        {t('withdrawBtn')}
      </button>
      {failure ? <ErrorBox message={failure} /> : null}
    </div>
  )
}

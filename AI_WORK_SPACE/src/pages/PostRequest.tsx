import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useFreebuffUser } from '@freebuff/auth/react'

import { SignInPrompt } from '../components/Auth'
import { Field, Chips, ErrorBox, Skeleton, Notice } from '../components/ui'
import { useLocale } from '../i18n'
import { api, ApiError } from '../lib/api'
import { useApi } from '../lib/useApi'
import {
  CLASS_LEVELS,
  DAYS,
  DISTRICTS,
  MODES,
  SUBJECTS,
  TIME_SLOTS,
} from '../../shared/constants'
import type { MeResponse, PublicTutor } from '../../shared/types'

export default function PostRequest() {
  const { t, label } = useLocale()
  const { user, isLoading } = useFreebuffUser()
  const [params] = useSearchParams()
  const inviteTutor = params.get('tutor') ?? ''

  const invite = useApi<{ tutor: PublicTutor }>(
    inviteTutor ? `/api/tutors/${encodeURIComponent(inviteTutor)}` : null,
  )
  const me = useApi<MeResponse>(user ? '/api/me' : null)

  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [district, setDistrict] = useState('')
  const [area, setArea] = useState('')
  const [mode, setMode] = useState('home')
  const [budget, setBudget] = useState('')
  const [days, setDays] = useState<string[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [studentName, setStudentName] = useState('')
  const [phone, setPhone] = useState('')
  const [details, setDetails] = useState('')
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [createdId, setCreatedId] = useState<string | null>(null)

  const initialPhone = me.data?.phone ?? ''
  const effectivePhone = phone || initialPhone
  const initialName = me.data?.user.name ?? ''
  const currentName = studentName || initialName

  const toggle = (list: string[], set: (v: string[]) => void, key: string) =>
    set(list.includes(key) ? list.filter((k) => k !== key) : [...list, key])

  const subjectOptions = useMemo(
    () => SUBJECTS.map((o) => ({ key: o.key, text: label(SUBJECTS, o.key) })),
    [label],
  )
  const classOptions = useMemo(
    () => CLASS_LEVELS.map((o) => ({ key: o.key, text: label(CLASS_LEVELS, o.key) })),
    [label],
  )
  const dayOptions = useMemo(() => DAYS.map((o) => ({ key: o.key, text: label(DAYS, o.key) })), [label])
  const slotOptions = useMemo(
    () => TIME_SLOTS.map((o) => ({ key: o.key, text: label(TIME_SLOTS, o.key) })),
    [label],
  )

  if (isLoading) {
    return (
      <div className="container page">
        <Skeleton count={2} />
      </div>
    )
  }

  if (!user) return <SignInPrompt lead={t('mustSignIn')} />

  if (createdId) {
    return (
      <div className="container page">
        <div className="panel" style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.5rem' }}>{t('postSuccess')}</h1>
          <p className="subtle" style={{ marginTop: 8 }}>
            {t('postSuccessLead')}
          </p>
          <div className="row" style={{ marginTop: 20, justifyContent: 'center' }}>
            <Link to={`/tutions/${createdId}`} className="btn btn-primary">
              {t('goToRequest')}
            </Link>
            <Link to="/tutions" className="btn btn-ghost">
              {t('navBoard')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  async function submit() {
    setBusy(true)
    setFailure(null)
    try {
      const result = await api<{ id: string }>('/api/requests', {
        method: 'POST',
        body: {
          subjects,
          class_levels: classes,
          district,
          area,
          mode,
          budget_amount: budget ? Number(budget) : null,
          days,
          time_slots: slots,
          student_name: currentName,
          phone: effectivePhone,
          details,
          invite_tutor_sub: inviteTutor,
        },
      })
      setCreatedId(result.id)
    } catch (err) {
      setFailure((err as ApiError).message || t('genericError'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="container page">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="section-head">
          <h1>{t('postTitle')}</h1>
          <p className="subtle">{t('postLead')}</p>
        </div>

        {inviteTutor && invite.data ? (
          <div style={{ marginBottom: 16 }}>
            <Notice>
              {t('inviteHint')}: {invite.data.tutor.display_name}
            </Notice>
          </div>
        ) : null}

        <form
          className="panel stack"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <Field label={t('studentName')} required>
            <input
              className="input"
              maxLength={60}
              placeholder={t('studentNamePh')}
              value={currentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
          </Field>

          <Field label={t('subjects')} required>
            <Chips
              options={subjectOptions}
              selected={subjects}
              onToggle={(key) => toggle(subjects, setSubjects, key)}
            />
          </Field>

          <Field label={t('classLevels')} required>
            <Chips
              options={classOptions}
              selected={classes}
              onToggle={(key) => toggle(classes, setClasses, key)}
            />
          </Field>

          <div className="grid grid-2">
            <Field label={t('district')} required>
              <select
                className="select"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
              >
                <option value="">{t('all')}</option>
                {DISTRICTS.map((d) => (
                  <option key={d.key} value={d.key}>
                    {label(DISTRICTS, d.key)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={t('area')} hint={t('optional')}>
              <input
                className="input"
                maxLength={80}
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
            </Field>
          </div>

          <div className="grid grid-2">
            <Field label={t('mode')}>
              <select className="select" value={mode} onChange={(e) => setMode(e.target.value)}>
                {MODES.map((m) => (
                  <option key={m.key} value={m.key}>
                    {label(MODES, m.key)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`${t('budget')} (৳)`} hint={t('negotiable')}>
              <input
                className="input"
                type="number"
                inputMode="numeric"
                min={0}
                max={1000000}
                placeholder="5000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
              />
            </Field>
          </div>

          <Field label={t('days')} hint={t('optional')}>
            <Chips options={dayOptions} selected={days} onToggle={(key) => toggle(days, setDays, key)} />
          </Field>

          <Field label={t('timeSlots')} hint={t('optional')}>
            <Chips
              options={slotOptions}
              selected={slots}
              onToggle={(key) => toggle(slots, setSlots, key)}
            />
          </Field>

          <Field label={t('phone')} required hint={t('phoneHint')}>
            <input
              className="input"
              type="tel"
              inputMode="tel"
              maxLength={20}
              placeholder="01XXXXXXXXX"
              value={effectivePhone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          <Field label={t('details')} required>
            <textarea
              className="textarea"
              maxLength={2000}
              placeholder={t('detailsPh')}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </Field>

          {failure ? <ErrorBox message={failure} /> : null}

          <div className="row wrap">
            <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
              {busy ? <span className="spinner" /> : null}
              {t('submitPost')}
            </button>
            <Link to="/tutions" className="btn btn-ghost">
              {t('cancel')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

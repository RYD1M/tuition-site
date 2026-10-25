import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { Field, Chips, ErrorBox, Notice } from '../components/ui'
import { useLocale } from '../i18n'
import { api, ApiError } from '../lib/api'
import { useApi } from '../lib/useApi'
import { useFreebuffUser } from '@freebuff/auth/react'
import { CLASS_LEVELS, DAYS, DISTRICTS, MODES, SUBJECTS, TIME_SLOTS } from '../../shared/constants'
import type { MeResponse } from '../../shared/types'

/**
 * Creates or edits the signed-in tutor's public profile.
 * The server owns validation; this form mirrors its field limits.
 */
export default function TutorProfileForm({ standalone = false }: { standalone?: boolean }) {
  const { t, label } = useLocale()
  const { user } = useFreebuffUser()
  const me = useApi<MeResponse>(user ? '/api/me' : null)

  const existing = me.data?.tutor_profile ?? null

  const [headline, setHeadline] = useState('')
  const [qualification, setQualification] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [classes, setClasses] = useState<string[]>([])
  const [districts, setDistricts] = useState<string[]>([])
  const [mode, setMode] = useState('both')
  const [fee, setFee] = useState('')
  const [experience, setExperience] = useState('')
  const [days, setDays] = useState<string[]>([])
  const [slots, setSlots] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!existing) return
    setHeadline(existing.headline)
    setQualification(existing.qualification)
    setSubjects(existing.subjects)
    setClasses(existing.class_levels)
    setDistricts(existing.districts)
    setMode(existing.mode)
    setFee(existing.fee_amount !== null ? String(existing.fee_amount) : '')
    setExperience(existing.experience_years !== null ? String(existing.experience_years) : '')
    setDays(existing.available_days)
    setSlots(existing.available_time)
    setBio(existing.bio)
    setPhone(me.data?.phone ?? '')
  }, [existing, me.data?.phone])

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

  async function save() {
    setBusy(true)
    setFailure(null)
    setSaved(false)
    try {
      await api('/api/me/tutor-profile', {
        method: 'PUT',
        body: {
          headline,
          qualification,
          subjects,
          class_levels: classes,
          districts,
          mode,
          fee_amount: fee ? Number(fee) : null,
          experience_years: experience ? Number(experience) : 0,
          bio,
          available_days: days,
          available_time: slots,
          phone,
        },
      })
      setSaved(true)
      me.reload()
    } catch (err) {
      setFailure((err as ApiError).message || t('genericError'))
    } finally {
      setBusy(false)
    }
  }

  const body = (
    <form
      className="panel stack"
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      {saved ? <Notice>{t('profileSaved')}</Notice> : null}

      <Field label={t('headline')} required hint={t('headlineHint')}>
        <input
          className="input"
          maxLength={140}
          placeholder={t('headlinePh')}
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
        />
      </Field>

      <Field label={t('qualification')} hint={t('optional')}>
        <input
          className="input"
          maxLength={140}
          placeholder={t('qualificationPh')}
          value={qualification}
          onChange={(e) => setQualification(e.target.value)}
        />
      </Field>

      <Field label={t('subjects')} required hint={t('optional')}>
        <Chips
          options={subjectOptions}
          selected={subjects}
          onToggle={(key) => toggle(subjects, setSubjects, key)}
        />
      </Field>

      <Field label={t('classLevels')} hint={t('optional')}>
        <Chips
          options={classOptions}
          selected={classes}
          onToggle={(key) => toggle(classes, setClasses, key)}
        />
      </Field>

      <Field label={t('worksIn')} required hint={t('optional')}>
        <Chips
          options={DISTRICTS.map((d) => ({ key: d.key, text: label(DISTRICTS, d.key) }))}
          selected={districts}
          onToggle={(key) => toggle(districts, setDistricts, key)}
        />
      </Field>

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

        <Field label={`${t('fee')} (৳)`} hint={t('optional')}>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={1000000}
            placeholder="4000"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
          />
        </Field>
      </div>

      <Field label={t('availableDays')} hint={t('optional')}>
        <Chips options={dayOptions} selected={days} onToggle={(key) => toggle(days, setDays, key)} />
      </Field>

      <Field label={t('availableTime')} hint={t('optional')}>
        <Chips
          options={slotOptions}
          selected={slots}
          onToggle={(key) => toggle(slots, setSlots, key)}
        />
      </Field>

      <div className="grid grid-2">
        <Field label={t('experienceYears')} hint={t('optional')}>
          <input
            className="input"
            type="number"
            inputMode="numeric"
            min={0}
            max={60}
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
          />
        </Field>

        <Field label={t('phone')} hint={t('phoneHint')}>
          <input
            className="input"
            type="tel"
            inputMode="tel"
            maxLength={20}
            placeholder="01XXXXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </Field>
      </div>

      <Field label={t('bio')} hint={t('optional')}>
        <textarea
          className="textarea"
          maxLength={1200}
          placeholder={t('bioPh')}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </Field>

      {failure ? <ErrorBox message={failure} /> : null}

      <div className="row wrap">
        <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
          {busy ? <span className="spinner" /> : null}
          {t('saveProfile')}
        </button>
        <Link to="/tutors" className="btn btn-ghost">
          {t('cancel')}
        </Link>
      </div>
    </form>
  )

  if (!standalone) return body

  return (
    <div className="container page">
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="section-head">
          <h1>{t('profileTitle')}</h1>
          <p className="subtle">{t('profileLead')}</p>
        </div>
        {body}
      </div>
    </div>
  )
}

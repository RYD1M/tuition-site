import { Hono } from 'hono'
import { isSameOriginRequest } from '@freebuff/auth'
import type { FreebuffAuth, FreebuffUser } from '@freebuff/auth'

import {
  CLASS_LEVELS,
  DAYS,
  DISTRICTS,
  MODES,
  SUBJECTS,
  TIME_SLOTS,
} from '../shared/constants'
import type {
  ApplicationTutorSummary,
  ApplicationWithTutor,
  MyApplication,
} from '../shared/types'
import {
  REQUEST_COLUMNS,
  TUTOR_COLUMNS,
  aliased,
  displayName,
  ensureSchema,
  newId,
  now,
  toRequest,
  toTutor,
} from './db'
import type { Env } from './db'

const NO_STORE = 'private, no-store'
const PUBLIC_LIST = 'public, max-age=60'

const SUBJECT_KEYS = new Set(SUBJECTS.map((o) => o.key))
const CLASS_KEYS = new Set(CLASS_LEVELS.map((o) => o.key))
const DISTRICT_KEYS = new Set(DISTRICTS.map((o) => o.key))
const MODE_KEYS = new Set(MODES.map((o) => o.key))
const DAY_KEYS = new Set(DAYS.map((o) => o.key))
const TIME_KEYS = new Set(TIME_SLOTS.map((o) => o.key))

function json(data: unknown, status = 200, cache = NO_STORE): Response {
  return Response.json(data, { status, headers: { 'Cache-Control': cache } })
}

function error(message: string, status: number, code?: string): Response {
  return json({ error: message, code }, status)
}

/** Trims to one line and drops control characters. */
function line(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max)
}

/** Keeps paragraph breaks but bounds the length. */
function para(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/\r\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max)
}

function pickKeys(value: unknown, allowed: Set<string>, max: number): string[] {
  if (!Array.isArray(value)) return []
  const out: string[] = []
  for (const item of value) {
    const key = String(item)
    if (allowed.has(key) && !out.includes(key)) out.push(key)
    if (out.length >= max) break
  }
  return out
}

function intOrNull(value: unknown, min: number, max: number): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  if (!Number.isFinite(n)) return null
  return Math.min(max, Math.max(min, Math.trunc(n)))
}

function listParam(url: URL, name: string, allowed: Set<string>): string {
  const raw = url.searchParams.get(name)
  return raw && allowed.has(raw) ? raw : ''
}

function limitOffset(url: URL): [number, number] {
  const limit = Number(url.searchParams.get('limit') ?? 24)
  const offset = Number(url.searchParams.get('offset') ?? 0)
  return [
    Math.min(50, Math.max(1, Number.isFinite(limit) ? Math.trunc(limit) : 24)),
    Math.min(500, Math.max(0, Number.isFinite(offset) ? Math.trunc(offset) : 0)),
  ]
}

const PHONE_RE = /^[0-9+][0-9+\-\s()]{5,19}$/

async function requireUser(auth: FreebuffAuth, request: Request): Promise<FreebuffUser | null> {
  return auth.getUser(request)
}

/** Keeps the profile row in step with the identity provider. */
async function ensureUser(db: D1Database, user: FreebuffUser): Promise<void> {
  await db
    .prepare(
      `INSERT INTO users (sub, name, email, picture)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(sub) DO UPDATE SET
         name = excluded.name,
         email = excluded.email,
         picture = excluded.picture,
         updated_at = ?`,
    )
    .bind(user.sub, user.name ?? null, user.email ?? null, user.picture ?? null, now())
    .run()
}

interface ApplicationRowDb {
  id: string
  request_id: string
  tutor_sub: string
  message: string
  status: string
  created_at: string
  tutor_name: string | null
  tutor_email: string | null
  headline: string | null
  qualification: string | null
  subjects: string | null
  experience_years: number | null
  tutor_phone: string | null
}

function toOwnerApplication(row: ApplicationRowDb): ApplicationWithTutor {
  const tutor: ApplicationTutorSummary = {
    sub: row.tutor_sub,
    name: displayName(row.tutor_name, row.tutor_email),
    headline: row.headline ?? '',
    qualification: row.qualification ?? '',
    subjects: row.subjects ? JSON.parse(row.subjects) : [],
    experience_years: row.experience_years,
  }
  // Contact details unlock only for an accepted application.
  if (row.status === 'accepted' && row.tutor_phone) tutor.phone = row.tutor_phone
  return {
    id: row.id,
    request_id: row.request_id,
    tutor_sub: row.tutor_sub,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    tutor,
  }
}

const OWNER_APPLICATION_SQL = `
  SELECT a.id, a.request_id, a.tutor_sub, a.message, a.status, a.created_at,
         u.name AS tutor_name, u.email AS tutor_email, u.phone AS tutor_phone,
         p.headline, p.qualification, p.subjects, p.experience_years
  FROM applications a
  LEFT JOIN users u ON u.sub = a.tutor_sub
  LEFT JOIN tutor_profiles p ON p.sub = a.tutor_sub
  WHERE a.request_id = ? AND a.status != 'withdrawn'
  ORDER BY CASE a.status WHEN 'accepted' THEN 0 WHEN 'pending' THEN 1 WHEN 'invited' THEN 2 ELSE 3 END,
           a.created_at DESC`

interface MyApplicationRowDb {
  id: string
  request_id: string
  tutor_sub: string
  message: string
  status: string
  created_at: string
  r_subjects: string
  r_class_levels: string
  r_district: string
  r_area: string
  r_mode: string
  r_budget_amount: number | null
  r_days: string
  r_time_slots: string
  r_status: string
  r_details: string
  r_created_at: string
  student_name: string | null
  student_email: string | null
  student_phone: string | null
}

function toMyApplication(row: MyApplicationRowDb): MyApplication {
  const app: MyApplication = {
    id: row.id,
    request_id: row.request_id,
    tutor_sub: row.tutor_sub,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    request: {
      id: row.request_id,
      subjects: JSON.parse(row.r_subjects || '[]'),
      class_levels: JSON.parse(row.r_class_levels || '[]'),
      district: row.r_district,
      area: row.r_area,
      mode: row.r_mode,
      budget_amount: row.r_budget_amount === null ? null : Number(row.r_budget_amount),
      days: JSON.parse(row.r_days || '[]'),
      time_slots: JSON.parse(row.r_time_slots || '[]'),
      status: row.r_status,
      details: row.r_details,
      created_at: row.r_created_at,
    },
    student_name: displayName(row.student_name, row.student_email),
  }
  // The student's number unlocks only once the student accepts this application.
  if (row.status === 'accepted' && row.student_phone) app.student_phone = row.student_phone
  return app
}

export function createApp(auth: FreebuffAuth) {
  const app = new Hono<{ Bindings: Env }>()

  app.onError((err) => {
    console.error('request failed:', err.name, err.message)
    return error('সার্ভারে সমস্যা হয়েছে / Something went wrong', 500)
  })

  app.notFound(() => error('Not found', 404))

  app.use('/api/*', async (c, next) => {
    await ensureSchema(c.env.DB)
    const method = c.req.method
    if (method !== 'GET' && method !== 'HEAD') {
      if (!isSameOriginRequest(c.req.raw, c.env.APP_ORIGIN)) {
        return error('Cross-origin request refused', 403)
      }
    }
    await next()
  })

  /* ---------------------------------------------------------------- public */

  app.get('/api/health', () => json({ ok: true }, 200, PUBLIC_LIST))

  app.get('/api/requests', async (c) => {
    const url = new URL(c.req.url)
    const db = c.env.DB

    const where: string[] = ["r.status = 'open'"]
    const binds: (string | number)[] = []

    const district = listParam(url, 'district', DISTRICT_KEYS)
    if (district) {
      where.push('r.district = ?')
      binds.push(district)
    }
    const mode = listParam(url, 'mode', MODE_KEYS)
    if (mode === 'home' || mode === 'online') {
      where.push("(r.mode = ? OR r.mode = 'both')")
      binds.push(mode)
    }
    const subject = listParam(url, 'subject', SUBJECT_KEYS)
    if (subject) {
      where.push('r.subjects LIKE ?')
      binds.push(`%"${subject}"%`)
    }
    const klass = listParam(url, 'class', CLASS_KEYS)
    if (klass) {
      where.push('r.class_levels LIKE ?')
      binds.push(`%"${klass}"%`)
    }
    const search = line(url.searchParams.get('q'), 80)
    if (search) {
      const like = `%${search}%`
      where.push('(r.area LIKE ? OR r.details LIKE ? OR r.student_name LIKE ?)')
      binds.push(like, like, like)
    }

    const [limit, offset] = limitOffset(url)
    const clause = where.join(' AND ')

    const countRow = await db
      .prepare(`SELECT COUNT(*) AS total FROM tuition_requests r WHERE ${clause}`)
      .bind(...binds)
      .first<{ total: number }>()

    const rows = await db
      .prepare(
        `SELECT ${REQUEST_COLUMNS},
           (SELECT COUNT(*) FROM applications a
             WHERE a.request_id = r.id AND a.status IN ('pending','invited','accepted'))
           AS application_count
         FROM tuition_requests r
         WHERE ${clause}
         ORDER BY r.created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(...binds, limit, offset)
      .all()

    return json(
      {
        items: (rows.results as never[]).map((row) => toRequest(row as never)),
        total: Number(countRow?.total ?? 0),
        limit,
        offset,
      },
      200,
      PUBLIC_LIST,
    )
  })

  app.get('/api/requests/:id', async (c) => {
    const db = c.env.DB
    const id = c.req.param('id')

    const row = await db
      .prepare(`SELECT ${REQUEST_COLUMNS} FROM tuition_requests WHERE id = ?`)
      .bind(id)
      .first()
    if (!row) return error('টিউশন খুঁজে পাওয়া যায়নি / Request not found', 404)

    const request = toRequest(row as never)
    const user = await requireUser(auth, c.req.raw)
    const isOwner = !!user && user.sub === request.sub

    if (isOwner) {
      const appRows = await db
        .prepare(OWNER_APPLICATION_SQL)
        .bind(id)
        .all<ApplicationRowDb>()
      const applications = appResults(appRows.results).map(toOwnerApplication)
      return json({
        request,
        applications,
        application_count: applications.filter((a) => a.status !== 'rejected').length,
        viewer_is_owner: true,
      })
    }

    const countRow = await db
      .prepare(
        `SELECT COUNT(*) AS total FROM applications
         WHERE request_id = ? AND status IN ('pending','invited','accepted')`,
      )
      .bind(id)
      .first<{ total: number }>()

    return json({
      request: { ...request, application_count: Number(countRow?.total ?? 0) },
      applications: null,
      application_count: Number(countRow?.total ?? 0),
      viewer_is_owner: false,
    })
  })

  app.get('/api/tutors', async (c) => {
    const url = new URL(c.req.url)
    const db = c.env.DB

    const where: string[] = ['1 = 1']
    const binds: (string | number)[] = []

    const district = listParam(url, 'district', DISTRICT_KEYS)
    if (district) {
      where.push('p.districts LIKE ?')
      binds.push(`%"${district}"%`)
    }
    const subject = listParam(url, 'subject', SUBJECT_KEYS)
    if (subject) {
      where.push('p.subjects LIKE ?')
      binds.push(`%"${subject}"%`)
    }
    const klass = listParam(url, 'class', CLASS_KEYS)
    if (klass) {
      where.push('p.class_levels LIKE ?')
      binds.push(`%"${klass}"%`)
    }
    const mode = listParam(url, 'mode', MODE_KEYS)
    if (mode === 'home' || mode === 'online') {
      where.push("(p.mode = ? OR p.mode = 'both')")
      binds.push(mode)
    }
    const search = line(url.searchParams.get('q'), 80)
    if (search) {
      const like = `%${search}%`
      where.push('(p.headline LIKE ? OR p.bio LIKE ? OR p.qualification LIKE ?)')
      binds.push(like, like, like)
    }

    const [limit, offset] = limitOffset(url)
    const clause = where.join(' AND ')

    const countRow = await db
      .prepare(`SELECT COUNT(*) AS total FROM tutor_profiles p WHERE ${clause}`)
      .bind(...binds)
      .first<{ total: number }>()

    const rows = await db
      .prepare(
        `SELECT ${aliased(TUTOR_COLUMNS, 'p')}, u.name AS d_name, u.email AS d_email
         FROM tutor_profiles p
         LEFT JOIN users u ON u.sub = p.sub
         WHERE ${clause}
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
      )
      .bind(...binds, limit, offset)
      .all()

    const items = (rows.results as never[]).map((raw) => {
      const row = raw as Record<string, unknown> & { d_name: string | null; d_email: string | null }
      return {
        ...toTutor(row as never),
        display_name: displayName(row.d_name, row.d_email),
      }
    })

    return json({ items, total: Number(countRow?.total ?? 0), limit, offset }, 200, PUBLIC_LIST)
  })

  app.get('/api/tutors/:sub', async (c) => {
    const db = c.env.DB
    const sub = c.req.param('sub')
    const row = await db
      .prepare(
        `SELECT ${aliased(TUTOR_COLUMNS, 'p')}, u.name AS d_name, u.email AS d_email
         FROM tutor_profiles p LEFT JOIN users u ON u.sub = p.sub
         WHERE p.sub = ?`,
      )
      .bind(sub)
      .first<Record<string, unknown> & { d_name: string | null; d_email: string | null }>()
    if (!row) return error('টিউটর পাওয়া যায়নি / Tutor not found', 404)

    return json({
      tutor: {
        ...toTutor(row as never),
        display_name: displayName(row.d_name, row.d_email),
      },
    })
  })

  /* ------------------------------------------------------------------ auth */

  app.get('/api/me', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    await ensureUser(db, user)

    const u = await db
      .prepare('SELECT sub, name, email, picture, phone FROM users WHERE sub = ?')
      .bind(user.sub)
      .first<{ sub: string; name: string | null; email: string | null; picture: string | null; phone: string }>()

    const profileRow = await db
      .prepare(`SELECT ${TUTOR_COLUMNS} FROM tutor_profiles WHERE sub = ?`)
      .bind(user.sub)
      .first()

    const counts = await db
      .prepare(
        `SELECT
           (SELECT COUNT(*) FROM tuition_requests WHERE sub = ? AND status = 'open') AS open_requests,
           (SELECT COUNT(*) FROM applications WHERE tutor_sub = ?
              AND status IN ('pending','accepted')) AS applications_sent,
           (SELECT COUNT(*) FROM applications a
              JOIN tuition_requests r ON r.id = a.request_id
              WHERE r.sub = ? AND a.status IN ('pending','invited','accepted'))
             AS applications_received`,
      )
      .bind(user.sub, user.sub, user.sub)
      .first<{ open_requests: number; applications_sent: number; applications_received: number }>()

    return json({
      user: {
        sub: u?.sub ?? user.sub,
        name: u?.name ?? null,
        email: u?.email ?? null,
        picture: u?.picture ?? null,
      },
      phone: u?.phone ?? '',
      tutor_profile: profileRow ? toTutor(profileRow as never) : null,
      counts: {
        open_requests: Number(counts?.open_requests ?? 0),
        applications_sent: Number(counts?.applications_sent ?? 0),
        applications_received: Number(counts?.applications_received ?? 0),
      },
    })
  })

  app.put('/api/me/phone', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    await ensureUser(db, user)

    const body = (await c.req.json().catch(() => ({}))) as { phone?: unknown }
    const phone = line(body.phone, 20)
    if (!PHONE_RE.test(phone)) return error('সঠিক মোবাইল নম্বর দিন / Enter a valid phone number', 400)

    await db
      .prepare("UPDATE users SET phone = ?, updated_at = ? WHERE sub = ?")
      .bind(phone, now(), user.sub)
      .run()
    return json({ ok: true, phone })
  })

  app.put('/api/me/tutor-profile', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    await ensureUser(db, user)

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>

    const headline = line(body.headline, 140)
    const qualification = line(body.qualification, 140)
    const subjects = pickKeys(body.subjects, SUBJECT_KEYS, 12)
    const classLevels = pickKeys(body.class_levels, CLASS_KEYS, 8)
    const districts = pickKeys(body.districts, DISTRICT_KEYS, 12)
    const mode = MODE_KEYS.has(String(body.mode)) ? String(body.mode) : 'both'
    const feeAmount = intOrNull(body.fee_amount, 0, 1_000_000)
    const feeNote = line(body.fee_note, 60)
    const experience = intOrNull(body.experience_years, 0, 60)
    const bio = para(body.bio, 1200)
    const days = pickKeys(body.available_days, DAY_KEYS, 7)
    const times = pickKeys(body.available_time, TIME_KEYS, 4)
    const open = body.open_to_offers === false ? 0 : 1
    const phone = line(body.phone, 20)

    if (!headline) return error('একটি শিরোনাম লিখুন / Add a short headline', 400)
    if (subjects.length === 0) return error('কমপক্ষে একটি বিষয় দিন / Pick at least one subject', 400)
    if (districts.length === 0) return error('কমপক্ষে একটি জেলা দিন / Pick at least one district', 400)
    if (phone && !PHONE_RE.test(phone)) {
      return error('সঠিক মোবাইল নম্বর দিন / Enter a valid phone number', 400)
    }

    if (phone) {
      await db
        .prepare('UPDATE users SET phone = ?, updated_at = ? WHERE sub = ?')
        .bind(phone, now(), user.sub)
        .run()
    }

    await db
      .prepare(
        `INSERT INTO tutor_profiles
           (sub, headline, qualification, subjects, class_levels, districts, mode,
            fee_amount, fee_note, experience_years, bio, available_days, available_time,
            open_to_offers, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(sub) DO UPDATE SET
           headline = excluded.headline,
           qualification = excluded.qualification,
           subjects = excluded.subjects,
           class_levels = excluded.class_levels,
           districts = excluded.districts,
           mode = excluded.mode,
           fee_amount = excluded.fee_amount,
           fee_note = excluded.fee_note,
           experience_years = excluded.experience_years,
           bio = excluded.bio,
           available_days = excluded.available_days,
           available_time = excluded.available_time,
           open_to_offers = excluded.open_to_offers,
           updated_at = excluded.updated_at`,
      )
      .bind(
        user.sub,
        headline,
        qualification,
        JSON.stringify(subjects),
        JSON.stringify(classLevels),
        JSON.stringify(districts),
        mode,
        feeAmount,
        feeNote,
        experience,
        bio,
        JSON.stringify(days),
        JSON.stringify(times),
        open,
        now(),
      )
      .run()

    return json({ ok: true })
  })

  app.delete('/api/me/tutor-profile', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    await c.env.DB.prepare('DELETE FROM tutor_profiles WHERE sub = ?').bind(user.sub).run()
    return json({ ok: true })
  })

  /* -------------------------------------------------------- student side */

  app.get('/api/me/requests', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB

    const rows = await db
      .prepare(
        `SELECT ${REQUEST_COLUMNS},
           (SELECT COUNT(*) FROM applications a
             WHERE a.request_id = r.id AND a.status IN ('pending','invited','accepted'))
           AS application_count
         FROM tuition_requests r
         WHERE r.sub = ?
         ORDER BY r.created_at DESC
         LIMIT 50`,
      )
      .bind(user.sub)
      .all()

    const items = []
    for (const raw of rows.results as never[]) {
      const request = toRequest(raw as never)
      const appRows = await db
        .prepare(OWNER_APPLICATION_SQL)
        .bind(request.id)
        .all<ApplicationRowDb>()
      items.push({
        request,
        applications: appResults(appRows.results).map(toOwnerApplication),
      })
    }
    return json({ items })
  })

  app.post('/api/requests', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    await ensureUser(db, user)

    const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>

    const subjects = pickKeys(body.subjects, SUBJECT_KEYS, 10)
    const classLevels = pickKeys(body.class_levels, CLASS_KEYS, 6)
    const district = line(body.district, 60)
    const mode = MODE_KEYS.has(String(body.mode)) ? String(body.mode) : 'home'

    if (subjects.length === 0) return error('কমপক্ষে একটি বিষয় দিন / Pick at least one subject', 400)
    if (classLevels.length === 0) return error('শ্রেণি নির্বাচন করুন / Pick a class level', 400)
    if (!DISTRICT_KEYS.has(district)) return error('জেলা নির্বাচন করুন / Pick a district', 400)

    const details = para(body.details, 2000)
    if (details.length < 10) {
      return error('বিস্তারিত লিখুন (কমপক্ষে ১০ অক্ষর) / Add a little more detail', 400)
    }

    const phone = line(body.phone, 20)
    if (phone && !PHONE_RE.test(phone)) {
      return error('সঠিক মোবাইল নম্বর দিন / Enter a valid phone number', 400)
    }

    const recent = await db
      .prepare(
        `SELECT COUNT(*) AS total FROM tuition_requests
         WHERE sub = ? AND created_at > ?`,
      )
      .bind(user.sub, new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .first<{ total: number }>()
    if (Number(recent?.total ?? 0) >= 10) {
      return error('এক দিনে সর্বোচ্চ ১০টি পোস্ট করা যায় / Limit reached for today', 429, 'rate_limited')
    }

    if (phone) {
      await db
        .prepare('UPDATE users SET phone = ?, updated_at = ? WHERE sub = ?')
        .bind(phone, now(), user.sub)
        .run()
    }
    const existing = await db
      .prepare('SELECT phone FROM users WHERE sub = ?')
      .bind(user.sub)
      .first<{ phone: string }>()
    if (!existing?.phone) {
      return error(
        'যোগাযোগের জন্য মোবাইল নম্বর প্রয়োজন / A phone number is needed to receive responses',
        400,
        'phone_required',
      )
    }

    const id = newId()
    const studentName = line(body.student_name, 60) || displayName(user.name ?? null, user.email ?? null)

    await db
      .prepare(
        `INSERT INTO tuition_requests
           (id, sub, student_name, subjects, class_levels, district, area, mode,
            budget_amount, days, time_slots, start_date, details, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
      )
      .bind(
        id,
        user.sub,
        studentName,
        JSON.stringify(subjects),
        JSON.stringify(classLevels),
        district,
        line(body.area, 80),
        mode,
        intOrNull(body.budget_amount, 0, 1_000_000),
        JSON.stringify(pickKeys(body.days, DAY_KEYS, 7)),
        JSON.stringify(pickKeys(body.time_slots, TIME_KEYS, 4)),
        line(body.start_date, 20) || null,
        details,
        now(),
        now(),
      )
      .run()

    // Inviting a tutor straight from the directory creates the application too.
    const invite = line(body.invite_tutor_sub, 64)
    if (invite) {
      const tutor = await db
        .prepare('SELECT sub FROM tutor_profiles WHERE sub = ?')
        .bind(invite)
        .first()
      if (tutor && invite !== user.sub) {
        await db
          .prepare(
            `INSERT INTO applications (id, request_id, tutor_sub, message, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'invited', ?, ?)
             ON CONFLICT(request_id, tutor_sub) DO NOTHING`,
          )
          .bind(newId(), id, invite, 'আপনাকে এই টিউশনের জন্য আমন্ত্রণ জানানো হয়েছে', now(), now())
          .run()
      }
    }

    return json({ ok: true, id }, 201)
  })

  app.patch('/api/requests/:id', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    const id = c.req.param('id')
    const body = (await c.req.json().catch(() => ({}))) as { status?: unknown }
    const status = String(body.status ?? '')
    if (!['open', 'filled', 'closed'].includes(status)) {
      return error('অবৈধ অবস্থা / Invalid status', 400)
    }
    const owner = await db
      .prepare('SELECT sub FROM tuition_requests WHERE id = ?')
      .bind(id)
      .first<{ sub: string }>()
    if (!owner) return error('পাওয়া যায়নি / Not found', 404)
    if (owner.sub !== user.sub) return error('অনুমতি নেই / Not allowed', 403)

    await db
      .prepare('UPDATE tuition_requests SET status = ?, updated_at = ? WHERE id = ?')
      .bind(status, now(), id)
      .run()
    return json({ ok: true, status })
  })

  app.delete('/api/requests/:id', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    const id = c.req.param('id')
    const owner = await db
      .prepare('SELECT sub FROM tuition_requests WHERE id = ?')
      .bind(id)
      .first<{ sub: string }>()
    if (!owner) return error('পাওয়া যায়নি / Not found', 404)
    if (owner.sub !== user.sub) return error('অনুমতি নেই / Not allowed', 403)

    await db.batch([
      db.prepare('DELETE FROM applications WHERE request_id = ?').bind(id),
      db.prepare('DELETE FROM tuition_requests WHERE id = ?').bind(id),
    ])
    return json({ ok: true })
  })

  /* ---------------------------------------------------------- tutor side */

  app.get('/api/me/applications', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB

    const rows = await db
      .prepare(
        `SELECT a.id, a.request_id, a.tutor_sub, a.message, a.status, a.created_at,
                r.subjects AS r_subjects, r.class_levels AS r_class_levels,
                r.district AS r_district, r.area AS r_area, r.mode AS r_mode,
                r.budget_amount AS r_budget_amount, r.days AS r_days,
                r.time_slots AS r_time_slots, r.status AS r_status,
                r.details AS r_details, r.created_at AS r_created_at,
                u.name AS student_name, u.email AS student_email,
                u.phone AS student_phone
         FROM applications a
         JOIN tuition_requests r ON r.id = a.request_id
         LEFT JOIN users u ON u.sub = r.sub
         WHERE a.tutor_sub = ?
         ORDER BY a.created_at DESC
         LIMIT 50`,
      )
      .bind(user.sub)
      .all<MyApplicationRowDb>()

    return json({ items: rows.results.map(toMyApplication) })
  })

  app.post('/api/requests/:id/apply', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    const id = c.req.param('id')

    const profile = await db
      .prepare('SELECT sub FROM tutor_profiles WHERE sub = ?')
      .bind(user.sub)
      .first()
    if (!profile) {
      return error('আগে টিউটর প্রোফাইল তৈরি করুন / Create your tutor profile first', 400, 'no_profile')
    }

    const request = await db
      .prepare('SELECT id, sub, status FROM tuition_requests WHERE id = ?')
      .bind(id)
      .first<{ id: string; sub: string; status: string }>()
    if (!request) return error('পাওয়া যায়নি / Not found', 404)
    if (request.sub === user.sub) {
      return error('নিজের পোস্টে আবেদন করা যায় না / You cannot apply to your own post', 403)
    }
    if (request.status !== 'open') {
      return error('এই টিউশনটি ইতিমধ্যে পূরণ হয়েছে / This post is no longer open', 409, 'closed')
    }

    const message = para(bodyMessage(c), 600)
    const result = await db
      .prepare(
        `INSERT INTO applications (id, request_id, tutor_sub, message, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'pending', ?, ?)
         ON CONFLICT(request_id, tutor_sub) DO UPDATE SET
           status = 'pending',
           message = excluded.message,
           updated_at = excluded.updated_at
         WHERE applications.status IN ('withdrawn', 'rejected')`,
      )
      .bind(newId(), id, user.sub, message, now(), now())
      .run()

    if (result.meta.changes === 0) {
      const existing = await db
        .prepare('SELECT status FROM applications WHERE request_id = ? AND tutor_sub = ?')
        .bind(id, user.sub)
        .first<{ status: string }>()
      return error(
        `আপনার আবেদনের অবস্থা: ${existing?.status ?? 'pending'} / Already applied`,
        409,
        'already_applied',
      )
    }
    return json({ ok: true }, 201)
  })

  app.post('/api/requests/:id/invite', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    const id = c.req.param('id')
    const body = (await c.req.json().catch(() => ({}))) as { tutor_sub?: unknown }
    const tutorSub = line(body.tutor_sub, 64)
    if (!tutorSub) return error('টিউটর নির্বাচন করুন / Pick a tutor', 400)

    const request = await db
      .prepare('SELECT id, sub, status FROM tuition_requests WHERE id = ?')
      .bind(id)
      .first<{ id: string; sub: string; status: string }>()
    if (!request) return error('পাওয়া যায়নি / Not found', 404)
    if (request.sub !== user.sub) return error('অনুমতি নেই / Not allowed', 403)
    if (tutorSub === user.sub) return error('নিজেকে আমন্ত্রণ জানানো যায় না / Cannot invite yourself', 400)

    const tutor = await db
      .prepare('SELECT sub FROM tutor_profiles WHERE sub = ?')
      .bind(tutorSub)
      .first()
    if (!tutor) return error('টিউটর পাওয়া যায়নি / Tutor not found', 404)

    await db
      .prepare(
        `INSERT INTO applications (id, request_id, tutor_sub, message, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'invited', ?, ?)
         ON CONFLICT(request_id, tutor_sub) DO NOTHING`,
      )
      .bind(newId(), id, tutorSub, 'আপনাকে এই টিউশনের জন্য আমন্ত্রণ জানানো হয়েছে', now(), now())
      .run()

    return json({ ok: true }, 201)
  })

  app.post('/api/applications/:id/accept', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    const id = c.req.param('id')

    const app = await db
      .prepare('SELECT id, request_id, status FROM applications WHERE id = ?')
      .bind(id)
      .first<{ id: string; request_id: string; status: string }>()
    if (!app) return error('পাওয়া যায়নি / Not found', 404)

    const request = await db
      .prepare('SELECT id, sub, status FROM tuition_requests WHERE id = ?')
      .bind(app.request_id)
      .first<{ id: string; sub: string; status: string }>()
    if (!request) return error('পাওয়া যায়নি / Not found', 404)
    if (request.sub !== user.sub) return error('অনুমতি নেই / Not allowed', 403)
    if (app.status !== 'pending' && app.status !== 'invited') {
      return error('এই আবেদনের অবস্থা বদলানো যায় না / This application can no longer change', 409)
    }

    // One accepted tutor closes the post; the rest are told it is taken.
    await db.batch([
      db
        .prepare("UPDATE applications SET status = 'accepted', updated_at = ? WHERE id = ?")
        .bind(now(), id),
      db
        .prepare(
          `UPDATE applications SET status = 'rejected', updated_at = ?
           WHERE request_id = ? AND id != ? AND status IN ('pending', 'invited')`,
        )
        .bind(now(), app.request_id, id),
      db
        .prepare("UPDATE tuition_requests SET status = 'filled', updated_at = ? WHERE id = ?")
        .bind(now(), app.request_id),
    ])

    return json({ ok: true, status: 'accepted' })
  })

  app.post('/api/applications/:id/reject', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    const id = c.req.param('id')

    const app = await db
      .prepare('SELECT id, request_id, status FROM applications WHERE id = ?')
      .bind(id)
      .first<{ id: string; request_id: string; status: string }>()
    if (!app) return error('পাওয়া যায়নি / Not found', 404)

    const request = await db
      .prepare('SELECT id, sub FROM tuition_requests WHERE id = ?')
      .bind(app.request_id)
      .first<{ id: string; sub: string }>()
    if (!request || request.sub !== user.sub) return error('অনুমতি নেই / Not allowed', 403)

    await db
      .prepare("UPDATE applications SET status = 'rejected', updated_at = ? WHERE id = ?")
      .bind(now(), id)
      .run()
    return json({ ok: true, status: 'rejected' })
  })

  app.post('/api/applications/:id/withdraw', async (c) => {
    const user = await requireUser(auth, c.req.raw)
    if (!user) return error('সাইন ইন করুন / Sign in required', 401)
    const db = c.env.DB
    const id = c.req.param('id')

    const app = await db
      .prepare('SELECT id, tutor_sub, status FROM applications WHERE id = ?')
      .bind(id)
      .first<{ id: string; tutor_sub: string; status: string }>()
    if (!app) return error('পাওয়া যায়নি / Not found', 404)
    if (app.tutor_sub !== user.sub) return error('অনুমতি নেই / Not allowed', 403)

    await db
      .prepare("UPDATE applications SET status = 'withdrawn', updated_at = ? WHERE id = ?")
      .bind(now(), id)
      .run()
    return json({ ok: true, status: 'withdrawn' })
  })

  return app
}

function bodyMessage(c: { req: { json: () => Promise<unknown> } }): unknown {
  return c.req
    .json()
    .then((body) => (body as { message?: unknown }).message ?? '')
    .catch(() => '')
}

function appResults(results: unknown): ApplicationRowDb[] {
  return (results ?? []) as ApplicationRowDb[]
}

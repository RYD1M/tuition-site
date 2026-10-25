import { STATEMENTS } from './schema'
import type { TutorProfile, TuitionRequest } from '../shared/types'

export interface Env {
  DB: D1Database
  ASSETS: { fetch(request: Request): Promise<Response> }
  FREEBUFF_CLIENT_ID: string
  FREEBUFF_ISSUER?: string
  APP_ORIGIN: string
}

let schemaReady: Promise<void> | null = null

/** Applies the schema once per isolate, and retries if a first attempt fails. */
export function ensureSchema(db: D1Database): Promise<void> {
  if (!schemaReady) {
    schemaReady = db
      .batch(STATEMENTS.map((sql) => db.prepare(sql)))
      .then(() => undefined)
      .catch((err: unknown) => {
        schemaReady = null
        throw err
      })
  }
  return schemaReady
}

export function now(): string {
  return new Date().toISOString()
}

export function newId(): string {
  return crypto.randomUUID()
}

export function parseArray(value: unknown): string[] {
  if (typeof value !== 'string' || value.length === 0) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed.map((item) => String(item)).slice(0, 40)
  } catch {
    return []
  }
}

export function parseNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : null
}

interface RequestRow {
  id: string
  sub: string
  student_name: string
  subjects: string
  class_levels: string
  district: string
  area: string
  mode: string
  budget_amount: number | null
  days: string
  time_slots: string
  start_date: string | null
  details: string
  status: string
  created_at: string
  application_count?: number
}

export function toRequest(row: RequestRow): TuitionRequest {
  return {
    id: row.id,
    sub: row.sub,
    student_name: row.student_name,
    subjects: parseArray(row.subjects),
    class_levels: parseArray(row.class_levels),
    district: row.district,
    area: row.area,
    mode: row.mode,
    budget_amount: parseNumberOrNull(row.budget_amount),
    days: parseArray(row.days),
    time_slots: parseArray(row.time_slots),
    start_date: row.start_date,
    details: row.details,
    status: row.status,
    created_at: row.created_at,
    application_count: Number(row.application_count ?? 0),
  }
}

interface TutorRow {
  sub: string
  headline: string
  qualification: string
  subjects: string
  class_levels: string
  districts: string
  mode: string
  fee_amount: number | null
  fee_note: string
  experience_years: number | null
  bio: string
  available_days: string
  available_time: string
  open_to_offers: number
  created_at: string
}

export function toTutor(row: TutorRow): TutorProfile {
  return {
    sub: row.sub,
    headline: row.headline,
    qualification: row.qualification,
    subjects: parseArray(row.subjects),
    class_levels: parseArray(row.class_levels),
    districts: parseArray(row.districts),
    mode: row.mode,
    fee_amount: parseNumberOrNull(row.fee_amount),
    fee_note: row.fee_note,
    experience_years: parseNumberOrNull(row.experience_years),
    bio: row.bio,
    available_days: parseArray(row.available_days),
    available_time: parseArray(row.available_time),
    open_to_offers: Number(row.open_to_offers) === 1,
    created_at: row.created_at,
  }
}

/** Titles a person may have never set, so the list never shows a blank row. */
export function displayName(name: string | null, email: string | null): string {
  if (name && name.trim()) return name.trim()
  if (email && email.trim()) return email.trim().split('@')[0]
  return 'ব্যবহারকারী'
}

export const REQUEST_COLUMNS = `id, sub, student_name, subjects, class_levels, district, area, mode,
  budget_amount, days, time_slots, start_date, details, status, created_at`

export const TUTOR_COLUMNS = `sub, headline, qualification, subjects, class_levels, districts, mode,
  fee_amount, fee_note, experience_years, bio, available_days, available_time, open_to_offers, created_at`

/** Prefixes a column list with a table alias, for queries that join users. */
export function aliased(columns: string, alias: string): string {
  return columns
    .split(',')
    .map((column) => `${alias}.${column.trim()}`)
    .join(', ')
}

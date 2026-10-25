/**
 * Schema is applied through controlled server-side code on first use,
 * so there is no manual SQL step for preview or production.
 */

export const STATEMENTS: string[] = [
  `CREATE TABLE IF NOT EXISTS users (
    sub TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    picture TEXT,
    phone TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`,

  `CREATE TABLE IF NOT EXISTS tutor_profiles (
    sub TEXT PRIMARY KEY,
    headline TEXT NOT NULL DEFAULT '',
    qualification TEXT NOT NULL DEFAULT '',
    subjects TEXT NOT NULL DEFAULT '[]',
    class_levels TEXT NOT NULL DEFAULT '[]',
    districts TEXT NOT NULL DEFAULT '[]',
    mode TEXT NOT NULL DEFAULT 'both',
    fee_amount INTEGER,
    fee_note TEXT NOT NULL DEFAULT '',
    experience_years INTEGER,
    bio TEXT NOT NULL DEFAULT '',
    available_days TEXT NOT NULL DEFAULT '[]',
    available_time TEXT NOT NULL DEFAULT '[]',
    phone TEXT NOT NULL DEFAULT '',
    open_to_offers INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`,

  `CREATE TABLE IF NOT EXISTS tuition_requests (
    id TEXT PRIMARY KEY,
    sub TEXT NOT NULL,
    student_name TEXT NOT NULL DEFAULT '',
    subjects TEXT NOT NULL DEFAULT '[]',
    class_levels TEXT NOT NULL DEFAULT '[]',
    district TEXT NOT NULL,
    area TEXT NOT NULL DEFAULT '',
    mode TEXT NOT NULL DEFAULT 'home',
    budget_amount INTEGER,
    days TEXT NOT NULL DEFAULT '[]',
    time_slots TEXT NOT NULL DEFAULT '[]',
    start_date TEXT,
    details TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
  )`,

  `CREATE TABLE IF NOT EXISTS applications (
    id TEXT PRIMARY KEY,
    request_id TEXT NOT NULL,
    tutor_sub TEXT NOT NULL,
    message TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
    UNIQUE (request_id, tutor_sub)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_requests_feed ON tuition_requests (status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_requests_owner ON tuition_requests (sub, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS idx_requests_district ON tuition_requests (district)`,
  `CREATE INDEX IF NOT EXISTS idx_applications_tutor ON applications (tutor_sub, status)`,
  `CREATE INDEX IF NOT EXISTS idx_applications_request ON applications (request_id, status)`,
]

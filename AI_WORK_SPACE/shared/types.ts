/** Row shapes shared by the Worker and the browser. */

export interface PublicUser {
  sub: string
  name: string | null
  email: string | null
  picture: string | null
}

export interface TutorProfile {
  sub: string
  headline: string
  qualification: string
  subjects: string[]
  class_levels: string[]
  districts: string[]
  mode: string
  fee_amount: number | null
  fee_note: string
  experience_years: number | null
  bio: string
  available_days: string[]
  available_time: string[]
  open_to_offers: boolean
  created_at: string
}

/** What the tutor directory shows. Phone numbers never appear here. */
export interface PublicTutor extends TutorProfile {
  display_name: string
}

export interface TuitionRequest {
  id: string
  sub: string
  student_name: string
  subjects: string[]
  class_levels: string[]
  district: string
  area: string
  mode: string
  budget_amount: number | null
  days: string[]
  time_slots: string[]
  start_date: string | null
  details: string
  status: string
  created_at: string
  application_count: number
}

export interface ApplicationTutorSummary {
  sub: string
  name: string
  headline: string
  qualification: string
  subjects: string[]
  experience_years: number | null
  /** Only present once this application has been accepted by the student. */
  phone?: string
}

export interface ApplicationRow {
  id: string
  request_id: string
  tutor_sub: string
  message: string
  status: string
  created_at: string
}

/** Application as the student (the request owner) sees it. */
export interface ApplicationWithTutor extends ApplicationRow {
  tutor: ApplicationTutorSummary
}

/** Application as the tutor sees it, with the student's contact after acceptance. */
export interface MyApplication extends ApplicationRow {
  request: {
    id: string
    subjects: string[]
    class_levels: string[]
    district: string
    area: string
    mode: string
    budget_amount: number | null
    days: string[]
    time_slots: string[]
    status: string
    details: string
    created_at: string
  }
  student_name: string
  /** Only present once this application has been accepted. */
  student_phone?: string
}

export interface MeResponse {
  user: PublicUser
  phone: string
  tutor_profile: TutorProfile | null
  counts: {
    open_requests: number
    applications_sent: number
    applications_received: number
  }
}

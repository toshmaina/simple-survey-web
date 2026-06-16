// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string
  type: string
  username: string
  email: string
  role: string
}

export interface AuthUser {
  token: string
  username: string
  email: string
  role: string
}

// ── Survey ────────────────────────────────────────────────────────────────────
export interface Survey {
  id: number
  name: string
  description: string
}

// ── Question ──────────────────────────────────────────────────────────────────
export type QuestionType =
  | 'short_text'
  | 'long_text'
  | 'email'
  | 'choice'
  | 'file'

export interface QuestionOption {
  value: string
  label: string
}

export interface FileProperties {
  format: string
  maxFileSize: number
  maxFileSizeUnit: string
  multiple: boolean
}

export interface Question {
  id: number
  name: string
  type: QuestionType
  required: boolean
  text: string
  description?: string
  options?: {
    multiple: boolean
    items: QuestionOption[]
  }
  fileProperties?: FileProperties
}

// ── Response ──────────────────────────────────────────────────────────────────
export interface Certificate {
  id: number
  filename: string
}

export interface SurveyResponse {
  responseId: number
  fullName?: string
  emailAddress?: string
  [key: string]: unknown
  certificates?: Certificate[]
  dateResponded: string
}

export interface PaginatedResponses {
  currentPage: number
  lastPage: number
  pageSize: number
  totalCount: number
  items: SurveyResponse[]
}

// ── API ───────────────────────────────────────────────────────────────────────
export interface ApiError {
  message: string
  status?: number
}

import client from './client'
import { parseXml } from './xml'
import type { PaginatedResponses, SurveyResponse, Certificate } from '../types/survey'

type RawCert = { '@_id': string; '#text': string }
type RawResponse = {
  response_id: string | number
  full_name?: string
  email_address?: string
  date_responded?: string
  certificates?: { certificate: RawCert[] }
  [key: string]: unknown
}

function mapResponse(r: RawResponse): SurveyResponse {
  const certs: Certificate[] = (r.certificates?.certificate ?? []).map((c: RawCert) => ({
    id: Number(c['@_id']),
    filename: String(c['#text'] ?? '').trim(),
  }))

  const base: SurveyResponse = {
    responseId: Number(r.response_id),
    fullName: r.full_name,
    emailAddress: r.email_address,
    dateResponded: String(r.date_responded ?? ''),
    certificates: certs,
  }

  // Copy dynamic fields (any field not already mapped)
  const skip = new Set(['response_id', 'full_name', 'email_address', 'date_responded', 'certificates'])
  for (const [k, v] of Object.entries(r)) {
    if (!skip.has(k)) base[k] = v
  }

  return base
}

export async function getResponses(
  surveyId: number,
  page: number,
  pageSize: number,
  email?: string,
): Promise<PaginatedResponses> {
  const params: Record<string, string | number> = { page, pageSize }
  if (email) params.email = email

  const res = await client.get<string>(`/api/surveys/${surveyId}/responses`, {
    params,
    responseType: 'text',
  })

  const parsed = parseXml<{
    question_responses: {
      '@_current_page': string
      '@_last_page': string
      '@_page_size': string
      '@_total_count': string
      question_response: RawResponse[]
    }
  }>(res.data)

  const root = parsed.question_responses
  return {
    currentPage: Number(root['@_current_page']),
    lastPage: Number(root['@_last_page']),
    pageSize: Number(root['@_page_size']),
    totalCount: Number(root['@_total_count']),
    items: (root.question_response ?? []).map(mapResponse),
  }
}

export async function downloadCertificate(certId: number, filename: string): Promise<void> {
  const res = await client.get(`/api/certificates/${certId}`, {
    responseType: 'blob',
  })
  const url = URL.createObjectURL(res.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

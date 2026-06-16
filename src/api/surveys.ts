import client from './client'
import { parseXml, buildSurveyXml } from './xml'
import type { Survey } from '../types/survey'

function parseSurveys(xml: string): Survey[] {
  const parsed = parseXml<{ surveys: { survey: Array<{ '@_id': string; name: string; description: string }> } }>(xml)
  const list = parsed?.surveys?.survey ?? []
  return list.map((s) => ({
    id: Number(s['@_id']),
    name: s.name,
    description: s.description,
  }))
}

function parseSurvey(xml: string): Survey {
  const parsed = parseXml<{ survey: { '@_id': string; name: string; description: string } }>(xml)
  const s = parsed.survey
  return { id: Number(s['@_id']), name: s.name, description: s.description }
}

export async function getSurveys(): Promise<Survey[]> {
  const res = await client.get<string>('/api/surveys', { responseType: 'text' })
  return parseSurveys(res.data)
}

export async function getSurvey(id: number): Promise<Survey> {
  const res = await client.get<string>(`/api/surveys/${id}`, { responseType: 'text' })
  return parseSurvey(res.data)
}

export async function createSurvey(data: { name: string; description: string }): Promise<Survey> {
  const res = await client.post<string>('/api/surveys', buildSurveyXml(data), { responseType: 'text' })
  return parseSurvey(res.data)
}

export async function updateSurvey(id: number, data: { name: string; description: string }): Promise<Survey> {
  const res = await client.put<string>(`/api/surveys/${id}`, buildSurveyXml(data), { responseType: 'text' })
  return parseSurvey(res.data)
}

export async function deleteSurvey(id: number): Promise<void> {
  await client.delete(`/api/surveys/${id}`)
}

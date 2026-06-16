import client from './client'
import { parseXml, buildQuestionXml } from './xml'
import type { Question, QuestionOption } from '../types/survey'

type RawOption = { '@_value': string; '#text': string }
type RawQuestion = {
  '@_id'?: string
  '@_name': string
  '@_type': string
  '@_required': string
  text: string
  description?: string
  options?: {
    '@_multiple': string
    option: RawOption[]
  }
  file_properties?: {
    '@_format': string
    '@_max_file_size': string
    '@_max_file_size_unit': string
    '@_multiple': string
  }
}

function mapQuestion(q: RawQuestion): Question {
  const opts = q.options
    ? {
        multiple: q.options['@_multiple'] === 'yes',
        items: (q.options.option ?? []).map((o: RawOption): QuestionOption => ({
          value: o['@_value'],
          label: String(o['#text'] ?? ''),
        })),
      }
    : undefined

  const fp = q.file_properties
    ? {
        format: q.file_properties['@_format'],
        maxFileSize: Number(q.file_properties['@_max_file_size']),
        maxFileSizeUnit: q.file_properties['@_max_file_size_unit'],
        multiple: q.file_properties['@_multiple'] === 'yes',
      }
    : undefined

  return {
    id: Number(q['@_id'] ?? 0),
    name: q['@_name'],
    type: q['@_type'] as Question['type'],
    required: q['@_required'] === 'yes',
    text: q.text,
    description: q.description,
    options: opts,
    fileProperties: fp,
  }
}

export async function getQuestions(surveyId: number): Promise<Question[]> {
  const res = await client.get<string>(`/api/surveys/${surveyId}/questions`, { responseType: 'text' })
  const parsed = parseXml<{ questions: { question: RawQuestion[] } }>(res.data)
  return (parsed?.questions?.question ?? []).map(mapQuestion)
}

export async function createQuestion(
  surveyId: number,
  q: Omit<Parameters<typeof buildQuestionXml>[0], never>,
): Promise<Question> {
  const xml = buildQuestionXml(q)
  const res = await client.post<string>(`/api/surveys/${surveyId}/questions`, xml, { responseType: 'text' })
  const parsed = parseXml<{ question: RawQuestion }>(res.data)
  return mapQuestion(parsed.question)
}

export async function updateQuestion(
  surveyId: number,
  questionId: number,
  q: Parameters<typeof buildQuestionXml>[0],
): Promise<Question> {
  const xml = buildQuestionXml(q)
  const res = await client.put<string>(`/api/surveys/${surveyId}/questions/${questionId}`, xml, {
    responseType: 'text',
  })
  const parsed = parseXml<{ question: RawQuestion }>(res.data)
  return mapQuestion(parsed.question)
}

export async function deleteQuestion(surveyId: number, questionId: number): Promise<void> {
  await client.delete(`/api/surveys/${surveyId}/questions/${questionId}`)
}

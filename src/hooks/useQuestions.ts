import { useState, useCallback } from 'react'
import * as api from '../api/questions'
import type { Question } from '../types/survey'

export function useQuestions(surveyId: number) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchQuestions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setQuestions(await api.getQuestions(surveyId))
    } catch {
      setError('Failed to load questions.')
    } finally {
      setLoading(false)
    }
  }, [surveyId])

  const createQuestion = useCallback(
    async (q: Parameters<typeof api.createQuestion>[1]) => {
      const created = await api.createQuestion(surveyId, q)
      setQuestions((prev) => [...prev, created])
      return created
    },
    [surveyId],
  )

  const updateQuestion = useCallback(
    async (questionId: number, q: Parameters<typeof api.updateQuestion>[2]) => {
      const updated = await api.updateQuestion(surveyId, questionId, q)
      setQuestions((prev) => prev.map((x) => (x.id === questionId ? updated : x)))
      return updated
    },
    [surveyId],
  )

  const deleteQuestion = useCallback(
    async (questionId: number) => {
      await api.deleteQuestion(surveyId, questionId)
      setQuestions((prev) => prev.filter((x) => x.id !== questionId))
    },
    [surveyId],
  )

  return { questions, loading, error, fetchQuestions, createQuestion, updateQuestion, deleteQuestion }
}

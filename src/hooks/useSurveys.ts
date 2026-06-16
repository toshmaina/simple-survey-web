import { useState, useCallback } from 'react'
import * as api from '../api/surveys'
import type { Survey } from '../types/survey'

export function useSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      setSurveys(await api.getSurveys())
    } catch {
      setError('Failed to load surveys.')
    } finally {
      setLoading(false)
    }
  }, [])

  const createSurvey = useCallback(async (data: { name: string; description: string }) => {
    const s = await api.createSurvey(data)
    setSurveys((prev) => [...prev, s])
    return s
  }, [])

  const updateSurvey = useCallback(async (id: number, data: { name: string; description: string }) => {
    const s = await api.updateSurvey(id, data)
    setSurveys((prev) => prev.map((x) => (x.id === id ? s : x)))
    return s
  }, [])

  const deleteSurvey = useCallback(async (id: number) => {
    await api.deleteSurvey(id)
    setSurveys((prev) => prev.filter((x) => x.id !== id))
  }, [])

  return { surveys, loading, error, fetchSurveys, createSurvey, updateSurvey, deleteSurvey }
}

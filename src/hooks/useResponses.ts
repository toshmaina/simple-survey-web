import { useState, useCallback } from 'react'
import * as api from '../api/responses'
import type { PaginatedResponses } from '../types/survey'

export function useResponses(surveyId: number) {
  const [data, setData] = useState<PaginatedResponses | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchResponses = useCallback(
    async (page: number, pageSize: number, email?: string) => {
      setLoading(true)
      setError(null)
      try {
        setData(await api.getResponses(surveyId, page, pageSize, email))
      } catch {
        setError('Failed to load responses.')
      } finally {
        setLoading(false)
      }
    },
    [surveyId],
  )

  const downloadCertificate = useCallback(api.downloadCertificate, [])

  return { data, loading, error, fetchResponses, downloadCertificate }
}

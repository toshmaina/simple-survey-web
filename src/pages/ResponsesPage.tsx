import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useResponses } from '../hooks/useResponses'
import { getSurvey } from '../api/surveys'
import type { SurveyResponse, Certificate } from '../types/survey'
import { Button, Input, EmptyState, ErrorMessage, Spinner, Badge } from '../components/ui'

export function ResponsesPage() {
  const { surveyId } = useParams<{ surveyId: string }>()
  const id = Number(surveyId)
  const navigate = useNavigate()

  const [surveyName, setSurveyName] = useState('')
  const [emailFilter, setEmailFilter] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 10

  const { data, loading, error, fetchResponses, downloadCertificate } = useResponses(id)
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  const load = useCallback(
    (p: number, email?: string) => {
      fetchResponses(p, PAGE_SIZE, email || undefined)
    },
    [fetchResponses],
  )

  useEffect(() => {
    getSurvey(id).then((s) => setSurveyName(s.name)).catch(() => {})
    load(1)
  }, [id, load])

  const handleSearch = () => {
    setEmailFilter(emailInput.trim())
    setPage(1)
    load(1, emailInput.trim())
  }

  const handleClearSearch = () => {
    setEmailInput('')
    setEmailFilter('')
    setPage(1)
    load(1)
  }

  const handlePage = (p: number) => {
    setPage(p)
    load(p, emailFilter)
  }

  const handleDownload = async (cert: Certificate) => {
    setDownloadingId(cert.id)
    try {
      await downloadCertificate(cert.id, cert.filename)
    } finally {
      setDownloadingId(null)
    }
  }

  const responses = data?.items ?? []

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/surveys')}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors mb-6"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Surveys
      </button>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-ink">Responses</h1>
          <p className="text-sm text-muted mt-0.5">{surveyName}</p>
        </div>
        {data && (
          <span className="text-sm text-muted bg-surface px-3 py-1.5 rounded-lg border border-border">
            {data.totalCount} total response{data.totalCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-2 mb-6">
        <Input
          placeholder="Filter by email address…"
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          className="max-w-sm"
        />
        <Button variant="secondary" onClick={handleSearch}>
          Search
        </Button>
        {emailFilter && (
          <Button variant="ghost" onClick={handleClearSearch}>
            Clear
          </Button>
        )}
      </div>

      {emailFilter && (
        <p className="text-sm text-muted mb-4">
          Showing results for <span className="font-medium text-ink">{emailFilter}</span>
        </p>
      )}

      {/* Content */}
      {loading && (
        <div className="flex justify-center py-20">
          <Spinner size={28} />
        </div>
      )}

      {!loading && error && <ErrorMessage message={error} onRetry={() => load(page, emailFilter)} />}

      {!loading && !error && responses.length === 0 && (
        <EmptyState
          title={emailFilter ? 'No responses match that email' : 'No responses yet'}
          description={emailFilter ? 'Try a different email address.' : 'Responses will appear here once users submit the survey.'}
        />
      )}

      {!loading && !error && responses.length > 0 && (
        <div className="flex flex-col gap-4">
          {responses.map((r) => (
            <ResponseCard
              key={r.responseId}
              response={r}
              onDownload={handleDownload}
              downloadingId={downloadingId}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.lastPage > 1 && (
        <div className="flex items-center justify-between mt-8">
          <p className="text-sm text-muted">
            Page {data.currentPage} of {data.lastPage}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={data.currentPage <= 1}
              onClick={() => handlePage(page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: data.lastPage }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                size="sm"
                variant={p === page ? 'primary' : 'ghost'}
                onClick={() => handlePage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="secondary"
              size="sm"
              disabled={data.currentPage >= data.lastPage}
              onClick={() => handlePage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Response card ─────────────────────────────────────────────────────────────
function ResponseCard({
  response,
  onDownload,
  downloadingId,
}: {
  response: SurveyResponse
  onDownload: (cert: Certificate) => void
  downloadingId: number | null
}) {
  const [expanded, setExpanded] = useState(false)

  // Fields to render as top-level chips
  const skipKeys = new Set(['responseId', 'fullName', 'emailAddress', 'dateResponded', 'certificates'])
  const extraFields = Object.entries(response).filter(
    ([k, v]) => !skipKeys.has(k) && v !== undefined && v !== null,
  )

  const formattedDate = response.dateResponded
    ? new Date(response.dateResponded.replace(' ', 'T')).toLocaleString()
    : ''

  return (
    <div className="border border-border rounded-xl bg-white overflow-hidden">
      {/* Summary row */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-4 p-5 text-left hover:bg-surface transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <p className="font-medium text-ink text-sm">
              {response.fullName ?? `Response #${response.responseId}`}
            </p>
            {response.emailAddress && (
              <span className="text-xs text-muted font-mono">{String(response.emailAddress)}</span>
            )}
          </div>
          {formattedDate && <p className="text-xs text-muted mt-0.5">{formattedDate}</p>}
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`flex-shrink-0 mt-0.5 transition-transform ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 flex flex-col gap-4">
          {/* Dynamic fields */}
          {extraFields.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {extraFields.map(([key, val]) => (
                <div key={key}>
                  <p className="text-xs font-medium text-muted uppercase tracking-wide mb-0.5">
                    {key.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm text-ink">{String(val)}</p>
                </div>
              ))}
            </div>
          )}

          {/* Certificates */}
          {response.certificates && response.certificates.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
                Certificates
              </p>
              <div className="flex flex-col gap-2">
                {response.certificates.map((cert) => (
                  <div
                    key={cert.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border bg-surface"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#DC2626"
                        strokeWidth="1.75"
                        className="flex-shrink-0"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="text-sm text-ink truncate">{cert.filename}</span>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => onDownload(cert)}
                      loading={downloadingId === cert.id}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

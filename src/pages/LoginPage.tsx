import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button, Input } from '../components/ui'

export function LoginPage() {
  const { signIn, loading, error, user } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  useEffect(() => {
    if (user) navigate('/surveys', { replace: true })
  }, [user, navigate])

  const validate = () => {
    const errs: typeof fieldErrors = {}
    if (!email.trim()) errs.email = 'Email is required.'
    else if (!/^\S+@\S+\.\S+$/.test(email)) errs.email = 'Enter a valid email address.'
    if (!password) errs.password = 'Password is required.'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    try {
      await signIn(email, password)
      navigate('/surveys', { replace: true })
    } catch {
      // error is shown via context
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-[420px] bg-surface flex-col justify-between p-12 border-r border-border flex-shrink-0">
        <div>
          <span className="text-sm font-semibold text-ink tracking-tight">Sky World Limited</span>
        </div>
        <div>
          <p className="text-2xl font-semibold text-ink leading-snug">
            Manage surveys,<br />review responses,<br />stay in control.
          </p>
          <p className="text-sm text-muted mt-4 leading-relaxed">
            The admin portal for creating dynamic surveys and tracking candidate applications.
          </p>
        </div>
        <p className="text-xs text-muted">© {new Date().getFullYear()} Sky World Limited</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-xl font-semibold text-ink">Sign in to your account</h1>
            <p className="text-sm text-muted mt-1">Admin access only.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              placeholder="you@skyworld.com"
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              placeholder="••••••••"
            />

            {error && (
              <p className="text-sm text-danger bg-danger-light rounded-lg px-3 py-2">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full justify-center mt-2">
              Sign in
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

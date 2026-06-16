import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { Layout } from './components/layout/Layout'
import { LoginPage } from './pages/LoginPage'
import { SurveysPage } from './pages/SurveysPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { ResponsesPage } from './pages/ResponsesPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Layout>{children}</Layout>
}

function PublicOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  if (user) return <Navigate to="/surveys" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnly>
            <LoginPage />
          </PublicOnly>
        }
      />
      <Route
        path="/surveys"
        element={
          <RequireAuth>
            <SurveysPage />
          </RequireAuth>
        }
      />
      <Route
        path="/surveys/:surveyId/questions"
        element={
          <RequireAuth>
            <QuestionsPage />
          </RequireAuth>
        }
      />
      <Route
        path="/surveys/:surveyId/responses"
        element={
          <RequireAuth>
            <ResponsesPage />
          </RequireAuth>
        }
      />
      <Route path="/" element={<Navigate to="/surveys" replace />} />
      <Route path="*" element={<Navigate to="/surveys" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}

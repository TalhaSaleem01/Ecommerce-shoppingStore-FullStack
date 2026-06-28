import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <PageSpinner />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function PageSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0', color: 'var(--color-text-muted)' }}>
      Loading...
    </div>
  )
}

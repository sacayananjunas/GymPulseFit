import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PageSkeleton } from './Skeleton'
import ErrorState from './ErrorState'

export default function ProtectedRoute({ children }) {
  const { user, loading, error, refresh } = useAuth()
  const location = useLocation()

  if (loading && !user) return <PageSkeleton />
  if (!user && error) return <ErrorState error={error} onRetry={refresh} />
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

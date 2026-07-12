import { LoaderCircle } from 'lucide-react'
import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function ProtectedRoute({ children }) {
  const { user, isRestoring } = useAuth()
  const location = useLocation()

  if (isRestoring) {
    return (
      <div className="page-loader" role="status">
        <LoaderCircle className="page-loader__icon" aria-hidden="true" size={28} />
        <span>Restaurando sesión</span>
      </div>
    )
  }

  if (!user) return <Navigate replace state={{ from: location }} to="/login" />
  return children
}

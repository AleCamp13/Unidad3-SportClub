import { Navigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'

export default function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth()

  if (!user) return <Navigate replace to="/login" />
  if (!allowedRoles.includes(user.role)) return <Navigate replace to="/unauthorized" />
  return children
}

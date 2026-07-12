import { LoaderCircle } from 'lucide-react'
import { Navigate, Route, Routes } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import PublicLayout from '../layouts/PublicLayout'
import { AdminLayout, CoachLayout, CurrentRoleLayout, UserLayout } from '../layouts/RoleLayouts'
import LoginPage from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'
import AdminRoomsPage from '../pages/admin/AdminRoomsPage'
import AdminSportsPage from '../pages/admin/AdminSportsPage'
import AdminUsersPage from '../pages/admin/AdminUsersPage'
import RoleDashboardPage from '../pages/dashboard/RoleDashboardPage'
import ProfilePage from '../pages/profile/ProfilePage'
import NotFoundPage from '../pages/system/NotFoundPage'
import UnauthorizedPage from '../pages/system/UnauthorizedPage'
import ProtectedRoute from '../routes/ProtectedRoute'
import RoleRoute from '../routes/RoleRoute'
import { getRoleDashboard } from '../routes/rolePaths'

function SessionLoader() {
  return (
    <div className="page-loader" role="status">
      <LoaderCircle className="page-loader__icon" aria-hidden="true" size={28} />
      <span>Restaurando sesión</span>
    </div>
  )
}

function RootRedirect() {
  const { user, isRestoring } = useAuth()
  if (isRestoring) return <SessionLoader />
  return <Navigate replace to={user ? getRoleDashboard(user.role) : '/login'} />
}

function PublicRoute({ children }) {
  const { user, isRestoring } = useAuth()
  if (isRestoring) return <SessionLoader />
  if (user) return <Navigate replace to={getRoleDashboard(user.role)} />
  return children
}

function ProtectedRoleLayout({ role, layout }) {
  return (
    <ProtectedRoute>
      <RoleRoute allowedRoles={[role]}>{layout}</RoleRoute>
    </ProtectedRoute>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />

      <Route element={<PublicRoute><PublicLayout /></PublicRoute>}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoleLayout layout={<AdminLayout />} role="admin" />}>
        <Route path="/admin/dashboard" element={<RoleDashboardPage role="admin" />} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/sports" element={<AdminSportsPage />} />
        <Route path="/admin/rooms" element={<AdminRoomsPage />} />
      </Route>
      <Route element={<ProtectedRoleLayout layout={<CoachLayout />} role="coach" />}>
        <Route path="/coach/dashboard" element={<RoleDashboardPage role="coach" />} />
      </Route>
      <Route element={<ProtectedRoleLayout layout={<UserLayout />} role="user" />}>
        <Route path="/user/dashboard" element={<RoleDashboardPage role="user" />} />
      </Route>

      <Route element={<ProtectedRoute><CurrentRoleLayout /></ProtectedRoute>}>
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

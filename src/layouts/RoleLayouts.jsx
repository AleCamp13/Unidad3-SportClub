import { Building2, Dumbbell, LayoutDashboard, UserRound, UsersRound } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import useAuth from '../hooks/useAuth'
import { getRoleDashboard } from '../routes/rolePaths'

const ROLE_CONFIG = {
  admin: { shellRole: 'admin', label: 'Administración' },
  coach: { shellRole: 'coach', label: 'Entrenamiento' },
  user: { shellRole: 'member', label: 'Membresía' },
}

const ADMIN_NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Usuarios', icon: UsersRound },
  { to: '/admin/sports', label: 'Deportes', icon: Dumbbell },
  { to: '/admin/rooms', label: 'Salas', icon: Building2 },
]

function RoleLayout({ role }) {
  const { user, logout } = useAuth()
  const config = ROLE_CONFIG[role]
  const navItems = [
    ...(role === 'admin' ? ADMIN_NAV_ITEMS : [{ to: getRoleDashboard(role), label: 'Panel', icon: LayoutDashboard }]),
    { to: '/profile', label: 'Mi perfil', icon: UserRound },
  ]

  return <AppShell navItems={navItems} onLogout={logout} role={config.shellRole} roleLabel={config.label} user={user} />
}

export function AdminLayout() { return <RoleLayout role="admin" /> }
export function CoachLayout() { return <RoleLayout role="coach" /> }
export function UserLayout() { return <RoleLayout role="user" /> }

export function CurrentRoleLayout() {
  const { user } = useAuth()
  return <RoleLayout role={user.role} />
}

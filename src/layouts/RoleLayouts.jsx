import { Building2, CalendarCheck2, CalendarClock, Dumbbell, LayoutDashboard, Link2, UserRound, UsersRound } from 'lucide-react'
import AppShell from '../components/layout/AppShell'
import useAuth from '../hooks/useAuth'

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
  { to: '/admin/assignments', label: 'Asignaciones', icon: Link2 },
  { to: '/admin/schedules', label: 'Horarios', icon: CalendarClock },
]

const COACH_NAV_ITEMS = [
  { to: '/coach/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/coach/classes', label: 'Mis clases', icon: Dumbbell },
  { to: '/coach/schedules', label: 'Mi horario', icon: CalendarClock },
  { to: '/coach/rooms', label: 'Mis salas', icon: Building2 },
]

const USER_NAV_ITEMS = [
  { to: '/user/dashboard', label: 'Panel', icon: LayoutDashboard },
  { to: '/user/classes', label: 'Clases', icon: Dumbbell },
  { to: '/user/reservations', label: 'Mis reservas', icon: CalendarCheck2 },
]

function RoleLayout({ role }) {
  const { user, logout } = useAuth()
  const config = ROLE_CONFIG[role]
  const roleItems = role === 'admin' ? ADMIN_NAV_ITEMS : role === 'coach' ? COACH_NAV_ITEMS : USER_NAV_ITEMS
  const navItems = [
    ...roleItems,
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

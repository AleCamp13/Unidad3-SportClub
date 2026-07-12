import { Home, LogIn } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

const DEFAULT_NAV_ITEMS = [
  { to: '/', label: 'Inicio', icon: Home },
]

export default function AppShell({ role = 'guest', roleLabel = 'Acceso general', navItems = DEFAULT_NAV_ITEMS }) {
  return (
    <div className="app-shell" data-role={role}>
      <header className="app-header">
        <NavLink className="brand" to="/" aria-label="SportClub, ir al inicio">
          <img src="/assets/img/logo.png" alt="SportClub" />
        </NavLink>
        <div className="role-lane" aria-label={`Perfil: ${roleLabel}`}>
          <span className="role-lane__marker" aria-hidden="true" />
          <span>{roleLabel}</span>
        </div>
        <button className="header-action" type="button" aria-label="Iniciar sesión" disabled>
          <LogIn aria-hidden="true" size={20} />
          <span>Ingresar</span>
        </button>
      </header>

      <div className="court-line" aria-hidden="true" />

      <aside className="app-sidebar">
        <nav aria-label="Navegación principal">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              className={({ isActive }) => `nav-item${isActive ? ' nav-item--active' : ''}`}
              end={to === '/'}
              key={to}
              to={to}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={2} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <p className="app-sidebar__meta">Gestión deportiva</p>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}

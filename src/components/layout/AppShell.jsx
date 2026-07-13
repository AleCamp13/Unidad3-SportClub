import { LogOut, UserRound } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'

export default function AppShell({ role, roleLabel, navItems, user, onLogout }) {
  return (
    <div className="app-shell" data-role={role}>
      <a className="skip-link" href="#main-content">Saltar al contenido principal</a>
      <header className="app-header">
        <NavLink className="brand" to="/" aria-label="SportClub Pro, ir al inicio">
          <img src="/assets/img/logo.png" alt="SportClub" />
          <span aria-hidden="true" className="brand__edition">Pro</span>
        </NavLink>
        <div className="role-lane" aria-label={`Cuenta activa: ${user.full_name}, perfil ${roleLabel}`}>
          <span className="role-lane__marker" aria-hidden="true" />
          <span className="role-lane__label">{roleLabel}</span>
          <strong className="role-lane__user">{user.full_name}</strong>
        </div>
        <div className="header-actions">
          <NavLink aria-label="Abrir mi perfil" className="header-icon-button" title="Mi perfil" to="/profile">
            <UserRound aria-hidden="true" size={20} />
          </NavLink>
          <button aria-label="Cerrar sesión" className="header-icon-button" onClick={onLogout} title="Cerrar sesión" type="button">
            <LogOut aria-hidden="true" size={20} />
          </button>
        </div>
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
        <div className="app-sidebar__meta">
          <strong>SportClub Pro</strong>
          <span>Gestion deportiva</span>
        </div>
      </aside>

      <main className="app-main" id="main-content" tabIndex="-1">
        <Outlet />
      </main>
    </div>
  )
}

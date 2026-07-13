import { Outlet, useLocation } from 'react-router-dom'

export default function PublicLayout() {
  const location = useLocation()
  const isRegister = location.pathname === '/register'

  return (
    <div className={`public-shell${isRegister ? ' public-shell--register' : ''}`}>
      <header className="public-header">
        <div className="public-brand">
          <img src="/assets/img/logo.png" alt="SportClub" />
          <span aria-hidden="true">Pro</span>
        </div>
        <p>Gestion deportiva conectada</p>
      </header>
      <div className="court-line" aria-hidden="true" />
      <main className="public-main"><Outlet /></main>
      <p className="public-caption">Entrena con informacion real. Decide con claridad.</p>
    </div>
  )
}

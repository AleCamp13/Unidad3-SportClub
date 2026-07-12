import { Outlet } from 'react-router-dom'

export default function PublicLayout() {
  return (
    <div className="public-shell">
      <header className="public-header">
        <img src="/assets/img/logo.png" alt="SportClub" />
      </header>
      <div className="court-line" aria-hidden="true" />
      <main className="public-main"><Outlet /></main>
    </div>
  )
}

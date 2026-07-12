import { Link, Route, Routes } from 'react-router-dom'
import { CalendarDays, Clock3 } from 'lucide-react'
import AppShell from '../components/layout/AppShell'

function HomePage() {
  return (
    <div className="workspace">
      <div className="page-heading">
        <div>
          <p className="page-context">Vista general</p>
          <h1>Centro de operaciones</h1>
        </div>
        <span className="workspace-status">Sistema disponible</span>
      </div>

      <section className="operations-band" aria-labelledby="activity-title">
        <div className="operations-band__heading">
          <CalendarDays aria-hidden="true" size={22} />
          <div>
            <h2 id="activity-title">Actividad del club</h2>
            <p>La jornada se mostrará al iniciar sesión.</p>
          </div>
        </div>
        <div className="operations-band__empty">
          <Clock3 aria-hidden="true" size={24} />
          <span>Sin actividad disponible</span>
        </div>
      </section>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="workspace not-found">
      <p className="not-found__code">404</p>
      <h1>Página no encontrada</h1>
      <p>La dirección ingresada no corresponde a una sección disponible.</p>
      <Link className="btn btn-primary" to="/">Volver al inicio</Link>
    </div>
  )
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}

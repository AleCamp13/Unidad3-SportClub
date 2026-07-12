import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <main className="standalone-system-page">
      <div className="system-state">
        <img src="/assets/img/logo.png" alt="SportClub" />
        <p className="not-found__code">404</p>
        <h1>Página no encontrada</h1>
        <p>La dirección ingresada no corresponde a una sección disponible.</p>
        <Link className="btn btn-primary" to="/">Volver al inicio</Link>
      </div>
    </main>
  )
}

import { ArrowRight, CircleUserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const CONTENT = {
  admin: { context: 'Administración', title: 'Panel de administración', description: 'Accede desde la navegación a las herramientas habilitadas para gestionar el club.' },
  coach: { context: 'Entrenamiento', title: 'Panel de entrenador', description: 'Tu espacio reúne el acceso a la operación asignada a entrenadores.' },
  user: { context: 'Membresía', title: 'Panel de usuario', description: 'Tu espacio reúne el acceso a las actividades disponibles para miembros.' },
}

export default function RoleDashboardPage({ role }) {
  const { user } = useAuth()
  const content = CONTENT[role]

  return (
    <div className="workspace">
      <div className="page-heading">
        <div><p className="page-context">{content.context}</p><h1>{content.title}</h1></div>
        <span className="workspace-status">Sesión activa</span>
      </div>
      <section className="dashboard-welcome" aria-labelledby="welcome-title">
        <CircleUserRound aria-hidden="true" size={30} />
        <div><h2 id="welcome-title">Bienvenido, {user.full_name}</h2><p>{content.description}</p></div>
        <Link className="dashboard-welcome__link" to="/profile">Revisar perfil <ArrowRight aria-hidden="true" size={18} /></Link>
      </section>
    </div>
  )
}

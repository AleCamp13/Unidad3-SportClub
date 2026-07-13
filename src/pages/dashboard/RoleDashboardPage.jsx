import { ArrowRight, Building2, CalendarClock, CalendarPlus2, CircleUserRound, Dumbbell, Link2, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'

const CONTENT = {
  admin: { context: 'Administración', title: 'Panel de administración', description: 'Accede desde la navegación a las herramientas habilitadas para gestionar el club.' },
  coach: { context: 'Entrenamiento', title: 'Panel de entrenador', description: 'Tu espacio reúne el acceso a la operación asignada a entrenadores.' },
  user: { context: 'Membresía', title: 'Panel de usuario', description: 'Tu espacio reúne el acceso a las actividades disponibles para miembros.' },
}

const ADMIN_ACTIONS = [
  { to: '/admin/classes/new', label: 'Crear clase', description: 'Vincula recursos y programa el horario', icon: CalendarPlus2 },
  { to: '/admin/users', label: 'Gestionar usuarios', description: 'Cuentas, roles y datos de acceso', icon: UsersRound },
  { to: '/admin/sports', label: 'Gestionar deportes', description: 'Oferta, duracion y objetivos', icon: Dumbbell },
  { to: '/admin/rooms', label: 'Gestionar salas', description: 'Capacidad, ubicacion y estado', icon: Building2 },
  { to: '/admin/assignments', label: 'Vincular recursos', description: 'Deporte, sala y entrenador', icon: Link2 },
  { to: '/admin/schedules', label: 'Organizar horarios', description: 'Dias, horas y asignaciones', icon: CalendarClock },
]

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
      {role === 'admin' && (
        <section className="dashboard-actions" aria-labelledby="dashboard-actions-title">
          <div className="section-heading">
            <h2 id="dashboard-actions-title">Operacion del club</h2>
            <p>Accesos directos a las tareas administrativas principales.</p>
          </div>
          <div className="dashboard-actions__list">
            {ADMIN_ACTIONS.map(({ to, label, description, icon: Icon }) => (
              <Link aria-label={label} key={to} to={to}>
                <Icon aria-hidden="true" size={20} />
                <span><strong>{label}</strong><small>{description}</small></span>
                <ArrowRight aria-hidden="true" size={18} />
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

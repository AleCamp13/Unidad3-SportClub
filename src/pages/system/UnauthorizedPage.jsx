import { ShieldX } from 'lucide-react'
import { Link } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getRoleDashboard } from '../../routes/rolePaths'

export default function UnauthorizedPage() {
  const { user } = useAuth()
  return (
    <div className="workspace system-state">
      <ShieldX aria-hidden="true" size={34} />
      <p className="not-found__code">403</p>
      <h1>Acceso no autorizado</h1>
      <p>Tu perfil no tiene permisos para ingresar a esta sección.</p>
      <Link className="btn btn-primary" to={getRoleDashboard(user.role)}>Volver a mi panel</Link>
    </div>
  )
}

import { Badge } from 'react-bootstrap'

export default function StatusBadge({ active, activeLabel = 'Activo', inactiveLabel = 'Inactivo' }) {
  return (
    <Badge bg={active ? 'success' : 'secondary'} className="status-badge">
      {active ? activeLabel : inactiveLabel}
    </Badge>
  )
}

import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react'
import { Button, Spinner } from 'react-bootstrap'

export function LoadingState({ label = 'Cargando información' }) {
  return (
    <div className="feedback-state" role="status" aria-live="polite">
      <Spinner animation="border" size="sm" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

export function EmptyState({
  title = 'No hay información disponible',
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="feedback-state feedback-state--stacked">
      <Inbox aria-hidden="true" size={28} />
      <strong>{title}</strong>
      {description && <p>{description}</p>}
      {actionLabel && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </div>
  )
}

export function ErrorState({ message = 'Ocurrió un error inesperado.', onRetry }) {
  return (
    <div className="feedback-state feedback-state--error" role="alert">
      <AlertCircle aria-hidden="true" size={24} />
      <div>
        <strong>No fue posible completar la operación</strong>
        <p>{message}</p>
      </div>
      {onRetry && <Button variant="outline-danger" onClick={onRetry}>Reintentar</Button>}
    </div>
  )
}

export function PageLoader({ label = 'Preparando SportClub' }) {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <LoaderCircle className="page-loader__icon" aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}

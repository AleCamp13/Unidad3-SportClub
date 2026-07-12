import { Button } from 'react-bootstrap'

export default function AdminPageHeader({ actionLabel, context, description, icon: Icon, onAction, title }) {
  return (
    <div className="page-heading entity-page-heading">
      <div>
        <p className="page-context">{context}</p>
        <h1>{title}</h1>
        <p className="page-description">{description}</p>
      </div>
      <Button className="icon-text-button" onClick={onAction}>
        <Icon aria-hidden="true" size={18} /> {actionLabel}
      </Button>
    </div>
  )
}

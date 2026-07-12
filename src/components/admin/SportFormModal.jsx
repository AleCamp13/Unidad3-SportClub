import { useEffect, useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { validateAdminSport } from '../../utils/adminValidation'
import { fieldErrorProps, normalizeFieldErrors } from '../../utils/formErrors'

const EMPTY_FORM = { name: '', objective: '', duration: 60, status: true }

function formFromSport(sport) {
  return sport ? {
    name: sport.name || '',
    objective: sport.objective || '',
    duration: sport.duration ?? 60,
    status: sport.status !== false,
  } : { ...EMPTY_FORM }
}

export default function SportFormModal({ initialValue = null, onHide, onSubmit, show }) {
  const editing = Boolean(initialValue)
  const [form, setForm] = useState(() => formFromSport(initialValue))
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!show) return
    setForm(formFromSport(initialValue))
    setErrors({})
    setRequestError('')
  }, [initialValue, show])

  const updateField = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAdminSport(form)
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid) return

    setIsSaving(true)
    try {
      await onSubmit(result.data)
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.message || 'No fue posible guardar el deporte.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal animation={false} centered onHide={isSaving ? undefined : onHide} show={show}>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>{editing ? 'Editar deporte' : 'Nuevo deporte'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {requestError && <Alert variant="danger">{requestError}</Alert>}
          <Form.Group className="mb-3" controlId="admin-sport-name">
            <Form.Label>Nombre del deporte</Form.Label>
            <Form.Control {...fieldErrorProps(errors.name, 'admin-sport-name-error')} autoFocus isInvalid={Boolean(errors.name)} name="name" onChange={updateField} required value={form.name} />
            <Form.Control.Feedback id="admin-sport-name-error" type="invalid">{errors.name}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="admin-sport-objective">
            <Form.Label>Objetivo</Form.Label>
            <Form.Control {...fieldErrorProps(errors.objective, 'admin-sport-objective-error')} as="textarea" isInvalid={Boolean(errors.objective)} name="objective" onChange={updateField} required rows={3} value={form.objective} />
            <Form.Control.Feedback id="admin-sport-objective-error" type="invalid">{errors.objective}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="admin-sport-duration">
            <Form.Label>Duración en minutos</Form.Label>
            <Form.Control {...fieldErrorProps(errors.duration, 'admin-sport-duration-error')} isInvalid={Boolean(errors.duration)} min="1" name="duration" onChange={updateField} required type="number" value={form.duration} />
            <Form.Control.Feedback id="admin-sport-duration-error" type="invalid">{errors.duration}</Form.Control.Feedback>
          </Form.Group>
          <Form.Check checked={form.status} id="admin-sport-status" label="Activo" name="status" onChange={updateField} type="switch" />
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSaving} onClick={onHide} type="button" variant="outline-secondary">Cancelar</Button>
          <Button disabled={isSaving} type="submit">
            {isSaving && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {editing ? 'Guardar cambios' : 'Guardar deporte'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

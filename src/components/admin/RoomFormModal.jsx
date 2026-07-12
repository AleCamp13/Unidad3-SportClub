import { useEffect, useState } from 'react'
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { validateAdminRoom } from '../../utils/adminValidation'
import { fieldErrorProps, normalizeFieldErrors } from '../../utils/formErrors'

const EMPTY_FORM = {
  name: '', description: '', capacity: 1, location: '', image_url: '', observation: '', status: true,
}

function formFromRoom(room) {
  return room ? {
    name: room.name || '',
    description: room.description || '',
    capacity: room.capacity ?? 1,
    location: room.location || '',
    image_url: room.image_url || '',
    observation: room.observation || '',
    status: room.status !== false,
  } : { ...EMPTY_FORM }
}

export default function RoomFormModal({ initialValue = null, onHide, onSubmit, show }) {
  const editing = Boolean(initialValue)
  const [form, setForm] = useState(() => formFromRoom(initialValue))
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!show) return
    setForm(formFromRoom(initialValue))
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
    const result = validateAdminRoom(form)
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid) return

    setIsSaving(true)
    try {
      await onSubmit(result.data)
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.message || 'No fue posible guardar la sala.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal animation={false} centered onHide={isSaving ? undefined : onHide} show={show} size="lg">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>{editing ? 'Editar sala' : 'Nueva sala'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {requestError && <Alert variant="danger">{requestError}</Alert>}
          <Row>
            <Col md={8}>
              <Form.Group className="mb-3" controlId="admin-room-name">
                <Form.Label>Nombre de la sala</Form.Label>
                <Form.Control {...fieldErrorProps(errors.name, 'admin-room-name-error')} autoFocus isInvalid={Boolean(errors.name)} name="name" onChange={updateField} required value={form.name} />
                <Form.Control.Feedback id="admin-room-name-error" type="invalid">{errors.name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="admin-room-capacity">
                <Form.Label>Capacidad</Form.Label>
                <Form.Control {...fieldErrorProps(errors.capacity, 'admin-room-capacity-error')} isInvalid={Boolean(errors.capacity)} min="1" name="capacity" onChange={updateField} required type="number" value={form.capacity} />
                <Form.Control.Feedback id="admin-room-capacity-error" type="invalid">{errors.capacity}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="admin-room-description">
            <Form.Label>Descripción</Form.Label>
            <Form.Control {...fieldErrorProps(errors.description, 'admin-room-description-error')} as="textarea" isInvalid={Boolean(errors.description)} name="description" onChange={updateField} required rows={3} value={form.description} />
            <Form.Control.Feedback id="admin-room-description-error" type="invalid">{errors.description}</Form.Control.Feedback>
          </Form.Group>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-room-location">
                <Form.Label>Ubicación</Form.Label>
                <Form.Control {...fieldErrorProps(errors.location, 'admin-room-location-error')} isInvalid={Boolean(errors.location)} name="location" onChange={updateField} value={form.location} />
                <Form.Control.Feedback id="admin-room-location-error" type="invalid">{errors.location}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-room-image-url">
                <Form.Label>URL de imagen</Form.Label>
                <Form.Control {...fieldErrorProps(errors.image_url, 'admin-room-image-url-error')} isInvalid={Boolean(errors.image_url)} name="image_url" onChange={updateField} type="url" value={form.image_url} />
                <Form.Control.Feedback id="admin-room-image-url-error" type="invalid">{errors.image_url}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="admin-room-observation">
            <Form.Label>Observación</Form.Label>
            <Form.Control {...fieldErrorProps(errors.observation, 'admin-room-observation-error')} as="textarea" isInvalid={Boolean(errors.observation)} name="observation" onChange={updateField} rows={2} value={form.observation} />
            <Form.Control.Feedback id="admin-room-observation-error" type="invalid">{errors.observation}</Form.Control.Feedback>
          </Form.Group>
          <Form.Check checked={form.status} id="admin-room-status" label="Activa" name="status" onChange={updateField} type="switch" />
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSaving} onClick={onHide} type="button" variant="outline-secondary">Cancelar</Button>
          <Button disabled={isSaving} type="submit">
            {isSaving && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {editing ? 'Guardar cambios' : 'Guardar sala'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

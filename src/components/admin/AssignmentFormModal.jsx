import { useEffect, useState } from 'react'
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { validateAssignment } from '../../utils/schedulingValidation'
import { normalizeFieldErrors } from '../../utils/formErrors'

const EMPTY_FORM = { sport_id: '', room_id: '', coach_id: '', observation: '', status: true }

function formFromAssignment(assignment) {
  return assignment ? {
    sport_id: String(assignment.sport_id ?? ''),
    room_id: String(assignment.room_id ?? ''),
    coach_id: String(assignment.coach_id ?? ''),
    observation: assignment.observation || '',
    status: assignment.status !== false,
  } : { ...EMPTY_FORM }
}

function optionIsDisabled(item, selectedId) {
  return item.status === false && String(item.id) !== String(selectedId)
}

export default function AssignmentFormModal({
  coaches, initialValue = null, onHide, onSubmit, rooms, show, sports,
}) {
  const editing = Boolean(initialValue)
  const [form, setForm] = useState(() => formFromAssignment(initialValue))
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const hasRequiredReferences = sports.some((sport) => sport.status !== false)
    && rooms.some((room) => room.status !== false)
    && coaches.length > 0

  useEffect(() => {
    if (!show) return
    setForm(formFromAssignment(initialValue))
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
    const result = validateAssignment(form)
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid || (!editing && !hasRequiredReferences)) return

    setIsSaving(true)
    try {
      await onSubmit(result.data)
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.message || 'No fue posible guardar la asignación.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal animation={false} centered onHide={isSaving ? undefined : onHide} show={show} size="lg">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>{editing ? 'Editar asignación' : 'Nueva asignación'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!editing && !hasRequiredReferences && (
            <Alert variant="warning">Para continuar, crea al menos un deporte, una sala y un entrenador disponibles.</Alert>
          )}
          {requestError && <Alert variant="danger">{requestError}</Alert>}
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="assignment-sport">
                <Form.Label>Deporte</Form.Label>
                <Form.Select autoFocus isInvalid={Boolean(errors.sport_id)} name="sport_id" onChange={updateField} value={form.sport_id}>
                  <option value="">Seleccionar</option>
                  {sports.map((sport) => <option disabled={optionIsDisabled(sport, form.sport_id)} key={sport.id} value={sport.id}>{sport.name}{sport.status === false ? ' (inactivo)' : ''}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.sport_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="assignment-room">
                <Form.Label>Sala</Form.Label>
                <Form.Select isInvalid={Boolean(errors.room_id)} name="room_id" onChange={updateField} value={form.room_id}>
                  <option value="">Seleccionar</option>
                  {rooms.map((room) => <option disabled={optionIsDisabled(room, form.room_id)} key={room.id} value={room.id}>{room.name}{room.status === false ? ' (inactiva)' : ''}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.room_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="assignment-coach">
                <Form.Label>Entrenador</Form.Label>
                <Form.Select isInvalid={Boolean(errors.coach_id)} name="coach_id" onChange={updateField} value={form.coach_id}>
                  <option value="">Seleccionar</option>
                  {coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.full_name}</option>)}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.coach_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-3" controlId="assignment-observation">
            <Form.Label>Observación</Form.Label>
            <Form.Control as="textarea" isInvalid={Boolean(errors.observation)} name="observation" onChange={updateField} rows={3} value={form.observation} />
            <Form.Control.Feedback type="invalid">{errors.observation}</Form.Control.Feedback>
          </Form.Group>
          <Form.Check checked={form.status} id="assignment-status" label="Asignación activa" name="status" onChange={updateField} type="switch" />
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSaving} onClick={onHide} type="button" variant="outline-secondary">Cancelar</Button>
          <Button disabled={isSaving || (!editing && !hasRequiredReferences)} type="submit">
            {isSaving && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {editing ? 'Guardar cambios' : 'Guardar asignación'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

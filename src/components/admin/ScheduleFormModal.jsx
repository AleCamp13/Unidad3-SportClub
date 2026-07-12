import { useEffect, useState } from 'react'
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { validateSchedule } from '../../utils/schedulingValidation'
import { fieldErrorProps, normalizeFieldErrors } from '../../utils/formErrors'

const DAYS = [
  [1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'],
  [5, 'Viernes'], [6, 'Sábado'], [7, 'Domingo'],
]
const EMPTY_FORM = { sport_room_id: '', day_of_week: '', start_time: '', end_time: '', status: true }

function formFromSchedule(schedule) {
  return schedule ? {
    sport_room_id: String(schedule.sport_room_id ?? ''),
    day_of_week: String(schedule.day_of_week ?? ''),
    start_time: String(schedule.start_time || '').slice(0, 5),
    end_time: String(schedule.end_time || '').slice(0, 5),
    status: schedule.status !== false,
  } : { ...EMPTY_FORM }
}

function assignmentLabel(assignment) {
  const sport = assignment.sport?.name || 'Deporte no disponible'
  const room = assignment.room?.name || 'Sala no disponible'
  const coach = assignment.coach?.full_name || 'Entrenador no disponible'
  return `${sport} · ${room} · ${coach}`
}

export default function ScheduleFormModal({ assignments, initialValue = null, onHide, onSubmit, show }) {
  const editing = Boolean(initialValue)
  const [form, setForm] = useState(() => formFromSchedule(initialValue))
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const hasActiveAssignment = assignments.some((assignment) => assignment.status !== false)

  useEffect(() => {
    if (!show) return
    setForm(formFromSchedule(initialValue))
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
    const result = validateSchedule(form)
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid || (!editing && !hasActiveAssignment)) return

    setIsSaving(true)
    try {
      await onSubmit(result.data)
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.message || 'No fue posible guardar el horario.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal animation={false} centered onHide={isSaving ? undefined : onHide} show={show} size="lg">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>{editing ? 'Editar horario' : 'Nuevo horario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!editing && !hasActiveAssignment && <Alert variant="warning">Crea y activa una asignación antes de programar horarios.</Alert>}
          {requestError && <Alert variant="danger">{requestError}</Alert>}
          <Form.Group className="mb-3" controlId="schedule-assignment">
            <Form.Label>Asignación</Form.Label>
            <Form.Select {...fieldErrorProps(errors.sport_room_id, 'schedule-assignment-error')} autoFocus isInvalid={Boolean(errors.sport_room_id)} name="sport_room_id" onChange={updateField} required value={form.sport_room_id}>
              <option value="">Seleccionar deporte, sala y entrenador</option>
              {assignments.map((assignment) => {
                const disabled = assignment.status === false && String(assignment.id) !== form.sport_room_id
                return <option disabled={disabled} key={assignment.id} value={assignment.id}>{assignmentLabel(assignment)}{assignment.status === false ? ' (inactiva)' : ''}</option>
              })}
            </Form.Select>
            <Form.Control.Feedback id="schedule-assignment-error" type="invalid">{errors.sport_room_id}</Form.Control.Feedback>
          </Form.Group>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="schedule-day">
                <Form.Label>Día de la semana</Form.Label>
                <Form.Select {...fieldErrorProps(errors.day_of_week, 'schedule-day-error')} isInvalid={Boolean(errors.day_of_week)} name="day_of_week" onChange={updateField} required value={form.day_of_week}>
                  <option value="">Seleccionar</option>
                  {DAYS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Form.Select>
                <Form.Control.Feedback id="schedule-day-error" type="invalid">{errors.day_of_week}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="schedule-start-time">
                <Form.Label>Hora de inicio</Form.Label>
                <Form.Control {...fieldErrorProps(errors.start_time, 'schedule-start-time-error')} isInvalid={Boolean(errors.start_time)} name="start_time" onChange={updateField} required type="time" value={form.start_time} />
                <Form.Control.Feedback id="schedule-start-time-error" type="invalid">{errors.start_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3" controlId="schedule-end-time">
                <Form.Label>Hora de término</Form.Label>
                <Form.Control {...fieldErrorProps(errors.end_time, 'schedule-end-time-error')} isInvalid={Boolean(errors.end_time)} name="end_time" onChange={updateField} required type="time" value={form.end_time} />
                <Form.Control.Feedback id="schedule-end-time-error" type="invalid">{errors.end_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Check checked={form.status} id="schedule-status" label="Horario activo" name="status" onChange={updateField} type="switch" />
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSaving} onClick={onHide} type="button" variant="outline-secondary">Cancelar</Button>
          <Button disabled={isSaving || (!editing && !hasActiveAssignment)} type="submit">
            {isSaving && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {editing ? 'Guardar cambios' : 'Guardar horario'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

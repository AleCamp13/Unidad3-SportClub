import { useCallback, useMemo, useState } from 'react'
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { CalendarClock } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import useAsyncData from '../../hooks/useAsyncData'
import useAuth from '../../hooks/useAuth'
import * as assignmentService from '../../services/assignmentService'
import { createClass } from '../../services/classCreationService'
import * as roomsService from '../../services/roomsService'
import * as sportsService from '../../services/sportsService'
import * as usersService from '../../services/usersService'
import { fieldErrorProps, normalizeFieldErrors } from '../../utils/formErrors'
import { validateClassCreation } from '../../utils/classCreation'

const DAYS = [
  [1, 'Lunes'], [2, 'Martes'], [3, 'Miércoles'], [4, 'Jueves'],
  [5, 'Viernes'], [6, 'Sábado'], [7, 'Domingo'],
]
const EMPTY_FORM = {
  sport_id: '', room_id: '', coach_id: '', observation: '',
  day_of_week: '', start_time: '', end_time: '', status: true,
}
const EMPTY_REFERENCES = { sports: [], rooms: [], coaches: [], assignments: [] }

function isActive(item) {
  return item.status !== false
}

export default function AdminClassCreatePage() {
  const { token } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const loadReferences = useCallback(async () => {
    const [sports, rooms, coaches, assignments] = await Promise.all([
      sportsService.listSports(token),
      roomsService.listRooms(token),
      usersService.listUsers(token, { role: 'coach' }),
      assignmentService.listAssignments(token),
    ])
    return { sports, rooms, coaches, assignments }
  }, [token])
  const {
    data: references, error: referenceError, isLoading: referencesLoading, reload: reloadReferences,
  } = useAsyncData(loadReferences, EMPTY_REFERENCES)
  const activeReferences = useMemo(() => ({
    sports: references.sports.filter(isActive),
    rooms: references.rooms.filter(isActive),
    coaches: references.coaches.filter(isActive),
    assignments: references.assignments.filter(isActive),
  }), [references])
  const referencesReady = !referencesLoading && !referenceError
  const hasRequiredReferences = activeReferences.sports.length > 0
    && activeReferences.rooms.length > 0
    && activeReferences.coaches.length > 0

  const updateField = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const validated = validateClassCreation(form)
    setErrors(validated.errors)
    setRequestError('')
    setSuccessMessage('')
    if (!validated.isValid || !hasRequiredReferences) return

    setIsSaving(true)
    try {
      await createClass(token, validated, activeReferences.assignments)
      setForm({ ...EMPTY_FORM })
      await reloadReferences()
      setSuccessMessage('Clase creada. La asignación y el horario quedaron disponibles.')
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.assignmentCreated
        ? 'La vinculación quedó guardada, pero el horario no pudo crearse. Reintenta el horario.'
        : error.message || 'No fue posible crear la clase.')
      if (error.assignmentCreated) await reloadReferences()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="workspace class-create">
      <AdminPageHeader
        actionLabel="Gestionar horarios"
        context="Programación"
        description="Crea la vinculación de recursos y su horario semanal desde un solo formulario."
        icon={CalendarClock}
        onAction={() => navigate('/admin/schedules')}
        title="Crear clase"
      />

      {referencesLoading && (
        <div className="reference-status" role="status">
          <Spinner aria-hidden="true" animation="border" size="sm" /> Cargando deportes, salas, entrenadores y asignaciones
        </div>
      )}
      {!referencesLoading && referenceError && (
        <Alert className="reference-alert" variant="danger">
          <div><strong>No fue posible cargar los datos de referencia.</strong><span>{referenceError.message}</span></div>
          <Button disabled={isSaving} onClick={reloadReferences} variant="outline-danger">Reintentar referencias</Button>
        </Alert>
      )}
      {!referencesLoading && !referenceError && !hasRequiredReferences && (
        <Alert className="reference-alert" variant="warning">
          <div><strong>Faltan referencias activas para crear una clase.</strong><span>Debe existir al menos un deporte, una sala y un entrenador disponibles.</span></div>
        </Alert>
      )}

      <Form className="class-create-form" noValidate onSubmit={handleSubmit}>
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        {requestError && <Alert variant="danger">{requestError}</Alert>}
        <section className="class-create-section" aria-labelledby="class-create-resources">
          <h2 id="class-create-resources">Recursos de la clase</h2>
          <Row>
            <Col md={4}>
              <Form.Group controlId="class-create-sport">
                <Form.Label>Deporte</Form.Label>
                <Form.Select {...fieldErrorProps(errors.sport_id, 'class-create-sport-error')} disabled={!referencesReady || isSaving} isInvalid={Boolean(errors.sport_id)} name="sport_id" onChange={updateField} required value={form.sport_id}>
                  <option value="">Seleccionar</option>
                  {activeReferences.sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
                </Form.Select>
                <Form.Control.Feedback id="class-create-sport-error" type="invalid">{errors.sport_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="class-create-room">
                <Form.Label>Sala</Form.Label>
                <Form.Select {...fieldErrorProps(errors.room_id, 'class-create-room-error')} disabled={!referencesReady || isSaving} isInvalid={Boolean(errors.room_id)} name="room_id" onChange={updateField} required value={form.room_id}>
                  <option value="">Seleccionar</option>
                  {activeReferences.rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                </Form.Select>
                <Form.Control.Feedback id="class-create-room-error" type="invalid">{errors.room_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="class-create-coach">
                <Form.Label>Entrenador</Form.Label>
                <Form.Select {...fieldErrorProps(errors.coach_id, 'class-create-coach-error')} disabled={!referencesReady || isSaving} isInvalid={Boolean(errors.coach_id)} name="coach_id" onChange={updateField} required value={form.coach_id}>
                  <option value="">Seleccionar</option>
                  {activeReferences.coaches.map((coach) => <option key={coach.id} value={coach.id}>{coach.full_name}</option>)}
                </Form.Select>
                <Form.Control.Feedback id="class-create-coach-error" type="invalid">{errors.coach_id}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="class-create-observation" controlId="class-create-observation">
            <Form.Label>Observación</Form.Label>
            <Form.Control {...fieldErrorProps(errors.observation, 'class-create-observation-error')} as="textarea" disabled={!referencesReady || isSaving} isInvalid={Boolean(errors.observation)} name="observation" onChange={updateField} rows={3} value={form.observation} />
            <Form.Control.Feedback id="class-create-observation-error" type="invalid">{errors.observation}</Form.Control.Feedback>
          </Form.Group>
        </section>

        <section className="class-create-section" aria-labelledby="class-create-schedule">
          <h2 id="class-create-schedule">Horario semanal</h2>
          <Row>
            <Col md={4}>
              <Form.Group controlId="class-create-day">
                <Form.Label>Día de la semana</Form.Label>
                <Form.Select {...fieldErrorProps(errors.day_of_week, 'class-create-day-error')} disabled={!referencesReady || isSaving} isInvalid={Boolean(errors.day_of_week)} name="day_of_week" onChange={updateField} required value={form.day_of_week}>
                  <option value="">Seleccionar</option>
                  {DAYS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </Form.Select>
                <Form.Control.Feedback id="class-create-day-error" type="invalid">{errors.day_of_week}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="class-create-start-time">
                <Form.Label>Hora de inicio</Form.Label>
                <Form.Control {...fieldErrorProps(errors.start_time, 'class-create-start-time-error')} disabled={!referencesReady || isSaving} isInvalid={Boolean(errors.start_time)} name="start_time" onChange={updateField} required type="time" value={form.start_time} />
                <Form.Control.Feedback id="class-create-start-time-error" type="invalid">{errors.start_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group controlId="class-create-end-time">
                <Form.Label>Hora de término</Form.Label>
                <Form.Control {...fieldErrorProps(errors.end_time, 'class-create-end-time-error')} disabled={!referencesReady || isSaving} isInvalid={Boolean(errors.end_time)} name="end_time" onChange={updateField} required type="time" value={form.end_time} />
                <Form.Control.Feedback id="class-create-end-time-error" type="invalid">{errors.end_time}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Check checked={form.status} disabled={!referencesReady || isSaving} id="class-create-status" label="Clase activa" name="status" onChange={updateField} type="switch" />
        </section>

        <div className="class-create-actions">
          <Button disabled={isSaving || !referencesReady || !hasRequiredReferences} type="submit">
            {isSaving && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {isSaving ? 'Creando clase' : 'Crear clase'}
          </Button>
        </div>
      </Form>
    </div>
  )
}

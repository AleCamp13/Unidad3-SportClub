import { useEffect, useState } from 'react'
import { Alert, Button, Col, Form, Modal, Row, Spinner } from 'react-bootstrap'
import { Plus, Trash2 } from 'lucide-react'
import { validateAdminUser } from '../../utils/adminValidation'
import { normalizeFieldErrors } from '../../utils/formErrors'

const EMPTY_SPORT = { name: '', frequency_per_week: 1 }
const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  confirm_password: '',
  role: 'user',
  birth_date: '',
  must_change_password: false,
  sports: [],
}

function formFromUser(user) {
  if (!user) return { ...EMPTY_FORM, sports: [] }
  return {
    full_name: user.full_name || '',
    email: user.email || '',
    password: '',
    confirm_password: '',
    role: user.role || 'user',
    birth_date: user.birth_date || '',
    must_change_password: Boolean(user.must_change_password),
    sports: (user.metadata?.sports || []).map((sport) => ({ ...sport })),
  }
}

export default function UserFormModal({ initialValue = null, onHide, onSubmit, show }) {
  const editing = Boolean(initialValue)
  const [form, setForm] = useState(() => formFromUser(initialValue))
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!show) return
    setForm(formFromUser(initialValue))
    setErrors({})
    setRequestError('')
  }, [initialValue, show])

  const updateField = (event) => {
    const { checked, name, type, value } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const updateSport = (index, field, value) => {
    setForm((current) => ({
      ...current,
      sports: current.sports.map((sport, sportIndex) => (
        sportIndex === index ? { ...sport, [field]: value } : sport
      )),
    }))
    setErrors((current) => ({ ...current, sports: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateAdminUser(form, { editing })
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid) return

    setIsSaving(true)
    try {
      await onSubmit(result.data)
    } catch (error) {
      const fieldErrors = normalizeFieldErrors(error.errors)
      if (fieldErrors.metadata) fieldErrors.sports = fieldErrors.metadata
      setErrors(fieldErrors)
      setRequestError(error.message || 'No fue posible guardar el usuario.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Modal animation={false} centered onHide={isSaving ? undefined : onHide} show={show} size="lg">
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>{editing ? 'Editar usuario' : 'Nuevo usuario'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {requestError && <Alert variant="danger">{requestError}</Alert>}
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-user-name">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control autoFocus isInvalid={Boolean(errors.full_name)} name="full_name" onChange={updateField} value={form.full_name} />
                <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-user-email">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control isInvalid={Boolean(errors.email)} name="email" onChange={updateField} type="email" value={form.email} />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-user-role">
                <Form.Label>Rol</Form.Label>
                <Form.Select isInvalid={Boolean(errors.role)} name="role" onChange={updateField} value={form.role}>
                  <option value="user">Usuario</option>
                  <option value="coach">Entrenador</option>
                  <option value="admin">Administrador</option>
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-user-birth-date">
                <Form.Label>Fecha de nacimiento</Form.Label>
                <Form.Control isInvalid={Boolean(errors.birth_date)} name="birth_date" onChange={updateField} type="date" value={form.birth_date} />
                <Form.Control.Feedback type="invalid">{errors.birth_date}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-user-password">
                <Form.Label>{editing ? 'Nueva contraseña' : 'Contraseña'}</Form.Label>
                <Form.Control autoComplete="new-password" isInvalid={Boolean(errors.password)} name="password" onChange={updateField} type="password" value={form.password} />
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
                {editing && <Form.Text>Déjala vacía para conservar la contraseña actual.</Form.Text>}
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="admin-user-confirm-password">
                <Form.Label>Confirmar contraseña</Form.Label>
                <Form.Control autoComplete="new-password" isInvalid={Boolean(errors.confirm_password)} name="confirm_password" onChange={updateField} type="password" value={form.confirm_password} />
                <Form.Control.Feedback type="invalid">{errors.confirm_password}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Check
            checked={form.must_change_password}
            className="mb-4"
            id="admin-user-must-change-password"
            label="Solicitar cambio de contraseña en el próximo ingreso"
            name="must_change_password"
            onChange={updateField}
            type="switch"
          />

          <fieldset className="sport-fields sport-fields--compact">
            <legend>Deportes del usuario</legend>
            {form.sports.length === 0 && <p className="field-empty-note">Sin deportes registrados.</p>}
            {form.sports.map((sport, index) => (
              <div className="sport-fields__row" key={index}>
                <Form.Group controlId={`admin-user-sport-${index}`}>
                  <Form.Label>Deporte {index + 1}</Form.Label>
                  <Form.Control onChange={(event) => updateSport(index, 'name', event.target.value)} value={sport.name} />
                </Form.Group>
                <Form.Group controlId={`admin-user-frequency-${index}`}>
                  <Form.Label>Veces por semana</Form.Label>
                  <Form.Control min="0" onChange={(event) => updateSport(index, 'frequency_per_week', event.target.value)} type="number" value={sport.frequency_per_week} />
                </Form.Group>
                <Button aria-label={`Eliminar deporte ${index + 1}`} className="icon-button" onClick={() => setForm((current) => ({ ...current, sports: current.sports.filter((_, itemIndex) => itemIndex !== index) }))} title="Eliminar deporte" type="button" variant="outline-danger">
                  <Trash2 aria-hidden="true" size={18} />
                </Button>
              </div>
            ))}
            {errors.sports && <div className="invalid-feedback d-block">{errors.sports}</div>}
            <Button className="icon-text-button" onClick={() => setForm((current) => ({ ...current, sports: [...current.sports, { ...EMPTY_SPORT }] }))} type="button" variant="outline-secondary">
              <Plus aria-hidden="true" size={18} /> Agregar deporte
            </Button>
          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSaving} onClick={onHide} type="button" variant="outline-secondary">Cancelar</Button>
          <Button disabled={isSaving} type="submit">
            {isSaving && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {editing ? 'Guardar cambios' : 'Guardar usuario'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

import { useState } from 'react'
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Plus, Trash2 } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { validateRegistration } from '../../utils/authValidation'
import { normalizeFieldErrors } from '../../utils/formErrors'

const EMPTY_SPORT = { name: '', frequency_per_week: 1 }

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: '', email: '', birth_date: '', password: '', confirm_password: '', sports: [{ ...EMPTY_SPORT }],
  })
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const updateSport = (index, field, value) => {
    setForm((current) => ({
      ...current,
      sports: current.sports.map((sport, sportIndex) => sportIndex === index ? { ...sport, [field]: value } : sport),
    }))
    setErrors((current) => ({ ...current, sports: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateRegistration(form)
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid) return

    setIsSubmitting(true)
    try {
      await register(result.data)
      navigate('/login', { replace: true, state: { registrationComplete: true } })
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.message || 'No fue posible crear la cuenta.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-form auth-form--wide" aria-labelledby="register-title">
      <div className="auth-form__heading">
        <p className="page-context">Nueva membresía</p>
        <h1 id="register-title">Crear cuenta</h1>
        <p>Todos los registros nuevos se crean con perfil de usuario.</p>
      </div>
      {requestError && <Alert variant="danger">{requestError}</Alert>}

      <Form noValidate onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="register-name">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control autoComplete="name" isInvalid={Boolean(errors.full_name)} name="full_name" onChange={updateField} value={form.full_name} />
              <Form.Control.Feedback type="invalid">{errors.full_name}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="register-email">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control autoComplete="email" isInvalid={Boolean(errors.email)} name="email" onChange={updateField} type="email" value={form.email} />
              <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>
        <Form.Group className="mb-3" controlId="register-birth-date">
          <Form.Label>Fecha de nacimiento</Form.Label>
          <Form.Control isInvalid={Boolean(errors.birth_date)} name="birth_date" onChange={updateField} type="date" value={form.birth_date} />
          <Form.Control.Feedback type="invalid">{errors.birth_date}</Form.Control.Feedback>
        </Form.Group>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="register-password">
              <Form.Label>Contraseña</Form.Label>
              <Form.Control autoComplete="new-password" isInvalid={Boolean(errors.password)} name="password" onChange={updateField} type="password" value={form.password} />
              <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3" controlId="register-confirm-password">
              <Form.Label>Confirmar contraseña</Form.Label>
              <Form.Control autoComplete="new-password" isInvalid={Boolean(errors.confirm_password)} name="confirm_password" onChange={updateField} type="password" value={form.confirm_password} />
              <Form.Control.Feedback type="invalid">{errors.confirm_password}</Form.Control.Feedback>
            </Form.Group>
          </Col>
        </Row>

        <fieldset className="sport-fields">
          <legend>Deportes que practicas</legend>
          {form.sports.map((sport, index) => (
            <div className="sport-fields__row" key={index}>
              <Form.Group controlId={`register-sport-${index}`}>
                <Form.Label>Deporte</Form.Label>
                <Form.Control onChange={(event) => updateSport(index, 'name', event.target.value)} value={sport.name} />
              </Form.Group>
              <Form.Group controlId={`register-frequency-${index}`}>
                <Form.Label>Frecuencia semanal</Form.Label>
                <Form.Control min="0" onChange={(event) => updateSport(index, 'frequency_per_week', event.target.value)} type="number" value={sport.frequency_per_week} />
              </Form.Group>
              {form.sports.length > 1 && (
                <Button aria-label={`Eliminar deporte ${index + 1}`} className="icon-button" onClick={() => setForm((current) => ({ ...current, sports: current.sports.filter((_, itemIndex) => itemIndex !== index) }))} title="Eliminar deporte" type="button" variant="outline-danger">
                  <Trash2 aria-hidden="true" size={18} />
                </Button>
              )}
            </div>
          ))}
          {errors.sports && <div className="invalid-feedback d-block">{errors.sports}</div>}
          <Button className="icon-text-button" onClick={() => setForm((current) => ({ ...current, sports: [...current.sports, { ...EMPTY_SPORT }] }))} type="button" variant="outline-secondary">
            <Plus aria-hidden="true" size={18} /> Agregar deporte
          </Button>
        </fieldset>

        <Button className="w-100 mt-4" disabled={isSubmitting} type="submit">
          {isSubmitting && <Spinner aria-hidden="true" className="me-2" size="sm" />}
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </Form>
      <p className="auth-form__alternate">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p>
    </section>
  )
}

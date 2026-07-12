import { useState } from 'react'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../../hooks/useAuth'
import { getRoleDashboard } from '../../routes/rolePaths'
import { normalizeFieldErrors } from '../../utils/formErrors'
import { validateLogin } from '../../utils/authValidation'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => ({ ...current, [name]: undefined }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateLogin(form)
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid) return

    setIsSubmitting(true)
    try {
      const user = await login(result.data)
      const requestedPath = location.state?.from?.pathname
      navigate(requestedPath || getRoleDashboard(user.role), { replace: true })
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.message || 'No fue posible iniciar sesión.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="auth-form" aria-labelledby="login-title">
      <div className="auth-form__heading">
        <p className="page-context">Acceso al club</p>
        <h1 id="login-title">Iniciar sesión</h1>
        <p>Ingresa con tu cuenta para acceder a tu espacio de trabajo.</p>
      </div>

      {location.state?.registrationComplete && (
        <Alert variant="success">Cuenta creada correctamente. Ya puedes iniciar sesión.</Alert>
      )}
      {requestError && <Alert variant="danger">{requestError}</Alert>}

      <Form noValidate onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="login-email">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            autoComplete="email"
            autoFocus
            isInvalid={Boolean(errors.email)}
            name="email"
            onChange={updateField}
            type="email"
            value={form.email}
          />
          <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-4" controlId="login-password">
          <Form.Label>Contraseña</Form.Label>
          <Form.Control
            autoComplete="current-password"
            isInvalid={Boolean(errors.password)}
            name="password"
            onChange={updateField}
            type="password"
            value={form.password}
          />
          <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
        </Form.Group>
        <Button className="w-100" disabled={isSubmitting} type="submit">
          {isSubmitting && <Spinner aria-hidden="true" className="me-2" size="sm" />}
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </Form>

      <p className="auth-form__alternate">¿No tienes cuenta? <Link to="/register">Crear cuenta</Link></p>
    </section>
  )
}

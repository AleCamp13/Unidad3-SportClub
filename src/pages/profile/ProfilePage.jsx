import { useState } from 'react'
import { Alert, Badge, Button, Col, Form, Row, Spinner } from 'react-bootstrap'
import { Plus, Trash2 } from 'lucide-react'
import useAuth from '../../hooks/useAuth'
import * as authService from '../../services/authService'
import { validatePasswordChange, validateProfile } from '../../utils/authValidation'
import { normalizeFieldErrors } from '../../utils/formErrors'

const ROLE_LABELS = { admin: 'Administrador', coach: 'Entrenador', user: 'Usuario' }
const EMPTY_SPORT = { name: '', frequency_per_week: 1 }

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth()
  const [profile, setProfile] = useState({
    full_name: user.full_name || '',
    email: user.email || '',
    birth_date: user.birth_date || '',
    metadata: user.metadata || {},
    sports: user.metadata?.sports?.length ? user.metadata.sports : [],
  })
  const [password, setPassword] = useState({ current_password: '', new_password: '', confirm_password: '' })
  const [profileErrors, setProfileErrors] = useState({})
  const [passwordErrors, setPasswordErrors] = useState({})
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' })
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  const updateProfileField = (event) => {
    const { name, value } = event.target
    setProfile((current) => ({ ...current, [name]: value }))
    setProfileErrors((current) => ({ ...current, [name]: undefined }))
  }

  const updateSport = (index, field, value) => {
    setProfile((current) => ({
      ...current,
      sports: current.sports.map((sport, sportIndex) => sportIndex === index ? { ...sport, [field]: value } : sport),
    }))
    setProfileErrors((current) => ({ ...current, sports: undefined }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    const result = validateProfile(profile)
    setProfileErrors(result.errors)
    setProfileMessage({ type: '', text: '' })
    if (!result.isValid) return

    setIsSavingProfile(true)
    try {
      await authService.updateProfile(token, result.data)
      await refreshUser()
      setProfileMessage({ type: 'success', text: 'Perfil actualizado correctamente.' })
    } catch (error) {
      const fieldErrors = normalizeFieldErrors(error.errors)
      if (fieldErrors.metadata) fieldErrors.sports = fieldErrors.metadata
      setProfileErrors(fieldErrors)
      setProfileMessage({ type: 'danger', text: error.message || 'No fue posible actualizar el perfil.' })
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    const result = validatePasswordChange(password)
    setPasswordErrors(result.errors)
    setPasswordMessage({ type: '', text: '' })
    if (!result.isValid) return

    setIsSavingPassword(true)
    try {
      await authService.changePassword(token, result.data)
      setPassword({ current_password: '', new_password: '', confirm_password: '' })
      setPasswordMessage({ type: 'success', text: 'Contraseña actualizada correctamente.' })
    } catch (error) {
      setPasswordErrors(normalizeFieldErrors(error.errors))
      setPasswordMessage({ type: 'danger', text: error.message || 'No fue posible actualizar la contraseña.' })
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <div className="workspace profile-page">
      <div className="page-heading">
        <div>
          <p className="page-context">Cuenta personal</p>
          <h1>Mi perfil</h1>
        </div>
        <Badge bg="light" className="profile-role" text="dark">{ROLE_LABELS[user.role] || user.role}</Badge>
      </div>

      <section className="profile-section" aria-labelledby="profile-data-title">
        <div className="section-heading">
          <h2 id="profile-data-title">Datos personales</h2>
          <p>La información guardada se refleja de inmediato en tu cuenta.</p>
        </div>
        {profileMessage.text && <Alert variant={profileMessage.type}>{profileMessage.text}</Alert>}
        <Form noValidate onSubmit={handleProfileSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="profile-name">
                <Form.Label>Nombre completo</Form.Label>
                <Form.Control isInvalid={Boolean(profileErrors.full_name)} name="full_name" onChange={updateProfileField} value={profile.full_name} />
                <Form.Control.Feedback type="invalid">{profileErrors.full_name}</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="profile-email">
                <Form.Label>Correo electrónico</Form.Label>
                <Form.Control isInvalid={Boolean(profileErrors.email)} name="email" onChange={updateProfileField} type="email" value={profile.email} />
                <Form.Control.Feedback type="invalid">{profileErrors.email}</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
          <Form.Group className="mb-4 profile-date" controlId="profile-birth-date">
            <Form.Label>Fecha de nacimiento</Form.Label>
            <Form.Control isInvalid={Boolean(profileErrors.birth_date)} name="birth_date" onChange={updateProfileField} type="date" value={profile.birth_date} />
            <Form.Control.Feedback type="invalid">{profileErrors.birth_date}</Form.Control.Feedback>
          </Form.Group>

          <fieldset className="sport-fields">
            <legend>Deportes</legend>
            {profile.sports.map((sport, index) => (
              <div className="sport-fields__row" key={index}>
                <Form.Group controlId={`profile-sport-${index}`}>
                  <Form.Label>Deporte {index + 1}</Form.Label>
                  <Form.Control onChange={(event) => updateSport(index, 'name', event.target.value)} value={sport.name} />
                </Form.Group>
                <Form.Group controlId={`profile-frequency-${index}`}>
                  <Form.Label>Frecuencia semanal {index + 1}</Form.Label>
                  <Form.Control min="0" onChange={(event) => updateSport(index, 'frequency_per_week', event.target.value)} type="number" value={sport.frequency_per_week} />
                </Form.Group>
                <Button aria-label={`Eliminar deporte ${index + 1}`} className="icon-button" onClick={() => setProfile((current) => ({ ...current, sports: current.sports.filter((_, itemIndex) => itemIndex !== index) }))} title="Eliminar deporte" type="button" variant="outline-danger">
                  <Trash2 aria-hidden="true" size={18} />
                </Button>
              </div>
            ))}
            {profileErrors.sports && <div className="invalid-feedback d-block">{profileErrors.sports}</div>}
            <Button className="icon-text-button" onClick={() => setProfile((current) => ({ ...current, sports: [...current.sports, { ...EMPTY_SPORT }] }))} type="button" variant="outline-secondary">
              <Plus aria-hidden="true" size={18} /> Agregar deporte
            </Button>
          </fieldset>
          <Button className="mt-4" disabled={isSavingProfile} type="submit">
            {isSavingProfile && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {isSavingProfile ? 'Guardando...' : 'Guardar perfil'}
          </Button>
        </Form>
      </section>

      <section className="profile-section" aria-labelledby="password-title">
        <div className="section-heading">
          <h2 id="password-title">Cambiar contraseña</h2>
          <p>Usa al menos ocho caracteres y confirma la nueva contraseña.</p>
        </div>
        {passwordMessage.text && <Alert variant={passwordMessage.type}>{passwordMessage.text}</Alert>}
        <Form className="password-form" noValidate onSubmit={handlePasswordSubmit}>
          <Form.Group controlId="current-password">
            <Form.Label>Contraseña actual</Form.Label>
            <Form.Control autoComplete="current-password" isInvalid={Boolean(passwordErrors.current_password)} onChange={(event) => setPassword((current) => ({ ...current, current_password: event.target.value }))} type="password" value={password.current_password} />
            <Form.Control.Feedback type="invalid">{passwordErrors.current_password}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="new-password">
            <Form.Label>Nueva contraseña</Form.Label>
            <Form.Control autoComplete="new-password" isInvalid={Boolean(passwordErrors.new_password)} onChange={(event) => setPassword((current) => ({ ...current, new_password: event.target.value }))} type="password" value={password.new_password} />
            <Form.Control.Feedback type="invalid">{passwordErrors.new_password}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="confirm-new-password">
            <Form.Label>Confirmar nueva contraseña</Form.Label>
            <Form.Control autoComplete="new-password" isInvalid={Boolean(passwordErrors.confirm_password)} onChange={(event) => setPassword((current) => ({ ...current, confirm_password: event.target.value }))} type="password" value={password.confirm_password} />
            <Form.Control.Feedback type="invalid">{passwordErrors.confirm_password}</Form.Control.Feedback>
          </Form.Group>
          <Button disabled={isSavingPassword} type="submit">
            {isSavingPassword && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            {isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
          </Button>
        </Form>
      </section>
    </div>
  )
}

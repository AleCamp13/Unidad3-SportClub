import { useEffect, useState } from 'react'
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap'
import { CalendarDays, Clock3, MapPin, UserRound } from 'lucide-react'
import { DAY_LABELS, validateReservation } from '../../utils/reservationUtils'
import { formatTime } from '../../utils/formatters'
import { normalizeFieldErrors } from '../../utils/formErrors'

function coachLabel(coach) {
  return coach?.full_name || coach?.email || 'Entrenador no disponible'
}

export default function ReservationModal({ classInfo, onHide, onSubmit, schedule, show }) {
  const [observation, setObservation] = useState('')
  const [errors, setErrors] = useState({})
  const [requestError, setRequestError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!show) return
    setObservation('')
    setErrors({})
    setRequestError('')
  }, [schedule, show])

  const handleSubmit = async (event) => {
    event.preventDefault()
    const result = validateReservation({ class_schedule_id: schedule?.id, observation })
    setErrors(result.errors)
    setRequestError('')
    if (!result.isValid) return

    setIsSaving(true)
    try {
      await onSubmit(result.data)
    } catch (error) {
      setErrors(normalizeFieldErrors(error.errors))
      setRequestError(error.message || 'No fue posible crear la reserva.')
    } finally {
      setIsSaving(false)
    }
  }

  const dayLabel = DAY_LABELS[Number(schedule?.day_of_week) - 1] || 'Día no disponible'

  return (
    <Modal animation={false} centered onHide={isSaving ? undefined : onHide} show={show}>
      <Form noValidate onSubmit={handleSubmit}>
        <Modal.Header closeButton={!isSaving}>
          <Modal.Title>Reservar clase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {requestError && <Alert variant="danger">{requestError}</Alert>}
          <div className="reservation-selection" aria-label="Horario seleccionado">
            <strong>{classInfo?.sport?.name || 'Clase no disponible'}</strong>
            <span><MapPin aria-hidden="true" size={16} />{classInfo?.room?.name || 'Sala no disponible'}</span>
            <span><UserRound aria-hidden="true" size={16} />{coachLabel(classInfo?.coach)}</span>
            <span><CalendarDays aria-hidden="true" size={16} />{dayLabel} · {formatTime(schedule?.start_time)} - {formatTime(schedule?.end_time)}</span>
            <span><Clock3 aria-hidden="true" size={16} />{classInfo?.sport?.duration || 'Duración no disponible'}{classInfo?.sport?.duration ? ' min' : ''}</span>
          </div>
          {errors.class_schedule_id && <Alert className="mt-3" variant="danger">{errors.class_schedule_id}</Alert>}
          <Form.Group className="mt-3" controlId="reservation-observation">
            <Form.Label>Observación opcional</Form.Label>
            <Form.Control
              as="textarea"
              isInvalid={Boolean(errors.observation)}
              maxLength={255}
              onChange={(event) => {
                setObservation(event.target.value)
                setErrors((current) => ({ ...current, observation: undefined }))
              }}
              rows={3}
              value={observation}
            />
            <Form.Control.Feedback type="invalid">{errors.observation}</Form.Control.Feedback>
            <Form.Text>{observation.length}/255</Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button disabled={isSaving} onClick={onHide} type="button" variant="outline-secondary">Cancelar</Button>
          <Button disabled={isSaving || !schedule} type="submit">
            {isSaving && <Spinner aria-hidden="true" className="me-2" size="sm" />}
            Confirmar reserva
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

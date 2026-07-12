import { useCallback, useMemo, useState } from 'react'
import { Col, Form, Row } from 'react-bootstrap'
import ClassOffering from '../../components/member/ClassOffering'
import ReservationModal from '../../components/member/ReservationModal'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAsyncData from '../../hooks/useAsyncData'
import useAuth from '../../hooks/useAuth'
import * as memberService from '../../services/memberService'
import * as reservationService from '../../services/reservationService'
import { showAdminSuccess } from '../../utils/adminAlerts'
import { getActiveScheduleIds } from '../../utils/reservationUtils'

const EMPTY_DATA = { classes: [], sports: [], rooms: [], reservations: [] }

export default function MemberClassesPage() {
  const { token } = useAuth()
  const loadData = useCallback(async () => {
    const [classes, sports, rooms, reservations] = await Promise.all([
      memberService.getAvailableClasses(token),
      memberService.getAvailableSports(token),
      memberService.getAvailableRooms(token),
      reservationService.getMyReservations(token),
    ])
    return { classes, sports, rooms, reservations }
  }, [token])
  const { data, error, isLoading, reload } = useAsyncData(loadData, EMPTY_DATA)
  const [sportFilter, setSportFilter] = useState('')
  const [roomFilter, setRoomFilter] = useState('')
  const [selection, setSelection] = useState(null)
  const activeScheduleIds = useMemo(() => getActiveScheduleIds(data.reservations), [data.reservations])
  const filteredClasses = data.classes.filter((item) => (
    (!sportFilter || String(item.sport_id) === sportFilter)
    && (!roomFilter || String(item.room_id) === roomFilter)
  ))

  const createReservation = async (payload) => {
    await reservationService.createReservation(token, payload)
    await reload()
    setSelection(null)
    await showAdminSuccess('Reserva confirmada')
  }

  return (
    <div className="workspace member-page">
      <div className="page-heading">
        <div><p className="page-context">Membresía</p><h1>Clases disponibles</h1><p className="page-description">Selecciona un horario real y confirma tu reserva.</p></div>
      </div>

      {!isLoading && !error && (
        <Form className="class-filters" aria-label="Filtros de clases">
          <Row>
            <Col md={6}>
              <Form.Group controlId="member-sport-filter">
                <Form.Label>Filtrar por deporte</Form.Label>
                <Form.Select onChange={(event) => setSportFilter(event.target.value)} value={sportFilter}>
                  <option value="">Todos los deportes</option>
                  {data.sports.map((sport) => <option key={sport.id} value={sport.id}>{sport.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="member-room-filter">
                <Form.Label>Filtrar por sala</Form.Label>
                <Form.Select onChange={(event) => setRoomFilter(event.target.value)} value={roomFilter}>
                  <option value="">Todas las salas</option>
                  {data.rooms.map((room) => <option key={room.id} value={room.id}>{room.name}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Form>
      )}

      <section className="class-catalog" aria-label="Catálogo de clases">
        {isLoading && <LoadingState label="Cargando clases y reservas" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && filteredClasses.length === 0 && (
          <EmptyState description="Prueba otra combinación de filtros o vuelve más tarde." title="No hay clases disponibles" />
        )}
        {!isLoading && !error && filteredClasses.map((item) => (
          <ClassOffering
            activeScheduleIds={activeScheduleIds}
            classInfo={item}
            detailLink={`/user/classes/${item.id}`}
            key={item.id}
            onReserve={(classInfo, schedule) => setSelection({ classInfo, schedule })}
          />
        ))}
      </section>

      <ReservationModal
        classInfo={selection?.classInfo}
        onHide={() => setSelection(null)}
        onSubmit={createReservation}
        schedule={selection?.schedule}
        show={Boolean(selection)}
      />
    </div>
  )
}

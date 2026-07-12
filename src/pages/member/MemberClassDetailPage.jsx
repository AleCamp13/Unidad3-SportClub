import { useCallback, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import ClassOffering from '../../components/member/ClassOffering'
import ReservationModal from '../../components/member/ReservationModal'
import { ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAsyncData from '../../hooks/useAsyncData'
import useAuth from '../../hooks/useAuth'
import * as memberService from '../../services/memberService'
import * as reservationService from '../../services/reservationService'
import { showAdminSuccess } from '../../utils/adminAlerts'
import { getActiveScheduleIds } from '../../utils/reservationUtils'

const EMPTY_DATA = { classInfo: null, reservations: [] }

export default function MemberClassDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const loadData = useCallback(async () => {
    const [classInfo, reservations] = await Promise.all([
      memberService.getAvailableClass(token, id),
      reservationService.getMyReservations(token),
    ])
    return { classInfo, reservations }
  }, [id, token])
  const { data, error, isLoading, reload } = useAsyncData(loadData, EMPTY_DATA)
  const [selection, setSelection] = useState(null)
  const activeScheduleIds = useMemo(() => getActiveScheduleIds(data.reservations), [data.reservations])

  const createReservation = async (payload) => {
    await reservationService.createReservation(token, payload)
    await reload()
    setSelection(null)
    await showAdminSuccess('Reserva confirmada')
  }

  return (
    <div className="workspace member-page">
      <Link className="back-link" to="/user/classes"><ArrowLeft aria-hidden="true" size={17} /> Volver a clases</Link>
      {isLoading && <LoadingState label="Cargando detalle de la clase" />}
      {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
      {!isLoading && !error && data.classInfo && (
        <>
          <div className="page-heading class-detail-heading"><div><p className="page-context">Detalle de clase</p><h1>{data.classInfo.sport?.name || 'Clase'}</h1></div></div>
          <ClassOffering
            activeScheduleIds={activeScheduleIds}
            classInfo={data.classInfo}
            onReserve={(classInfo, schedule) => setSelection({ classInfo, schedule })}
          />
        </>
      )}
      <ReservationModal classInfo={selection?.classInfo} onHide={() => setSelection(null)} onSubmit={createReservation} schedule={selection?.schedule} show={Boolean(selection)} />
    </div>
  )
}

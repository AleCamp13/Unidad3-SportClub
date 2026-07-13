import { useCallback } from 'react'
import { CalendarClock, DoorOpen, Dumbbell, Layers3 } from 'lucide-react'
import { Link } from 'react-router-dom'
import MemberActivity from '../../components/member/MemberActivity'
import { ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAsyncData from '../../hooks/useAsyncData'
import useAuth from '../../hooks/useAuth'
import * as memberService from '../../services/memberService'
import * as reservationService from '../../services/reservationService'
import { getSportImage } from '../../utils/sportImages'

const EMPTY_DATA = { dashboard: null, reservations: [] }

export default function MemberDashboardPage() {
  const { token, user } = useAuth()
  const loadData = useCallback(async () => {
    const [dashboard, reservations] = await Promise.all([
      memberService.getMemberDashboard(token),
      reservationService.getMyReservations(token),
    ])
    return { dashboard, reservations }
  }, [token])
  const { data, error, isLoading, reload } = useAsyncData(loadData, EMPTY_DATA)

  return (
    <div className="workspace member-page">
      <div className="page-heading">
        <div><p className="page-context">Hola, {user.full_name}</p><h1>Mi SportClub</h1><p className="page-description">Disponibilidad y actividad obtenidas desde la API del club.</p></div>
      </div>
      {isLoading && <div className="member-page-state"><LoadingState label="Cargando tu panel" /></div>}
      {!isLoading && error && <div className="member-page-state"><ErrorState message={error.message} onRetry={reload} /></div>}
      {!isLoading && !error && data.dashboard && (
        <>
          <section className="role-metrics" aria-label="Disponibilidad del club">
            <div aria-label={`${data.dashboard.available_classes} ${data.dashboard.available_classes === 1 ? 'clase disponible' : 'clases disponibles'}`}><Layers3 aria-hidden="true" size={22} /><strong>{data.dashboard.available_classes}</strong><span>Clases</span></div>
            <div aria-label={`${data.dashboard.available_schedules} horarios disponibles`}><CalendarClock aria-hidden="true" size={22} /><strong>{data.dashboard.available_schedules}</strong><span>Horarios</span></div>
            <div aria-label={`${data.dashboard.available_sports} deportes disponibles`}><Dumbbell aria-hidden="true" size={22} /><strong>{data.dashboard.available_sports}</strong><span>Deportes</span></div>
            <div aria-label={`${data.dashboard.available_rooms} salas disponibles`}><DoorOpen aria-hidden="true" size={22} /><strong>{data.dashboard.available_rooms}</strong><span>Salas</span></div>
          </section>
          <section className="next-classes" aria-labelledby="next-classes-title">
            <div className="section-heading"><h2 id="next-classes-title">Clases destacadas</h2><p>Primeras alternativas disponibles en este momento.</p></div>
            <div className="next-classes__list">
              {data.dashboard.next_classes?.map((item) => (
                <Link key={item.id} to={`/user/classes/${item.id}`}>
                  <img alt="" aria-hidden="true" loading="lazy" src={getSportImage(item.sport?.name)} />
                  <span><strong>{item.sport?.name || 'Clase'}</strong><small>{item.room?.name || 'Sala no disponible'}</small></span>
                </Link>
              ))}
              {!data.dashboard.next_classes?.length && <span className="field-empty-note">No hay clases destacadas.</span>}
            </div>
          </section>
          <MemberActivity reservations={data.reservations} />
        </>
      )}
    </div>
  )
}

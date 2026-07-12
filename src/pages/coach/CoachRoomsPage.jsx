import { useCallback } from 'react'
import { Dumbbell, MapPin, UsersRound } from 'lucide-react'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as coachService from '../../services/coachService'

export default function CoachRoomsPage() {
  const { token } = useAuth()
  const loadRooms = useCallback(() => coachService.getCoachRooms(token), [token])
  const { error, isLoading, items: rooms, reload } = useEntityList(loadRooms)

  return (
    <div className="workspace coach-page">
      <div className="page-heading"><div><p className="page-context">Entrenamiento</p><h1>Mis salas</h1><p className="page-description">Espacios asociados a tus clases vigentes.</p></div></div>
      <section className="coach-room-grid" aria-label="Salas asignadas">
        {isLoading && <LoadingState label="Cargando salas asignadas" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && rooms.length === 0 && <EmptyState description="Las salas vinculadas a tus clases aparecerán aquí." title="No tienes salas asignadas" />}
        {!isLoading && !error && rooms.map((room) => (
          <article className="coach-room" key={`${room.id}-${room.sport?.id || 'sport'}`}>
            <div><p className="page-context">{room.sport?.name || 'Deporte no disponible'}</p><h2>{room.name}</h2><p>{room.description}</p></div>
            <div className="coach-room__facts"><span><MapPin aria-hidden="true" size={16} />{room.location || 'Sin ubicación'}</span><span><UsersRound aria-hidden="true" size={16} />Cupo {room.capacity}</span><span><Dumbbell aria-hidden="true" size={16} />{room.sport?.name || 'Sin deporte'}</span></div>
            {room.observation && <p className="coach-room__note">{room.observation}</p>}
          </article>
        ))}
      </section>
    </div>
  )
}

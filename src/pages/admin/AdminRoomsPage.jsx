import { useCallback, useState } from 'react'
import { Button, ButtonGroup, Table } from 'react-bootstrap'
import { MapPin, Pencil, Plus, Power, Trash2, UsersRound } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import RoomFormModal from '../../components/admin/RoomFormModal'
import StatusBadge from '../../components/admin/StatusBadge'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as roomsService from '../../services/roomsService'
import { confirmAdminAction, showAdminError, showAdminSuccess } from '../../utils/adminAlerts'

export default function AdminRoomsPage() {
  const { token } = useAuth()
  const loadRooms = useCallback(() => roomsService.listRooms(token), [token])
  const { error, isLoading, items: rooms, reload } = useEntityList(loadRooms)
  const [showModal, setShowModal] = useState(false)
  const [editingRoom, setEditingRoom] = useState(null)

  const openCreate = () => {
    setEditingRoom(null)
    setShowModal(true)
  }

  const openEdit = (room) => {
    setEditingRoom(room)
    setShowModal(true)
  }

  const saveRoom = async (payload) => {
    if (editingRoom) await roomsService.updateRoom(token, editingRoom.id, payload)
    else await roomsService.createRoom(token, payload)

    await reload()
    setShowModal(false)
    setEditingRoom(null)
    await showAdminSuccess(editingRoom ? 'Sala actualizada' : 'Sala creada')
  }

  const changeStatus = async (room) => {
    const nextStatus = !room.status
    const confirmed = await confirmAdminAction({
      title: nextStatus ? 'Activar sala' : 'Desactivar sala',
      text: `${room.name} quedará ${nextStatus ? 'disponible' : 'fuera de servicio'}.`,
      confirmText: nextStatus ? 'Sí, activar' : 'Sí, desactivar',
    })
    if (!confirmed) return

    try {
      await roomsService.updateRoom(token, room.id, { status: nextStatus })
      await reload()
      await showAdminSuccess(nextStatus ? 'Sala activada' : 'Sala desactivada')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  const removeRoom = async (room) => {
    const confirmed = await confirmAdminAction({
      title: 'Eliminar sala',
      text: `Se eliminará ${room.name}. Verifica antes que no tenga clases asociadas.`,
      confirmText: 'Sí, eliminar',
    })
    if (!confirmed) return

    try {
      await roomsService.deleteRoom(token, room.id)
      await reload()
      await showAdminSuccess('Sala eliminada')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  return (
    <div className="workspace entity-page">
      <AdminPageHeader
        actionLabel="Nueva sala"
        context="Administración"
        description="Gestiona capacidad, ubicación y disponibilidad de los espacios deportivos."
        icon={Plus}
        onAction={openCreate}
        title="Salas"
      />

      <section className="entity-table-section" aria-label="Listado de salas">
        {isLoading && <LoadingState label="Cargando salas" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && rooms.length === 0 && (
          <EmptyState actionLabel="Crear primera sala" description="Registra el primer espacio disponible del club." onAction={openCreate} title="No hay salas registradas" />
        )}
        {!isLoading && !error && rooms.length > 0 && (
          <Table className="entity-table" hover responsive>
            <thead><tr><th>Sala</th><th>Descripción</th><th>Capacidad</th><th>Ubicación</th><th>Estado</th><th className="actions-column">Acciones</th></tr></thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room.id}>
                  <td><strong>{room.name}</strong></td>
                  <td>{room.description}</td>
                  <td><span className="inline-data"><UsersRound aria-hidden="true" size={15} />{room.capacity}</span></td>
                  <td><span className="inline-data"><MapPin aria-hidden="true" size={15} />{room.location || 'Sin ubicación'}</span></td>
                  <td><StatusBadge active={room.status} activeLabel="Activa" inactiveLabel="Inactiva" /></td>
                  <td>
                    <ButtonGroup aria-label={`Acciones para ${room.name}`} size="sm">
                      <Button aria-label={`Editar ${room.name}`} onClick={() => openEdit(room)} title="Editar sala" variant="outline-secondary"><Pencil aria-hidden="true" size={16} /></Button>
                      <Button aria-label={`${room.status ? 'Desactivar' : 'Activar'} ${room.name}`} onClick={() => changeStatus(room)} title={room.status ? 'Desactivar sala' : 'Activar sala'} variant="outline-secondary"><Power aria-hidden="true" size={16} /></Button>
                      <Button aria-label={`Eliminar ${room.name}`} onClick={() => removeRoom(room)} title="Eliminar sala" variant="outline-danger"><Trash2 aria-hidden="true" size={16} /></Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <RoomFormModal initialValue={editingRoom} onHide={() => setShowModal(false)} onSubmit={saveRoom} show={showModal} />
    </div>
  )
}

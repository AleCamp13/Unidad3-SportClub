import { useCallback, useState } from 'react'
import { Button, ButtonGroup, Table } from 'react-bootstrap'
import { Pencil, Plus, Power, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import SportFormModal from '../../components/admin/SportFormModal'
import StatusBadge from '../../components/admin/StatusBadge'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as sportsService from '../../services/sportsService'
import { confirmAdminAction, showAdminError, showAdminSuccess } from '../../utils/adminAlerts'

export default function AdminSportsPage() {
  const { token } = useAuth()
  const loadSports = useCallback(() => sportsService.listSports(token), [token])
  const { error, isLoading, items: sports, reload } = useEntityList(loadSports)
  const [showModal, setShowModal] = useState(false)
  const [editingSport, setEditingSport] = useState(null)

  const openCreate = () => {
    setEditingSport(null)
    setShowModal(true)
  }

  const openEdit = (sport) => {
    setEditingSport(sport)
    setShowModal(true)
  }

  const saveSport = async (payload) => {
    if (editingSport) await sportsService.updateSport(token, editingSport.id, payload)
    else await sportsService.createSport(token, payload)

    await reload()
    setShowModal(false)
    setEditingSport(null)
    await showAdminSuccess(editingSport ? 'Deporte actualizado' : 'Deporte creado')
  }

  const changeStatus = async (sport) => {
    const nextStatus = !sport.status
    const confirmed = await confirmAdminAction({
      title: nextStatus ? 'Activar deporte' : 'Desactivar deporte',
      text: `${sport.name} quedará ${nextStatus ? 'disponible' : 'fuera de la programación'}.`,
      confirmText: nextStatus ? 'Sí, activar' : 'Sí, desactivar',
    })
    if (!confirmed) return

    try {
      await sportsService.changeSportStatus(token, sport.id, nextStatus)
      await reload()
      await showAdminSuccess(nextStatus ? 'Deporte activado' : 'Deporte desactivado')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  const removeSport = async (sport) => {
    const confirmed = await confirmAdminAction({
      title: 'Eliminar deporte',
      text: `Se eliminará ${sport.name}. Verifica antes que no tenga asignaciones activas.`,
      confirmText: 'Sí, eliminar',
    })
    if (!confirmed) return

    try {
      await sportsService.deleteSport(token, sport.id)
      await reload()
      await showAdminSuccess('Deporte eliminado')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  return (
    <div className="workspace entity-page">
      <AdminPageHeader
        actionLabel="Nuevo deporte"
        context="Administración"
        description="Define la oferta deportiva, su objetivo, duración y disponibilidad."
        icon={Plus}
        onAction={openCreate}
        title="Deportes"
      />

      <section className="entity-table-section" aria-label="Listado de deportes">
        {isLoading && <LoadingState label="Cargando deportes" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && sports.length === 0 && (
          <EmptyState actionLabel="Crear primer deporte" description="Registra la primera disciplina del club." onAction={openCreate} title="No hay deportes registrados" />
        )}
        {!isLoading && !error && sports.length > 0 && (
          <Table className="entity-table" hover responsive>
            <thead><tr><th>Deporte</th><th>Objetivo</th><th>Duración</th><th>Estado</th><th className="actions-column">Acciones</th></tr></thead>
            <tbody>
              {sports.map((sport) => (
                <tr key={sport.id}>
                  <td><strong>{sport.name}</strong></td>
                  <td>{sport.objective}</td>
                  <td>{sport.duration} min</td>
                  <td><StatusBadge active={sport.status} /></td>
                  <td>
                    <ButtonGroup aria-label={`Acciones para ${sport.name}`} size="sm">
                      <Button aria-label={`Editar ${sport.name}`} onClick={() => openEdit(sport)} title="Editar deporte" variant="outline-secondary"><Pencil aria-hidden="true" size={16} /></Button>
                      <Button aria-label={`${sport.status ? 'Desactivar' : 'Activar'} ${sport.name}`} onClick={() => changeStatus(sport)} title={sport.status ? 'Desactivar deporte' : 'Activar deporte'} variant="outline-secondary"><Power aria-hidden="true" size={16} /></Button>
                      <Button aria-label={`Eliminar ${sport.name}`} onClick={() => removeSport(sport)} title="Eliminar deporte" variant="outline-danger"><Trash2 aria-hidden="true" size={16} /></Button>
                    </ButtonGroup>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </section>

      <SportFormModal initialValue={editingSport} onHide={() => setShowModal(false)} onSubmit={saveSport} show={showModal} />
    </div>
  )
}

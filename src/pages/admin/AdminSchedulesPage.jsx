import { useCallback, useState } from 'react'
import { Alert, Button, ButtonGroup, Table } from 'react-bootstrap'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import ScheduleFormModal from '../../components/admin/ScheduleFormModal'
import StatusBadge from '../../components/admin/StatusBadge'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAsyncData from '../../hooks/useAsyncData'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as assignmentService from '../../services/assignmentService'
import * as scheduleService from '../../services/scheduleService'
import { confirmAdminAction, showAdminError, showAdminSuccess } from '../../utils/adminAlerts'
import { formatTime } from '../../utils/formatters'

const DAY_LABELS = { 1: 'Lunes', 2: 'Martes', 3: 'Miércoles', 4: 'Jueves', 5: 'Viernes', 6: 'Sábado', 7: 'Domingo' }

function scheduleName(schedule) {
  const assignment = schedule.sportRoom || {}
  return `${assignment.sport?.name || 'Deporte no disponible'} · ${assignment.room?.name || 'Sala no disponible'} · ${DAY_LABELS[schedule.day_of_week] || 'Día no disponible'} ${formatTime(schedule.start_time)}`
}

export default function AdminSchedulesPage() {
  const { token } = useAuth()
  const loadSchedules = useCallback(() => scheduleService.listSchedules(token), [token])
  const loadAssignments = useCallback(() => assignmentService.listAssignments(token), [token])
  const { error, isLoading, items: schedules, reload } = useEntityList(loadSchedules)
  const {
    data: assignments, error: referenceError, isLoading: referencesLoading, reload: reloadReferences,
  } = useAsyncData(loadAssignments, [])
  const [showModal, setShowModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState(null)

  const referencesReady = !referencesLoading && !referenceError

  const openCreate = () => {
    if (!referencesReady) return
    setEditingSchedule(null)
    setShowModal(true)
  }

  const openEdit = (schedule) => {
    setEditingSchedule(schedule)
    setShowModal(true)
  }

  const saveSchedule = async (payload) => {
    if (editingSchedule) await scheduleService.updateSchedule(token, editingSchedule.id, payload)
    else await scheduleService.createSchedule(token, payload)

    await reload()
    setShowModal(false)
    setEditingSchedule(null)
    await showAdminSuccess(editingSchedule ? 'Horario actualizado' : 'Horario creado')
  }

  const removeSchedule = async (schedule) => {
    const label = scheduleName(schedule)
    const confirmed = await confirmAdminAction({
      title: 'Eliminar horario',
      text: `Se eliminará ${label}. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
    })
    if (!confirmed) return

    try {
      await scheduleService.deleteSchedule(token, schedule.id)
      await reload()
      await showAdminSuccess('Horario eliminado')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  return (
    <div className="workspace entity-page">
      <AdminPageHeader
        actionDisabled={!referencesReady}
        actionLabel="Nuevo horario"
        context="Programación"
        description="Programa días y horas sobre las asignaciones activas del club."
        icon={Plus}
        onAction={openCreate}
        title="Horarios"
      />

      {referencesLoading && <div className="reference-status"><LoadingState label="Cargando asignaciones disponibles" /></div>}
      {!referencesLoading && referenceError && (
        <Alert className="reference-alert" variant="danger">
          <div><strong>No fue posible cargar las asignaciones.</strong><span>{referenceError.message}</span></div>
          <Button className="icon-text-button" onClick={reloadReferences} variant="outline-danger"><RefreshCw aria-hidden="true" size={16} /> Reintentar referencias</Button>
        </Alert>
      )}

      <section className="entity-table-section" aria-label="Listado de horarios">
        {isLoading && <LoadingState label="Cargando horarios" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && schedules.length === 0 && (
          <EmptyState actionLabel={referencesReady ? 'Crear primer horario' : undefined} description="Programa la primera clase semanal del club." onAction={referencesReady ? openCreate : undefined} title="No hay horarios registrados" />
        )}
        {!isLoading && !error && schedules.length > 0 && (
          <Table className="entity-table" hover responsive>
            <thead><tr><th>Deporte</th><th>Sala</th><th>Entrenador</th><th>Día</th><th>Horario</th><th>Estado</th><th className="actions-column">Acciones</th></tr></thead>
            <tbody>
              {schedules.map((schedule) => {
                const assignment = schedule.sportRoom || {}
                const label = scheduleName(schedule)
                return (
                  <tr key={schedule.id}>
                    <td><strong>{assignment.sport?.name || 'No disponible'}</strong></td>
                    <td>{assignment.room?.name || 'No disponible'}</td>
                    <td>{assignment.coach?.full_name || 'No disponible'}</td>
                    <td>{DAY_LABELS[schedule.day_of_week] || 'No disponible'}</td>
                    <td className="time-range">{formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}</td>
                    <td><StatusBadge active={schedule.status} /></td>
                    <td>
                      <ButtonGroup aria-label={`Acciones para ${label}`} size="sm">
                        <Button aria-label={`Editar ${label}`} onClick={() => openEdit(schedule)} title="Editar horario" variant="outline-secondary"><Pencil aria-hidden="true" size={16} /></Button>
                        <Button aria-label={`Eliminar ${label}`} onClick={() => removeSchedule(schedule)} title="Eliminar horario" variant="outline-danger"><Trash2 aria-hidden="true" size={16} /></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </section>

      <ScheduleFormModal assignments={assignments} initialValue={editingSchedule} onHide={() => setShowModal(false)} onSubmit={saveSchedule} show={showModal} />
    </div>
  )
}

import { useCallback, useState } from 'react'
import { Alert, Button, ButtonGroup, Table } from 'react-bootstrap'
import { Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import AssignmentFormModal from '../../components/admin/AssignmentFormModal'
import StatusBadge from '../../components/admin/StatusBadge'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAsyncData from '../../hooks/useAsyncData'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as assignmentService from '../../services/assignmentService'
import * as roomsService from '../../services/roomsService'
import * as sportsService from '../../services/sportsService'
import * as usersService from '../../services/usersService'
import { confirmAdminAction, showAdminError, showAdminSuccess } from '../../utils/adminAlerts'

const EMPTY_REFERENCES = { sports: [], rooms: [], coaches: [] }

function assignmentName(assignment) {
  return `${assignment.sport?.name || 'Deporte no disponible'} · ${assignment.room?.name || 'Sala no disponible'} · ${assignment.coach?.full_name || 'Entrenador no disponible'}`
}

export default function AdminAssignmentsPage() {
  const { token } = useAuth()
  const loadAssignments = useCallback(() => assignmentService.listAssignments(token), [token])
  const loadReferences = useCallback(async () => {
    const [sports, rooms, coaches] = await Promise.all([
      sportsService.listSports(token),
      roomsService.listRooms(token),
      usersService.listUsers(token, { role: 'coach' }),
    ])
    return { sports, rooms, coaches }
  }, [token])
  const { error, isLoading, items: assignments, reload } = useEntityList(loadAssignments)
  const {
    data: references, error: referenceError, isLoading: referencesLoading, reload: reloadReferences,
  } = useAsyncData(loadReferences, EMPTY_REFERENCES)
  const [showModal, setShowModal] = useState(false)
  const [editingAssignment, setEditingAssignment] = useState(null)

  const referencesReady = !referencesLoading && !referenceError

  const openCreate = () => {
    if (!referencesReady) return
    setEditingAssignment(null)
    setShowModal(true)
  }

  const openEdit = (assignment) => {
    setEditingAssignment(assignment)
    setShowModal(true)
  }

  const saveAssignment = async (payload) => {
    if (editingAssignment) {
      await assignmentService.updateAssignment(token, editingAssignment.id, payload)
    } else {
      await assignmentService.createAssignment(token, payload)
    }
    await reload()
    setShowModal(false)
    setEditingAssignment(null)
    await showAdminSuccess(editingAssignment ? 'Asignación actualizada' : 'Asignación creada')
  }

  const removeAssignment = async (assignment) => {
    const label = assignmentName(assignment)
    const confirmed = await confirmAdminAction({
      title: 'Eliminar asignación',
      text: `Se eliminará ${label}. Verifica antes que no tenga horarios asociados.`,
      confirmText: 'Sí, eliminar',
    })
    if (!confirmed) return

    try {
      await assignmentService.deleteAssignment(token, assignment.id)
      await reload()
      await showAdminSuccess('Asignación eliminada')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  return (
    <div className="workspace entity-page">
      <AdminPageHeader
        actionDisabled={!referencesReady}
        actionLabel="Nueva asignación"
        context="Programación"
        description="Relaciona cada deporte con una sala y el entrenador responsable."
        icon={Plus}
        onAction={openCreate}
        title="Asignaciones"
      />

      {referencesLoading && <div className="reference-status"><LoadingState label="Cargando deportes, salas y entrenadores" /></div>}
      {!referencesLoading && referenceError && (
        <Alert className="reference-alert" variant="danger">
          <div><strong>No fue posible cargar los datos de referencia.</strong><span>{referenceError.message}</span></div>
          <Button className="icon-text-button" onClick={reloadReferences} variant="outline-danger"><RefreshCw aria-hidden="true" size={16} /> Reintentar referencias</Button>
        </Alert>
      )}

      <section className="entity-table-section" aria-label="Listado de asignaciones">
        {isLoading && <LoadingState label="Cargando asignaciones" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && assignments.length === 0 && (
          <EmptyState actionLabel={referencesReady ? 'Crear primera asignación' : undefined} description="Combina un deporte, una sala y un entrenador." onAction={referencesReady ? openCreate : undefined} title="No hay asignaciones registradas" />
        )}
        {!isLoading && !error && assignments.length > 0 && (
          <Table className="entity-table" hover responsive>
            <thead><tr><th>Deporte</th><th>Sala</th><th>Entrenador</th><th>Observación</th><th>Horarios</th><th>Estado</th><th className="actions-column">Acciones</th></tr></thead>
            <tbody>
              {assignments.map((assignment) => {
                const label = assignmentName(assignment)
                return (
                  <tr key={assignment.id}>
                    <td><strong>{assignment.sport?.name || 'No disponible'}</strong></td>
                    <td>{assignment.room?.name || 'No disponible'}</td>
                    <td>{assignment.coach?.full_name || 'No disponible'}</td>
                    <td>{assignment.observation || 'Sin observación'}</td>
                    <td>{assignment.schedules?.length || 0}</td>
                    <td><StatusBadge active={assignment.status} activeLabel="Activa" inactiveLabel="Inactiva" /></td>
                    <td>
                      <ButtonGroup aria-label={`Acciones para ${label}`} size="sm">
                        <Button aria-label={`Editar ${label}`} onClick={() => openEdit(assignment)} title="Editar asignación" variant="outline-secondary"><Pencil aria-hidden="true" size={16} /></Button>
                        <Button aria-label={`Eliminar ${label}`} onClick={() => removeAssignment(assignment)} title="Eliminar asignación" variant="outline-danger"><Trash2 aria-hidden="true" size={16} /></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </section>

      <AssignmentFormModal
        coaches={references.coaches}
        initialValue={editingAssignment}
        onHide={() => setShowModal(false)}
        onSubmit={saveAssignment}
        rooms={references.rooms}
        show={showModal}
        sports={references.sports}
      />
    </div>
  )
}

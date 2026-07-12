import { useCallback, useState } from 'react'
import { Badge, Button, ButtonGroup, Table } from 'react-bootstrap'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import AdminPageHeader from '../../components/admin/AdminPageHeader'
import UserFormModal from '../../components/admin/UserFormModal'
import { EmptyState, ErrorState, LoadingState } from '../../components/feedback/FeedbackStates'
import useAuth from '../../hooks/useAuth'
import useEntityList from '../../hooks/useEntityList'
import * as usersService from '../../services/usersService'
import { confirmAdminAction, showAdminError, showAdminSuccess } from '../../utils/adminAlerts'
import { formatDate } from '../../utils/formatters'

const ROLE_LABELS = { admin: 'Administrador', coach: 'Entrenador', user: 'Usuario' }
const ROLE_VARIANTS = { admin: 'danger', coach: 'success', user: 'primary' }

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth()
  const loadUsers = useCallback(() => usersService.listUsers(token), [token])
  const { error, isLoading, items: users, reload } = useEntityList(loadUsers)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  const openCreate = () => {
    setEditingUser(null)
    setShowModal(true)
  }

  const openEdit = (user) => {
    setEditingUser(user)
    setShowModal(true)
  }

  const saveUser = async (payload) => {
    if (editingUser) await usersService.updateUser(token, editingUser.id, payload)
    else await usersService.createUser(token, payload)

    await reload()
    setShowModal(false)
    setEditingUser(null)
    await showAdminSuccess(editingUser ? 'Usuario actualizado' : 'Usuario creado')
  }

  const removeUser = async (user) => {
    if (user.id === currentUser.id) return
    const confirmed = await confirmAdminAction({
      title: 'Eliminar usuario',
      text: `Se eliminará a ${user.full_name}. Esta acción no se puede deshacer.`,
      confirmText: 'Sí, eliminar',
    })
    if (!confirmed) return

    try {
      await usersService.deleteUser(token, user.id)
      await reload()
      await showAdminSuccess('Usuario eliminado')
    } catch (requestError) {
      await showAdminError(requestError)
    }
  }

  return (
    <div className="workspace entity-page">
      <AdminPageHeader
        actionLabel="Nuevo usuario"
        context="Administración"
        description="Crea cuentas, asigna roles y mantén actualizados los datos de acceso."
        icon={Plus}
        onAction={openCreate}
        title="Usuarios"
      />

      <section className="entity-table-section" aria-label="Listado de usuarios">
        {isLoading && <LoadingState label="Cargando usuarios" />}
        {!isLoading && error && <ErrorState message={error.message} onRetry={reload} />}
        {!isLoading && !error && users.length === 0 && (
          <EmptyState actionLabel="Crear primer usuario" description="Agrega la primera cuenta para comenzar." onAction={openCreate} title="No hay usuarios registrados" />
        )}
        {!isLoading && !error && users.length > 0 && (
          <Table className="entity-table" hover responsive>
            <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Nacimiento</th><th>Deportes</th><th className="actions-column">Acciones</th></tr></thead>
            <tbody>
              {users.map((user) => {
                const isCurrent = user.id === currentUser.id
                return (
                  <tr key={user.id}>
                    <td><strong>{user.full_name}</strong>{isCurrent && <span className="current-user-label">Tu cuenta</span>}</td>
                    <td>{user.email}</td>
                    <td><Badge bg={ROLE_VARIANTS[user.role] || 'secondary'}>{ROLE_LABELS[user.role] || user.role}</Badge></td>
                    <td>{formatDate(user.birth_date)}</td>
                    <td>{user.metadata?.sports?.length || 0}</td>
                    <td>
                      <ButtonGroup aria-label={`Acciones para ${user.full_name}`} size="sm">
                        <Button aria-label={`Editar ${user.full_name}`} onClick={() => openEdit(user)} title="Editar usuario" variant="outline-secondary"><Pencil aria-hidden="true" size={16} /></Button>
                        <Button aria-label={`Eliminar ${user.full_name}`} disabled={isCurrent} onClick={() => removeUser(user)} title={isCurrent ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'} variant="outline-danger"><Trash2 aria-hidden="true" size={16} /></Button>
                      </ButtonGroup>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}
      </section>

      <UserFormModal initialValue={editingUser} onHide={() => setShowModal(false)} onSubmit={saveUser} show={showModal} />
    </div>
  )
}

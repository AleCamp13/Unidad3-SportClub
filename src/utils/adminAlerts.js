import Swal from 'sweetalert2'

export async function confirmAdminAction({ title, text, confirmText }) {
  const result = await Swal.fire({
    title,
    text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#c83a30',
    cancelButtonColor: '#5d5968',
    focusCancel: true,
    reverseButtons: true,
  })
  return result.isConfirmed
}

export function showAdminSuccess(title) {
  return Swal.fire({
    title,
    icon: 'success',
    timer: 1500,
    timerProgressBar: true,
    showConfirmButton: false,
  })
}

export function showAdminError(error) {
  return Swal.fire({
    title: 'No fue posible completar la operación',
    text: error?.message || 'Ocurrió un error inesperado.',
    icon: 'error',
    confirmButtonText: 'Entendido',
    confirmButtonColor: '#2e1a47',
  })
}

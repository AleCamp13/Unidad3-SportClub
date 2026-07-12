import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { EmptyState, ErrorState, LoadingState } from './FeedbackStates'

describe('feedback states', () => {
  it('announces loading progress', () => {
    render(<LoadingState label="Cargando deportes" />)

    expect(screen.getByRole('status')).toHaveTextContent('Cargando deportes')
  })

  it('renders an empty state with optional action', async () => {
    const onAction = vi.fn()
    render(<EmptyState title="Sin reservas" actionLabel="Explorar clases" onAction={onAction} />)

    await userEvent.click(screen.getByRole('button', { name: 'Explorar clases' }))
    expect(onAction).toHaveBeenCalledOnce()
  })

  it('renders an alert and retries after an error', async () => {
    const onRetry = vi.fn()
    render(<ErrorState message="No se pudo cargar" onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('No se pudo cargar')
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})

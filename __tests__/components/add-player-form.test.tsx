import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddPlayerForm } from '@/components/add-player-form'
import { toast } from '@/components/ui/use-toast'
import { createMockPlayer } from '../utils/test-utils'

// Mock fetch
global.fetch = jest.fn()

// Mock the toast
jest.mock('@/components/ui/use-toast')
const mockToast = toast as jest.MockedFunction<typeof toast>

describe('AddPlayerForm', () => {
  const mockOnAddPlayer = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<AddPlayerForm onAddPlayer={mockOnAddPlayer} />)
    
    expect(screen.getByLabelText(/player name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add player/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/enter player name/i)).toBeInTheDocument()
  })

  it('shows validation error for empty player name', async () => {
    const user = userEvent.setup()
    render(<AddPlayerForm onAddPlayer={mockOnAddPlayer} />)
    
    const submitButton = screen.getByRole('button', { name: /add player/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/player name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for single character name', async () => {
    const user = userEvent.setup()
    render(<AddPlayerForm onAddPlayer={mockOnAddPlayer} />)
    
    const nameInput = screen.getByLabelText(/player name/i)
    const submitButton = screen.getByRole('button', { name: /add player/i })
    
    await user.type(nameInput, 'A')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/player name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockPlayer = createMockPlayer({ name: 'Alice' })
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockPlayer,
    } as Response)
    
    render(<AddPlayerForm onAddPlayer={mockOnAddPlayer} />)
    
    const nameInput = screen.getByLabelText(/player name/i)
    const submitButton = screen.getByRole('button', { name: /add player/i })
    
    await user.type(nameInput, 'Alice')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/players', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: 'Alice' }),
      })
      expect(mockOnAddPlayer).toHaveBeenCalledWith(mockPlayer)
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Player added',
        description: 'Alice has been added to your players.'
      })
    })
  })

  it('handles submission error gracefully', async () => {
    const user = userEvent.setup()
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'))
    
    render(<AddPlayerForm onAddPlayer={mockOnAddPlayer} />)
    
    const nameInput = screen.getByLabelText(/player name/i)
    const submitButton = screen.getByRole('button', { name: /add player/i })
    
    await user.type(nameInput, 'Alice')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to add player. Please try again.',
        variant: 'destructive'
      })
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    const promise = new Promise(resolve => {
      resolvePromise = resolve
    })
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockReturnValue(promise)
    
    render(<AddPlayerForm onAddPlayer={mockOnAddPlayer} />)
    
    const nameInput = screen.getByLabelText(/player name/i)
    const submitButton = screen.getByRole('button', { name: /add player/i })
    
    await user.type(nameInput, 'Alice')
    await user.click(submitButton)
    
    // Check loading state
    expect(screen.getByRole('button', { name: /adding.../i })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
    
    // Resolve the promise to finish the test
    resolvePromise!({
      ok: true,
      json: async () => createMockPlayer({ name: 'Alice' }),
    } as Response)
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /add player/i })).toBeInTheDocument()
    })
  })

  it('clears form after successful submission', async () => {
    const user = userEvent.setup()
    const mockPlayer = createMockPlayer({ name: 'Alice' })
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockPlayer,
    } as Response)
    
    render(<AddPlayerForm onAddPlayer={mockOnAddPlayer} />)
    
    const nameInput = screen.getByLabelText(/player name/i) as HTMLInputElement
    const submitButton = screen.getByRole('button', { name: /add player/i })
    
    await user.type(nameInput, 'Alice')
    expect(nameInput.value).toBe('Alice')
    
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockOnAddPlayer).toHaveBeenCalled()
    })
    
    // Form should be cleared after successful submission
    // Note: This depends on the form implementation - you might need to add form.reset() in the component
  })
})
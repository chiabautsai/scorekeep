import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddGameForm } from '@/components/add-game-form'
import { addGame } from '@/lib/db/queries'
import { toast } from '@/components/ui/use-toast'

// Mock the data layer
jest.mock('@/lib/db/queries')
const mockAddGame = addGame as jest.MockedFunction<typeof addGame>

// Mock the toast
jest.mock('@/components/ui/use-toast')
const mockToast = toast as jest.MockedFunction<typeof toast>

describe('AddGameForm', () => {
  const mockOnAddGame = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders form fields correctly', () => {
    render(<AddGameForm onAddGame={mockOnAddGame} />)
    
    expect(screen.getByLabelText(/game name/i)).toBeInTheDocument()
    expect(screen.getByText(/scoring template/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /add game/i })).toBeInTheDocument()
    expect(screen.getByRole('radiogroup')).toBeInTheDocument()
  })

  it('shows validation error for empty game name', async () => {
    const user = userEvent.setup()
    render(<AddGameForm onAddGame={mockOnAddGame} />)
    
    const submitButton = screen.getByRole('button', { name: /add game/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/game name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('renders all template options including 7 Wonders', () => {
    render(<AddGameForm onAddGame={mockOnAddGame} />)
    
    expect(screen.getByLabelText(/generic/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/catan/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/ticket to ride/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/wingspan/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/7 wonders/i)).toBeInTheDocument()
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    const mockGame = { id: '1', name: 'Test Game', template: 'generic' }
    mockAddGame.mockResolvedValue(mockGame)
    
    render(<AddGameForm onAddGame={mockOnAddGame} />)
    
    const nameInput = screen.getByLabelText(/game name/i)
    const genericRadio = screen.getByLabelText(/generic/i)
    const submitButton = screen.getByRole('button', { name: /add game/i })
    
    await user.type(nameInput, 'Test Game')
    await user.click(genericRadio)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddGame).toHaveBeenCalledWith({
        name: 'Test Game',
        template: 'generic'
      })
      expect(mockOnAddGame).toHaveBeenCalledWith(mockGame)
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Game added',
        description: 'Test Game has been added to your library.'
      })
    })
  })

  it('submits form with 7 Wonders template', async () => {
    const user = userEvent.setup()
    const mockGame = { id: '2', name: '7 Wonders', template: 'seven-wonders' }
    mockAddGame.mockResolvedValue(mockGame)
    
    render(<AddGameForm onAddGame={mockOnAddGame} />)
    
    const nameInput = screen.getByLabelText(/game name/i)
    const sevenWondersRadio = screen.getByLabelText(/7 wonders/i)
    const submitButton = screen.getByRole('button', { name: /add game/i })
    
    await user.type(nameInput, '7 Wonders')
    await user.click(sevenWondersRadio)
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockAddGame).toHaveBeenCalledWith({
        name: '7 Wonders',
        template: 'seven-wonders'
      })
      expect(mockOnAddGame).toHaveBeenCalledWith(mockGame)
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Game added',
        description: '7 Wonders has been added to your library.'
      })
    })
  })



  it('handles submission error', async () => {
    const user = userEvent.setup()
    mockAddGame.mockRejectedValue(new Error('Failed to add game'))
    
    render(<AddGameForm onAddGame={mockOnAddGame} />)
    
    const nameInput = screen.getByLabelText(/game name/i)
    const submitButton = screen.getByRole('button', { name: /add game/i })
    
    await user.type(nameInput, 'Test Game')
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to add game. Please try again.',
        variant: 'destructive'
      })
    })
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    mockAddGame.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
    
    render(<AddGameForm onAddGame={mockOnAddGame} />)
    
    const nameInput = screen.getByLabelText(/game name/i)
    const submitButton = screen.getByRole('button', { name: /add game/i })
    
    await user.type(nameInput, 'Test Game')
    await user.click(submitButton)
    
    expect(screen.getByRole('button', { name: /adding.../i })).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })
})
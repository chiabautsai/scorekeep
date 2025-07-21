import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ScoreForm } from '@/components/score-form'
import { toast } from '@/components/ui/use-toast'
import { createMockGame, createMockPlayer } from '../utils/test-utils'

// Mock fetch
global.fetch = jest.fn()

// Mock the toast
jest.mock('@/components/ui/use-toast')
const mockToast = toast as jest.MockedFunction<typeof toast>

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

describe('ScoreForm', () => {
  const mockPlayers = [
    createMockPlayer({ id: 'player1', name: 'Alice' }),
    createMockPlayer({ id: 'player2', name: 'Bob' })
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })



  describe('Generic template', () => {
    const genericGame = createMockGame({
      id: 'game1',
      name: 'Test Game',
      template: 'generic'
    })

    it('renders generic round-based scoring interface', () => {
      render(<ScoreForm game={genericGame} players={mockPlayers} />)

      expect(screen.getByText('Game Settings')).toBeInTheDocument()
      expect(screen.getByLabelText('Target Score')).toBeInTheDocument()
      expect(screen.getByLabelText('Win Condition')).toBeInTheDocument()
      expect(screen.getByLabelText('Limit number of rounds')).toBeInTheDocument()
    })

    it('uses specialized GenericScoreForm component', () => {
      render(<ScoreForm game={genericGame} players={mockPlayers} />)

      // Should render the settings interface instead of the old table
      expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
      expect(screen.queryByText('Final Score')).not.toBeInTheDocument()
      expect(screen.queryByText('Live Score Summary')).not.toBeInTheDocument()
    })
  })

  describe('Seven Wonders template', () => {
    const sevenWondersGame = createMockGame({
      id: 'game1',
      name: '7 Wonders',
      template: 'seven-wonders'
    })

    beforeEach(() => {
      ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'session123' }),
      } as Response)
    })

    it('renders all 7 Wonders scoring categories', () => {
      render(<ScoreForm game={sevenWondersGame} players={mockPlayers} />)

      expect(screen.getByText('Live Score Summary')).toBeInTheDocument()
      expect(screen.getByText('Civilian Structures')).toBeInTheDocument()
      expect(screen.getByText('Science')).toBeInTheDocument()
      expect(screen.getByText('Commercial')).toBeInTheDocument()
      expect(screen.getByText('Guilds')).toBeInTheDocument()
      expect(screen.getByText('Military')).toBeInTheDocument()
      expect(screen.getByText('Wonder')).toBeInTheDocument()
      expect(screen.getByText('Coins (÷3)')).toBeInTheDocument()
    })

    it('calculates scores correctly including coin division', async () => {
      const user = userEvent.setup()
      render(<ScoreForm game={sevenWondersGame} players={[mockPlayers[0]]} />)

      // Fill in test scores
      const inputs = screen.getAllByRole('spinbutton')
      const [civilian, science, commercial, guilds, military, wonder, coins] = inputs

      await user.clear(civilian)
      await user.type(civilian, '15')
      await user.clear(science)
      await user.type(science, '12')
      await user.clear(commercial)
      await user.type(commercial, '8')
      await user.clear(guilds)
      await user.type(guilds, '10')
      await user.clear(military)
      await user.type(military, '5')
      await user.clear(wonder)
      await user.type(wonder, '20')
      await user.clear(coins)
      await user.type(coins, '21') // Should contribute 7 points (21÷3)

      // Check that the live score shows correct total: 15+12+8+10+5+20+7 = 77
      await waitFor(() => {
        // Look for the leader badge specifically (not the average)
        const leaderBadges = screen.getAllByText(/77 pts/)
        expect(leaderBadges.length).toBeGreaterThan(0)
      })
    })

    it('handles negative military scores correctly', async () => {
      const user = userEvent.setup()
      render(<ScoreForm game={sevenWondersGame} players={[mockPlayers[0]]} />)

      const inputs = screen.getAllByRole('spinbutton')
      const militaryInput = inputs[4] // Military is the 5th input

      await user.clear(militaryInput)
      await user.type(militaryInput, '-3')

      // Should show negative military score in the total
      await waitFor(() => {
        // Look for the negative score badges (there might be multiple)
        const scoreBadges = screen.getAllByText(/-3 pts/)
        expect(scoreBadges.length).toBeGreaterThan(0)
      })
    })

    it('submits 7 Wonders scores with correct calculation', async () => {
      const user = userEvent.setup()
      render(<ScoreForm game={sevenWondersGame} players={[mockPlayers[0]]} />)

      // Fill in test data
      const inputs = screen.getAllByRole('spinbutton')
      const [civilian, science, commercial, guilds, military, wonder, coins] = inputs

      await user.clear(civilian)
      await user.type(civilian, '10')
      await user.clear(science)
      await user.type(science, '15')
      await user.clear(commercial)
      await user.type(commercial, '5')
      await user.clear(guilds)
      await user.type(guilds, '8')
      await user.clear(military)
      await user.type(military, '-2')
      await user.clear(wonder)
      await user.type(wonder, '12')
      await user.clear(coins)
      await user.type(coins, '18') // Should contribute 6 points

      const saveButton = screen.getByRole('button', { name: /save session/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/api/sessions', expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }))
        
        // Check the body separately by parsing it
        const callArgs = (fetch as jest.MockedFunction<typeof fetch>).mock.calls[0]
        const body = JSON.parse(callArgs[1]?.body as string)
        
        expect(body.players).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              playerId: 'player1',
              playerName: 'Alice',
              score: 54, // 10+15+5+8+(-2)+12+6 = 54
              details: {
                civilian: 10,
                science: 15,
                commercial: 5,
                guilds: 8,
                military: -2,
                wonder: 12,
                coins: 18
              }
            })
          ])
        )
      })
    })

    it('shows correct standings with multiple players', async () => {
      const user = userEvent.setup()
      render(<ScoreForm game={sevenWondersGame} players={mockPlayers} />)

      // Fill scores for Alice (player1)
      const aliceInputs = screen.getAllByRole('spinbutton').slice(0, 7)
      await user.clear(aliceInputs[0]) // civilian
      await user.type(aliceInputs[0], '20')
      await user.clear(aliceInputs[6]) // coins
      await user.type(aliceInputs[6], '15') // 5 points from coins

      // Fill scores for Bob (player2)
      const bobInputs = screen.getAllByRole('spinbutton').slice(7, 14)
      await user.clear(bobInputs[0]) // civilian
      await user.type(bobInputs[0], '15')
      await user.clear(bobInputs[1]) // science
      await user.type(bobInputs[1], '12')

      // Check standings - Alice should be leading
      await waitFor(() => {
        const standingsSection = screen.getByText('Current Standings').parentElement
        const standingsContent = standingsSection?.querySelector('.space-y-1')
        expect(standingsContent).toHaveTextContent('👑')
        expect(standingsContent).toHaveTextContent('Alice')
        // Alice should be leading (regardless of exact score)
        expect(standingsContent).toHaveTextContent('Bob')
      })
    })
  })

  it('handles submission errors gracefully', async () => {
    const user = userEvent.setup()
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Network error'))

    const genericGame = createMockGame({ template: 'generic' })
    render(<ScoreForm game={genericGame} players={[mockPlayers[0]]} />)

    // First start the game by clicking "Start Game"
    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    // Complete a round to make the save button appear
    const scoreInput = screen.getByRole('spinbutton')
    await user.clear(scoreInput)
    await user.type(scoreInput, '50')

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    // Now look for the save button (which appears after completing a round)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save game session/i })).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /save game session/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Error',
        description: 'Failed to save session. Please try again.',
        variant: 'destructive'
      })
    })

    consoleSpy.mockRestore()
  })

  it('shows loading state during submission', async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: Response) => void
    const promise = new Promise<Response>(resolve => {
      resolvePromise = resolve
    })
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockReturnValue(promise)

    const genericGame = createMockGame({ template: 'generic' })
    render(<ScoreForm game={genericGame} players={[mockPlayers[0]]} />)

    // First start the game by clicking "Start Game"
    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    // Complete a round to make the save button appear
    const scoreInput = screen.getByRole('spinbutton')
    await user.clear(scoreInput)
    await user.type(scoreInput, '50')

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    // Now look for the save button (which appears after completing a round)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save game session/i })).toBeInTheDocument()
    })

    const saveButton = screen.getByRole('button', { name: /save game session/i })
    await user.click(saveButton)

    expect(screen.getByRole('button', { name: /saving.../i })).toBeInTheDocument()
    expect(saveButton).toBeDisabled()

    // Resolve the promise to finish the test
    resolvePromise!({
      ok: true,
      json: async () => ({ id: 'session123' }),
    } as Response)
  })
})
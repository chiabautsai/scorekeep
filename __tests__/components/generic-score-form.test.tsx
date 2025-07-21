import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GenericScoreForm } from '@/components/generic-score-form'
import { saveSession } from '@/lib/db/queries'
import { toast } from '@/components/ui/use-toast'
import { createMockGame, createMockPlayer } from '../utils/test-utils'

// Mock the data layer
jest.mock('@/lib/db/queries')
const mockSaveSession = saveSession as jest.MockedFunction<typeof saveSession>

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

describe('GenericScoreForm', () => {
  const genericGame = createMockGame({
    id: 'game1',
    name: 'Test Game',
    template: 'generic'
  })

  const mockPlayers = [
    createMockPlayer({ id: 'player1', name: 'Alice' }),
    createMockPlayer({ id: 'player2', name: 'Bob' })
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders game settings initially', () => {
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    expect(screen.getByText('Game Settings')).toBeInTheDocument()
    expect(screen.getByLabelText('Target Score')).toBeInTheDocument()
    expect(screen.getByLabelText('Win Condition')).toBeInTheDocument()
    expect(screen.getByLabelText('Limit number of rounds')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start game/i })).toBeInTheDocument()
  })

  it('configures game settings and starts game', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Configure settings
    const targetScoreInput = screen.getByLabelText('Target Score')
    await user.clear(targetScoreInput)
    await user.type(targetScoreInput, '50')

    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Test Game - Round 1')).toBeInTheDocument()
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Settings updated',
        description: 'Game configured: Highest score wins at 50 points'
      })
    })
  })

  it('plays multiple rounds and tracks scores', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Start game with default settings
    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    // Enter scores for round 1
    const aliceScoreInput = screen.getAllByRole('spinbutton')[0]
    const bobScoreInput = screen.getAllByRole('spinbutton')[1]

    await user.clear(aliceScoreInput)
    await user.type(aliceScoreInput, '25')
    await user.clear(bobScoreInput)
    await user.type(bobScoreInput, '30')

    // Complete round 1
    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    await waitFor(() => {
      expect(screen.getByText('Test Game - Round 2')).toBeInTheDocument()
      expect(screen.getByText('Score History')).toBeInTheDocument()
      expect(screen.getByText('Round 1')).toBeInTheDocument()
      expect(screen.getAllByText('25')).toHaveLength(3) // Alice's score appears in summary, table and totals
      expect(screen.getAllByText('30')).toHaveLength(2) // Bob's score appears in table and totals
    })
  })

  it('detects winner when target score is reached (highest wins)', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Configure for quick win
    const targetScoreInput = screen.getByLabelText('Target Score')
    await user.clear(targetScoreInput)
    await user.type(targetScoreInput, '50')

    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    // Enter winning score for Alice
    const aliceScoreInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(aliceScoreInput)
    await user.type(aliceScoreInput, '60') // Above target of 50

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    await waitFor(() => {
      expect(screen.getByText('🎉 Alice Wins!')).toBeInTheDocument()
      expect(mockToast).toHaveBeenCalledWith({
        title: '🎉 Game Over!',
        description: 'Alice wins! Reached target score of 50!'
      })
    })
  })

  it('detects winner when target score is reached (highest wins logic)', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Test highest wins logic with target score
    // Alice: 20, Bob: 50 -> no winner yet
    // Alice: 30 (total 50), Bob: 100 (total 150) -> Bob wins (reaches target first)

    const targetScoreInput = screen.getByLabelText('Target Score')
    await user.clear(targetScoreInput)
    await user.type(targetScoreInput, '100') // Set target to 100

    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    // Round 1: Alice 20, Bob 50 - no winner yet
    const aliceScoreInput1 = screen.getAllByRole('spinbutton')[0]
    const bobScoreInput1 = screen.getAllByRole('spinbutton')[1]

    await user.clear(aliceScoreInput1)
    await user.type(aliceScoreInput1, '20')
    await user.clear(bobScoreInput1)
    await user.type(bobScoreInput1, '50')

    let completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    // Should continue to round 2
    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 2')).toBeInTheDocument()
    })

    // Round 2: Alice 30 (total 50), Bob 100 (total 150) - Bob reaches target, Bob wins
    const aliceScoreInput2 = screen.getAllByRole('spinbutton')[0]
    const bobScoreInput2 = screen.getAllByRole('spinbutton')[1]

    await user.clear(aliceScoreInput2)
    await user.type(aliceScoreInput2, '30')
    await user.clear(bobScoreInput2)
    await user.type(bobScoreInput2, '100')

    completeRoundButton = screen.getByRole('button', { name: /complete round 2/i })
    await user.click(completeRoundButton)

    await waitFor(() => {
      expect(screen.getByText('🎉 Bob Wins!')).toBeInTheDocument()
      expect(mockToast).toHaveBeenCalledWith({
        title: '🎉 Game Over!',
        description: 'Bob wins! Reached target score of 100!'
      })
    })
  })

  it('ends game when max rounds reached', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Configure for max rounds - get the second switch (max rounds)
    const maxRoundsSwitch = screen.getByLabelText('Limit number of rounds')
    await user.click(maxRoundsSwitch)

    await waitFor(() => {
      expect(screen.getByLabelText('Maximum Rounds')).toBeInTheDocument()
    })

    const maxRoundsInput = screen.getByLabelText('Maximum Rounds')
    await user.clear(maxRoundsInput)
    await user.type(maxRoundsInput, '1') // Only 1 round

    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    // Enter scores
    const aliceScoreInput = screen.getAllByRole('spinbutton')[0]
    const bobScoreInput = screen.getAllByRole('spinbutton')[1]

    await user.clear(aliceScoreInput)
    await user.type(aliceScoreInput, '25')
    await user.clear(bobScoreInput)
    await user.type(bobScoreInput, '20')

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    await waitFor(() => {
      expect(screen.getByText('🎉 Alice Wins!')).toBeInTheDocument() // Alice has higher score
      expect(mockToast).toHaveBeenCalledWith({
        title: '🎉 Game Over!',
        description: 'Alice wins! Maximum rounds (1) reached!'
      })
    })
  })

  it('shows real-time summary with game progress', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    // Complete one round to show summary
    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    const aliceScoreInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(aliceScoreInput)
    await user.type(aliceScoreInput, '25')

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    await waitFor(() => {
      expect(screen.getByText('Game Summary')).toBeInTheDocument()
      expect(screen.getByText('Current Leader')).toBeInTheDocument()
      expect(screen.getByText('Game Progress')).toBeInTheDocument()
      expect(screen.getByText('Current Standings')).toBeInTheDocument()
      expect(screen.getAllByText('Alice')).toHaveLength(3) // Leader, standings, and score history table
      expect(screen.getByText('25 pts')).toBeInTheDocument() // Score
    })
  })

  it('saves session with correct data', async () => {
    const user = userEvent.setup()
    mockSaveSession.mockResolvedValue('session123')

    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Start and complete a round
    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    const aliceScoreInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(aliceScoreInput)
    await user.type(aliceScoreInput, '25')

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /save game session/i })).toBeInTheDocument()
    })

    // Save the session
    const saveButton = screen.getByRole('button', { name: /save game session/i })
    await user.click(saveButton)

    await waitFor(() => {
      expect(mockSaveSession).toHaveBeenCalledWith({
        gameId: 'game1',
        gameName: 'Test Game',
        date: expect.any(String),
        players: expect.arrayContaining([
          expect.objectContaining({
            playerId: 'player1',
            playerName: 'Alice',
            score: 25,
            details: expect.objectContaining({
              rounds: expect.any(Array),
              totalRounds: 1,
              gameSettings: expect.objectContaining({
                scoreToWin: 100,
                winCondition: 'highest'
              })
            })
          })
        ])
      })
    })
  })

  it('allows settings modification before first round', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Start game
    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Test Game - Round 1')).toBeInTheDocument()
    })

    // Settings button should be enabled before any rounds - look for settings button by aria-label or test-id
    const settingsButton = screen.getByRole('button', { name: /settings/i })
    expect(settingsButton).not.toBeDisabled()

    await user.click(settingsButton)

    await waitFor(() => {
      expect(screen.getByText('Game Settings')).toBeInTheDocument()
    })
  })

  it('handles optional target score (no target score set)', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Disable target score
    const targetScoreSwitch = screen.getByLabelText('Set target score')
    await user.click(targetScoreSwitch) // Turn off target score

    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    await waitFor(() => {
      expect(screen.getByText('Test Game - Round 1')).toBeInTheDocument()
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Settings updated',
        description: 'Game configured: Highest score wins (no target score)'
      })
    })

    // Complete a round
    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    const aliceScoreInput = screen.getAllByRole('spinbutton')[0]
    await user.clear(aliceScoreInput)
    await user.type(aliceScoreInput, '25')

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    // Should show "End Game Now" button since no target score
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /end game now/i })).toBeInTheDocument()
      expect(screen.getByText((content, element) => {
        return element?.textContent === 'Target: None'
      })).toBeInTheDocument()
    })
  })

  it('allows manual game ending when no target score is set', async () => {
    const user = userEvent.setup()
    render(<GenericScoreForm game={genericGame} players={mockPlayers} />)

    // Disable target score
    const targetScoreSwitch = screen.getByLabelText('Set target score')
    await user.click(targetScoreSwitch)

    const startButton = screen.getByRole('button', { name: /start game/i })
    await user.click(startButton)

    // Complete a round to enable manual end game
    await waitFor(() => {
      expect(screen.getByText('Enter Scores for Round 1')).toBeInTheDocument()
    })

    const aliceScoreInput = screen.getAllByRole('spinbutton')[0]
    const bobScoreInput = screen.getAllByRole('spinbutton')[1]

    await user.clear(aliceScoreInput)
    await user.type(aliceScoreInput, '25')
    await user.clear(bobScoreInput)
    await user.type(bobScoreInput, '20')

    const completeRoundButton = screen.getByRole('button', { name: /complete round 1/i })
    await user.click(completeRoundButton)

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /end game now/i })).toBeInTheDocument()
    })

    // Manually end the game
    const endGameButton = screen.getByRole('button', { name: /end game now/i })
    await user.click(endGameButton)

    // Wait for the game over banner to appear
    await waitFor(() => {
      expect(screen.getByText('🎉 GAME OVER! 🎉')).toBeInTheDocument()
      expect(screen.getByText('Alice is the Champion!')).toBeInTheDocument()
    })

    expect(mockToast).toHaveBeenCalledWith({
      title: '🎉 Game Over!',
      description: 'Alice wins! Game ended manually.'
    })
  })
})
import { render, screen, waitFor } from '@testing-library/react'
import { PlayerStats } from '@/components/player-stats'

// Mock fetch
global.fetch = jest.fn()

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

describe('PlayerStats', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('shows loading state initially', () => {
    (fetch as jest.MockedFunction<typeof fetch>).mockImplementation(() => new Promise(() => {})) // Never resolves
    
    render(<PlayerStats />)
    
    expect(screen.getAllByTestId('skeleton')).toHaveLength(3)
  })

  it('displays player stats correctly', async () => {
    const mockStats = [
      {
        id: '1',
        name: 'Alice',
        winRate: 75,
        gamesPlayed: 4,
        wins: 3
      },
      {
        id: '2',
        name: 'Bob',
        winRate: 50,
        gamesPlayed: 2,
        wins: 1
      }
    ]
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockStats,
    } as Response)
    
    render(<PlayerStats />)
    
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
      expect(screen.getByText('Bob')).toBeInTheDocument()
      expect(screen.getByText('75%')).toBeInTheDocument()
      expect(screen.getByText('50%')).toBeInTheDocument()
      expect(screen.getByText('3 wins')).toBeInTheDocument()
      expect(screen.getByText('1 wins')).toBeInTheDocument()
      expect(screen.getByText('4 games')).toBeInTheDocument()
      expect(screen.getByText('2 games')).toBeInTheDocument()
    })
    
    expect(fetch).toHaveBeenCalledWith('/api/players/stats')
  })

  it('shows empty state when no players exist', async () => {
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response)
    
    render(<PlayerStats />)
    
    await waitFor(() => {
      expect(screen.getByText('No player data available.')).toBeInTheDocument()
      expect(screen.getByText('Add players when you start a new session!')).toBeInTheDocument()
    })
  })

  it('handles error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    ;(fetch as jest.MockedFunction<typeof fetch>).mockRejectedValue(new Error('Failed to load'))
    
    render(<PlayerStats />)
    
    await waitFor(() => {
      expect(screen.getByText('No player data available.')).toBeInTheDocument()
    })
    
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load player stats:', expect.any(Error))
    consoleSpy.mockRestore()
  })

  it('creates correct links to player pages', async () => {
    const mockStats = [
      {
        id: '1',
        name: 'Alice',
        winRate: 75,
        gamesPlayed: 4,
        wins: 3
      }
    ]
    
    ;(fetch as jest.MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockStats,
    } as Response)
    
    render(<PlayerStats />)
    
    await waitFor(() => {
      const link = screen.getByRole('link')
      expect(link).toHaveAttribute('href', '/players/1')
    })
  })
})
import { 
  getPlayers, 
  addPlayer, 
  getGames, 
  addGame, 
  getSessions, 
  saveSession,
  getPlayerStats,
  getPopularGames,
  getRecentSessions
} from '@/lib/data'

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
})

describe('Data Layer', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockLocalStorage.getItem.mockReturnValue(null)
  })

  describe('Player functions', () => {
    it('should return empty array when no players exist', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const players = await getPlayers()
      
      expect(players).toEqual([])
    })

    it('should return existing players from localStorage', async () => {
      const mockPlayers = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' }
      ]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(mockPlayers))
      
      const players = await getPlayers()
      
      expect(players).toEqual(mockPlayers)
    })

    it('should add a new player', async () => {
      const existingPlayers = [{ id: '1', name: 'Alice' }]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingPlayers))
      
      const newPlayer = await addPlayer({ name: 'Bob' })
      
      expect(newPlayer).toHaveProperty('id')
      expect(newPlayer.name).toBe('Bob')
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'players',
        expect.stringContaining('Bob')
      )
    })
  })

  describe('Game functions', () => {
    it('should return empty array when no games exist', async () => {
      mockLocalStorage.getItem.mockReturnValue(null)
      
      const games = await getGames()
      
      expect(games).toEqual([])
    })

    it('should add a new game', async () => {
      const existingGames = [{ id: '1', name: 'Chess', template: 'generic' }]
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingGames))
      
      const newGame = await addGame({ name: 'Catan', template: 'catan' })
      
      expect(newGame).toHaveProperty('id')
      expect(newGame.name).toBe('Catan')
      expect(newGame.template).toBe('catan')
    })
  })

  describe('Session functions', () => {
    it('should save a new session', async () => {
      const existingSessions = []
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(existingSessions))
      
      const sessionData = {
        gameId: '1',
        gameName: 'Test Game',
        date: '2024-01-01',
        players: [
          { playerId: '1', playerName: 'Alice', score: 100, rank: 1, details: {} }
        ]
      }
      
      const sessionId = await saveSession(sessionData)
      
      expect(sessionId).toBeDefined()
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'sessions',
        expect.stringContaining('Test Game')
      )
    })
  })

  describe('Stats functions', () => {
    it('should calculate player stats correctly', async () => {
      const mockPlayers = [
        { id: '1', name: 'Alice' },
        { id: '2', name: 'Bob' }
      ]
      const mockSessions = [
        {
          id: '1',
          gameId: '1',
          gameName: 'Test Game',
          date: '2024-01-01',
          players: [
            { playerId: '1', playerName: 'Alice', score: 100, rank: 1, details: {} },
            { playerId: '2', playerName: 'Bob', score: 80, rank: 2, details: {} }
          ]
        }
      ]
      
      // Mock localStorage to return our test data
      mockLocalStorage.getItem.mockImplementation((key: string) => {
        if (key === 'players') return JSON.stringify(mockPlayers)
        if (key === 'sessions') return JSON.stringify(mockSessions)
        return null
      })
      
      const stats = await getPlayerStats()
      
      expect(stats).toHaveLength(2)
      expect(stats[0].name).toBe('Alice')
      expect(stats[0].winRate).toBe(100)
      expect(stats[0].wins).toBe(1)
      expect(stats[0].gamesPlayed).toBe(1)
    })
  })
})
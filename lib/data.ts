// This is a mock data layer that would be replaced with a real database in production
// For this MVP, we'll use localStorage to persist data between page refreshes

import { v4 as uuidv4 } from "uuid"

// Type definitions
type Player = {
  id: string
  name: string
}

type Game = {
  id: string
  name: string
  template: string
}

type PlayerScore = {
  playerId: string
  playerName: string
  score: number
  rank: number
  details: Record<string, any>
}

type Session = {
  id: string
  gameId: string
  gameName: string
  date: string
  players: PlayerScore[]
}

type PlayerStat = {
  id: string
  name: string
  winRate: number
  gamesPlayed: number
  wins: number
}

type GameStat = {
  id: string
  name: string
  playCount: number
  highScore: {
    value: number
    player: string
  }
}

type RecentSession = {
  id: string
  game: {
    id: string
    name: string
  }
  date: string
  winner: {
    id: string
    name: string
  }
  playerCount: number
}

// Helper function to safely access localStorage (for client-side only)
const storage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    return null
  },
  setItem: (key: string, value: any) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value))
    }
  },
}

// Initialize with some sample data if empty
const initializeData = () => {
  // Only run on client side
  if (typeof window === "undefined") return

  // Initialize players if empty
  if (!storage.getItem("players")) {
    storage.setItem("players", [
      { id: uuidv4(), name: "You" },
      { id: uuidv4(), name: "Sarah" },
      { id: uuidv4(), name: "David" },
    ])
  }

  // Initialize games if empty
  if (!storage.getItem("games")) {
    storage.setItem("games", [
      { id: uuidv4(), name: "Catan", template: "catan" },
      { id: uuidv4(), name: "Ticket to Ride", template: "ticket-to-ride" },
      { id: uuidv4(), name: "Wingspan", template: "wingspan" },
      { id: uuidv4(), name: "7 Wonders", template: "seven-wonders" },
    ])
  }

  // Initialize sessions if empty
  if (!storage.getItem("sessions")) {
    storage.setItem("sessions", [])
  }
}

// Player functions
export const getPlayers = async (): Promise<Player[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  initializeData()
  return storage.getItem("players") || []
}

export const getPlayersByIds = async (ids: string[]): Promise<Player[]> => {
  const players = await getPlayers()
  return players.filter((player) => ids.includes(player.id))
}

export const addPlayer = async (data: { name: string }): Promise<Player> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const players = await getPlayers()
  const newPlayer = {
    id: uuidv4(),
    name: data.name,
  }

  storage.setItem("players", [...players, newPlayer])
  return newPlayer
}

// Game functions
export const getGames = async (): Promise<Game[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  initializeData()
  return storage.getItem("games") || []
}

export const getGame = async (id: string): Promise<Game | null> => {
  const games = await getGames()
  return games.find((game) => game.id === id) || null
}

export const addGame = async (data: { name: string; template: string }): Promise<Game> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const games = await getGames()
  const newGame = {
    id: uuidv4(),
    name: data.name,
    template: data.template,
  }

  storage.setItem("games", [...games, newGame])
  return newGame
}

// Session functions
export const getSessions = async (): Promise<Session[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  initializeData()
  return storage.getItem("sessions") || []
}

export const getSession = async (id: string): Promise<Session | null> => {
  const sessions = await getSessions()
  return sessions.find((session) => session.id === id) || null
}

export const saveSession = async (data: Omit<Session, "id">): Promise<string> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const sessions = await getSessions()
  const newSession = {
    id: uuidv4(),
    ...data,
  }

  storage.setItem("sessions", [newSession, ...sessions])
  return newSession.id
}

// Stats and dashboard data
export const getRecentSessions = async (): Promise<RecentSession[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  initializeData()
  const sessions = storage.getItem("sessions") || []

  return sessions.slice(0, 5).map((session: Session) => {
    const winner = session.players.find((player) => player.rank === 1)

    return {
      id: session.id,
      game: {
        id: session.gameId,
        name: session.gameName,
      },
      date: session.date,
      winner: {
        id: winner?.playerId || "",
        name: winner?.playerName || "Unknown",
      },
      playerCount: session.players.length,
    }
  })
}

export const getPlayerStats = async (): Promise<PlayerStat[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  initializeData()
  const sessions = storage.getItem("sessions") || []
  const players = storage.getItem("players") || []

  const playerStats = players.map((player: Player) => {
    const playerSessions = sessions.filter((session: Session) => session.players.some((p) => p.playerId === player.id))

    const wins = sessions.filter((session: Session) =>
      session.players.some((p) => p.playerId === player.id && p.rank === 1),
    ).length

    const gamesPlayed = playerSessions.length
    const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

    return {
      id: player.id,
      name: player.name,
      winRate,
      gamesPlayed,
      wins,
    }
  })

  // Sort by win rate (highest first)
  return playerStats.sort((a, b) => b.winRate - a.winRate)
}

export const getPopularGames = async (): Promise<GameStat[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  initializeData()
  const sessions = storage.getItem("sessions") || []
  const games = await getGames()

  const gameStats = games.map((game) => {
    const gameSessions = sessions.filter((session: Session) => session.gameId === game.id)

    let highScore = { value: 0, player: "" }

    gameSessions.forEach((session: Session) => {
      session.players.forEach((player) => {
        if (player.score > highScore.value) {
          highScore = {
            value: player.score,
            player: player.playerName,
          }
        }
      })
    })

    return {
      id: game.id,
      name: game.name,
      playCount: gameSessions.length,
      highScore: highScore.value > 0 ? highScore : null,
    }
  })

  // Sort by play count (highest first)
  return gameStats.sort((a, b) => b.playCount - a.playCount)
}

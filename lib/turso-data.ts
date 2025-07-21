// Turso database implementation to replace localStorage-based data layer
import {
  getPlayers as dbGetPlayers,
  getPlayersByIds as dbGetPlayersByIds,
  addPlayer as dbAddPlayer,
  getPlayerById as dbGetPlayerById,
  getGames as dbGetGames,
  getGame as dbGetGame,
  addGame as dbAddGame,
  getSessions as dbGetSessions,
  getSession as dbGetSession,
  saveSession as dbSaveSession,
  getRecentSessions as dbGetRecentSessions,
  getPlayerStats as dbGetPlayerStats,
  getPopularGames as dbGetPopularGames,
  getGameSessions as dbGetGameSessions,
  getPlayerSessions as dbGetPlayerSessions,
} from "./db/queries"

// Type definitions (matching your existing types)
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
  } | null
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

// Player functions
export const getPlayers = async (): Promise<Player[]> => {
  return await dbGetPlayers()
}

export const getPlayersByIds = async (ids: string[]): Promise<Player[]> => {
  return await dbGetPlayersByIds(ids)
}

export const addPlayer = async (data: { name: string }): Promise<Player> => {
  return await dbAddPlayer(data)
}

// Game functions
export const getGames = async (): Promise<Game[]> => {
  return await dbGetGames()
}

export const getGame = async (id: string): Promise<Game | null> => {
  return await dbGetGame(id)
}

export const addGame = async (data: { name: string; template: string }): Promise<Game> => {
  return await dbAddGame(data)
}

// Session functions
export const getSessions = async (): Promise<Session[]> => {
  return await dbGetSessions()
}

export const getSession = async (id: string): Promise<Session | null> => {
  return await dbGetSession(id)
}

export const saveSession = async (data: Omit<Session, "id">): Promise<string> => {
  return await dbSaveSession(data)
}

// Stats and dashboard data
export const getRecentSessions = async (): Promise<RecentSession[]> => {
  return await dbGetRecentSessions(5)
}

export const getPlayerStats = async (): Promise<PlayerStat[]> => {
  return await dbGetPlayerStats()
}

export const getPopularGames = async (): Promise<GameStat[]> => {
  return await dbGetPopularGames()
}

// Additional functions for individual pages
export const getGameById = async (id: string) => {
  const game = await dbGetGame(id)
  if (!game) return null

  const sessions = await dbGetGameSessions(id)
  const stats = await dbGetPopularGames()
  const gameStats = stats.find(s => s.id === id)

  return {
    id: game.id,
    name: game.name,
    template: game.template,
    stats: {
      playCount: gameStats?.playCount || 0,
      highScore: gameStats?.highScore || null,
    },
  }
}

export const getGameSessions = async (gameId: string) => {
  return await dbGetGameSessions(gameId)
}

export const getPlayerById = async (id: string) => {
  const player = await dbGetPlayerById(id)
  if (!player) return null

  const stats = await dbGetPlayerStats()
  const playerStats = stats.find(s => s.id === id)

  return {
    id: player.id,
    name: player.name,
    stats: {
      gamesPlayed: playerStats?.gamesPlayed || 0,
      wins: playerStats?.wins || 0,
      winRate: playerStats?.winRate || 0,
    },
  }
}

export const getPlayerSessions = async (playerId: string) => {
  return await dbGetPlayerSessions(playerId)
}
import { getSessions } from "./db/data"

// Helper function to safely access localStorage (for client-side only)
const storage = {
  getItem: (key: string) => {
    if (typeof window !== "undefined") {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }
    return null
  },
}

export const getPlayerById = async (id: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const players = storage.getItem("players") || []
  const player = players.find((p: any) => p.id === id)

  if (!player) return null

  const sessions = await getSessions()

  // Calculate player stats
  const playerSessions = sessions.filter((session: any) => session.players.some((p: any) => p.playerId === id))

  const wins = sessions.filter((session: any) =>
    session.players.some((p: any) => p.playerId === id && p.rank === 1),
  ).length

  const gamesPlayed = playerSessions.length
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

  return {
    id: player.id,
    name: player.name,
    stats: {
      gamesPlayed,
      wins,
      winRate,
    },
  }
}

export const getPlayerSessions = async (playerId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const sessions = await getSessions()

  const playerSessions = sessions
    .filter((session: any) => session.players.some((p: any) => p.playerId === playerId))
    .map((session: any) => {
      const playerData = session.players.find((p: any) => p.playerId === playerId)

      return {
        id: session.id,
        date: session.date,
        gameName: session.gameName,
        score: playerData.score,
        rank: playerData.rank,
        playerCount: session.players.length,
      }
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return playerSessions
}

import { getGame, getSessions } from "./db/data"

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

export const getGameById = async (id: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const game = await getGame(id)

  if (!game) return null

  const sessions = await getSessions()

  // Calculate game stats
  const gameSessions = sessions.filter((session: any) => session.gameId === id)

  let highScore = { value: 0, player: "" }

  gameSessions.forEach((session: any) => {
    session.players.forEach((player: any) => {
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
    template: game.template,
    stats: {
      playCount: gameSessions.length,
      highScore: highScore.value > 0 ? highScore : null,
    },
  }
}

export const getGameSessions = async (gameId: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const sessions = await getSessions()

  const gameSessions = sessions
    .filter((session: any) => session.gameId === gameId)
    .map((session: any) => {
      const winner = session.players.find((p: any) => p.rank === 1)

      return {
        id: session.id,
        date: session.date,
        winner: {
          id: winner?.playerId || "",
          name: winner?.playerName || "Unknown",
          score: winner?.score || 0,
        },
        playerCount: session.players.length,
      }
    })
    .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return gameSessions
}

import { eq, desc, sql, and } from "drizzle-orm"
import { db } from "./client"
import { players, games, sessions, playerScores } from "./schema"
import type { Player, Game, Session, PlayerScore } from "./schema"
import { v4 as uuidv4 } from "uuid"

// Player functions
export async function getPlayers(): Promise<Player[]> {
    return await db.select().from(players).orderBy(players.name)
}

export async function getPlayersByIds(ids: string[]): Promise<Player[]> {
    return await db.select().from(players).where(sql`${players.id} IN ${ids}`)
}

export async function addPlayer(data: { name: string }): Promise<Player> {
    const newPlayer = {
        id: uuidv4(),
        name: data.name,
        createdAt: new Date().toISOString(),
    }

    await db.insert(players).values(newPlayer)
    return newPlayer
}

export async function getPlayerById(id: string): Promise<Player | null> {
    const result = await db.select().from(players).where(eq(players.id, id)).limit(1)
    return result[0] || null
}

// Game functions
export async function getGames(): Promise<Game[]> {
    return await db.select().from(games).orderBy(games.name)
}

export async function getGame(id: string): Promise<Game | null> {
    const result = await db.select().from(games).where(eq(games.id, id)).limit(1)
    return result[0] || null
}

export async function addGame(data: { name: string; template: string }): Promise<Game> {
    const newGame = {
        id: uuidv4(),
        name: data.name,
        template: data.template,
        createdAt: new Date().toISOString(),
    }

    await db.insert(games).values(newGame)
    return newGame
}

// Session functions
export async function getSessions(): Promise<(Session & { players: PlayerScore[] })[]> {
    const sessionsData = await db.select().from(sessions).orderBy(desc(sessions.date))

    const sessionsWithPlayers = await Promise.all(
        sessionsData.map(async (session) => {
            const sessionPlayers = await db
                .select()
                .from(playerScores)
                .where(eq(playerScores.sessionId, session.id))
                .orderBy(playerScores.rank)

            return {
                ...session,
                players: sessionPlayers,
            }
        })
    )

    return sessionsWithPlayers
}

export async function getSession(id: string): Promise<(Session & { players: PlayerScore[] }) | null> {
    const sessionData = await db.select().from(sessions).where(eq(sessions.id, id)).limit(1)

    if (!sessionData[0]) return null

    const sessionPlayers = await db
        .select()
        .from(playerScores)
        .where(eq(playerScores.sessionId, id))
        .orderBy(playerScores.rank)

    return {
        ...sessionData[0],
        players: sessionPlayers,
    }
}

export async function saveSession(data: {
    gameId: string
    gameName: string
    date: string
    players: Array<{
        playerId: string
        playerName: string
        score: number
        rank: number
        details: Record<string, any>
    }>
}): Promise<string> {
    const sessionId = uuidv4()

    // Insert session
    await db.insert(sessions).values({
        id: sessionId,
        gameId: data.gameId,
        gameName: data.gameName,
        date: data.date,
    })

    // Insert player scores
    const playerScoreData = data.players.map((player) => ({
        id: uuidv4(),
        sessionId,
        playerId: player.playerId,
        playerName: player.playerName,
        score: player.score,
        rank: player.rank,
        details: player.details,
    }))

    await db.insert(playerScores).values(playerScoreData)

    return sessionId
}

// Stats functions
export async function getRecentSessions(limit: number = 5) {
    const recentSessions = await db
        .select({
            id: sessions.id,
            gameId: sessions.gameId,
            gameName: sessions.gameName,
            date: sessions.date,
        })
        .from(sessions)
        .orderBy(desc(sessions.date))
        .limit(limit)

    const sessionsWithWinners = await Promise.all(
        recentSessions.map(async (session) => {
            const winner = await db
                .select()
                .from(playerScores)
                .where(and(eq(playerScores.sessionId, session.id), eq(playerScores.rank, 1)))
                .limit(1)

            const playerCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(playerScores)
                .where(eq(playerScores.sessionId, session.id))

            return {
                id: session.id,
                game: {
                    id: session.gameId,
                    name: session.gameName,
                },
                date: session.date,
                winner: {
                    id: winner[0]?.playerId || "",
                    name: winner[0]?.playerName || "Unknown",
                },
                playerCount: playerCount[0]?.count || 0,
            }
        })
    )

    return sessionsWithWinners
}

export async function getPlayerStats() {
    const allPlayers = await getPlayers()

    const playerStats = await Promise.all(
        allPlayers.map(async (player) => {
            // Get total games played
            const gamesPlayedResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(playerScores)
                .where(eq(playerScores.playerId, player.id))

            // Get wins
            const winsResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(playerScores)
                .where(and(eq(playerScores.playerId, player.id), eq(playerScores.rank, 1)))

            const gamesPlayed = gamesPlayedResult[0]?.count || 0
            const wins = winsResult[0]?.count || 0
            const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0

            return {
                id: player.id,
                name: player.name,
                winRate,
                gamesPlayed,
                wins,
            }
        })
    )

    return playerStats.sort((a, b) => b.winRate - a.winRate)
}

export async function getPopularGames() {
    const allGames = await getGames()

    const gameStats = await Promise.all(
        allGames.map(async (game) => {
            // Get play count
            const playCountResult = await db
                .select({ count: sql<number>`count(*)` })
                .from(sessions)
                .where(eq(sessions.gameId, game.id))

            // Get high score
            const highScoreResult = await db
                .select({
                    score: playerScores.score,
                    playerName: playerScores.playerName,
                })
                .from(playerScores)
                .innerJoin(sessions, eq(playerScores.sessionId, sessions.id))
                .where(eq(sessions.gameId, game.id))
                .orderBy(desc(playerScores.score))
                .limit(1)

            const playCount = playCountResult[0]?.count || 0
            const highScore = highScoreResult[0]
                ? {
                    value: highScoreResult[0].score,
                    player: highScoreResult[0].playerName,
                }
                : null

            return {
                id: game.id,
                name: game.name,
                playCount,
                highScore,
            }
        })
    )

    return gameStats.sort((a, b) => b.playCount - a.playCount)
}

export async function getGameSessions(gameId: string) {
    const gameSessions = await db
        .select({
            id: sessions.id,
            date: sessions.date,
        })
        .from(sessions)
        .where(eq(sessions.gameId, gameId))
        .orderBy(desc(sessions.date))

    const sessionsWithDetails = await Promise.all(
        gameSessions.map(async (session) => {
            const winner = await db
                .select()
                .from(playerScores)
                .where(and(eq(playerScores.sessionId, session.id), eq(playerScores.rank, 1)))
                .limit(1)

            const playerCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(playerScores)
                .where(eq(playerScores.sessionId, session.id))

            return {
                id: session.id,
                date: session.date,
                winner: {
                    id: winner[0]?.playerId || "",
                    name: winner[0]?.playerName || "Unknown",
                    score: winner[0]?.score || 0,
                },
                playerCount: playerCount[0]?.count || 0,
            }
        })
    )

    return sessionsWithDetails
}

export async function getPlayerSessions(playerId: string) {
    const playerSessions = await db
        .select({
            sessionId: playerScores.sessionId,
            score: playerScores.score,
            rank: playerScores.rank,
            date: sessions.date,
            gameName: sessions.gameName,
        })
        .from(playerScores)
        .innerJoin(sessions, eq(playerScores.sessionId, sessions.id))
        .where(eq(playerScores.playerId, playerId))
        .orderBy(desc(sessions.date))

    const sessionsWithPlayerCount = await Promise.all(
        playerSessions.map(async (session) => {
            const playerCount = await db
                .select({ count: sql<number>`count(*)` })
                .from(playerScores)
                .where(eq(playerScores.sessionId, session.sessionId))

            return {
                id: session.sessionId,
                date: session.date,
                gameName: session.gameName,
                score: session.score,
                rank: session.rank,
                playerCount: playerCount[0]?.count || 0,
            }
        })
    )

    return sessionsWithPlayerCount
}
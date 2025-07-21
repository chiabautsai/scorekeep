
import { db } from "./client";
import { players, games, sessions, playerScores } from "./schema";
import { eq, inArray, desc } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// Type definitions
export type Player = typeof players.$inferSelect;
export type NewPlayer = typeof players.$inferInsert;

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;

export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

export type PlayerScore = typeof playerScores.$inferSelect;
export type NewPlayerScore = typeof playerScores.$inferInsert;

export type PlayerStat = {
  id: string;
  name: string;
  winRate: number;
  gamesPlayed: number;
  wins: number;
};

export type GameStat = {
  id: string;
  name: string;
  playCount: number;
  highScore: {
    value: number;
    player: string;
  } | null;
};

export type RecentSession = {
  id: string;
  game: {
    id: string;
    name: string;
  };
  date: string;
  winner: {
    id: string;
    name: string;
  };
  playerCount: number;
};

// Player functions
export const getPlayers = async (): Promise<Player[]> => {
  return await db.select().from(players);
};

export const getPlayersByIds = async (ids: string[]): Promise<Player[]> => {
  if (ids.length === 0) return [];
  return await db.select().from(players).where(inArray(players.id, ids));
};

export const addPlayer = async (data: { name: string }): Promise<Player> => {
  const newPlayer: NewPlayer = {
    id: uuidv4(),
    name: data.name,
  };
  await db.insert(players).values(newPlayer);
  return newPlayer;
};

// Game functions
export const getGames = async (): Promise<Game[]> => {
  return await db.select().from(games);
};

export const getGame = async (id: string): Promise<Game | null> => {
  const game = await db.select().from(games).where(eq(games.id, id));
  return game[0] || null;
};

export const addGame = async (data: {
  name: string;
  template: string;
}): Promise<Game> => {
  const newGame: NewGame = {
    id: uuidv4(),
    name: data.name,
    template: data.template,
  };
  await db.insert(games).values(newGame);
  return newGame;
};

// Session functions
export const getSessions = async (): Promise<Session[]> => {
  return await db.select().from(sessions);
};

export const getSession = async (id: string): Promise<Session | null> => {
  const session = await db.select().from(sessions).where(eq(sessions.id, id));
  return session[0] || null;
};

export const saveSession = async (
  data: Omit<Session, "id" | "createdAt"> & { players: NewPlayerScore[] }
): Promise<string> => {
  const newSessionId = uuidv4();
  await db.transaction(async (tx) => {
    await tx.insert(sessions).values({ ...data, id: newSessionId });
    for (const player of data.players) {
      await tx
        .insert(playerScores)
        .values({ ...player, sessionId: newSessionId, id: uuidv4() });
    }
  });
  return newSessionId;
};

// Stats and dashboard data
export const getRecentSessions = async (): Promise<RecentSession[]> => {
  const recentSessions = await db
    .select()
    .from(sessions)
    .orderBy(desc(sessions.createdAt))
    .limit(5);
  const allPlayerScores = await db.select().from(playerScores);

  return recentSessions.map((session) => {
    const scoresForSession = allPlayerScores.filter(
      (ps) => ps.sessionId === session.id
    );
    const winnerScore = scoresForSession.find((ps) => ps.rank === 1);

    const winner = {
      id: winnerScore?.playerId || "",
      name: winnerScore?.playerName || "Unknown",
    };

    const playerCount = scoresForSession.length;

    return {
      id: session.id,
      game: {
        id: session.gameId,
        name: session.gameName,
      },
      date: session.date,
      winner,
      playerCount,
    };
  });
};

export const getPlayerStats = async (): Promise<PlayerStat[]> => {
  const allPlayers = await db.select().from(players);
  const allPlayerScores = await db.select().from(playerScores);

  const stats = allPlayers.map((player) => {
    const scoresForPlayer = allPlayerScores.filter(
      (ps) => ps.playerId === player.id
    );
    const gamesPlayed = scoresForPlayer.length;
    const wins = scoresForPlayer.filter((ps) => ps.rank === 1).length;
    const winRate =
      gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

    return {
      id: player.id,
      name: player.name,
      winRate,
      gamesPlayed,
      wins,
    };
  });

  return stats.sort((a, b) => b.winRate - a.winRate);
};

export const getPopularGames = async (): Promise<GameStat[]> => {
  const allGames = await db.select().from(games);
  const allSessions = await db.select().from(sessions);
  const allPlayerScores = await db.select().from(playerScores);

  const gameStats = allGames.map((game) => {
    const sessionsForGame = allSessions.filter((s) => s.gameId === game.id);
    const playCount = sessionsForGame.length;

    let highScore = { value: 0, player: "" };

    const sessionIdsForGame = sessionsForGame.map((s) => s.id);
    const playerScoresForGame = allPlayerScores.filter((ps) =>
      sessionIdsForGame.includes(ps.sessionId)
    );

    playerScoresForGame.forEach((ps) => {
      if (ps.score > highScore.value) {
        highScore = {
          value: ps.score,
          player: ps.playerName,
        };
      }
    });

    return {
      id: game.id,
      name: game.name,
      playCount,
      highScore: highScore.value > 0 ? highScore : null,
    };
  });

  return gameStats.sort((a, b) => b.playCount - a.playCount);
};

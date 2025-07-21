import { sql } from "drizzle-orm"
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core"

// Players table
export const players = sqliteTable("players", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

// Games table
export const games = sqliteTable("games", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  template: text("template").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

// Sessions table
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  gameId: text("game_id").notNull().references(() => games.id),
  gameName: text("game_name").notNull(),
  date: text("date").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
})

// Player scores table (for session results)
export const playerScores = sqliteTable("player_scores", {
  id: text("id").primaryKey(),
  sessionId: text("session_id").notNull().references(() => sessions.id, { onDelete: "cascade" }),
  playerId: text("player_id").notNull().references(() => players.id),
  playerName: text("player_name").notNull(),
  score: integer("score").notNull(),
  rank: integer("rank").notNull(),
  details: text("details", { mode: "json" }).$type<Record<string, any>>(),
})

// Type exports for use in the application
export type Player = typeof players.$inferSelect
export type NewPlayer = typeof players.$inferInsert

export type Game = typeof games.$inferSelect
export type NewGame = typeof games.$inferInsert

export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert

export type PlayerScore = typeof playerScores.$inferSelect
export type NewPlayerScore = typeof playerScores.$inferInsert
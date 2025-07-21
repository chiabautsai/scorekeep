import { config } from "dotenv"
import { v4 as uuidv4 } from "uuid"

// Load environment variables first
config({ path: ".env.local" })

export async function seedDatabase() {
  console.log("Seeding database...")

  // Dynamic imports to ensure environment variables are loaded first
  const { db } = await import("./client")
  const { players, games } = await import("./schema")

  // Seed players
  const samplePlayers = [
    { id: uuidv4(), name: "You" },
    { id: uuidv4(), name: "Sarah" },
    { id: uuidv4(), name: "David" },
  ]

  await db.insert(players).values(samplePlayers).onConflictDoNothing()

  // Seed games
  const sampleGames = [
    { id: uuidv4(), name: "Catan", template: "catan" },
    { id: uuidv4(), name: "Ticket to Ride", template: "ticket-to-ride" },
    { id: uuidv4(), name: "Wingspan", template: "wingspan" },
    { id: uuidv4(), name: "7 Wonders", template: "seven-wonders" },
  ]

  await db.insert(games).values(sampleGames).onConflictDoNothing()

  console.log("Database seeded successfully!")
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedDatabase().catch(console.error)
}
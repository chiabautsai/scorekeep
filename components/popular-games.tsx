"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Dices } from "lucide-react"

import { getPopularGames } from "@/lib/db/queries"
import { Skeleton } from "@/components/ui/skeleton"

type Game = {
  id: string
  name: string
  playCount: number
  highScore: {
    value: number
    player: string
  }
}

export function PopularGames() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await getPopularGames()
        setGames(data)
      } catch (error) {
        console.error("Failed to load popular games:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No games recorded yet.</p>
        <p className="text-sm mt-1">Start playing to see your most popular games!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {games.map((game) => (
        <Link
          key={game.id}
          href={`/games/${game.id}`}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="bg-primary/10 p-2 rounded-md text-primary">
            <Dices className="h-6 w-6" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <h4 className="font-medium truncate">{game.name}</h4>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{game.playCount} sessions</span>
              {game.highScore && (
                <span className="truncate">
                  High: {game.highScore.value} ({game.highScore.player})
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

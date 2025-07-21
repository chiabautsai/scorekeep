"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { User } from "lucide-react"

// Removed direct database import
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"

type PlayerStat = {
  id: string
  name: string
  winRate: number
  gamesPlayed: number
  wins: number
}

export function PlayerStats() {
  const [players, setPlayers] = useState<PlayerStat[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadPlayers = async () => {
      try {
        const response = await fetch('/api/players/stats')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error("Failed to load player stats:", error)
      } finally {
        setLoading(false)
      }
    }

    loadPlayers()
  }, [])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2" data-testid="skeleton">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No player data available.</p>
        <p className="text-sm mt-1">Add players when you start a new session!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {players.map((player) => (
        <Link
          key={player.id}
          href={`/players/${player.id}`}
          className="block p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{player.name}</span>
            </div>
            <div className="text-sm">
              <span className="font-medium">{player.winRate}%</span>
              <span className="text-muted-foreground ml-1">win rate</span>
            </div>
          </div>
          <Progress value={player.winRate} className="h-1.5" />
          <div className="flex justify-between mt-1.5 text-xs text-muted-foreground">
            <span>{player.wins} wins</span>
            <span>{player.gamesPlayed} games</span>
          </div>
        </Link>
      ))}
    </div>
  )
}

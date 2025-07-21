"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CalendarDays, Trophy } from "lucide-react"

// Removed direct database import
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

type Session = {
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

export function RecentSessions() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSessions = async () => {
      try {
        const response = await fetch('/api/sessions/recent')
        if (!response.ok) throw new Error('Failed to fetch')
        const data = await response.json()
        setSessions(data)
      } catch (error) {
        console.error("Failed to load recent sessions:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSessions()
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

  if (sessions.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        <p>No sessions recorded yet.</p>
        <p className="text-sm mt-1">Start a new game session to see it here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sessions.map((session) => (
        <Link
          key={session.id}
          href={`/sessions/${session.id}`}
          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
        >
          <div className="bg-primary/10 p-2 rounded-md text-primary">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium truncate">{session.game.name}</h4>
              <Badge variant="outline" className="ml-2 shrink-0">
                {new Date(session.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </Badge>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Trophy className="h-3.5 w-3.5 mr-1 text-yellow-500" />
              <span className="truncate">{session.winner.name}</span>
              <span className="mx-1.5">•</span>
              <span>{session.playerCount} players</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

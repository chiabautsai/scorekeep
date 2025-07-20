"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Dices, Medal, User } from "lucide-react"

import { getPlayerById, getPlayerSessions } from "@/lib/player-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

type Player = {
  id: string
  name: string
  stats: {
    gamesPlayed: number
    wins: number
    winRate: number
  }
}

type PlayerSession = {
  id: string
  date: string
  gameName: string
  score: number
  rank: number
  playerCount: number
}

export default function PlayerPage() {
  const params = useParams()
  const router = useRouter()
  const playerId = params.id as string

  const [player, setPlayer] = useState<Player | null>(null)
  const [sessions, setSessions] = useState<PlayerSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [playerData, sessionsData] = await Promise.all([getPlayerById(playerId), getPlayerSessions(playerId)])
        setPlayer(playerData)
        setSessions(sessionsData)
      } catch (error) {
        console.error("Failed to load player data:", error)
        toast({
          title: "Error",
          description: "Failed to load player data. Please try again.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [playerId, router])

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!player) {
    return (
      <div className="container max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Player Not Found</h1>
        </div>
        <p>The requested player could not be found.</p>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Player Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <User className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl">{player.name}</CardTitle>
              <CardDescription>
                {player.stats.gamesPlayed} games played • {player.stats.wins} wins • {player.stats.winRate}% win rate
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Games</h3>

            {sessions.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No game sessions recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sessions.map((session) => (
                  <Link
                    key={session.id}
                    href={`/sessions/${session.id}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex items-center justify-center w-8 h-8 rounded-full ${
                          session.rank === 1
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                            : session.rank === 2
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                              : session.rank === 3
                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                                : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {session.rank <= 3 ? (
                          <Medal className="h-4 w-4" />
                        ) : (
                          <span className="text-sm">{session.rank}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          <Dices className="h-4 w-4 text-muted-foreground" />
                          <span>{session.gameName}</span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(session.date).toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                          <span className="mx-1">•</span>
                          <span>{session.playerCount} players</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{session.score}</div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" asChild>
                <Link href="/">Back to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href="/new-session">New Session</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Dices, Trophy, User } from "lucide-react"

import { getGameById, getGameSessions } from "@/lib/game-data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

type Game = {
  id: string
  name: string
  template: string
  stats: {
    playCount: number
    highScore: {
      value: number
      player: string
    } | null
  }
}

type GameSession = {
  id: string
  date: string
  winner: {
    id: string
    name: string
    score: number
  }
  playerCount: number
}

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const gameId = params.id as string

  const [game, setGame] = useState<Game | null>(null)
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [gameData, sessionsData] = await Promise.all([getGameById(gameId), getGameSessions(gameId)])
        setGame(gameData)
        setSessions(sessionsData)
      } catch (error) {
        console.error("Failed to load game data:", error)
        toast({
          title: "Error",
          description: "Failed to load game data. Please try again.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [gameId, router])

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

  if (!game) {
    return (
      <div className="container max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Game Not Found</h1>
        </div>
        <p>The requested game could not be found.</p>
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
        <h1 className="text-2xl font-bold tracking-tight">Game Details</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-3 rounded-full text-primary">
              <Dices className="h-8 w-8" />
            </div>
            <div>
              <CardTitle className="text-2xl">{game.name}</CardTitle>
              <CardDescription>
                {game.stats.playCount} sessions played
                {game.stats.highScore &&
                  ` • High score: ${game.stats.highScore.value} (${game.stats.highScore.player})`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Recent Sessions</h3>

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
                      <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 flex items-center justify-center w-8 h-8 rounded-full">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center gap-1.5">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{session.winner.name}</span>
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
                    <div className="text-xl font-bold">{session.winner.score}</div>
                  </Link>
                ))}
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button variant="outline" asChild>
                <Link href="/">Back to Dashboard</Link>
              </Button>
              <Button asChild>
                <Link href={`/new-session/players?gameId=${game.id}`}>Play {game.name}</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

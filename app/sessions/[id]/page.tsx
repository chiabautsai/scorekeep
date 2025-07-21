"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Calendar, Dices, Medal, Trophy, User } from "lucide-react"

import { getSession } from "@/lib/db/queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

type PlayerScore = {
  playerId: string
  playerName: string
  score: number
  rank: number
  details: Record<string, any>
}

type Session = {
  id: string
  gameId: string
  gameName: string
  date: string
  players: PlayerScore[]
}

export default function SessionPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.id as string

  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSession = async () => {
      try {
        const data = await getSession(sessionId)
        setSession(data)
      } catch (error) {
        console.error("Failed to load session:", error)
        toast({
          title: "Error",
          description: "Failed to load session data. Please try again.",
          variant: "destructive",
        })
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadSession()
  }, [sessionId, router])

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

  if (!session) {
    return (
      <div className="container max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Session Not Found</h1>
        </div>
        <p>The requested session could not be found.</p>
        <Button asChild>
          <Link href="/">Return to Dashboard</Link>
        </Button>
      </div>
    )
  }

  const winner = session.players.find((player) => player.rank === 1)
  const formattedDate = new Date(session.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Session Results</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Dices className="h-5 w-5" />
                {session.gameName}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <Calendar className="h-3.5 w-3.5" />
                {formattedDate}
              </CardDescription>
            </div>
            <div className="flex flex-col items-end">
              <div className="text-sm text-muted-foreground">Winner</div>
              <div className="font-medium flex items-center gap-1">
                <Trophy className="h-4 w-4 text-yellow-500" />
                {winner?.playerName}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Final Standings</h3>

            <div className="space-y-3">
              {session.players.map((player) => (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    player.rank === 1
                      ? "bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
                      : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        player.rank === 1
                          ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                          : player.rank === 2
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                            : player.rank === 3
                              ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {player.rank <= 3 ? (
                        <Medal className="h-4 w-4" />
                      ) : (
                        <span className="text-sm">{player.rank}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{player.playerName}</span>
                    </div>
                  </div>
                  <div className="text-xl font-bold">{player.score}</div>
                </div>
              ))}
            </div>

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

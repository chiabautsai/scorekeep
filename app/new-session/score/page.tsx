"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft } from "lucide-react"

import { getGame, getPlayersByIds } from "@/lib/db/queries"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScoreForm } from "@/components/score-form"
import { toast } from "@/components/ui/use-toast"

type Player = {
  id: string
  name: string
}

type Game = {
  id: string
  name: string
  template: string
}

export default function ScorePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams.get("gameId")
  const playerIds = searchParams.getAll("players")

  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId || playerIds.length === 0) {
      router.push("/new-session")
      return
    }

    const loadData = async () => {
      try {
        const [gameData, playersData] = await Promise.all([getGame(gameId), getPlayersByIds(playerIds)])
        setGame(gameData)
        setPlayers(playersData)
      } catch (error) {
        console.error("Failed to load data:", error)
        toast({
          title: "Error",
          description: "Failed to load game or players. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [gameId, playerIds, router])

  if (loading) {
    return (
      <div className="container max-w-3xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href={`/new-session/players?gameId=${gameId}`}>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight">Loading...</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-3xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/new-session/players?gameId=${gameId}`}>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Enter Scores</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{game?.name}</CardTitle>
          <CardDescription>Enter scores for each player</CardDescription>
        </CardHeader>
        <CardContent>
          <ScoreForm game={game!} players={players} />
        </CardContent>
      </Card>
    </div>
  )
}

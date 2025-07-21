"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ChevronRight, Plus, User } from "lucide-react"

// Removed direct database import
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AddPlayerForm } from "@/components/add-player-form"
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

export default function PlayerSelection() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const gameId = searchParams.get("gameId")

  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!gameId) {
      router.push("/new-session")
      return
    }

    const loadData = async () => {
      try {
        const [gameResponse, playersResponse] = await Promise.all([
          fetch(`/api/games/${gameId}`),
          fetch('/api/players')
        ])
        
        if (!gameResponse.ok || !playersResponse.ok) {
          throw new Error('Failed to fetch data')
        }
        
        const [gameData, playersData] = await Promise.all([
          gameResponse.json(),
          playersResponse.json()
        ])
        
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
  }, [gameId, router])

  const handlePlayerToggle = (playerId: string) => {
    setSelectedPlayers((prev) => (prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]))
  }

  const handleAddPlayer = (newPlayer: Player) => {
    setPlayers((prev) => [...prev, newPlayer])
    setSelectedPlayers((prev) => [...prev, newPlayer.id])
    setDialogOpen(false)
  }

  const handleContinue = () => {
    if (selectedPlayers.length < 1) {
      toast({
        title: "Select players",
        description: "Please select at least one player to continue.",
      })
      return
    }

    const params = new URLSearchParams()
    params.set("gameId", gameId!)
    selectedPlayers.forEach((playerId) => params.append("players", playerId))
    router.push(`/new-session/score?${params.toString()}`)
  }

  if (loading) {
    return (
      <div className="container max-w-2xl mx-auto py-6 space-y-6">
        <div className="flex items-center gap-2">
          <Link href="/new-session">
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
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/new-session">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">Select Players</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Players for {game?.name}</CardTitle>
          <CardDescription>Select the players participating in this game session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player) => (
              <div key={player.id} className="flex items-center space-x-3 border rounded-lg p-3">
                <Checkbox
                  id={player.id}
                  checked={selectedPlayers.includes(player.id)}
                  onCheckedChange={() => handlePlayerToggle(player.id)}
                />
                <label
                  htmlFor={player.id}
                  className="flex items-center gap-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                >
                  <User className="h-4 w-4 text-muted-foreground" />
                  {player.name}
                </label>
              </div>
            ))}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 p-4 h-auto border-dashed bg-transparent"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New Player</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Player</DialogTitle>
                </DialogHeader>
                <AddPlayerForm onAddPlayer={handleAddPlayer} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/new-session">Back</Link>
          </Button>
          <Button onClick={handleContinue} disabled={selectedPlayers.length === 0}>
            Continue
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

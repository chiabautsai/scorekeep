"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dices, Plus, Search } from "lucide-react"

import { getGames } from "@/lib/db/queries"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AddGameForm } from "@/components/add-game-form"

type Game = {
  id: string
  name: string
  template: string
}

export function GameSelector() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    const loadGames = async () => {
      try {
        const data = await getGames()
        setGames(data)
      } catch (error) {
        console.error("Failed to load games:", error)
      } finally {
        setLoading(false)
      }
    }

    loadGames()
  }, [])

  const filteredGames = games.filter((game) => game.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleGameSelect = (gameId: string) => {
    router.push(`/new-session/players?gameId=${gameId}`)
  }

  const handleAddGame = (newGame: Game) => {
    setGames([...games, newGame])
    setDialogOpen(false)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search games..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-4 border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-md" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))
        ) : (
          <>
            {filteredGames.map((game) => (
              <Button
                key={game.id}
                variant="outline"
                className="flex items-center justify-start gap-3 p-4 h-auto bg-transparent"
                onClick={() => handleGameSelect(game.id)}
              >
                <div className="bg-primary/10 p-2 rounded-md text-primary">
                  <Dices className="h-6 w-6" />
                </div>
                <div className="text-left">
                  <div className="font-medium">{game.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {game.template === "generic" ? "Basic scoring" : "Custom template"}
                  </div>
                </div>
              </Button>
            ))}

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center justify-center gap-2 p-4 h-auto border-dashed bg-transparent"
                >
                  <Plus className="h-5 w-5" />
                  <span>Add New Game</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Game</DialogTitle>
                </DialogHeader>
                <AddGameForm onAddGame={handleAddGame} />
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>
    </div>
  )
}

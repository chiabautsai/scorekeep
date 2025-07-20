import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { GameSelector } from "@/components/game-selector"

export default function NewSession() {
  return (
    <div className="container max-w-2xl mx-auto py-6 space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">New Session</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Select a Game</CardTitle>
          <CardDescription>Choose a game from your library or add a new one</CardDescription>
        </CardHeader>
        <CardContent>
          <GameSelector />
        </CardContent>
      </Card>
    </div>
  )
}

import Link from "next/link"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecentSessions } from "@/components/recent-sessions"
import { PlayerStats } from "@/components/player-stats"
import { PopularGames } from "@/components/popular-games"
import { ThemeToggle } from "@/components/theme-toggle"

export default function Dashboard() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ScoreKeep</h1>
          <p className="text-muted-foreground">Track your board game scores and stats</p>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/new-session">
            <Button size="lg" className="gap-2">
              <PlusCircle className="h-5 w-5" />
              New Session
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Sessions</CardTitle>
            <CardDescription>Your latest game sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSessions />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Player Stats</CardTitle>
            <CardDescription>Win rates and game counts</CardDescription>
          </CardHeader>
          <CardContent>
            <PlayerStats />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Popular Games</CardTitle>
            <CardDescription>Your most played games</CardDescription>
          </CardHeader>
          <CardContent>
            <PopularGames />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

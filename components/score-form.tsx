"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Crown, Target, TrendingUp } from "lucide-react"

// Removed direct database import
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"

import { GenericScoreForm } from "@/components/generic-score-form"

type Player = {
  id: string
  name: string
}

type Game = {
  id: string
  name: string
  template: string
}

export function ScoreForm({ game, players }: { game: Game; players: Player[] }) {
  // Use specialized components for round-by-round scoring
  if (game.template === "generic") {
    return <GenericScoreForm game={game} players={players} />
  }

  return <TemplateScoreForm game={game} players={players} />
}

function TemplateScoreForm({ game, players }: { game: Game; players: Player[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Calculate real-time score for a player based on current form values
  const calculateCurrentScore = (playerId: string, formValues: any) => {
    const playerData = formValues[playerId] || {}
    let score = 0

    switch (game.template) {
      case "generic":
        score = Number(playerData.score) || 0
        break
      case "catan":
        score = Number(playerData.victoryPoints) || 0
        if (playerData.longestRoad) score += 2
        if (playerData.largestArmy) score += 2
        break
      case "ticket-to-ride":
        score = (Number(playerData.routes) || 0) + (Number(playerData.tickets) || 0)
        if (playerData.longestPath) score += 10
        break
      case "wingspan":
        score =
          (Number(playerData.birds) || 0) +
          (Number(playerData.bonusCards) || 0) +
          (Number(playerData.endOfRound) || 0) +
          (Number(playerData.eggs) || 0) +
          (Number(playerData.foodCache) || 0) +
          (Number(playerData.tuckedCards) || 0)
        break
      case "seven-wonders":
        score =
          (Number(playerData.civilian) || 0) +
          (Number(playerData.science) || 0) +
          (Number(playerData.commercial) || 0) +
          (Number(playerData.guilds) || 0) +
          (Number(playerData.military) || 0) +
          (Number(playerData.wonder) || 0) +
          Math.floor((Number(playerData.coins) || 0) / 3)
        break
      default:
        score = Number(playerData.score) || 0
    }

    return score
  }

  // Get current standings based on form values
  const getCurrentStandings = (formValues: any) => {
    const standings = players.map((player) => ({
      player,
      score: calculateCurrentScore(player.id, formValues)
    })).sort((a, b) => b.score - a.score)

    return standings
  }

  // Get game statistics
  const getGameStats = (formValues: any) => {
    const standings = getCurrentStandings(formValues)
    const totalScore = standings.reduce((sum, s) => sum + s.score, 0)
    const averageScore = totalScore / standings.length
    const highestScore = standings[0]?.score || 0
    const isCloseGame = standings.length > 1 && (standings[0].score - standings[1].score) <= 5

    // Check if there's a tie (multiple players with the same highest score)
    const isTied = standings.length > 1 && standings[0].score === standings[1].score

    return {
      leader: isTied ? null : standings[0]?.player,
      highestScore,
      averageScore: Math.round(averageScore * 10) / 10,
      totalScore,
      isCloseGame: isCloseGame && !isTied
    }
  }

  // Create a dynamic schema based on the game template and players
  const createFormSchema = () => {
    const playerFields: Record<string, any> = {}

    players.forEach((player) => {
      switch (game.template) {
        case "generic":
          playerFields[player.id] = z.object({
            score: z.coerce.number().min(0, "Score must be a positive number"),
          })
          break
        case "catan":
          playerFields[player.id] = z.object({
            victoryPoints: z.coerce.number().min(0),
            longestRoad: z.boolean().optional(),
            largestArmy: z.boolean().optional(),
          })
          break
        case "ticket-to-ride":
          playerFields[player.id] = z.object({
            routes: z.coerce.number().min(0),
            tickets: z.coerce.number(),
            longestPath: z.boolean().optional(),
          })
          break
        case "wingspan":
          playerFields[player.id] = z.object({
            birds: z.coerce.number().min(0),
            bonusCards: z.coerce.number().min(0),
            endOfRound: z.coerce.number(),
            eggs: z.coerce.number().min(0),
            foodCache: z.coerce.number().min(0),
            tuckedCards: z.coerce.number().min(0),
          })
          break
        case "seven-wonders":
          playerFields[player.id] = z.object({
            civilian: z.coerce.number().min(0),
            science: z.coerce.number().min(0),
            commercial: z.coerce.number().min(0),
            guilds: z.coerce.number().min(0),
            military: z.coerce.number(),
            wonder: z.coerce.number().min(0),
            coins: z.coerce.number().min(0),
          })
          break

        default:
          playerFields[player.id] = z.object({
            score: z.coerce.number().min(0, "Score must be a positive number"),
          })
      }
    })

    return z.object(playerFields)
  }

  const formSchema = createFormSchema()

  // Create default values based on the game template and players
  const createDefaultValues = () => {
    const defaultValues: Record<string, any> = {}

    players.forEach((player) => {
      switch (game.template) {
        case "generic":
          defaultValues[player.id] = { score: 0 }
          break
        case "catan":
          defaultValues[player.id] = {
            victoryPoints: 0,
            longestRoad: false,
            largestArmy: false,
          }
          break
        case "ticket-to-ride":
          defaultValues[player.id] = {
            routes: 0,
            tickets: 0,
            longestPath: false,
          }
          break
        case "wingspan":
          defaultValues[player.id] = {
            birds: 0,
            bonusCards: 0,
            endOfRound: 0,
            eggs: 0,
            foodCache: 0,
            tuckedCards: 0,
          }
          break
        case "seven-wonders":
          defaultValues[player.id] = {
            civilian: 0,
            science: 0,
            commercial: 0,
            guilds: 0,
            military: 0,
            wonder: 0,
            coins: 0,
          }
          break

        default:
          defaultValues[player.id] = { score: 0 }
      }
    })

    return defaultValues
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(),
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      // Calculate final scores based on the game template
      const playerScores = players.map((player) => {
        const playerData = values[player.id]
        let finalScore = 0

        switch (game.template) {
          case "generic":
            finalScore = playerData.score
            break
          case "catan":
            finalScore = playerData.victoryPoints
            if (playerData.longestRoad) finalScore += 2
            if (playerData.largestArmy) finalScore += 2
            break
          case "ticket-to-ride":
            finalScore = playerData.routes + playerData.tickets
            if (playerData.longestPath) finalScore += 10
            break
          case "wingspan":
            finalScore =
              playerData.birds +
              playerData.bonusCards +
              playerData.endOfRound +
              playerData.eggs +
              playerData.foodCache +
              playerData.tuckedCards
            break
          case "seven-wonders":
            finalScore =
              playerData.civilian +
              playerData.science +
              playerData.commercial +
              playerData.guilds +
              playerData.military +
              playerData.wonder +
              Math.floor(playerData.coins / 3)
            break

          default:
            finalScore = playerData.score
        }

        return {
          playerId: player.id,
          playerName: player.name,
          score: finalScore,
          details: playerData,
          rank: 0, // Initialize rank, will be set below
        }
      })

      // Sort players by score (highest first)
      playerScores.sort((a, b) => b.score - a.score)

      // Add rank to each player
      let currentRank = 1
      let previousScore = playerScores[0].score

      playerScores.forEach((player, index) => {
        if (player.score < previousScore) {
          currentRank = index + 1
          previousScore = player.score
        }
        player.rank = currentRank
      })

      const sessionData = {
        gameId: game.id,
        gameName: game.name,
        date: new Date().toISOString(),
        players: playerScores,
      }

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      })
      
      if (!response.ok) throw new Error('Failed to save session')
      
      const result = await response.json()
      const sessionId = result.id

      toast({
        title: "Session saved",
        description: "Your game session has been recorded successfully.",
      })

      router.push(`/sessions/${sessionId}`)
    } catch (error) {
      console.error("Failed to save session:", error)
      toast({
        title: "Error",
        description: "Failed to save session. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getScoringCategories = () => {
    switch (game.template) {
      case "generic":
        return [{ key: "score", label: "Final Score", type: "number", min: 0 }]
      case "catan":
        return [
          { key: "victoryPoints", label: "Victory Points", type: "number", min: 0 },
          { key: "longestRoad", label: "Longest Road (+2)", type: "checkbox" },
          { key: "largestArmy", label: "Largest Army (+2)", type: "checkbox" },
        ]
      case "ticket-to-ride":
        return [
          { key: "routes", label: "Route Points", type: "number", min: 0 },
          { key: "tickets", label: "Destination Tickets", type: "number" },
          { key: "longestPath", label: "Longest Path (+10)", type: "checkbox" },
        ]
      case "wingspan":
        return [
          { key: "birds", label: "Birds", type: "number", min: 0 },
          { key: "bonusCards", label: "Bonus Cards", type: "number", min: 0 },
          { key: "endOfRound", label: "End of Round Goals", type: "number" },
          { key: "eggs", label: "Eggs", type: "number", min: 0 },
          { key: "foodCache", label: "Food on Cards", type: "number", min: 0 },
          { key: "tuckedCards", label: "Tucked Cards", type: "number", min: 0 },
        ]
      case "seven-wonders":
        return [
          { key: "civilian", label: "Civilian Structures", type: "number", min: 0 },
          { key: "science", label: "Science", type: "number", min: 0 },
          { key: "commercial", label: "Commercial", type: "number", min: 0 },
          { key: "guilds", label: "Guilds", type: "number", min: 0 },
          { key: "military", label: "Military", type: "number" },
          { key: "wonder", label: "Wonder", type: "number", min: 0 },
          { key: "coins", label: "Coins (÷3)", type: "number", min: 0 },
        ]

      default:
        return [{ key: "score", label: "Final Score", type: "number", min: 0 }]
    }
  }

  const categories = getScoringCategories()

  return (
    <div className="space-y-6">
      {/* Game Conclusion Banner */}
      {(() => {
        const formValues = form.watch()
        const standings = getCurrentStandings(formValues)
        const hasWinner = standings.length > 0 && standings[0].score > 0
        const winner = hasWinner ? standings[0] : null

        // Only show if there's a clear winner with a significant score
        if (!winner || winner.score === 0) return null

        return (
          <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="text-6xl animate-bounce">🏆</div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                    🎉 CURRENT CHAMPION! 🎉
                  </h2>
                  <p className="text-xl font-semibold text-orange-700 dark:text-orange-300">
                    {winner.player.name} is leading!
                  </p>
                  <div className="flex justify-center">
                    <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                      Current Score: {winner.score} points
                    </Badge>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Save the session to finalize the results
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })()}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Real-time Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Live Score Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Current Leader */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Crown className="h-4 w-4" />
                    Current Leader
                  </div>
                  {(() => {
                    const formValues = form.watch()
                    const stats = getGameStats(formValues)
                    return (
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-lg text-yellow-700 dark:text-yellow-300">
                          {stats.leader ? `👑 ${stats.leader.name}` : "🤝 Tied"}
                        </span>
                        <Badge variant="secondary" className="text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                          {stats.highestScore} pts
                        </Badge>
                      </div>
                    )
                  })()}
                </div>

                {/* Game Stats */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    Game Stats
                  </div>
                  {(() => {
                    const formValues = form.watch()
                    const stats = getGameStats(formValues)
                    return (
                      <div className="space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">Total Points:</span> {stats.totalScore}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Average:</span> {stats.averageScore} pts
                        </div>
                        {stats.isCloseGame && (
                          <Badge variant="outline" className="text-xs">
                            Close Game!
                          </Badge>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Current Standings */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">
                    Current Standings
                  </div>
                  {(() => {
                    const formValues = form.watch()
                    const standings = getCurrentStandings(formValues)
                    return (
                      <div className="space-y-1">
                        {standings.map((standing, index) => (
                          <div key={standing.player.id} className={`flex items-center justify-between text-sm p-2 rounded-md ${index === 0 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700' : ''
                            }`}>
                            <div className="flex items-center gap-2">
                              <span className={`${index === 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted-foreground'}`}>
                                {index === 0 ? '👑' : `#${index + 1}`}
                              </span>
                              <span className={index === 0 ? "font-bold text-yellow-800 dark:text-yellow-200" : ""}>
                                {standing.player.name}
                              </span>
                            </div>
                            <span className={`font-medium ${index === 0 ? 'text-yellow-800 dark:text-yellow-200' : ''}`}>
                              {standing.score}
                            </span>
                          </div>
                        ))}
                      </div>
                    )
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Scoring Category</TableHead>
                  {players.map((player) => (
                    <TableHead key={player.id} className="text-center min-w-32">
                      {player.name}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.key}>
                    <TableCell className="font-medium">{category.label}</TableCell>
                    {players.map((player) => (
                      <TableCell key={player.id} className="text-center">
                        <FormField
                          control={form.control}
                          name={`${player.id}.${category.key}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                {category.type === "checkbox" ? (
                                  <div className="flex justify-center">
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </div>
                                ) : (
                                  <Input
                                    type="number"
                                    min={category.min}
                                    className="text-center"
                                    {...field}
                                  />
                                )}
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Saving..." : "Save Session"}
          </Button>
        </form>
      </Form>
    </div>
  )
}

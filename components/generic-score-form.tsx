"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Plus, Trophy, Settings } from "lucide-react"

import { saveSession } from "@/lib/db/queries"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
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

type RoundScore = {
  score: number
}

type PlayerRoundData = {
  [playerId: string]: RoundScore
}

type GameSettings = {
  scoreToWin?: number
  hasTargetScore: boolean
  winCondition: 'highest' | 'lowest'
  maxRounds?: number
  hasMaxRounds: boolean
}

export function GenericScoreForm({ game, players }: { game: Game; players: Player[] }) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [rounds, setRounds] = useState<PlayerRoundData[]>([])
  const [currentRound, setCurrentRound] = useState(0)
  const [gameWinner, setGameWinner] = useState<Player | null>(null)
  const [showSettings, setShowSettings] = useState(true)
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    scoreToWin: 100,
    hasTargetScore: true,
    winCondition: 'highest',
    maxRounds: 10,
    hasMaxRounds: false
  })

  // Settings form schema
  const settingsSchema = z.object({
    scoreToWin: z.coerce.number().min(1, "Score to win must be at least 1").optional(),
    hasTargetScore: z.boolean(),
    winCondition: z.enum(['highest', 'lowest']),
    maxRounds: z.coerce.number().min(1, "Max rounds must be at least 1").optional(),
    hasMaxRounds: z.boolean()
  })

  const settingsForm = useForm<GameSettings>({
    resolver: zodResolver(settingsSchema),
    defaultValues: gameSettings
  })

  // Round scoring schema
  const createRoundSchema = () => {
    const playerFields: Record<string, any> = {}

    players.forEach((player) => {
      playerFields[player.id] = z.object({
        score: z.coerce.number()
      })
    })

    return z.object(playerFields)
  }

  const formSchema = createRoundSchema()

  const createDefaultValues = () => {
    const defaultValues: Record<string, RoundScore> = {}

    players.forEach((player) => {
      defaultValues[player.id] = { score: 0 }
    })

    return defaultValues
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: createDefaultValues(),
  })

  // Calculate total score for a player across all rounds
  const calculatePlayerTotal = (playerId: string): number => {
    return rounds.reduce((total, round) => {
      const playerRound = round[playerId]
      return total + (playerRound?.score || 0)
    }, 0)
  }

  // Check for winner based on game settings
  const checkForWinner = (newRounds: PlayerRoundData[]): Player | null => {
    // Check max rounds first
    if (gameSettings.hasMaxRounds && newRounds.length >= gameSettings.maxRounds) {
      // Game ends due to max rounds, find winner based on win condition
      const standings = players.map(player => ({
        player,
        total: newRounds.reduce((sum, round) => sum + (round[player.id]?.score || 0), 0)
      })).sort((a, b) =>
        gameSettings.winCondition === 'highest' ? b.total - a.total : a.total - b.total
      )

      return standings[0].player
    }

    // Check target score (if enabled)
    if (gameSettings.hasTargetScore && gameSettings.scoreToWin) {
      const playerTotals = players.map(player => ({
        player,
        total: newRounds.reduce((sum, round) => sum + (round[player.id]?.score || 0), 0)
      }))

      if (gameSettings.winCondition === 'highest') {
        // Highest score wins: game ends when someone reaches target score
        const winner = playerTotals.find(p => p.total >= gameSettings.scoreToWin)
        return winner ? winner.player : null
      } else {
        // Lowest score wins: game ends when ANY player reaches target (upper bound)
        // Winner is the player with the LOWEST score when someone hits the target
        const anyPlayerReachedTarget = playerTotals.some(p => p.total >= gameSettings.scoreToWin)
        if (anyPlayerReachedTarget) {
          const sortedByLowest = playerTotals.sort((a, b) => a.total - b.total)
          return sortedByLowest[0].player
        }
      }
    }

    return null
  }

  // Get current standings
  const getCurrentStandings = () => {
    const standings = players.map((player) => {
      const total = calculatePlayerTotal(player.id)
      let pointsToTarget = 0

      if (gameSettings.hasTargetScore && gameSettings.scoreToWin) {
        pointsToTarget = gameSettings.winCondition === 'highest'
          ? Math.max(0, gameSettings.scoreToWin - total)
          : Math.max(0, gameSettings.scoreToWin - total) // For lowest wins, show points until upper bound
      }

      return {
        player,
        total,
        pointsToTarget
      }
    }).sort((a, b) =>
      gameSettings.winCondition === 'highest' ? b.total - a.total : a.total - b.total
    )

    return standings
  }

  // Get game progress statistics
  const getGameStats = () => {
    const standings = getCurrentStandings()
    const leader = standings[0]
    const bestScore = leader?.total || 0
    const averageScore = standings.reduce((sum, s) => sum + s.total, 0) / standings.length
    const roundsPlayed = rounds.length
    const maxRoundsReached = gameSettings.hasMaxRounds && roundsPlayed >= gameSettings.maxRounds

    // Determine if it's a close game based on win condition
    const isCloseGame = standings.length > 1 && Math.abs(standings[0].total - standings[1].total) <= 5

    return {
      leader: leader?.player,
      bestScore,
      averageScore: Math.round(averageScore),
      roundsPlayed,
      maxRoundsReached,
      isCloseGame,
      remainingRounds: gameSettings.hasMaxRounds ? gameSettings.maxRounds - roundsPlayed : null
    }
  }

  // Handle settings update
  const handleSettingsUpdate = (values: GameSettings) => {
    setGameSettings(values)
    setShowSettings(false)

    const targetInfo = values.hasTargetScore
      ? ` at ${values.scoreToWin} points`
      : " (no target score)"

    toast({
      title: "Settings updated",
      description: `Game configured: ${values.winCondition === 'highest' ? 'Highest' : 'Lowest'} score wins${targetInfo}`,
    })
  }

  // Handle manual game end (when no target score is set)
  const handleEndGame = () => {
    const standings = getCurrentStandings()
    const winner = standings[0]?.player

    if (winner) {
      setGameWinner(winner)
      toast({
        title: "🎉 Game Over!",
        description: `${winner.name} wins! Game ended manually.`,
      })
    }
  }

  // Handle completing a round
  const handleCompleteRound = async (values: z.infer<typeof formSchema>) => {
    const newRoundData: PlayerRoundData = {}

    players.forEach((player) => {
      newRoundData[player.id] = values[player.id]
    })

    const newRounds = [...rounds, newRoundData]
    setRounds(newRounds)

    // Check for winner
    const winner = checkForWinner(newRounds)
    if (winner) {
      setGameWinner(winner)
      const reason = gameSettings.hasMaxRounds && newRounds.length >= gameSettings.maxRounds
        ? `Maximum rounds (${gameSettings.maxRounds}) reached!`
        : `Reached target score of ${gameSettings.scoreToWin}!`

      toast({
        title: "🎉 Game Over!",
        description: `${winner.name} wins! ${reason}`,
      })
    } else {
      // Start new round
      setCurrentRound(currentRound + 1)
      form.reset(createDefaultValues())

      const remainingRounds = gameSettings.hasMaxRounds ? gameSettings.maxRounds - newRounds.length : null
      const roundInfo = remainingRounds ? ` (${remainingRounds} rounds left)` : ""

      toast({
        title: "Round completed",
        description: `Starting Round ${currentRound + 2}${roundInfo}`,
      })
    }
  }

  // Handle saving the complete game session
  const handleSaveSession = async () => {
    setIsSubmitting(true)
    try {
      const playerScores = players.map((player) => {
        const totalScore = calculatePlayerTotal(player.id)

        return {
          playerId: player.id,
          playerName: player.name,
          score: totalScore,
          details: {
            rounds: rounds.map(round => round[player.id]),
            totalRounds: rounds.length,
            gameSettings
          },
        }
      })

      // Sort players by score based on win condition
      playerScores.sort((a, b) =>
        gameSettings.winCondition === 'highest' ? b.score - a.score : a.score - b.score
      )

      // Add rank to each player
      let currentRank = 1
      let previousScore = playerScores[0]?.score || 0

      playerScores.forEach((player, index) => {
        const scoreDiff = gameSettings.winCondition === 'highest'
          ? player.score < previousScore
          : player.score > previousScore

        if (scoreDiff) {
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

      const sessionId = await saveSession(sessionData)

      toast({
        title: "Session saved",
        description: `Your ${game.name} game has been recorded successfully.`,
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

  return (
    <div className="space-y-6">
      {/* Game Conclusion Banner */}
      {gameWinner && (
        <Card className="border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 via-orange-50 to-red-50 dark:from-yellow-900/20 dark:via-orange-900/20 dark:to-red-900/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-6xl animate-bounce">🏆</div>
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                  🎉 GAME OVER! 🎉
                </h2>
                <p className="text-xl font-semibold text-orange-700 dark:text-orange-300">
                  {gameWinner.name} is the Champion!
                </p>
                <div className="flex justify-center">
                  <Badge className="text-lg px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    Final Score: {calculatePlayerTotal(gameWinner.id)} points
                  </Badge>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                {(() => {
                  const reason = gameSettings.hasMaxRounds && rounds.length >= gameSettings.maxRounds
                    ? `Maximum rounds (${gameSettings.maxRounds}) reached!`
                    : gameSettings.hasTargetScore
                      ? `Reached target score of ${gameSettings.scoreToWin}!`
                      : 'Game ended manually'
                  return reason
                })()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Game Settings */}
      {showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Game Settings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...settingsForm}>
              <form onSubmit={settingsForm.handleSubmit(handleSettingsUpdate)} className="space-y-4">
                <FormField
                  control={settingsForm.control}
                  name="winCondition"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Win Condition</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select win condition" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="highest">Highest Score Wins</SelectItem>
                          <SelectItem value="lowest">Lowest Score Wins</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {settingsForm.watch('hasTargetScore') && (
                  <FormField
                    control={settingsForm.control}
                    name="scoreToWin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Target Score
                          {settingsForm.watch('winCondition') === 'lowest' && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (Upper bound - game ends when any player reaches this score)
                            </span>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <FormField
                      control={settingsForm.control}
                      name="hasTargetScore"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Set target score</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <FormField
                      control={settingsForm.control}
                      name="hasMaxRounds"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel>Limit number of rounds</FormLabel>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {settingsForm.watch('hasMaxRounds') && (
                  <FormField
                    control={settingsForm.control}
                    name="maxRounds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Rounds</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button type="submit" className="w-full">
                  Start Game
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Game Status */}
      {!showSettings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{game.name} - Round {currentRound + 1}</span>
              <div className="flex items-center gap-2">
                {gameWinner && (
                  <Badge variant="default" className="flex items-center gap-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white animate-pulse">
                    <Trophy className="h-4 w-4" />
                    🎉 {gameWinner.name} Wins!
                  </Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  disabled={rounds.length > 0}
                  aria-label="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="font-medium">Target:</span> {
                  gameSettings.hasTargetScore
                    ? `${gameSettings.scoreToWin} pts${gameSettings.winCondition === 'lowest' ? ' (upper bound)' : ''}`
                    : 'None'
                }
              </div>
              <div>
                <span className="font-medium">Win Condition:</span> {gameSettings.winCondition === 'highest' ? 'Highest' : 'Lowest'}
              </div>
              <div>
                <span className="font-medium">Round:</span> {currentRound + 1}
                {gameSettings.hasMaxRounds && ` / ${gameSettings.maxRounds}`}
              </div>
              <div>
                <span className="font-medium">Players:</span> {players.length}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Real-time Summary */}
      {!showSettings && rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Game Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Leader */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Current Leader
                </div>
                {(() => {
                  const stats = getGameStats()
                  return (
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-lg text-yellow-700 dark:text-yellow-300">
                        {stats.leader ? `👑 ${stats.leader.name}` : "🤝 Tied"}
                      </span>
                      <Badge variant="secondary" className="text-sm bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {stats.bestScore} pts
                      </Badge>
                    </div>
                  )
                })()}
              </div>

              {/* Game Progress */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Game Progress
                </div>
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Rounds:</span> {getGameStats().roundsPlayed}
                    {gameSettings.hasMaxRounds && ` / ${gameSettings.maxRounds}`}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Avg Score:</span> {getGameStats().averageScore} pts
                  </div>
                  {getGameStats().isCloseGame && (
                    <Badge variant="outline" className="text-xs">
                      Close Game!
                    </Badge>
                  )}
                </div>
              </div>

              {/* Current Standings */}
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground">
                  Current Standings
                </div>
                <div className="space-y-1">
                  {getCurrentStandings().map((standing, index) => (
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
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${index === 0 ? 'text-yellow-800 dark:text-yellow-200' : ''}`}>
                          {standing.total}
                        </span>
                        {gameSettings.hasTargetScore && (
                          <span className="text-xs text-muted-foreground">
                            ({standing.pointsToTarget} to {gameSettings.winCondition === 'highest' ? 'win' : 'target'})
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score History */}
      {!showSettings && rounds.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Score History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Round</TableHead>
                    {players.map((player) => (
                      <TableHead key={player.id} className="text-center">
                        {player.name}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rounds.map((round, roundIndex) => (
                    <TableRow key={roundIndex}>
                      <TableCell className="font-medium">
                        Round {roundIndex + 1}
                      </TableCell>
                      {players.map((player) => (
                        <TableCell key={player.id} className="text-center">
                          {round[player.id]?.score || 0}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                  {/* Totals Row */}
                  <TableRow className="bg-muted/50 font-semibold">
                    <TableCell>Total</TableCell>
                    {players.map((player) => {
                      const total = calculatePlayerTotal(player.id)
                      const standings = getCurrentStandings()
                      const isLeader = standings[0]?.player.id === player.id && standings[0]?.total > 0
                      return (
                        <TableCell key={player.id} className={`text-center ${isLeader ? 'bg-gradient-to-br from-yellow-100 to-orange-100 text-yellow-800 font-bold dark:from-yellow-900/30 dark:to-orange-900/30 dark:text-yellow-200' : ''
                          }`}>
                          {isLeader ? `👑 ${total}` : total}
                        </TableCell>
                      )
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Round Input */}
      {!showSettings && !gameWinner && (
        <Card>
          <CardHeader>
            <CardTitle>Enter Scores for Round {currentRound + 1}</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleCompleteRound)} className="space-y-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-48">Player</TableHead>
                        <TableHead className="text-center">Score</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {players.map((player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell className="text-center">
                            <FormField
                              control={form.control}
                              name={`${player.id}.score`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input
                                      type="number"
                                      className="text-center"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-3">
                  <Button type="submit" className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Complete Round {currentRound + 1}
                  </Button>

                  {!gameSettings.hasTargetScore && rounds.length > 0 && (
                    <Button
                      type="button"
                      variant="secondary"
                      className="w-full"
                      onClick={handleEndGame}
                    >
                      <Trophy className="mr-2 h-4 w-4" />
                      End Game Now
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Save Session Button */}
      {!showSettings && (gameWinner || rounds.length > 0) && (
        <Button
          onClick={handleSaveSession}
          className="w-full"
          disabled={isSubmitting}
          variant={gameWinner ? "default" : "outline"}
        >
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? "Saving..." : "Save Game Session"}
        </Button>
      )}
    </div>
  )
}
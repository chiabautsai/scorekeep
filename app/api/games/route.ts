import { NextResponse } from 'next/server'
import { getGames, addGame } from '@/lib/db/queries'

export async function GET() {
  try {
    const games = await getGames()
    return NextResponse.json(games)
  } catch (error) {
    console.error('Failed to fetch games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const game = await addGame(body)
    return NextResponse.json(game)
  } catch (error) {
    console.error('Failed to add game:', error)
    return NextResponse.json(
      { error: 'Failed to add game' },
      { status: 500 }
    )
  }
}
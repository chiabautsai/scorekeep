import { NextResponse } from 'next/server'
import { getPlayers, addPlayer } from '@/lib/db/queries'

export async function GET() {
  try {
    const players = await getPlayers()
    return NextResponse.json(players)
  } catch (error) {
    console.error('Failed to fetch players:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const player = await addPlayer(body)
    return NextResponse.json(player)
  } catch (error) {
    console.error('Failed to add player:', error)
    return NextResponse.json(
      { error: 'Failed to add player' },
      { status: 500 }
    )
  }
}
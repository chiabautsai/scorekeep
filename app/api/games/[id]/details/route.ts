import { NextResponse } from 'next/server'
import { getGameById } from '@/lib/game-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const game = await getGameById(params.id)
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(game)
  } catch (error) {
    console.error('Failed to fetch game details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game details' },
      { status: 500 }
    )
  }
}
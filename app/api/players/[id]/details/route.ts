import { NextResponse } from 'next/server'
import { getPlayerById } from '@/lib/player-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const player = await getPlayerById(params.id)
    if (!player) {
      return NextResponse.json(
        { error: 'Player not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(player)
  } catch (error) {
    console.error('Failed to fetch player details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player details' },
      { status: 500 }
    )
  }
}
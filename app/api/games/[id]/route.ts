import { NextResponse } from 'next/server'
import { getGame } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const game = await getGame(params.id)
    if (!game) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(game)
  } catch (error) {
    console.error('Failed to fetch game:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { getGameSessions } from '@/lib/game-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessions = await getGameSessions(params.id)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Failed to fetch game sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch game sessions' },
      { status: 500 }
    )
  }
}
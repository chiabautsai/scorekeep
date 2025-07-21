import { NextResponse } from 'next/server'
import { getPlayerSessions } from '@/lib/player-data'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const sessions = await getPlayerSessions(params.id)
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Failed to fetch player sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player sessions' },
      { status: 500 }
    )
  }
}
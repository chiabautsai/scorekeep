import { NextResponse } from 'next/server'
import { getRecentSessions } from '@/lib/db/queries'

export async function GET() {
  try {
    const sessions = await getRecentSessions()
    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Failed to fetch recent sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch recent sessions' },
      { status: 500 }
    )
  }
}
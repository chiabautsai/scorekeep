import { NextResponse } from 'next/server'
import { getPlayerStats } from '@/lib/db/queries'

export async function GET() {
  try {
    const stats = await getPlayerStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Failed to fetch player stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch player stats' },
      { status: 500 }
    )
  }
}
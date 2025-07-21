import { NextResponse } from 'next/server'
import { getPopularGames } from '@/lib/db/queries'

export async function GET() {
  try {
    const games = await getPopularGames()
    return NextResponse.json(games)
  } catch (error) {
    console.error('Failed to fetch popular games:', error)
    return NextResponse.json(
      { error: 'Failed to fetch popular games' },
      { status: 500 }
    )
  }
}
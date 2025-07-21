import { NextResponse } from 'next/server'
import { getPlayersByIds } from '@/lib/db/queries'

export async function POST(request: Request) {
  try {
    const { ids } = await request.json()
    const players = await getPlayersByIds(ids)
    return NextResponse.json(players)
  } catch (error) {
    console.error('Failed to fetch players by IDs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch players' },
      { status: 500 }
    )
  }
}
import { NextResponse } from 'next/server'
import { saveSession } from '@/lib/db/queries'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const session = await saveSession(body)
    return NextResponse.json(session)
  } catch (error) {
    console.error('Failed to save session:', error)
    return NextResponse.json(
      { error: 'Failed to save session' },
      { status: 500 }
    )
  }
}
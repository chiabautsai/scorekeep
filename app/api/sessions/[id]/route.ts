import { NextResponse } from 'next/server'
import { getSession } from '@/lib/db/queries'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession(params.id)
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(session)
  } catch (error) {
    console.error('Failed to fetch session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}
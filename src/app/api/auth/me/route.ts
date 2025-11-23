import { NextResponse } from 'next/server'
import { getUser } from '@/lib/getUser'

export async function GET() {
  const user = await getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
}
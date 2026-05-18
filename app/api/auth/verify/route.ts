import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { password } = await req.json()

  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true })

  res.cookies.set('ce_admin_authed', 'true', {
    httpOnly: true,
    maxAge: 86400,
    path: '/',
    sameSite: 'lax',
  })

  return res
}

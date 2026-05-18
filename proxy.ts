import { NextRequest, NextResponse } from 'next/server'

export function proxy(req: NextRequest) {
  const authed = req.cookies.get('ce_admin_authed')
  const isLogin = req.nextUrl.pathname === '/login'
  const isApi = req.nextUrl.pathname.startsWith('/api')

  if (!authed && !isLogin && !isApi) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (authed && isLogin) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|images/).*)'],
}

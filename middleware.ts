import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/setup', '/api/auth/login', '/api/auth/logout', '/api/household']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for session cookie
  const session = request.cookies.get('kitchen-prep-session')

  if (!session) {
    const url = request.nextUrl.clone()
    url.pathname = '/setup'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

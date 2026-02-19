import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const protectedRoutes = ['/dashboard', '/settings', '/content', '/media', '/crm', '/setup']
const authRoutes = ['/login', '/signup', '/forgot-password']

// Middleware runs in Edge — can't import server-only constants, so read env directly
const prefix = process.env.TABLE_PREFIX || '0n'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionToken = request.cookies.get(`${prefix}_session`)?.value

  const isProtected = protectedRoutes.some((r) => pathname.startsWith(r))
  const isAuthRoute = authRoutes.some((r) => pathname.startsWith(r))

  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/content/:path*',
    '/media/:path*',
    '/crm/:path*',
    '/setup/:path*',
    '/login',
    '/signup',
    '/forgot-password',
  ],
}

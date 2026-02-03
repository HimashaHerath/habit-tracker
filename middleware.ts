import { updateSession } from '@/lib/supabase/proxy'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isAuthRoute = request.nextUrl.pathname.startsWith('/auth')
  if (!isAuthRoute) {
    const code = request.nextUrl.searchParams.get('code')
    if (code) {
      const type = request.nextUrl.searchParams.get('type')
      const destination =
        type === 'recovery' ? '/auth/reset-password' : '/auth/callback'
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = destination
      return NextResponse.redirect(redirectUrl)
    }
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

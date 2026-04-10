import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Do not add logic between createServerClient and
  // supabase.auth.getUser(). Doing so invalidates the session refresh.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Route Protection ─────────────────────────────────────────────────────
  // Customer portal: /dashboard, /orders, /appointments, /profile
  const portalPaths = ['/dashboard', '/orders', '/appointments', '/profile']
  const isPortalRoute = portalPaths.some((p) => pathname.startsWith(p))

  // Admin routes: /admin/*
  const isAdminRoute = pathname.startsWith('/admin')

  // Sales agent routes: /agent/*
  const isAgentRoute = pathname.startsWith('/agent')

  if ((isPortalRoute || isAdminRoute || isAgentRoute) && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Affiliate Referral Tracking ──────────────────────────────────────────
  // Capture ?ref=AGENT_CODE from any page and persist it as a 7-day cookie.
  const refCode = request.nextUrl.searchParams.get('ref')
  if (refCode) {
    supabaseResponse.cookies.set('referral_code', refCode, {
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
      path: '/',
      httpOnly: false, // Must be readable by the checkout client
    })
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public assets (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}

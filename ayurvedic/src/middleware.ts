import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

type UserRole = 'admin' | 'customer' | 'sales_agent' | 'doctor' | 'front_desk' | 'product_manager'

function homeForRole(role: UserRole | null | undefined): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'sales_agent':
      return '/agent/dashboard'
    case 'doctor':
      return '/doctor'
    case 'front_desk':
      return '/console'
    case 'product_manager':
      return '/product-management'
    case 'customer':
    default:
      return '/account/dashboard'
  }
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

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

  const isAccountRoute = pathname.startsWith('/account')

  // /admin/login and /agent/login are PUBLIC sign-in pages (not protected).
  // Only the dashboard parts (under the (portal) route group) are role-gated.
  const isAdminLogin = pathname === '/admin/login'
  const isAgentLogin = pathname === '/agent/login'
  const isStaffLogin = pathname === '/staff/login'
  const isDoctorLogin = pathname === '/doctor/login'
  const isProductManagementLogin = pathname === '/product-management/login'
  const isAdminRoute = pathname.startsWith('/admin') && !isAdminLogin
  const isAgentRoute = pathname.startsWith('/agent') && !isAgentLogin
  // Front-desk + admin share the /console workspace; doctors get /doctor.
  const isConsoleRoute = pathname.startsWith('/console')
  const isDoctorRoute = pathname.startsWith('/doctor') && !isDoctorLogin
  // Product Management has its own dedicated account/login — separate from
  // the admin portal (admin can still enter as a fallback/oversight path).
  const isProductManagementRoute =
    pathname.startsWith('/product-management') && !isProductManagementLogin
  const isProtectedRoute =
    isAccountRoute ||
    isAdminRoute ||
    isAgentRoute ||
    isConsoleRoute ||
    isDoctorRoute ||
    isProductManagementRoute

  // Auth pages that signed-in users should be bounced away from.
  // We DO NOT bounce away from /auth/callback (mid-OAuth handshake) or
  // /auth/reset-password (user is signed in via a recovery session here).
  const isBouncableAuthPage =
    pathname === '/auth/login' ||
    pathname === '/auth/register' ||
    pathname === '/auth/forgot-password' ||
    isAdminLogin ||
    isAgentLogin ||
    isStaffLogin ||
    isDoctorLogin ||
    isProductManagementLogin

  // ── Not signed in → send to the portal-specific login page ──────────────
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = isAdminRoute
      ? '/admin/login'
      : isAgentRoute
      ? '/agent/login'
      : isDoctorRoute
      ? '/doctor/login'
      : isConsoleRoute
      ? '/staff/login'
      : isProductManagementRoute
      ? '/product-management/login'
      : '/auth/login'
    loginUrl.search = ''
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── Signed in → role gating ──────────────────────────────────────────────
  if (user && (isProtectedRoute || isBouncableAuthPage)) {
    const { data: profileRaw } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const profile = profileRaw as { role: UserRole } | null
    const role = profile?.role ?? null

    // Bounce already-signed-in users off the auth pages → their home
    if (isBouncableAuthPage) {
      const home = request.nextUrl.clone()
      home.pathname = homeForRole(role)
      home.search = ''
      return NextResponse.redirect(home)
    }

    // Role mismatch on any portal route → redirect to the user's own home.
    // Cleaner UX than 404; access decision is invisible to the wrong-role user.
    const wrongRoleForAdmin = isAdminRoute && role !== 'admin'
    const wrongRoleForAgent = isAgentRoute && role !== 'sales_agent'
    const wrongRoleForAccount = isAccountRoute && role !== 'customer'
    // /console = admin + front desk; /doctor = doctor + admin.
    const wrongRoleForConsole =
      isConsoleRoute && role !== 'admin' && role !== 'front_desk'
    const wrongRoleForDoctor =
      isDoctorRoute && role !== 'admin' && role !== 'doctor'
    // Product Management: its own account (product_manager), admin can also enter.
    const wrongRoleForProductManagement =
      isProductManagementRoute && role !== 'admin' && role !== 'product_manager'
    if (
      wrongRoleForAdmin ||
      wrongRoleForAgent ||
      wrongRoleForAccount ||
      wrongRoleForConsole ||
      wrongRoleForDoctor ||
      wrongRoleForProductManagement
    ) {
      const home = request.nextUrl.clone()
      home.pathname = homeForRole(role)
      home.search = ''
      return NextResponse.redirect(home)
    }
  }

  // ── Brand Partner referral tracking ──────────────────────────────────────
  // Capture ?ref=PARTNER_CODE from any page → 7-day cookie. Used at checkout
  // to populate orders.referral_agent_id.
  const refCode = request.nextUrl.searchParams.get('ref')
  if (refCode) {
    supabaseResponse.cookies.set('referral_code', refCode, {
      maxAge: 60 * 60 * 24 * 7,
      sameSite: 'lax',
      path: '/',
      httpOnly: false, // readable by the checkout client
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

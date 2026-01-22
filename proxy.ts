import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import {
  PROTECTED_ROUTES,
  PUBLIC_ROUTES,
  ROLE_ROUTES,
  ROLE_DEFAULT_PATHS,
} from '@/lib/constants'

// Helper function to check if path matches allowed routes
function hasAccess(userRole: string, pathname: string): boolean {
  // Master has access to everything
  if (userRole === 'master') {
    return true
  }

  // Check if it's a protected route (all authenticated users can access)
  const isProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route))
  if (isProtected) {
    return true
  }

  // Check role-specific routes
  const allowedRoutes = ROLE_ROUTES[userRole] || []

  // If no routes defined, deny access
  if (allowedRoutes.length === 0) {
    return false
  }

  // Check if pathname starts with any allowed route
  return allowedRoutes.some(route => {
    if (route === '*') return true
    return pathname.startsWith(route)
  })
}

// Helper function to check if route is public
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  })
}

// Helper function to get default redirect path based on role
function getDefaultPath(userRole: string): string {
  return ROLE_DEFAULT_PATHS[userRole] || '/dashboard'
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always refresh/keep Supabase session in sync (do not modify this helper).
  // This response may contain updated auth cookies.
  const supabaseResponse = await updateSession(request)

  // Step 1: Check if route is public
  if (isPublicRoute(pathname)) {
    return supabaseResponse
  }

  const userId = supabaseResponse.headers.get('x-user-id') || ''
  const userRoleFromSession = supabaseResponse.headers.get('x-user-role') || 'customer'

  // Step 2: Check authentication
  if (!userId) {
    // No user, redirect to sign-in
    const signInUrl = new URL('/sign-in', request.url)
    signInUrl.searchParams.set('from', pathname)
    const redirectResponse = NextResponse.redirect(signInUrl)
    
    // Preserve Supabase cookies
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  // Step 3: Extract user role from app_metadata
  // Requirement: role stored as session.user.meta_data.role
  const userRole = userRoleFromSession.toLowerCase().trim()

  // Step 4: Check role-based access
  if (!hasAccess(userRole, pathname)) {
    // Wrong role -> block and redirect to home
    const redirectResponse = NextResponse.redirect(new URL('/', request.url))
    
    // Copy Supabase cookies to redirect response
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value)
    })
    
    return redirectResponse
  }

  // Step 5: User has access, create final response
  const finalResponse = NextResponse.next({
    request,
  })

  // Copy Supabase cookies
  supabaseResponse.cookies.getAll().forEach(cookie => {
    finalResponse.cookies.set(cookie.name, cookie.value)
  })

  // Add user info to headers for server components
  finalResponse.headers.set('x-user-role', userRole)
  finalResponse.headers.set('x-user-id', userId)

  return finalResponse
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

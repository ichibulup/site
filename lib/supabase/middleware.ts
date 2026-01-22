import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: If you remove getClaims() and you use server-side rendering
  // with the Supabase client, your users may be randomly logged out.
  const { data: claimsData } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  const user = claims

  // Expose basic auth info via headers so the proxy middleware can do RBAC.
  // Use getUser() (server-verified) instead of getSession() to avoid trusting
  // potentially tampered cookie/session payload.
  const {
    data: { user: verifiedUser },
  } = await supabase.auth.getUser()

  const claimUserId = typeof claims?.sub === 'string' ? claims.sub : ''
  const claimRoleRaw =
    claims?.app_metadata?.role ??
    claims?.user_metadata?.role ??
    claims?.role ??
    "customer"
  const userId = verifiedUser?.id ?? claimUserId ?? ''
  const rawRole =
    verifiedUser?.app_metadata?.role ??
    verifiedUser?.user_metadata?.role ??
    claimRoleRaw ??
    "customer"
  const userRole = typeof rawRole === 'string' ? rawRole.toLowerCase() : "customer"

  supabaseResponse.headers.set('x-user-id', userId)
  supabaseResponse.headers.set('x-user-role', userRole)
  supabaseResponse.headers.set('x-user-authenticated', userId ? '1' : '0')

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/') &&
    !request.nextUrl.pathname.startsWith('/sign-in')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    // url.pathname = '/auth/login'
    url.pathname = '/sign-in'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

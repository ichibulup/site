import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import axios from 'axios'

export async function updateSession(request: NextRequest) {
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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Lấy access token và refresh token từ cookies
  const accessToken = request.cookies.get('access_token')?.value
  const refreshToken = request.cookies.get('refresh_token')?.value

  // Danh sách các route công khai không yêu cầu xác thực
  const publicRoutes = [
    '/',
    '/sign-in',
    '/sign-up', 
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth',
    '/about',
    '/contact',
    '/privacy-policy',
    '/terms-of-service',
    '/landing',
    '/pages',
    '/coming-soon',
    '/directing',
    '/error',
    '/loading',
    '/not-authorized',
    '/under-maintenance',
    '/manager/*',
    '/manager'
  ]

  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname === route || request.nextUrl.pathname.startsWith(route + '/')
  )

  // Nếu là route công khai, cho phép truy cập
  if (isPublicRoute) {
    return supabaseResponse
  }

  // Nếu không có access token, redirect về trang chủ
  if (!accessToken) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Xác thực token với Express API thông qua /auth/me endpoint
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      withCredentials: true,
      validateStatus: (status) => status < 500, // Không throw error cho status < 500
    })

    // Nếu token không hợp lệ (401, 403), redirect về trang chủ
    if (response.status === 401 || response.status === 403) {
      console.warn(`[Middleware] Auth verification failed: ${response.status}`)
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }

    // Token hợp lệ, cho phép truy cập
    if (response.status === 200) {
      const userData = response.data
      console.log('[Middleware] User authenticated:', userData?.email || userData?.username)
    }
    
  } catch (error) {
    // Lỗi kết nối hoặc lỗi server, redirect về trang chủ
    console.error('[Middleware] Auth verification error:', error)
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

// export async function updateSession(request: NextRequest) {
//   let supabaseResponse = NextResponse.next({
//     request,
//   })
//
//   // With Fluid compute, don't put this client in a global environment
//   // variable. Always create a new one on each request.
//   const supabase = createServerClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll()
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
//           supabaseResponse = NextResponse.next({
//             request,
//           })
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           )
//         },
//       },
//     }
//   )
//
//   // Do not run code between createServerClient and
//   // supabase.auth.getClaims(). A simple mistake could make it very hard to debug
//   // issues with users being randomly logged out.
//
//   // IMPORTANT: If you remove getClaims() and you use server-side rendering
//   // with the Supabase client, your users may be randomly logged out.
//   const { data } = await supabase.auth.getClaims()
//   const user = data?.claims
//
//   if (
//     !user &&
//     !request.nextUrl.pathname.startsWith('/login') &&
//     !request.nextUrl.pathname.startsWith('/auth')
//   ) {
//     // no user, potentially respond by redirecting the user to the login page
//     const url = request.nextUrl.clone()
//     url.pathname = '/auth/login'
//     return NextResponse.redirect(url)
//   }
//
//   // IMPORTANT: You *must* return the supabaseResponse object as it is.
//   // If you're creating a new response object with NextResponse.next() make sure to:
//   // 1. Pass the request in it, like so:
//   //    const myNewResponse = NextResponse.next({ request })
//   // 2. Copy over the cookies, like so:
//   //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
//   // 3. Change the myNewResponse object to fit your needs, but avoid changing
//   //    the cookies!
//   // 4. Finally:
//   //    return myNewResponse
//   // If this is not done, you may be causing the browser and server to go out
//   // of sync and terminate the user's session prematurely!
//
//   return supabaseResponse
// }


// import { createServerClient, type CookieOptions } from "@supabase/ssr";

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// export const createClient = (request: NextRequest) => {
//   // Create an unmodified response
//   let supabaseResponse = NextResponse.next({
//     request: {
//       headers: request.headers,
//     },
//   });

//   const supabase = createServerClient(
//     supabaseUrl!,
//     supabaseKey!,
//     {
//       cookies: {
//         getAll() {
//           return request.cookies.getAll()
//         },
//         setAll(cookiesToSet) {
//           cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
//           supabaseResponse = NextResponse.next({
//             request,
//           })
//           cookiesToSet.forEach(({ name, value, options }) =>
//             supabaseResponse.cookies.set(name, value, options)
//           )
//         },
//       },
//     },
//   );

//   return supabaseResponse
// };

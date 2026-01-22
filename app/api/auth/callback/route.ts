import { createServer } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const supabase = await createServer()

    // Get the current user from Supabase Auth
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the session to send tokens to backend
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'No active session' },
        { status: 401 }
      )
    }

    // Call Express API to sync user using axios
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

    try {
      const syncResponse = await axios.post(
        `${apiUrl}/auth/callback`,
        {
          session: session,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      )

      // Return response with user data
      const response = NextResponse.json({
        success: true,
        message: 'User synced successfully',
        user: syncResponse.data.data?.user,
        dbUser: syncResponse.data.data?.dbUser,
      })

      // Copy cookies from backend response if available
      const setCookieHeader = syncResponse.headers['set-cookie']
      if (setCookieHeader) {
        // Handle both string and array of cookies
        if (Array.isArray(setCookieHeader)) {
          setCookieHeader.forEach(cookie => {
            response.headers.append('set-cookie', cookie)
          })
        } else {
          response.headers.set('set-cookie', setCookieHeader)
        }
      }

      return response
    } catch (syncError: any) {
      console.error('Sync user to backend failed:', syncError)

      // Handle axios error
      if (syncError.response) {
        return NextResponse.json(
          {
            error: syncError.response.data?.message || 'Failed to sync user',
            details: syncError.response.data
          },
          { status: syncError.response.status }
        )
      }

      throw syncError
    }
  } catch (error: any) {
    console.error('Sync user error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error.message
      },
      { status: 500 }
    )
  }
}

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url)
//   const code = searchParams.get('code')
//   const next = searchParams.get('next') ?? '/'
//
//   if (code) {
//     const supabase = await createClient()
//     const { data, error } = await supabase.auth.exchangeCodeForSession(code)
//
//     if (!error && data.session && data.user) {
//       // Sync user to Express backend after successful OAuth
//       try {
//         const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'
//
//         const syncResponse = await fetch(`${apiBaseUrl}/api/v1/auth/sync-user`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//           },
//           body: JSON.stringify({
//             user: data.user,
//             session: data.session,
//           }),
//         })
//
//         if (syncResponse.ok) {
//           // Create redirect response
//           const forwardedHost = request.headers.get('x-forwarded-host')
//           const isLocalEnv = process.env.NODE_ENV === 'development'
//
//           let redirectUrl: string
//           if (isLocalEnv) {
//             redirectUrl = `${origin}${next}`
//           } else if (forwardedHost) {
//             redirectUrl = `https://${forwardedHost}${next}`
//           } else {
//             redirectUrl = `${origin}${next}`
//           }
//
//           const response = NextResponse.redirect(redirectUrl)
//
//           // Copy cookies from Express backend
//           const setCookieHeader = syncResponse.headers.get('set-cookie')
//           if (setCookieHeader) {
//             // Parse and set each cookie
//             const cookies = setCookieHeader.split(',').map(c => c.trim())
//             cookies.forEach(cookie => {
//               response.headers.append('Set-Cookie', cookie)
//             })
//           }
//
//           return response
//         } else {
//           console.error('Failed to sync user:', await syncResponse.text())
//         }
//       } catch (syncError) {
//         console.error('Error syncing user to backend:', syncError)
//       }
//
//       // Fallback: redirect even if sync fails
//       const forwardedHost = request.headers.get('x-forwarded-host')
//       const isLocalEnv = process.env.NODE_ENV === 'development'
//
//       if (isLocalEnv) {
//         return NextResponse.redirect(`${origin}${next}`)
//       } else if (forwardedHost) {
//         return NextResponse.redirect(`https://${forwardedHost}${next}`)
//       } else {
//         return NextResponse.redirect(`${origin}${next}`)
//       }
//     }
//   }
//
//   // return the user to an error page with instructions
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`)
// }

import { NextResponse } from 'next/server'
import { createServer } from '@/lib/supabase/server'
import axios from 'axios'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const code = url.searchParams.get('code')
  let next = url.searchParams.get('next') ?? '/'

  // bảo vệ open-redirect
  if (!next.startsWith('/')) next = '/'

  if (!code) {
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  const supabase = await createServer()

  // 1) exchange code -> set cookies session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
  if (exchangeError) {
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  // 2) lấy session sau khi exchange
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError || !session) {
    return NextResponse.redirect(new URL('/auth/error', origin))
  }

  // 3) sync qua backend Express
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

  try {
    const syncResponse = await axios.post(
      `${apiUrl}/auth/callback`,
      { session },
      {
        headers: { 'Content-Type': 'application/json' },
        // ⚠️ server-to-server không cần withCredentials
        // withCredentials chỉ có ý nghĩa trên browser
        validateStatus: () => true,
      }
    )

    // (tuỳ chọn) nếu backend trả Set-Cookie muốn forward về browser:
    // Chỉ làm nếu bạn thật sự cần cookie từ backend xuất hiện ở domain Next.js
    // (đa số trường hợp không cần; vì cookie backend nên set trên domain backend)
    // const setCookie = syncResponse.headers['set-cookie']

    // Nếu muốn: fail sync vẫn cho user vào app
    // Nếu bạn muốn chặt chẽ: check status 2xx rồi mới cho qua
  } catch (e) {
    // fail sync vẫn cho user vào app (khuyến nghị)
    console.error('❌ Sync to backend failed:', e)
  }

  // 4) redirect về app
  const forwardedHost = request.headers.get('x-forwarded-host')
  const isLocal = process.env.NODE_ENV === 'development'

  if (isLocal) return NextResponse.redirect(`${origin}${next}`)
  if (forwardedHost) return NextResponse.redirect(`https://${forwardedHost}${next}`)
  return NextResponse.redirect(`${origin}${next}`)
}

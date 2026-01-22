import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token');
  const refreshToken = cookieStore.get('refresh_token');

  // Authenticated if has access token OR refresh token (backend will auto-refresh)
  return NextResponse.json({
    authenticated: !!accessToken || !!refreshToken,
    hasAccessToken: !!accessToken,
    hasRefreshToken: !!refreshToken,
  });
}

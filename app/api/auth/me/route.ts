import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token');
    
    if (!accessToken) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    // Call Express API to get user info
    const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/api/v1/auth/me`, {
      headers: {
        'Cookie': `access_token=${accessToken.value}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json({
        authenticated: false,
        user: null,
      });
    }

    const data = await response.json();
    
    return NextResponse.json({
      authenticated: data.authenticated || false,
      user: data.user || null,
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({
      authenticated: false,
      user: null,
    });
  }
}

/**
 * Supabase configuration and shared utilities
 */

export const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
}

/**
 * Validates that required Supabase environment variables are set
 */
export function validateSupabaseConfig() {
  if (!supabaseConfig.url || !supabaseConfig.anonKey) {
    throw new Error('Missing Supabase environment variables')
  }
}

/**
 * Common cookie options for Supabase
 */
export const supabaseCookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}

'use client'

import { useMemo } from 'react';
import { useAuth } from "@/hooks/use-auth";
import { User } from '@/lib/interfaces';
import { normalizeUserFromSupabase } from '@/lib/utils/formatters';

export function useUser() {
  const { session, isLoading, isLoggedIn } = useAuth();
  const user = session?.user

  const info: User | null = useMemo(() => {
    if (!user) return null;
    return normalizeUserFromSupabase(user);
  }, [user]);

  return {
    user: info,
    raw: session?.user,
    // isAuthenticated: !!user,
    isLoggedIn,
    isLoading,
    // session: undefined,
    // profile: undefined,
    // isLoading: true,
    // isLoggedIn: false,
    session,
  };
}

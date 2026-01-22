import { Session, User } from '@supabase/supabase-js'
import { createContext, useContext } from 'react'

export type AuthData = {
  session?: Session | null;
  profile?: any | null;
  user?: User | null;
  info?: any | null;
  isLoading: boolean;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  user: undefined,
  info: undefined,
  isLoading: true,
  isLoggedIn: false,
})

export const useAuthContext = () => useContext(AuthContext)

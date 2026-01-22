"use client";

import React, {
  PropsWithChildren,
  ReactNode,
  useEffect,
  useState,
  useContext,
  createContext,
} from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from '@/lib/supabase';
import { AuthContext } from "@/hooks/use-auth";
// import { useAuth } from '@/hooks/use-auth';

// Re-export auth helpers for convenience
// export { getUserRole, getUserDbMetadata, hasRole, isAdmin, isStaff } from '@/lib/auth-helpers';

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | undefined | null>();
  const [profile, setProfile] = useState<any>();
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch the session once, and subscribe to auth state changes
  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Error fetching session:", error);
      }

      setSession(session);
      setIsLoading(false);
    };

    fetchSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // console.log('Auth state changed:', { event: _event, session })
      setSession(session);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the profile when the session changes
  // useEffect(() => {
  //   const fetchProfile = async () => {
  //     setIsLoading(true);
  //
  //     if (session) {
  //       const { data, error } = await supabase
  //         .from("profiles")
  //         .select("*")
  //         .eq("id", session.user.id)
  //         .single();
  //
  //       setProfile(data);
  //     } else {
  //       setProfile(null);
  //     }
  //
  //     setIsLoading(false);
  //   };
  //
  //   fetchProfile();
  // }, [session]);

  return (
    <AuthContext.Provider
      value={{
        session,
        isLoading,
        profile,
        // user: session?.user ?? null,
        // info: null,
        isLoggedIn: !!session && !!session.user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  sessions: any[];
  signIn: (identifier: string, password: string) => Promise<any>;
  signUp: (data: any) => Promise<any>;
  signOut: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (data: any) => Promise<any>;
  signInWithOAuth: (provider: 'google' | 'facebook' | 'apple', options?: { redirectTo?: string }) => Promise<any>;
  verifyEmail: (data: any) => Promise<any>;
  resendVerificationEmail: () => Promise<any>;
  updateProfile: (data: any) => Promise<any>;
  // revokeSession: (sessionId: string) => Promise<any>;
  // revokeAllSessions: () => Promise<any>;
  refetchUser: () => void;
}

// const AuthContextOld = createContext<AuthContextType | undefined>(undefined);
//
// export function AuthProviderOld({ children }: { children: ReactNode }) {
//   const auth = useAuth();
//
// 	// // Revalidate auth when page becomes visible or focus changes
// 	// useEffect(() => {
// 	// 	const handleVisibilityChange = () => {
// 	// 		if (document.visibilityState === 'visible' && auth.user) {
// 	// 			// Page is visible and we have a user, revalidate
// 	// 			auth.refetchUser();
// 	// 		}
// 	// 	};
//
// 	// 	const handleFocus = () => {
// 	// 		if (auth.user) {
// 	// 			auth.refetchUser();
// 	// 		}
// 	// 	};
//
// 	// 	document.addEventListener('visibilitychange', handleVisibilityChange);
// 	// 	window.addEventListener('focus', handleFocus);
//
// 	// 	// Periodic check every 5 minutes to refresh token if needed
// 	// 	const interval = setInterval(() => {
// 	// 		if (auth.user) {
// 	// 			auth.refetchUser();
// 	// 		}
// 	// 	}, 5 * 60 * 1000);
//
// 	// 	return () => {
// 	// 		document.removeEventListener('visibilitychange', handleVisibilityChange);
// 	// 		window.removeEventListener('focus', handleFocus);
// 	// 		clearInterval(interval);
// 	// 	};
// 	// }, [auth]);
//
//   return (
//     <AuthContextOld.Provider value={auth}>
//       {children}
//     </AuthContextOld.Provider>
//   );
// }
//
// export function useAuthContext() {
//   const context = useContext(AuthContext);
//   if (context === undefined) {
//     throw new Error('useAuthContext must be used within an AuthProvider');
//   }
//   return context;
// }


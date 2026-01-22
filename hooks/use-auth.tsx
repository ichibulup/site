// "use client";
import { useEffect, useState, useRef, createContext, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js'

export type AuthData = {
  session?: Session | null;
  profile?: any | null;
  isLoading: boolean;
  isLoggedIn: boolean;
};

export const AuthContext = createContext<AuthData>({
  session: undefined,
  profile: undefined,
  isLoading: true,
  isLoggedIn: false,
})

export const useAuth = () => useContext(AuthContext)


// import { useRouter } from 'next/navigation';
// import {
//   useLoginMutation,
//   useRegisterMutation,
//   useLogoutMutation,
//   useGetMeQuery,
//   useForgotPasswordMutation,
//   useResetPasswordMutation,
//   useChangePasswordMutation,
//   useVerifyEmailMutation,
//   useResendVerificationEmailMutation,
//   useOauthLoginMutation,
//   useSyncUserMutation,
//   useUpdateProfileMutation,
//   useGetUserSessionsQuery,
//   useRevokeSessionMutation,
//   useRevokeAllSessionsMutation,
// } from '@/state/api';
// // Global state to track synced users (prevents duplicate syncs across component mounts)
// const syncedUsers = new Set<string>();
// let syncInProgress = false;
//
// /**
//  * useAuth - Pure Supabase Auth implementation
//  *
//  * Sync Strategy:
//  * - Only syncs ONCE per user session on SIGNED_IN event
//  * - Uses debounce (500ms) to prevent rapid-fire duplicate calls
//  * - Tracks synced users globally to avoid re-syncing on component remounts
//  * - Profile updates trigger immediate sync (required for metadata changes)
//  * - Sign in/sign up/verify do NOT sync manually - handled by onAuthStateChange
//  *
//  * This prevents the multiple sync calls issue while ensuring data consistency.
//  */
// export function useAuth() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [sessions, setSessions] = useState<any[]>([]);
//   const router = useRouter();
//   const supabase = createClient();
//   const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
//
//   // Initialize and listen to auth state changes
//   useEffect(() => {
//     // Get initial session
//     const initializeAuth = async () => {
//       try {
//         const { data: { session }, error } = await supabase.auth.getSession();
//         if (error) throw error;
//
//         setUser(session?.user ?? null);
//       } catch (error) {
//         console.error('Error initializing auth:', error);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     initializeAuth();
//
//     // Listen for auth changes
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         // console.log('🔄 Auth state change:', event);
//
//         const newUser = session?.user ?? null;
//         setUser(newUser);
//
//         // Only sync on SIGNED_IN event (not on TOKEN_REFRESHED or INITIAL_SESSION)
//         // and only if user hasn't been synced yet
//         if (event === 'SIGNED_IN' && newUser && !syncedUsers.has(newUser.id) && !syncInProgress) {
//           // Clear any pending sync timeout
//           if (syncTimeoutRef.current) {
//             clearTimeout(syncTimeoutRef.current);
//           }
//
//           // Debounce: only sync after 500ms of no new auth events
//           syncTimeoutRef.current = setTimeout(async () => {
//             if (syncInProgress) return;
//
//             syncInProgress = true;
//             try {
//               await axios.post('/api/auth/sync', {}, {
//                 withCredentials: true,
//               });
//               syncedUsers.add(newUser.id);
//               console.log('✅ User synced to backend');
//             } catch (error) {
//               console.error('❌ Failed to sync user:', error);
//             } finally {
//               syncInProgress = false;
//             }
//           }, 500);
//         }
//
//         // Clear state on sign out
//         if (event === 'SIGNED_OUT') {
//           if (user) {
//             syncedUsers.delete(user.id);
//           }
//           setUser(null);
//           setSessions([]);
//         }
//       }
//     );
//
//     return () => {
//       subscription.unsubscribe();
//       // Clean up any pending sync timeouts
//       if (syncTimeoutRef.current) {
//         clearTimeout(syncTimeoutRef.current);
//       }
//     };
//   }, [supabase.auth]);
//
//   // Sign in with email/password
//   const signIn = async (identifier: string, password: string) => {
//     try {
//       setLoading(true);
//
//       // Determine if identifier is email or username
//       const isEmail = identifier.includes('@');
//
//       let signInResult;
//       if (isEmail) {
//         // Sign in with email
//         signInResult = await supabase.auth.signInWithPassword({
//           email: identifier,
//           password,
//         });
//       } else {
//         // For username, we need to query backend first to get email
//         // Or use Supabase metadata if stored
//         const { data, error } = await supabase.auth.signInWithPassword({
//           email: identifier, // Try as email first
//           password,
//         });
//         signInResult = { data, error };
//       }
//
//       const { data, error } = signInResult;
//
//       if (error) {
//         return { data: null, error };
//       }
//
//       // Don't sync here - let onAuthStateChange handle it to avoid duplicates
//       setUser(data.user);
//       return { data, error: null };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'Sign in failed' } };
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Sign up with email/password
//   const signUp = async (data: {
//     firstName: string;
//     lastName: string;
//     username?: string;
//     email: string;
//     password: string;
//     confirmPassword: string;
//     phoneNumber?: string;
//     phoneCode?: string;
//     termsAccepted: boolean;
//     newsletterSubscription?: boolean;
//   }) => {
//     try {
//       setLoading(true);
//
//       // Validate passwords match
//       if (data.password !== data.confirmPassword) {
//         return {
//           data: null,
//           error: { message: 'Passwords do not match' }
//         };
//       }
//
//       // Sign up with Supabase
//       const { data: authData, error } = await supabase.auth.signUp({
//         email: data.email,
//         password: data.password,
//         options: {
//           data: {
//             first_name: data.firstName,
//             last_name: data.lastName,
//             username: data.username,
//             phone_number: data.phoneNumber,
//             phone_code: data.phoneCode,
//             newsletter_subscription: data.newsletterSubscription,
//           },
//           emailRedirectTo: `${window.location.origin}/auth/callback`,
//         },
//       });
//
//       if (error) {
//         return { data: null, error };
//       }
//
//       // Don't sync here - let onAuthStateChange handle it to avoid duplicates
//       if (authData.session) {
//         setUser(authData.user);
//       }
//
//       return { data: authData, error: null };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'Sign up failed' } };
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Sign out
//   const signOut = async () => {
//     try {
//       setLoading(true);
//
//       // Sign out from Supabase
//       const { error } = await supabase.auth.signOut();
//
//       if (error) {
//         console.error('Supabase sign out error:', error);
//       }
//
//       // Clear all cookies client-side
//       if (typeof document !== 'undefined') {
//         const cookies = document.cookie.split(';');
//         cookies.forEach(cookie => {
//           const name = cookie.split('=')[0].trim();
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
//         });
//       }
//
//       // Clear local state
//       setUser(null);
//       setSessions([]);
//
//       // Redirect to sign-in
//       router.push('/sign-in');
//
//       return { error: null };
//     } catch (error: any) {
//       return { error: { message: error.message || 'Sign out failed' } };
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Reset password
//   const resetPassword = async (email: string) => {
//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(email, {
//         redirectTo: `${window.location.origin}/auth/reset-password`,
//       });
//
//       if (error) {
//         return { data: null, error };
//       }
//
//       return {
//         data: { message: 'Password reset email sent' },
//         error: null
//       };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'Reset password failed' } };
//     }
//   };
//
//   // Update password
//   const updatePassword = async (data: {
//     currentPassword?: string;
//     newPassword: string;
//     confirmNewPassword?: string;
//   }) => {
//     try {
//       setLoading(true);
//
//       // Validate new passwords match if confirmNewPassword provided
//       if (data.confirmNewPassword && data.newPassword !== data.confirmNewPassword) {
//         return {
//           data: null,
//           error: { message: 'New passwords do not match' }
//         };
//       }
//
//       // Update password in Supabase
//       const { error } = await supabase.auth.updateUser({
//         password: data.newPassword,
//       });
//
//       if (error) {
//         return { data: null, error };
//       }
//
//       return {
//         data: { message: 'Password updated successfully' },
//         error: null
//       };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'Password update failed' } };
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Sign in with OAuth
//   const signInWithOAuth = async (
//     provider: 'google' | 'facebook' | 'apple',
//     options?: { redirectTo?: string }
//   ) => {
//     try {
//       const redirectTo = options?.redirectTo || `${window.location.origin}/auth/callback`;
//
//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider,
//         options: {
//           redirectTo,
//         },
//       });
//
//       return { data, error };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'OAuth sign in failed' } };
//     }
//   };
//
//   // Verify email
//   const verifyEmail = async (data: {
//     email?: string;
//     token?: string;
//     token_hash?: string;
//     access_token?: string;
//     refresh_token?: string;
//     type: string;
//   }) => {
//     try {
//       setLoading(true);
//
//       // Supabase handles email verification via callback URL
//       // This method is mainly for compatibility
//       if (data.token_hash && data.type) {
//         const { error } = await supabase.auth.verifyOtp({
//           token_hash: data.token_hash,
//           type: data.type as any,
//         });
//
//         if (error) {
//           return { data: null, error };
//         }
//
//         // Don't sync here - let onAuthStateChange handle it to avoid duplicates
//
//         return {
//           data: { message: 'Email verified successfully' },
//           error: null
//         };
//       }
//
//       return {
//         data: null,
//         error: { message: 'Invalid verification data' }
//       };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'Email verification failed' } };
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Resend verification email
//   const resendVerificationEmail = async () => {
//     try {
//       if (!user?.email) {
//         return {
//           data: null,
//           error: { message: 'No user email found' }
//         };
//       }
//
//       const { error } = await supabase.auth.resend({
//         type: 'signup',
//         email: user.email,
//       });
//
//       if (error) {
//         return { data: null, error };
//       }
//
//       return {
//         data: { message: 'Verification email resent' },
//         error: null
//       };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'Resend verification failed' } };
//     }
//   };
//
//   // Update profile
//   const updateProfile = async (data: {
//     firstName?: string;
//     lastName?: string;
//     username?: string;
//     email?: string;
//     phoneNumber?: string;
//     phoneCode?: string;
//     bio?: string;
//     dateOfBirth?: string;
//     gender?: string;
//     avatarUrl?: string;
//     coverUrl?: string;
//   }) => {
//     try {
//       setLoading(true);
//
//       // Update user metadata in Supabase
//       const updateData: any = {};
//
//       if (data.email) {
//         updateData.email = data.email;
//       }
//
//       if (data.firstName || data.lastName || data.username || data.phoneNumber ||
//           data.bio || data.dateOfBirth || data.gender || data.avatarUrl || data.coverUrl) {
//         updateData.data = {
//           first_name: data.firstName,
//           last_name: data.lastName,
//           username: data.username,
//           phone_number: data.phoneNumber,
//           phone_code: data.phoneCode,
//           bio: data.bio,
//           date_of_birth: data.dateOfBirth,
//           gender: data.gender,
//           avatar_url: data.avatarUrl,
//           cover_url: data.coverUrl,
//         };
//       }
//
//       const { data: userData, error } = await supabase.auth.updateUser(updateData);
//
//       if (error) {
//         return { data: null, error };
//       }
//
//       // Sync with backend (profile updates need immediate sync)
//       if (userData.user) {
//         try {
//           await axios.post('/api/auth/sync', {}, {
//             withCredentials: true,
//           });
//           syncedUsers.add(userData.user.id);
//         } catch (syncError) {
//           console.error('Failed to sync profile update:', syncError);
//         }
//       }
//
//       setUser(userData.user);
//
//       return {
//         data: { user: userData.user, message: 'Profile updated successfully' },
//         error: null
//       };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'Profile update failed' } };
//     } finally {
//       setLoading(false);
//     }
//   };
//
//   // Revoke session - Supabase doesn't have direct session revocation
//   // This is handled by backend if needed
//   // const revokeSession = async (sessionId: string) => {
//   //   try {
//   //     // Call backend API to revoke session
//   //     const response = await axios.post('/api/auth/revoke-session',
//   //       { sessionId },
//   //       { withCredentials: true }
//   //     );
//
//   //     return { data: response.data, error: null };
//   //   } catch (error: any) {
//   //     return { data: null, error: { message: error.message || 'Session revocation failed' } };
//   //   }
//   // };
//
//   // // Revoke all sessions
//   // const revokeAllSessions = async () => {
//   //   try {
//   //     // Sign out from all devices by signing out and invalidating all sessions
//   //     const { error } = await supabase.auth.signOut({ scope: 'global' });
//
//   //     if (error) {
//   //       return { data: null, error };
//   //     }
//
//   //     setUser(null);
//   //     setSessions([]);
//
//   //     return {
//   //       data: { message: 'All sessions revoked successfully' },
//   //       error: null
//   //     };
//   //   } catch (error: any) {
//   //     return { data: null, error: { message: error.message || 'Revoke all sessions failed' } };
//   //   }
//   // };
//
//   // Refetch user
//   const refetchUser = async () => {
//     try {
//       const { data: { user: freshUser }, error } = await supabase.auth.getUser();
//
//       if (error) throw error;
//
//       setUser(freshUser);
//     } catch (error) {
//       console.error('Error refetching user:', error);
//       setUser(null);
//     }
//   };
//
//   return {
//     user,
//     loading,
//     sessions,
//     signIn,
//     signUp,
//     signOut,
//     resetPassword,
//     updatePassword,
//     signInWithOAuth,
//     verifyEmail,
//     resendVerificationEmail,
//     updateProfile,
//     // revokeSession,
//     // revokeAllSessions,
//     refetchUser,
//   };
// }
//
// export function useAuthOld() {
//   const [user, setUser] = useState<User | null>(null);
//   const [loading, setLoading] = useState(true);
//   const router = useRouter();
//   const supabase = createClient();
//
//   // Redux Query hooks
//   const [loginMutation] = useLoginMutation();
//   const [registerMutation] = useRegisterMutation();
//   const [logoutMutation] = useLogoutMutation();
//   const [forgotPasswordMutation] = useForgotPasswordMutation();
//   const [resetPasswordMutation] = useResetPasswordMutation();
//   const [changePasswordMutation] = useChangePasswordMutation();
//   const [verifyEmailMutation] = useVerifyEmailMutation();
//   const [resendVerificationEmailMutation] = useResendVerificationEmailMutation();
//   const [oauthLoginMutation] = useOauthLoginMutation();
//   const [syncUserMutation] = useSyncUserMutation();
//   const [updateProfileMutation] = useUpdateProfileMutation();
//   const [revokeSessionMutation] = useRevokeSessionMutation();
//   const [revokeAllSessionsMutation] = useRevokeAllSessionsMutation();
//
//   // Check auth status via Next.js API route (can read httpOnly cookies)
//   const [hasAccessToken, setHasAccessToken] = useState(false);
//
//   useEffect(() => {
//     const checkToken = async () => {
//       if (typeof window !== 'undefined') {
//         try {
//           const response = await axios.get('/api/auth/status', {
//             withCredentials: true // Quan trọng: để gửi/nhận cookie
//           });
//
//           // Axios tự động parse JSON, dữ liệu nằm trong response.data
//           setHasAccessToken(response.data.authenticated);
//         } catch (error) {
//           setHasAccessToken(false);
//         } finally {
//           setLoading(false);
//         }
//       }
//     };
//     checkToken();
//   }, []);
//
//   // Get current user from Express API - only if we have access token
//   const { data: meData, isLoading: isMeLoading, refetch: refetchMe } = useGetMeQuery(undefined, {
//     skip: !hasAccessToken // Skip query if no access token
//   });
//
//   // Only fetch sessions when needed, not on every mount
//   const { data: sessionsData } = useGetUserSessionsQuery(undefined, {
//     skip: !user // Only fetch when user is logged in
//   });
//
//   useEffect(() => {
//     const getUser = async () => {
//       try {
//         // Only refetch if we have access token
//         if (!hasAccessToken) {
//           setUser(null);
//           setLoading(false);
//           return;
//         }
//
//         // Lấy user từ Express API
//         const result = await refetchMe();
//
//         if (result.data?.authenticated && result.data.user) {
//           setUser(result.data.user);
//         } else if (result.error) {
//           setUser(null);
//         } else {
//           setUser(null);
//         }
//       } catch (error) {
//         console.error('Error fetching user:', error);
//         setUser(null);
//       } finally {
//         setLoading(false);
//       }
//     };
//
//     getUser();
//
//     // Listen to Supabase auth changes for OAuth
//     const { data: { subscription } } = supabase.auth.onAuthStateChange(
//       async (event, session) => {
//         console.log('🔄 Auth state change:', event, 'has session:', !!session);
//
//         if (event === 'SIGNED_OUT') {
//           console.log('👋 User signed out - clearing state');
//           setUser(null);
//           setHasAccessToken(false);
//           return;
//         }
//
//         // Only handle SIGNED_IN (explicit user action), not INITIAL_SESSION
//         if (event === 'SIGNED_IN' && session?.user) {
//           console.log('👤 User signed in via OAuth');
//
//           // Check if we already have a valid backend session
//           let isBackendAuthenticated = false;
//           try {
//              const statusRes = await axios.get('/api/auth/status');
//              isBackendAuthenticated = statusRes.data.authenticated;
//           } catch (e) { isBackendAuthenticated = false; }
//
//           if (isBackendAuthenticated) {
//              console.log('✅ Backend already authenticated, skipping sync');
//              router.refresh();
//              return;
//           }
//
//           // Sync user to Express backend using oauthLoginMutation
//           console.log('🔄 Syncing OAuth user to backend...');
//           try {
//             await oauthLoginMutation({
//               provider: 'supabase',
//               session: session,
//               user: session.user
//             }).unwrap();
//
//             console.log('✅ OAuth sync successful');
//
//             // Set user and enable query
//             setUser(session.user);
//             setHasAccessToken(true);
//
//             // Redirect if on auth pages
//             if (typeof window !== 'undefined' && (window.location.pathname.includes('/sign-in') || window.location.pathname.includes('/sign-up'))) {
//               router.push('/');
//             }
//           } catch (error) {
//             console.error('❌ Error syncing OAuth user:', error);
//           }
//         }
//       }
//     );
//
//     return () => subscription.unsubscribe();
//   }, [hasAccessToken, router, supabase.auth, oauthLoginMutation, refetchMe]);
//
//   // Update user state when meData changes
//   useEffect(() => {
//     if (isMeLoading) return;
//
//     if (meData?.authenticated && meData.user) {
//       setUser(meData.user);
//     } else if (!hasAccessToken) {
//       setUser(null);
//     }
//     setLoading(isMeLoading);
//   }, [meData, isMeLoading, hasAccessToken]);
//
//   const signIn = async (identifier: string, password: string) => {
//     try {
//       const result = await loginMutation({
//         identifier,
//         password,
//       }).unwrap();
//
//       console.log(result);
//
//       if (result.authenticated) {
//         // Set user directly from login response (no need to refetch)
//         // await refetchMe();
//         setUser(result.user);
//         setHasAccessToken(true);
//         setLoading(false);
//         return { data: result, error: null };
//       }
//       return { data: null, error: { message: result.message || 'Login failed' } };
//     } catch (error: any) {
//       return { data: null, error: { message: error.data?.message || error.message || 'Login failed' } };
//     }
//   };
//
//   const signUp = async (data: {
//     firstName: string;
//     lastName: string;
//     username?: string;
//     email: string;
//     password: string;
//     confirmPassword: string;
//     phoneNumber?: string;
//     phoneCode?: string;
//     termsAccepted: boolean;
//     newsletterSubscription?: boolean;
//   }) => {
//     try {
//       console.log('useAuth signUp: Starting registration with data:', data);
//       const result = await registerMutation(data).unwrap();
//       console.log('useAuth signUp: Registration successful:', result);
//       return { data: result, error: null };
//     } catch (error: any) {
//       console.error('useAuth signUp: Registration failed:', error);
//       const errorMessage = error.data?.message || error.message || 'Registration failed';
//       console.error('useAuth signUp: Error message:', errorMessage);
//       return { data: null, error: { message: errorMessage } };
//     }
//   };
//
//   const signOut = async () => {
//     try {
//       // Call backend to sign out from Supabase server-side and clear cookies
//       await logoutMutation().unwrap();
//
//       // Clear ALL cookies client-side (especially Supabase cookies)
//       // This ensures sb-{project-ref}-auth-token.{index} are cleared
//       if (typeof document !== 'undefined') {
//         const cookies = document.cookie.split(';');
//         cookies.forEach(cookie => {
//           const name = cookie.split('=')[0].trim();
//           // Clear all cookies, especially those starting with 'sb-'
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
//         });
//       }
//
//       // Clear local state
//       setUser(null);
//       setHasAccessToken(false);
//
//       // Redirect to sign-in
//       router.push('/sign-in');
//
//       return { error: null };
//     } catch (error: any) {
//       console.error('Logout error:', error);
//       // Even on error, clear local state and cookies
//       if (typeof document !== 'undefined') {
//         const cookies = document.cookie.split(';');
//         cookies.forEach(cookie => {
//           const name = cookie.split('=')[0].trim();
//           document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
//         });
//       }
//       setUser(null);
//       setHasAccessToken(false);
//       router.push('/sign-in');
//       return { error: { message: error.data?.message || error.message || 'Logout failed' } };
//     }
//   };
//
//   const resetPassword = async (email: string) => {
//     try {
//       const result = await forgotPasswordMutation({ email }).unwrap();
//       return { data: result, error: null };
//     } catch (error: any) {
//       return { data: null, error: { message: error.data?.message || error.message || 'Reset password failed' } };
//     }
//   };
//
//   const updatePassword = async (data: {
//     currentPassword: string;
//     newPassword: string;
//     confirmNewPassword: string;
//   }) => {
//     try {
//       const result = await changePasswordMutation(data).unwrap();
//       return { data: result, error: null };
//     } catch (error: any) {
//       return { data: null, error: { message: error.data?.message || error.message || 'Password update failed' } };
//     }
//   };
//
//   const signInWithOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
//     try {
//       // Use Frontend URL for callback to handle PKCE correctly on client side
//       const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;
//
//       // Redirect to Supabase OAuth
//       const { data, error } = await supabase.auth.signInWithOAuth({
//         provider,
//         options: {
//           redirectTo: redirectUrl,
//         },
//       });
//       return { data, error };
//     } catch (error: any) {
//       return { data: null, error: { message: error.message || 'OAuth login failed' } };
//     }
//   };
//
//   const verifyEmail = async (data: {
//     email?: string;
//     token?: string;
//     token_hash?: string;
//     access_token?: string;
//     refresh_token?: string;
//     type: string
//   }) => {
//     try {
//       console.log('useAuth verifyEmail: Starting verification with data:', {
//         hasEmail: !!data.email,
//         hasToken: !!data.token,
//         hasTokenHash: !!data.token_hash,
//         hasAccessToken: !!data.access_token,
//         hasRefreshToken: !!data.refresh_token,
//         type: data.type
//       });
//       const result = await verifyEmailMutation(data).unwrap();
//       console.log('useAuth verifyEmail: Verification successful:', {
//         hasUser: !!result.user,
//         hasSession: !!result.session
//       });
//       if (result.user) {
//         setUser(result.user);
//         await refetchMe();
//       }
//       return { data: result, error: null };
//     } catch (error: any) {
//       console.error('useAuth verifyEmail: Verification failed:', error);
//       return { data: null, error: { message: error.data?.message || error.message || 'Email verification failed' } };
//     }
//   };
//
//   const resendVerificationEmail = async () => {
//     try {
//       const result = await resendVerificationEmailMutation().unwrap();
//       return { data: result, error: null };
//     } catch (error: any) {
//       return { data: null, error: { message: error.data?.message || error.message || 'Resend verification failed' } };
//     }
//   };
//
//   const updateProfile = async (data: User) => {
//     try {
//       const result = await updateProfileMutation(data).unwrap();
//       if (result.user) {
//         setUser(result.user);
//         await refetchMe();
//       }
//       return { data: result, error: null };
//     } catch (error: any) {
//       return { data: null, error: { message: error.data?.message || error.message || 'Profile update failed' } };
//     }
//   };
//
//   // const revokeSession = async (sessionId: string) => {
//   //   try {
//   //     const result = await revokeSessionMutation({ sessionId }).unwrap();
//   //     return { data: result, error: null };
//   //   } catch (error: any) {
//   //     return { data: null, error: { message: error.data?.message || error.message || 'Session revocation failed' } };
//   //   }
//   // };
//
//   // const revokeAllSessions = async () => {
//   //   try {
//   //     const result = await revokeAllSessionsMutation().unwrap();
//   //     return { data: result, error: null };
//   //   } catch (error: any) {
//   //     return { data: null, error: { message: error.data?.message || error.message || 'All sessions revocation failed' } };
//   //   }
//   // };
//
//   return {
//     user,
//     loading,
//     sessions: sessionsData || [],
//     signIn,
//     signUp,
//     signOut,
//     resetPassword,
//     updatePassword,
//     signInWithOAuth,
//     verifyEmail,
//     resendVerificationEmail,
//     updateProfile,
//     refetchUser: refetchMe,
//   };
// }

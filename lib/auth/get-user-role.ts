import type { User } from '@supabase/supabase-js';

/**
 * Extract user role from Supabase user metadata
 * Priority: app_metadata.userRole > user_metadata.role > default 'customer'
 */
export function getUserRole(user: User | null): string {
  if (!user) return 'guest';
  
  return user.app_metadata?.userRole || user.user_metadata?.role || 'customer';
}

/**
 * Extract user role from Supabase user metadata
 * Priority: app_metadata.userRole > user_metadata.role > default 'customer'
 */
export function getUsername(user: User | null): string {
  if (!user) return 'guest';
  
  return user.app_metadata?.username || user.user_metadata?.username || 'guest';
}

/**
 * Get user display name
 */
export function getUserDisplayName(user: User | null): string {
  if (!user) return 'Guest';
  
  return (
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim() ||
    user.email ||
    'User'
  );
}

/**
 * Get user avatar URL
 */
export function getUserAvatar(user: User | null): string | undefined {
  if (!user) return undefined;
  
  return (
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    user.user_metadata?.avatar
  );
}

/**
 * Format user object for UI components
 */
export function formatUserForUI(user: User | null) {
  console.log('Formatting user for UI:', user);
  console.log('User role determined as:', {
    id: user?.id || '',
    username: getUsername(user),
    name: getUserDisplayName(user),
    email: user?.email || '',
    avatar: getUserAvatar(user),
    role: getUserRole(user),
  });
  return {
    id: user?.id || '',
    username: getUsername(user),
    name: getUserDisplayName(user),
    email: user?.email || '',
    avatar: getUserAvatar(user),
    role: getUserRole(user),
  };
}

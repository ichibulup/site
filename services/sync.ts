import axios from "axios";
import type { User, Session } from "@supabase/supabase-js";

const syncedUsers = new Set<string>();
let syncInProgress = false;

/**
 * Sync user data with backend
 * Similar to web's /api/auth/sync route
 *
 * @param user - Supabase user object
 * @param session - Supabase session object
 * @returns Promise with sync result
 */

export async function syncUser() {
  try {
    await axios.post('/api/auth/sync')
  } catch (e) {
    console.error(e)
  }
}

// export async function syncUser(
//   user: User,
//   session: Session,
// ): Promise<{
//   success: boolean;
//   message?: string;
//   data?: any;
//   error?: string;
// }> {
//   try {
//     // Check if already syncing
//     if (syncInProgress) {
//       console.log("⏳ Sync already in progress, skipping");
//       return {
//         success: false,
//         message: "Sync already in progress",
//       };
//     }
//
//     // Check if user already synced
//     if (syncedUsers.has(user.id)) {
//       console.log("✅ User already synced:", user.id);
//       return {
//         success: true,
//         message: "User already synced",
//       };
//     }
//
//     syncInProgress = true;
//
//     // Call backend sync endpoint
//     const response = await axios.post(
//       `${API_BASE_URL}/user/sync`,
//       {
//         user: user,
//         session: session,
//       },
//       {
//         headers: {
//           // 'Authorization': `Bearer ${session.access_token}`,
//           "Content-Type": "application/json",
//         },
//         withCredentials: true,
//         timeout: 10000, // 10 second timeout
//       },
//     );
//
//     // Mark user as synced
//     syncedUsers.add(user.id);
//
//     console.log("✅ User synced successfully:", user.id);
//
//     return {
//       success: true,
//       message: "User synced successfully",
//       data: response.data,
//     };
//   } catch (error: any) {
//     console.error("❌ Failed to sync user:", error.message);
//
//     // Handle axios error
//     if (error.response) {
//       return {
//         success: false,
//         error: error.response.data?.message || "Failed to sync user",
//         data: error.response.data,
//       };
//     }
//
//     return {
//       success: false,
//       error: error.message || "Network error during sync",
//     };
//   } finally {
//     syncInProgress = false;
//   }
// }

/**
 * Clear sync status for a user (used on sign out)
 * @param userId - User ID to clear from synced set
 */
export function clearSyncStatus(userId: string) {
  syncedUsers.delete(userId);
  console.log("🗑️ Cleared sync status for user:", userId);
}

/**
 * Clear all sync statuses (used for debugging or reset)
 */
export function clearAllSyncStatuses() {
  syncedUsers.clear();
  syncInProgress = false;
  console.log("🗑️ Cleared all sync statuses");
}

/**
 * Check if user is synced
 * @param userId - User ID to check
 * @returns boolean
 */
export function isUserSynced(userId: string): boolean {
  return syncedUsers.has(userId);
}

/**
 * Check if sync is in progress
 * @returns boolean
 */
export function isSyncInProgress(): boolean {
  return syncInProgress;
}

'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient();

      await supabase.auth.signOut();
      router.push("/sign-in");
    } catch (error) {
      console.error("Logout error:", error);
      // Fallback: redirect to home page anyway
      router.push("/");
    }
  };

  // const logout = async () => {
  //   const supabase = createClient()
  //   await supabase.auth.signOut()
  //   router.push('/sign-in')
  // }

  return (
    <>
      <Button onClick={handleLogout}>Đăng xuất</Button>
    </>
  );
}

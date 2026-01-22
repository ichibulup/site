import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/form/auth/sign-out-button'
import { createServer } from '@/lib/supabase/server'

export default async function ProtectedPage() {
  const supabase = await createServer()

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <p>
        Hello <span>{data.claims.email}</span>
      </p>
      <LogoutButton />
    </div>
  )
}

// export default async function ProtectedPage() {
//   const supabase = await createClient()
//
//   const { data, error } = await supabase.auth.getClaims()
//   if (error || !data?.claims) {
//     redirect('/auth/login')
//   }
//
//   return (
//     <div className="flex h-svh w-full items-center justify-center gap-2">
//       <p>
//         Hello <span>{data.claims.email}</span>
//       </p>
//       <LogoutButton />
//     </div>
//   )
// }

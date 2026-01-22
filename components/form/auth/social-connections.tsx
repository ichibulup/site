"use client";

import React, { useState } from 'react'
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { callback } from "@/services/auth";

interface SocialConnectionsProps extends React.ComponentPropsWithoutRef<'div'> {
  className?: string;
  isLoading?: boolean;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;
}

const SOCIAL_CONNECTION_STRATEGIES: {
  type: string;
  provider: 'apple' | 'google' | 'facebook';
  source: string;
  useTint: boolean;
}[] = [
  // {
  //   type: 'oauth_apple',
  //   provider: 'apple',
  //   // source: 'https://img.clerk.com/static/apple.png?width=160',
  //   source: '/logo/Apple.png',
  //   useTint: true,
  // },
  {
    type: 'oauth_google',
    provider: 'google',
    // source: 'https://img.clerk.com/static/google.png?width=160',
    source: '/logo/Google.png',
    useTint: false,
  },
  {
    type: 'oauth_facebook',
    provider: 'facebook',
    // source: 'https://img.clerk.com/static/facebook.png?width=160',
    source: '/logo/Facebook.png',
    useTint: false,
  },
  // {
  //   type: 'oauth_microsoft',
  //   source: { uri: 'https://img.clerk.com/static/microsoft.png?width=160' },
  //   useTint: false,
  // },
  // {
  //   type: 'oauth_github',
  //   source: { uri: 'https://img.clerk.com/static/github.png?width=160' },
  //   useTint: true,
  // },
];

export function SocialConnections({ className, isLoading, setIsLoading, ...props }: SocialConnectionsProps) {
  const [error, setError] = useState<string | null>(null)

  const handleSocialLogin = async (e: React.FormEvent, provider: "apple" | "google" | "facebook") => {
    e.preventDefault()
    
    const supabase = createClient()
    if (setIsLoading) setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        // provider: 'github',
        provider,
        options: {
          redirectTo: `${window.location.origin}/api/auth/oauth?next=/`,
          // redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      // Note: User will be redirected to OAuth provider, so no need to setIsLoading(false)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      if (setIsLoading) setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-row gap-2 justify-center items-center", className)}>
    {/*<div className={cn('flex flex-col gap-6', className)} {...props}>*/}
      {/*<Card>*/}
      {/*  <CardHeader>*/}
      {/*    <CardTitle className="text-2xl">Welcome!</CardTitle>*/}
      {/*    <CardDescription>Sign in to your account to continue</CardDescription>*/}
      {/*  </CardHeader>*/}
      {/*  <CardContent>*/}
      {/*    <form onSubmit={handleSocialLogin}>*/}
      {/*      <div className="flex flex-col gap-6">*/}
      {/*        {error && <p className="text-sm text-destructive-500">{error}</p>}*/}
      {/*        <Button type="submit" className="w-full" disabled={isLoading}>*/}
      {/*          {isLoading ? 'Logging in...' : 'Continue with GitHub'}*/}
      {/*        </Button>*/}
      {/*      </div>*/}
      {/*    </form>*/}
      {/*  </CardContent>*/}
      {/*</Card>*/}
      {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => (
        <form
          key={strategy.type}
          onSubmit={(e) => handleSocialLogin(e, strategy.provider)}
          className="w-full"
        >
          <div className="flex flex-col gap-6">
            {error && <p className="text-sm text-destructive-500">{error}</p>}
            {/*<Button type="submit" className="w-full" disabled={isLoading}>*/}
            {/*  {isLoading ? 'Logging in...' : 'Continue with GitHub'}*/}
            {/*</Button>*/}
            <Button
              key={strategy.type}
              type="submit"
              variant="outline"
              // onClick={() => handleOAuthAction(strategy.provider)}
              disabled={isLoading}
              className="w-full" // flex-1
            >
              <Image
                className="h-4"
                src={strategy.source}
                alt={strategy.provider}
                width={strategy.provider === 'apple' ? 14 : 16}
                height={16}
              />
              {/* {isLoading ? 'Logging in...' : ''} */}
            </Button>
          </div>
        </form>
      ))}
      {error && <p className="text-sm text-destructive absolute -top-6">{error}</p>}
    </div>
  )
}


// export function SocialConnectionsOld({
//   onOAuthSignIn,
//   onOAuthSignUp,
//   isLoading = false,
//   showSeparator = true,
//   className
// }: SocialConnectionsProps) {
//   const handleOAuthAction = (provider: 'google' | 'facebook' | 'apple') => {
//     if (onOAuthSignIn) {
//       onOAuthSignIn(provider);
//     } else if (onOAuthSignUp) {
//       onOAuthSignUp(provider);
//     }
//   };
//
//   return (
//     <div className={cn("flex flex-row gap-2 justify-center items-center", className)}>
//       {/* {showSeparator && (
//         <div className="relative">
//           <div className="absolute inset-0 flex items-center">
//             <Separator className="w-full" />
//           </div>
//           <div className="relative flex justify-center text-xs uppercase">
//             <span className="bg-background px-2 text-muted-foreground">
//               Hoặc tiếp tục với
//             </span>
//           </div>
//         </div>
//       )} */}
//
//       {/* <div className="grid grid-cols-2 gap-3"> */}
//       {SOCIAL_CONNECTION_STRATEGIES.map((strategy) => (
//         <Button
//           key={strategy.type}
//           type="button"
//           variant="outline"
//           onClick={() => handleOAuthAction(strategy.provider)}
//           disabled={isLoading}
//           className="flex-1"
//         >
//           <Image
//             className="h-4"
//             src={strategy.source}
//             alt={strategy.provider}
//             width={strategy.provider === 'apple' ? 14 : 16}
//             height={16}
//           />
//         </Button>
//       ))}
//       {/* </div> */}
//     </div>
//   );
// }

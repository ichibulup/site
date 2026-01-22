"use client";

import React, { ReactNode, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";
import "./page.css";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [layout] = useState(0);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading } = useAuth();
  const { user } = useUser()

  // Redirect authenticated users away from auth pages
  useEffect(() => {
    if (!isLoading && user && (pathname === '/sign-in' || pathname === '/sign-up')) {
      // console.log('✅ User already authenticated, redirecting to /');
      router.replace('/');
    }
  }, [user, isLoading, pathname, router]);

  // Show nothing while checking auth to prevent flash of auth page
  if (isLoading) {
    return null;
  }

  // Don't render auth forms if user is authenticated
  if (user && (pathname === '/sign-in' || pathname === '/sign-up')) {
    return null;
  }

  return (
    <>
      {layout === 0 ? (
        <>
          <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
              {children}
            </div>
          </div>
        </>
      ) : layout === 2 ? (
        <>
          <div className="authentication-wrapper authentication-basic min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="authentication-inner w-full max-w-md">
              
              {/* Form Content */}
              <div className="space-y-4">
                {children}
              </div>
            </div>
          </div>
        </>
      ) : layout === 3 ? (
        <>
          <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-sm md:max-w-3xl">
              {children}
            </div>
          </div>
        </>
      ) : layout === 1 ? (
        <>
          <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
              <div className="flex justify-center gap-2 md:justify-start">
                <Link href="/" className="flex items-center gap-2 font-medium">
                  {/*<div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">*/}
                  {/*  <GalleryVerticalEnd className="size-4" />*/}
                  {/*</div>*/}
                  <div className="flex size-12 items-center justify-center rounded-md">
                    <Image
                      src="/logo/logo.png"
                      alt="Gorth Inc."
                      width={64}
                      height={64}
                    // className="rounded-full"
                    // className="invert-[0.8] dark:invert-0"
                    />
                  </div>
                  Gorth Inc.
                </Link>
              </div>
              <div className="flex flex-1 items-center justify-center">
                <div className="w-full max-w-xs">
                  {children}
                </div>
              </div>
            </div>
            <div className="bg-muted relative hidden lg:block">
              {/*<img*/}
              {/*  src="/background/placeholder.svg"*/}
              {/*  alt="Image"*/}
              {/*  className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"*/}
              {/*/>*/}
              <img
                // src="/background/placeholder.svg"
                src="/avatar/suit-gradient.jpeg"
                alt="Image"
                className="absolute inset-0 h-full w-full object-cover brightness-[0.9] dark:invert dark:grayscale"
              />
            </div>
          </div>
        </>
      ) : layout === 4 ? (
        <>
          <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
              <a href="#" className="flex items-center gap-2 self-center font-medium">
                <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                Gorth Inc.
              </a>
              {children}
            </div>
          </div>
        </>
      ) : (
        <>
        </>
      )}
    </>
  )
}

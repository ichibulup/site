"use client"

import React, { JSX, ReactNode, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { appGlobal, administratorSidebar } from "@/lib/constants";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/element/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { Dashbar } from "@/components/layout/dashbar";
import { Copyright } from "@/components/layout/copyright";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

export default function AdministratorLayout({
  children
}: {
  children: ReactNode
}) {
  const { isLoading } = useAuth()
  const { user } = useUser()
  const pathname = usePathname()
  const router = useRouter()

  // Redirect if not authenticated (using useEffect to prevent hydration mismatch)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/sign-in')
    }
  }, [isLoading, user, router])

  return (
    <SidebarProvider>
      <AppSidebar
        sidebar={administratorSidebar}
        global={appGlobal}
        user={user}
      />
      <SidebarInset>
        <Dashbar>
          <SidebarTrigger className="-ml-1" />
        </Dashbar>
        <main className="flex flex-1 flex-col">
          <div className="container mx-auto p-6">
            {children}
          </div>
        </main>
        <Copyright />
      </SidebarInset>
    </SidebarProvider>
  )
}

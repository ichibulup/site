"use client"

import React, { useEffect, ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth";
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/element/sidebar"
import { appGlobal, staffSidebar } from "@/lib/constants"
import { createBreadcrumbs } from "@/lib/general/old/breadcrumb-utils"
import { Dashbar } from "@/components/layout/dashbar"
import { Copyright } from "@/components/layout/copyright"
import { useUser } from "@/hooks/use-user";

export default function StaffLayout({ children }: { children: ReactNode } ) {
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
  
  const breadcrumbs = createBreadcrumbs(pathname, appGlobal.name)

  return (
    <SidebarProvider>
      <AppSidebar 
        sidebar={staffSidebar} 
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

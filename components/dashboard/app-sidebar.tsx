"use client"

import React, { ComponentProps } from "react"
import Link from "next/link"
import Image from "next/image"
import { NavMain } from "@/components/dashboard/nav-main"
import { NavProjects } from "@/components/dashboard/nav-projects"
import { NavUser } from "@/components/dashboard/nav-user"
import { TeamSwitcher } from "@/components/dashboard/team-switcher"
import { type LucideIcon } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenuButton,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/element/sidebar"
import { AppSidebarProps } from "@/lib/interfaces"
// import { appGlobal } from "@/constants/constants";

export function AppSidebar({ sidebar, global, user, ...props }: AppSidebarProps) {
// export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="h-14" asChild>
              <Link href="/">
                {/* <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg"> */}
                  {/* <Command className="size-4" /> */}
                {/* </div> */}
                {/* <Image src="/logo/logo.png" alt={global.name} width={40} height={40} /> */}
                <Image src="/logo/icon.png" alt={global.name} width={36} height={36} />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{global.name}</span>
                  <span className="truncate text-xs">{sidebar.role}</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebar.navMain} />
        <NavProjects projects={sidebar.projects} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} type="sidebar" size="lg" side="right" align="end" />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}

"use client"

import React, { JSX } from "react";
import Link from "next/link"
import { useRouter } from "next/navigation";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/element/sidebar"
import { Button } from "@/components/ui/button";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
  Bolt,
  LucideIcon
} from "lucide-react"
import { AppSidebarUserProps, User } from "@/lib/interfaces"
import { createClient } from '@/lib/supabase/client'
import { Nav } from "react-day-picker";
// import { callback } from "@/services/auth";
import { getUserName } from "@/lib/utils/formatters";
import { useCallbackMutation } from "@/state/api";

interface NavUserDropdownProps {
  user?: User | null
}

export function NavUserDropdown({
  user
}: NavUserDropdownProps): JSX.Element {
  const [callback, { isLoading, error }] = useCallbackMutation()
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClient()
      await callback().unwrap();
      await supabase.auth.signOut()
      router.push('/sign-in')
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback: redirect to home page anyway
      router.push('/');
    }
  };

  return (
    <>
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <NavAvatar user={user} />
          <NavName user={user} />
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <NavDropdownItem
          icon={BadgeCheck}
          title="Tài khoản"
          link="/setting/information"
        />
        <NavDropdownItem
          icon={CreditCard}
          title="Thanh toán"
          link="/setting/payment"
        />
        <NavDropdownItem
          icon={Bolt}
          title="Cài đặt"
          link="/setting"
        />
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <NavDropdownItem
        icon={LogOut}
        title="Đăng xuất"
        action={handleLogout}
      />
      {/* <DropdownMenuItem className="h-9 gap-3 p-2.5" onClick={handleLogout}>
        disabled={isLoggingOut}
        <LogOut className="h-4 w-4" />
        {isLoggingOut ? 'Logging out...' : 'Log out'}
        Đăng xuất
      </DropdownMenuItem> */}
    </>
  );
}

export function NavUser({
  user,
  type,
  size = "icon",
  side = "bottom",
  align = "end"
}: AppSidebarUserProps) {
  const { isMobile } = useSidebar();

  return (
    <>
      {type === "navbar" ? (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 p-0 cursor-pointer"
              >
                <NavAvatar user={user} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align={align}
              sideOffset={4}
            >
              <NavUserDropdown user={user} />
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : type === "sidebar" ? (
        <>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {size === "lg" ? (
                    <SidebarMenuButton
                      size="lg"
                      className="h-14 data-[active=true]:bg-professional-main/24 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <NavAvatar user={user} />
                      <NavName user={user} />
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  ) : size === "icon" ? (
                    <SidebarMenuButton
                      size="default"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-9 md:p-0"
                    >
                      <NavAvatar user={user} />
                      <NavName user={user} />
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  ) : (
                    <>
                      <SidebarMenuButton
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-9 md:p-0"
                      >
                        <NavAvatar user={user} />
                        <NavName user={user} />
                        <ChevronsUpDown className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  // side={isMobile ? "bottom" : "right"}
                  side={isMobile ? "bottom" : side}
                  align={align}
                  sideOffset={4}
                >
                  <NavUserDropdown user={user} />
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </>
      ) : (
        <></>
      )}
    </>
  )
}

export function NavAvatar({
  user,
}: {
  user?: User | null
}) {
  return (
    <>
      <Avatar className="h-9 w-9 rounded-md">
        {user ? (
          <>
            <AvatarImage
              src={user?.imageUrl ?? user?.avatarUrl ?? undefined}
              alt={user?.fullName ?? `${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
            />
            <AvatarFallback className="bg-professional-main/24 rounded-md" suppressHydrationWarning>
              {(user?.firstName?.charAt(0) ?? 'U').toUpperCase()}
              {(user?.lastName?.charAt(0) ?? 'A').toUpperCase()}
            </AvatarFallback>
            {/* <AvatarImage src={user?.imageUrl} alt={`${user?.fullName}`} /> */}
            {/* <AvatarFallback className="rounded-md">JG</AvatarFallback> */}
            {/* <AvatarImage src={nullToUndefined(user?.avatar_url)} alt={nullToUndefined(user?.name)} /> */}
            {/* <AvatarFallback className="rounded-lg">WD</AvatarFallback> */}
          </>
        ) : (
          <>
            {/* <AvatarImage src={user?.user_metadata?.avatar_url ?? user?.user_metadata?.picture ?? undefined} alt={`${user?.user_metadata?.name}`} /> */}
            <AvatarFallback className="rounded-md">VA</AvatarFallback>
          </>
        )}
      </Avatar>
    </>
  )
}

export function NavName({
  user,
}: {
  user?: User | null
}) {
  const name = getUserName(user)
  
  return (
    <>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium" suppressHydrationWarning>
          {name}
        </span>
        <span className="truncate text-xs" suppressHydrationWarning>
          {user ? user.email : "user@gorth.org"}
        </span>
      </div>
    </>
  )
}

export function NavDropdownItem({
  icon: Icon,
  title,
  link,
  action
}: {
  icon: LucideIcon;
  title: string;
  link?: string;
  action?: () => void;
}) {
  return (
    <>
      <DropdownMenuItem
        className="h-9 gap-3 p-2.5"
        onClick={action}
      >
        <Icon className="h-4 w-4" />
        {link ? <Link href={link}>{title}</Link> : <span>{title}</span>}
      </DropdownMenuItem>
    </>
  )
}

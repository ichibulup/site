"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  User as UserIcon,
  Settings, 
  LogOut, 
  Shield, 
  Bell, 
  HelpCircle,
  ChevronDown
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { User } from "@/lib/interfaces"


export function UserMenu({ user }: { user: User }) {
  const router = useRouter();
  // const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      // const { error } = await signOut();
      // if (error) {
      //   toast.error("Có lỗi xảy ra khi đăng xuất");
      //   return;
      // }
      toast.success("Đăng xuất thành công");
      router.push("/sign-in");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đăng xuất");
    }
  };

  const getInitials = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getDisplayName = () => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    return user.email || "Người dùng";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user.avatarUrl!}
              alt={getDisplayName()} 
            />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{getDisplayName()}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <Badge variant="secondary" className="w-fit text-xs">
              Khách hàng
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/profile")}>
          <UserIcon className="mr-2 h-4 w-4" />
          <span>Hồ sơ</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/setting")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>Cài đặt</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/notifications")}>
          <Bell className="mr-2 h-4 w-4" />
          <span>Thông báo</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/change-password")}>
          <Shield className="mr-2 h-4 w-4" />
          <span>Đổi mật khẩu</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/help")}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Trợ giúp</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

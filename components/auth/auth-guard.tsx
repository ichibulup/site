"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  fallback,
  redirectTo = "/sign-in" 
}: AuthGuardProps) {
  const { isLoading } = useAuth();
  const { user } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      )
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

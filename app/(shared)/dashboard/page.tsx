"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UserMenu } from "@/components/form/auth/user-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  ShoppingCart, 
  Package, 
  TrendingUp,
  Settings,
  Bell
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function DashboardPage() {
  const { user } = useUser();

  if (!user) {
    return null;
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-muted-foreground">
                  Chào mừng trở lại, {user.fullName}!
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm">
                  <Bell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
                <UserMenu user={user} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Tổng khách hàng
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2,350</div>
                  <p className="text-xs text-muted-foreground">
                    +20.1% so với tháng trước
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Đơn hàng hôm nay
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">89</div>
                  <p className="text-xs text-muted-foreground">
                    +12% so với hôm qua
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Sản phẩm
                  </CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-muted-foreground">
                    +3 sản phẩm mới
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Doanh thu
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₫12,234,000</div>
                  <p className="text-xs text-muted-foreground">
                    +8.2% so với tháng trước
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* User Info Card */}
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
                <CardDescription>
                  Thông tin chi tiết về tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Tên hiển thị
                    </label>
                    <p className="text-sm">{user.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Email
                    </label>
                    <p className="text-sm">{user.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      ID người dùng
                    </label>
                    <p className="text-sm font-mono text-xs">{user.id}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Vai trò
                    </label>
                    <Badge variant="secondary">Khách hàng</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Thao tác nhanh</CardTitle>
                <CardDescription>
                  Các thao tác thường dùng
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <ShoppingCart className="h-6 w-6 mb-2" />
                    Đặt hàng
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Package className="h-6 w-6 mb-2" />
                    Xem menu
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Users className="h-6 w-6 mb-2" />
                    Liên hệ
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

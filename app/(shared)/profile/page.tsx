"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UserMenu } from "@/components/form/auth/user-menu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar,
  MapPin,
  Edit,
  Shield,
  Bell,
  Settings
} from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function ProfilePage() {
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
                <h1 className="text-2xl font-bold">Hồ sơ cá nhân</h1>
                <p className="text-muted-foreground">
                  Quản lý thông tin tài khoản của bạn
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage 
                        src={user.avatarUrl!}
                        alt={user.fullName!}
                      />
                      <AvatarFallback className="text-2xl">
                        {user.fullName}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <CardTitle className="text-xl">{user.fullName}</CardTitle>
                  <CardDescription>
                    <Badge variant="secondary">Khách hàng</Badge>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa hồ sơ
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Shield className="mr-2 h-4 w-4" />
                    Đổi mật khẩu
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Thông tin cá nhân
                  </CardTitle>
                  <CardDescription>
                    Thông tin cơ bản về tài khoản của bạn
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Họ và tên
                      </label>
                      <p className="text-sm">{user.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Email
                      </label>
                      <p className="text-sm flex items-center">
                        <Mail className="mr-2 h-4 w-4" />
                        {user.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Số điện thoại
                      </label>
                      <p className="text-sm flex items-center">
                        <Phone className="mr-2 h-4 w-4" />
                        {user.phoneNumber || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Ngày tạo tài khoản
                      </label>
                      <p className="text-sm flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Account Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Thông tin tài khoản
                  </CardTitle>
                  <CardDescription>
                    Chi tiết về tài khoản và bảo mật
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        ID người dùng
                      </label>
                      <p className="text-sm font-mono text-xs break-all">
                        {user.id}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Trạng thái email
                      </label>
                      <p className="text-sm">
                        <Badge variant={user.emailVerifiedAt ? "default" : "secondary"}>
                          {user.emailVerifiedAt ? "Đã xác thực" : "Chưa xác thực"}
                        </Badge>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Lần đăng nhập cuối
                      </label>
                      <p className="text-sm">
                        {user.lastSignInAt
                          ? new Date(user.lastSignInAt).toLocaleString('vi-VN')
                          : "Chưa có"
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Vai trò
                      </label>
                      <p className="text-sm">
                        <Badge variant="secondary">Khách hàng</Badge>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Tùy chọn
                  </CardTitle>
                  <CardDescription>
                    Cài đặt cá nhân và thông báo
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Nhận thông báo email</p>
                        <p className="text-xs text-muted-foreground">
                          Nhận thông báo về đơn hàng và cập nhật
                        </p>
                      </div>
                      <Badge variant="default">Bật</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Nhận tin tức</p>
                        <p className="text-xs text-muted-foreground">
                          Nhận email về sản phẩm và dịch vụ mới
                        </p>
                      </div>
                      <Badge variant="secondary">Tắt</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}

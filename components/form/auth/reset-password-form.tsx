"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff, CheckCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPasswordSchema, type ResetPasswordInput } from "@/schemas/auth";
import { useAuth } from "@/hooks/use-auth";

export function ResetPasswordForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  // const { updatePassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema as any),
    defaultValues: {
      // token: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const tokenFromUrl = searchParams.get("token");
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      toast.error("Token không hợp lệ");
      router.push("/forgot-password");
    }
  }, [searchParams, router]);

  const onSubmit = async (data: ResetPasswordInput) => {
    if (!token) {
      toast.error("Token không hợp lệ");
      return;
    }

    setIsLoading(true);
    // try {
    //   const { error } = await updatePassword({
    //     currentPassword: "", // Not needed for reset password
    //     newPassword: data.newPassword,
    //     confirmNewPassword: data.confirmPassword,
    //   });
    //
    //   if (error) {
    //     toast.error(error.message);
    //     return;
    //   }
    //
    //   setIsSuccess(true);
    //   toast.success("Mật khẩu đã được đặt lại thành công!");
    //
    //   // Redirect to sign in after 3 seconds
    //   setTimeout(() => {
    //     router.push("/sign-in");
    //   }, 3000);
    // } catch (error) {
    //   toast.error("Có lỗi xảy ra khi đặt lại mật khẩu");
    // } finally {
    //   setIsLoading(false);
    // }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex flex-col items-center gap-2">
              <Link href="/apps/web/public" className="flex flex-col items-center gap-2 font-medium">
                <div className="flex size-24 items-center justify-center rounded-md">
                  <img
                    src="/logo/logo.png"
                    alt="Restaurant Chain Management"
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <span className="sr-only">Restaurant Chain Management</span>
              </Link>
            </div>
            <CardTitle className="text-2xl text-center">Thành công!</CardTitle>
            <CardDescription className="text-center">
              Mật khẩu của bạn đã được đặt lại thành công
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Mật khẩu của bạn đã được cập nhật thành công.
                </p>
                <p className="text-sm text-muted-foreground">
                  Bạn sẽ được chuyển hướng đến trang đăng nhập trong vài giây...
                </p>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href="/sign-in">
                Đăng nhập ngay
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Token không hợp lệ</h3>
                <p className="text-sm text-muted-foreground">
                  Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/forgot-password">
                  Yêu cầu liên kết mới
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center gap-2">
            <Link href="/apps/web/public" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-24 items-center justify-center rounded-md">
                <img
                  src="/logo/logo.png"
                  alt="Restaurant Chain Management"
                  className="w-24 h-24 object-contain"
                />
              </div>
              <span className="sr-only">Restaurant Chain Management</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
          <CardDescription className="text-center">
            Nhập mật khẩu mới cho tài khoản của bạn
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  {...register("newPassword")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  </span>
                </Button>
              </div>
              {errors.newPassword && (
                <p className="text-sm text-destructive">{errors.newPassword.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu mới"
                  {...register("confirmPassword")}
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                  <span className="sr-only">
                    {showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  </span>
                </Button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Đặt lại mật khẩu
            </Button>
          </form>

          <div className="text-center text-sm">
            Nhớ mật khẩu rồi?{" "}
            <Link href="/sign-in" className="text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

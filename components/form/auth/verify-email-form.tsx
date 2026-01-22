"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

export function VerifyEmailForm() {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useUser()
  // const { user, verifyEmail, resendVerificationEmail } = useAuth();

  // Fix hydration mismatch
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return; // Wait for client-side hydration
    
    const handleVerifyEmail = async () => {
      // Supabase sends different parameters depending on verification method
      const token = searchParams.get("token") || searchParams.get("access_token");
      const type = searchParams.get("type");
      const email = searchParams.get("email");
      const hash = searchParams.get("hash");
      const refreshToken = searchParams.get("refresh_token");
      const code = searchParams.get("code"); // OTP code from email link

      console.log('URL parameters:', {
        token: !!token,
        type,
        email,
        hash: !!hash,
        refreshToken: !!refreshToken,
        code: !!code,
        allParams: Object.fromEntries(searchParams.entries())
      });

      // **PRIORITY 1: Handle OTP code from email (most common)**
      if (code) {
        console.log('✅ Found OTP code in URL - proceeding with token_hash verification');
        try {
          // const { error } = await verifyEmail({
          //   token_hash: code,
          //   type: type || 'email'
          // });
          //
          // if (error) {
          //   console.error('❌ OTP code verification error:', error);
          //   setError(error.message);
          //   setIsLoading(false);
          //   return;
          // }
          //
          // console.log('✅ Email verification successful with OTP code');
          // setIsVerified(true);
          // toast.success("Email đã được xác thực thành công!");
          //
          // // Redirect to dashboard after 2 seconds
          // setTimeout(() => {
          //   router.push("/dashboard");
          // }, 2000);
          // return;
        } catch (err) {
          console.error('❌ OTP code verification failed:', err);
          setError("Có lỗi xảy ra khi xác thực email");
          setIsLoading(false);
          return;
        }
      }

      // **PRIORITY 2: Supabase magic link with access_token and refresh_token**
      if (token && refreshToken) {
        console.log('✅ Found access_token and refresh_token in URL - proceeding with verification');
        try {
          // const { error } = await verifyEmail({
          //   access_token: token,
          //   refresh_token: refreshToken,
          //   type: type || 'email'
          // });
          //
          // if (error) {
          //   console.error('❌ Verification error:', error);
          //   setError(error.message);
          //   setIsLoading(false);
          //   return;
          // }
          //
          // console.log('✅ Email verification successful');
          // setIsVerified(true);
          // toast.success("Email đã được xác thực thành công!");
          //
          // // Redirect to dashboard after 2 seconds
          // setTimeout(() => {
          //   router.push("/dashboard");
          // }, 2000);
          // return;
        } catch (err) {
          console.error('❌ Verification failed:', err);
          setError("Có lỗi xảy ra khi xác thực email");
          setIsLoading(false);
          return;
        }
      }

      // Check if we have the required parameters for other verification methods
      if (!token && !hash) {
        setError("Liên kết xác thực không hợp lệ");
        setIsLoading(false);
        return;
      }

      // Use 'email' as the default type for email verification
      const verificationType = type || 'email';

      // try {
      //   console.log('Verifying email with:', { email, token: !!token, hash: !!hash, type: verificationType });
      //
      //   // If we have hash (Supabase format), try to verify with API
      //   if (hash) {
      //     console.log('Using hash verification via API');
      //     try {
      //       const { error } = await verifyEmail({
      //         token_hash: hash,
      //         type: verificationType
      //       });
      //
      //       if (error) {
      //         console.error('Hash verification error:', error);
      //         setError(error.message);
      //         setIsLoading(false);
      //         return;
      //       }
      //
      //       console.log('Hash verification successful');
      //       setIsVerified(true);
      //       toast.success("Email đã được xác thực thành công!");
      //       setTimeout(() => {
      //         router.push("/dashboard");
      //       }, 2000);
      //       return;
      //     } catch (hashErr) {
      //       console.error('Hash verification failed:', hashErr);
      //     }
      //   }
      //
      //   // Fallback to API verification with token and email
      //   if (email && token) {
      //     const { error } = await verifyEmail({ email, token, type: verificationType });
      //
      //     if (error) {
      //       setError(error.message);
      //       setIsLoading(false);
      //       return;
      //     }
      //
      //     setIsVerified(true);
      //     toast.success("Email đã được xác thực thành công!");
      //
      //     // Redirect to dashboard after 2 seconds
      //     setTimeout(() => {
      //       router.push("/dashboard");
      //     }, 2000);
      //   } else {
      //     setError("Thiếu thông tin xác thực");
      //     setIsLoading(false);
      //   }
      // } catch (error) {
      //   console.error('Email verification error:', error);
      //   setError("Có lỗi xảy ra khi xác thực email");
      //   setIsLoading(false);
      // }
    };

    handleVerifyEmail();
  }, [isClient, searchParams, router]);

  const handleResendEmail = async () => {
    if (!user?.email) {
      toast.error("Không tìm thấy email để gửi lại");
      return;
    }

    setIsLoading(true);
    try {
      // const { error } = await resendVerificationEmail();
      //
      // if (error) {
      //   toast.error(error.message);
      //   return;
      // }

      toast.success("Email xác thực đã được gửi lại!");
    } catch (error) {
      toast.error("Có lỗi xảy ra khi gửi lại email");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while hydrating or verifying
  if (!isClient || isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {!isClient ? "Đang tải..." : "Đang xác thực email..."}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {!isClient ? "Vui lòng chờ..." : "Vui lòng chờ trong giây lát."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isVerified) {
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
            <CardTitle className="text-2xl text-center">Xác thực thành công!</CardTitle>
            <CardDescription className="text-center">
              Email của bạn đã được xác thực thành công
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Tài khoản của bạn đã được kích hoạt thành công.
                </p>
                <p className="text-sm text-muted-foreground">
                  Bạn sẽ được chuyển hướng đến trang chủ trong vài giây...
                </p>
              </div>
            </div>

            <Button asChild className="w-full">
              <Link href="/dashboard">
                Tiếp tục
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
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
            <CardTitle className="text-2xl text-center">Xác thực thất bại</CardTitle>
            <CardDescription className="text-center">
              Có lỗi xảy ra khi xác thực email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Không thể xác thực email</h3>
                <p className="text-sm text-muted-foreground">
                  {error}
                </p>
                <p className="text-sm text-muted-foreground">
                  Liên kết có thể đã hết hạn hoặc không hợp lệ.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleResendEmail}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Gửi lại email xác thực
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-in">
                  Quay lại đăng nhập
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
          <CardTitle className="text-2xl text-center">Xác thực email</CardTitle>
          <CardDescription className="text-center">
            Vui lòng kiểm tra email và xác thực tài khoản
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Chúng tôi đã gửi email xác thực đến địa chỉ email của bạn.
              </p>
              <p className="text-sm text-muted-foreground">
                Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn trong email.
              </p>
              <p className="text-sm text-muted-foreground">
                Nếu không thấy email, hãy kiểm tra thư mục spam.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button
              onClick={handleResendEmail}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Gửi lại email xác thực
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/sign-in">
                Quay lại đăng nhập
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

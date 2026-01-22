// import React, { useState } from "react";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import { Loader2, ArrowLeft } from "lucide-react";
//
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { forgotPasswordSchema, type ForgotPasswordInput } from "@/schemas/authSchemas";
// import { useAuth } from "@/hooks/use-auth";

'use client'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useState } from 'react'

export function ForgotPasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      // The url which will be included in the email. This URL needs to be configured in your redirect URLs in the Supabase dashboard at https://supabase.com/dashboard/project/_/auth/url-configuration
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/change-password`,
      })
      if (error) throw error
      setSuccess(true)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      {success ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription>Password reset instructions sent</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              If you registered using your email and password, you will receive a password reset
              email.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Type in your email and we&apos;ll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send reset email'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/sign-in" className="underline underline-offset-4">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}


// export function ForgotPasswordForm() {
//   const [isLoading, setIsLoading] = useState(false);
//   const [emailSent, setEmailSent] = useState(false);
//   const { resetPassword } = useAuth();
//
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     watch,
//   } = useForm<ForgotPasswordInput>({
//     resolver: zodResolver(forgotPasswordSchema),
//     defaultValues: {
//       email: "",
//     },
//   });
//
//   const onSubmit = async (data: ForgotPasswordInput) => {
//     setIsLoading(true);
//     try {
//       const { error } = await resetPassword(data.email);
//
//       if (error) {
//         toast.error(error.message);
//         return;
//       }
//
//       setEmailSent(true);
//       toast.success("Email đặt lại mật khẩu đã được gửi!");
//     } catch (error) {
//       toast.error("Có lỗi xảy ra khi gửi email đặt lại mật khẩu");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   if (emailSent) {
//     return (
//       <div className="flex flex-col gap-6">
//         <Card>
//           <CardHeader className="space-y-1">
//             <div className="flex flex-col items-center gap-2">
//               <Link href="/apps/web/public" className="flex flex-col items-center gap-2 font-medium">
//                 <div className="flex size-24 items-center justify-center rounded-md">
//                   <img
//                     src="/logo/logo.png"
//                     alt="Restaurant Chain Management"
//                     className="w-24 h-24 object-contain"
//                   />
//                 </div>
//                 <span className="sr-only">Restaurant Chain Management</span>
//               </Link>
//             </div>
//             <CardTitle className="text-2xl text-center">Kiểm tra email của bạn</CardTitle>
//             <CardDescription className="text-center">
//               Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email của bạn
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-6">
//             <div className="text-center space-y-4">
//               <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
//                 <svg
//                   className="w-8 h-8 text-green-600"
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M5 13l4 4L19 7"
//                   />
//                 </svg>
//               </div>
//               <div className="space-y-2">
//                 <p className="text-sm text-muted-foreground">
//                   Chúng tôi đã gửi email đặt lại mật khẩu đến:
//                 </p>
//                 <p className="font-medium">{watch("email")}</p>
//               </div>
//               <div className="space-y-2">
//                 <p className="text-sm text-muted-foreground">
//                   Vui lòng kiểm tra hộp thư đến và làm theo hướng dẫn trong email.
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   Nếu không thấy email, hãy kiểm tra thư mục spam.
//                 </p>
//               </div>
//             </div>
//
//             <div className="space-y-4">
//               <Button
//                 onClick={() => setEmailSent(false)}
//                 variant="outline"
//                 className="w-full"
//               >
//                 Gửi lại email
//               </Button>
//               <Button asChild variant="ghost" className="w-full">
//                 <Link href="/sign-in">
//                   <ArrowLeft className="mr-2 h-4 w-4" />
//                   Quay lại đăng nhập
//                 </Link>
//               </Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }
//
//   return (
//     <div className="flex flex-col gap-6">
//       <Card>
//         <CardHeader className="space-y-1">
//           <div className="flex flex-col items-center gap-2">
//             <Link href="/apps/web/public" className="flex flex-col items-center gap-2 font-medium">
//               <div className="flex size-24 items-center justify-center rounded-md">
//                 <img
//                   src="/logo/logo.png"
//                   alt="Restaurant Chain Management"
//                   className="w-24 h-24 object-contain"
//                 />
//               </div>
//               <span className="sr-only">Restaurant Chain Management</span>
//             </Link>
//           </div>
//           <CardTitle className="text-2xl text-center">Quên mật khẩu</CardTitle>
//           <CardDescription className="text-center">
//             Nhập email của bạn để nhận liên kết đặt lại mật khẩu
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Email Field */}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@example.com"
//                 {...register("email")}
//                 disabled={isLoading}
//               />
//               {errors.email && (
//                 <p className="text-sm text-destructive">{errors.email.message}</p>
//               )}
//             </div>
//
//             {/* Submit Button */}
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Gửi liên kết đặt lại mật khẩu
//             </Button>
//           </form>
//
//           <div className="text-center text-sm">
//             Nhớ mật khẩu rồi?{" "}
//             <Link href="/sign-in" className="text-primary hover:underline">
//               Đăng nhập ngay
//             </Link>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// import React, { useState } from "react";
// import { useRouter } from "next/navigation";
// import Link from "next/link";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { toast } from "sonner";
// import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
//
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { changePasswordSchema, type ChangePasswordInput } from "@/schemas/authSchemas";
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
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function UpdatePasswordForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push('/protected')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>Please enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleForgotPassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="New password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save new password'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// export function ChangePasswordForm() {
//   const [showCurrentPassword, setShowCurrentPassword] = useState(false);
//   const [showNewPassword, setShowNewPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//
//   const router = useRouter();
//   const { updatePassword, user } = useAuth();
//
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//   } = useForm<ChangePasswordInput>({
//     resolver: zodResolver(changePasswordSchema),
//     defaultValues: {
//       currentPassword: "",
//       newPassword: "",
//       confirmNewPassword: "",
//     },
//   });
//
//   // Redirect if not authenticated
//   React.useEffect(() => {
//     if (!user) {
//       router.push("/sign-in");
//     }
//   }, [user, router]);
//
//   const onSubmit = async (data: ChangePasswordInput) => {
//     setIsLoading(true);
//     try {
//       const { error } = await updatePassword({
//         currentPassword: data.currentPassword,
//         newPassword: data.newPassword,
//         confirmNewPassword: data.confirmNewPassword,
//       });
//
//       if (error) {
//         toast.error(error.message);
//         return;
//       }
//
//       setIsSuccess(true);
//       toast.success("Mật khẩu đã được cập nhật thành công!");
//
//       // Redirect to profile after 3 seconds
//       setTimeout(() => {
//         router.push("/profile");
//       }, 3000);
//     } catch (error) {
//       toast.error("Có lỗi xảy ra khi cập nhật mật khẩu");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   if (isSuccess) {
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
//             <CardTitle className="text-2xl text-center">Thành công!</CardTitle>
//             <CardDescription className="text-center">
//               Mật khẩu của bạn đã được cập nhật thành công
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
//                   Mật khẩu của bạn đã được cập nhật thành công.
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   Bạn sẽ được chuyển hướng đến trang hồ sơ trong vài giây...
//                 </p>
//               </div>
//             </div>
//
//             <Button asChild className="w-full">
//               <Link href="/profile">
//                 Quay lại hồ sơ
//               </Link>
//             </Button>
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
//           <CardTitle className="text-2xl text-center">Đổi mật khẩu</CardTitle>
//           <CardDescription className="text-center">
//             Nhập mật khẩu hiện tại và mật khẩu mới
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Current Password Field */}
//             <div className="space-y-2">
//               <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
//               <div className="relative">
//                 <Input
//                   id="currentPassword"
//                   type={showCurrentPassword ? "text" : "password"}
//                   placeholder="Nhập mật khẩu hiện tại"
//                   {...register("currentPassword")}
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowCurrentPassword(!showCurrentPassword)}
//                   disabled={isLoading}
//                 >
//                   {showCurrentPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                   <span className="sr-only">
//                     {showCurrentPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
//                   </span>
//                 </Button>
//               </div>
//               {errors.currentPassword && (
//                 <p className="text-sm text-destructive">{errors.currentPassword.message}</p>
//               )}
//             </div>
//
//             {/* New Password Field */}
//             <div className="space-y-2">
//               <Label htmlFor="newPassword">Mật khẩu mới</Label>
//               <div className="relative">
//                 <Input
//                   id="newPassword"
//                   type={showNewPassword ? "text" : "password"}
//                   placeholder="Nhập mật khẩu mới"
//                   {...register("newPassword")}
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowNewPassword(!showNewPassword)}
//                   disabled={isLoading}
//                 >
//                   {showNewPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                   <span className="sr-only">
//                     {showNewPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
//                   </span>
//                 </Button>
//               </div>
//               {errors.newPassword && (
//                 <p className="text-sm text-destructive">{errors.newPassword.message}</p>
//               )}
//             </div>
//
//             {/* Confirm New Password Field */}
//             <div className="space-y-2">
//               <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
//               <div className="relative">
//                 <Input
//                   id="confirmNewPassword"
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Nhập lại mật khẩu mới"
//                   {...register("confirmNewPassword")}
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                   disabled={isLoading}
//                 >
//                   {showConfirmPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                   <span className="sr-only">
//                     {showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
//                   </span>
//                 </Button>
//               </div>
//               {errors.confirmNewPassword && (
//                 <p className="text-sm text-destructive">{errors.confirmNewPassword.message}</p>
//               )}
//             </div>
//
//             {/* Submit Button */}
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Cập nhật mật khẩu
//             </Button>
//           </form>
//
//           <div className="space-y-4">
//             <Button asChild variant="outline" className="w-full">
//               <Link href="/profile">
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Quay lại hồ sơ
//               </Link>
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

//
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Label } from "@/components/ui/label";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Checkbox } from "@/components/ui/checkbox";
// import { SocialConnections } from "@/components/form/auth/social-connections";

'use client'

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { SocialConnections } from "@/components/form/auth/social-connections";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { registerSchema, type RegisterInput } from "@/schemas/auth";

export function RegisterForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  // const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // const sync = useSyncQuery()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema as any),
    defaultValues: {
      firstName: "",
      lastName: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      phoneCode: "+84",
      termsAccepted: false,
      // newsletterSubscription: false,
    },
  });

  const handleSignUp = async (data: RegisterInput) => {
    // e.preventDefault() // e: React.FormEvent
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (data.password !== data.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        phone: data.phoneNumber,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
            username: data.username,
            role: 'customer',
          },
        },
      });
      if (error) throw error

      // await sync.refetch();
      router.push('/sign-up/success')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center gap-2">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-24 items-center justify-center rounded-md">
                <Image
                  src="/logo/logo.png"
                  alt="Restaurant Chain Management"
                  className="w-24 h-24 object-contain"
                  loading="eager"
                  width={96}
                  height={96}
                />
              </div>
              <span className="sr-only">Restaurant Chain Management</span>
            </Link>
            {/*<h1 className="text-xl font-bold">Chào mừng bạn</h1>*/}
          </div>
          <CardTitle className="text-2xl text-center">Tạo tài khoản</CardTitle>
          <CardDescription className="text-center">
            Chào mừng! Điền thông tin để tạo tài khoản mới.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(handleSignUp)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Họ</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Họ"
                  {...register("firstName")}
                  disabled={isLoading}
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Tên</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Tên"
                  {...register("lastName")}
                  disabled={isLoading}
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Tên đăng nhập</Label>
              <Input
                id="username"
                type="text"
                placeholder="username"
                {...register("username")}
                disabled={isLoading}
              />
              {errors.username && (
                <p className="text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@gmail.com"
                {...register("email")}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Số điện thoại</Label>
              <div className="flex gap-2">
                <Input
                  id="phoneCode"
                  type="text"
                  value="+84"
                  disabled
                  className="w-16"
                />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0123456789"
                  {...register("phoneNumber")}
                  disabled={isLoading}
                  className="flex-1"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  {...register("password")}
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
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
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

            {/* Terms and Newsletter */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="termsAccepted"
                  checked={watch("termsAccepted")}
                  onCheckedChange={(checked) => setValue("termsAccepted", !!checked)}
                  disabled={isLoading}
                  className="mt-1"
                />
                <div className="grid leading-none">
                  <Label htmlFor="termsAccepted" className="text-sm gap-1">
                    <p>Đồng ý{" "}</p>
                    <Link href="/term" className="text-primary hover:underline">
                      Điều khoản
                    </Link>
                    <p>{" "}và{" "}</p>
                    <Link href="/privacy" className="text-primary hover:underline">
                      Chính sách
                    </Link>
                  </Label>
                  {errors.termsAccepted && (
                    <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
                  )}
                </div>
              </div>

              {/*<div className="flex items-center space-x-2">*/}
              {/*  <Checkbox*/}
              {/*    id="newsletterSubscription"*/}
              {/*    checked={watch("newsletterSubscription")}*/}
              {/*    onCheckedChange={(checked) => setValue("newsletterSubscription", !!checked)}*/}
              {/*    disabled={isLoading}*/}
              {/*  />*/}
              {/*  <Label htmlFor="newsletterSubscription" className="text-sm">*/}
              {/*    Đăng ký nhận thông báo và cập nhật mới*/}
              {/*  </Label>*/}
              {/*</div>*/}
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Tạo tài khoản
            </Button>
            <div className="text-center text-sm">
              Đã có tài khoản?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function RegisterFormDef({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      router.push('/auth/sign-up-success')
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
          <CardTitle className="text-2xl">Sign up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
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
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">Repeat Password</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating an account...' : 'Sign up'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{' '}
              <Link href="/auth/login" className="underline underline-offset-4">
                Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// export function SignUpForm() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const next = searchParams.get('next') || '/';
//   const { signUp, signInWithOAuth, user } = useAuth();
//
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useForm<RegisterInput>({
//     resolver: zodResolver(registerSchema),
//     defaultValues: {
//       firstName: "",
//       lastName: "",
//       username: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//       phoneNumber: "",
//       phoneCode: "+84",
//       termsAccepted: false,
//       // newsletterSubscription: false,
//     },
//   });
//
//   // Redirect if already authenticated
//   useEffect(() => {
//     if (user) {
//       router.push("/");
//     }
//   }, [user, router]);
//
//   const onSubmit = async (data: RegisterInput) => {
//     setIsLoading(true);
//     try {
//       const { error } = await signUp({
//         firstName: data.firstName,
//         lastName: data.lastName,
//         username: data.username,
//         email: data.email,
//         password: data.password,
//         confirmPassword: data.confirmPassword,
//         phoneNumber: data.phoneNumber,
//         phoneCode: data.phoneCode,
//         termsAccepted: data.termsAccepted,
//         // newsletterSubscription: data.newsletterSubscription,
//       });
//
//       if (error) {
//         console.error('Registration error:', error);
//         toast.error(`Đăng ký thất bại: ${error.message || 'Có lỗi xảy ra'}`);
//         return;
//       }
//
//       toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.");
//       router.push("/verify-email");
//     } catch (error) {
//       toast.error("Có lỗi xảy ra khi đăng ký");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const handleOAuthSignUp = async (provider: 'google' | 'facebook' | 'apple') => {
//     setIsLoading(true);
//     // try {
//     //   const { error } = await signInWithOAuth(provider, { redirectTo: next });
//     //
//     //   if (error) {
//     //     toast.error(error.message);
//     //     return;
//     //   }
//     // } catch (error) {
//     //   toast.error("Có lỗi xảy ra khi đăng ký");
//     // } finally {
//     //   setIsLoading(false);
//     // }
//   };
//
//   return (
//     <div className="flex flex-col gap-6">
//       <Card>
//         <CardHeader className="space-y-1">
//           <div className="flex flex-col items-center gap-2">
//             <Link href="/" className="flex flex-col items-center gap-2 font-medium">
//               <div className="flex size-24 items-center justify-center rounded-md">
//                 <Image
//                   src="/logo/logo.png"
//                   alt="Restaurant Chain Management"
//                   className="w-24 h-24 object-contain"
//                   loading="eager"
//                   width={96}
//                   height={96}
//                 />
//               </div>
//               <span className="sr-only">Restaurant Chain Management</span>
//             </Link>
//             {/*<h1 className="text-xl font-bold">Chào mừng bạn</h1>*/}
//           </div>
//           <CardTitle className="text-2xl text-center">Tạo tài khoản</CardTitle>
//           <CardDescription className="text-center">
//             Chào mừng! Điền thông tin để tạo tài khoản mới.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Name Fields */}
//             <div className="grid grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="firstName">Họ</Label>
//                 <Input
//                   id="firstName"
//                   type="text"
//                   placeholder="Họ"
//                   {...register("firstName")}
//                   disabled={isLoading}
//                 />
//                 {errors.firstName && (
//                   <p className="text-sm text-destructive">{errors.firstName.message}</p>
//                 )}
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="lastName">Tên</Label>
//                 <Input
//                   id="lastName"
//                   type="text"
//                   placeholder="Tên"
//                   {...register("lastName")}
//                   disabled={isLoading}
//                 />
//                 {errors.lastName && (
//                   <p className="text-sm text-destructive">{errors.lastName.message}</p>
//                 )}
//               </div>
//             </div>
//
//             {/* Username Field */}
//             <div className="space-y-2">
//               <Label htmlFor="username">Tên đăng nhập</Label>
//               <Input
//                 id="username"
//                 type="text"
//                 placeholder="username"
//                 {...register("username")}
//                 disabled={isLoading}
//               />
//               {errors.username && (
//                 <p className="text-sm text-destructive">{errors.username.message}</p>
//               )}
//             </div>
//
//             {/* Email Field */}
//             <div className="space-y-2">
//               <Label htmlFor="email">Email</Label>
//               <Input
//                 id="email"
//                 type="email"
//                 placeholder="user@gmail.com"
//                 {...register("email")}
//                 disabled={isLoading}
//               />
//               {errors.email && (
//                 <p className="text-sm text-destructive">{errors.email.message}</p>
//               )}
//             </div>
//
//             {/* Phone Field */}
//             <div className="space-y-2">
//               <Label htmlFor="phoneNumber">Số điện thoại</Label>
//               <div className="flex gap-2">
//                 <Input
//                   id="phoneCode"
//                   type="text"
//                   value="+84"
//                   disabled
//                   className="w-16"
//                 />
//                 <Input
//                   id="phoneNumber"
//                   type="tel"
//                   placeholder="0123456789"
//                   {...register("phoneNumber")}
//                   disabled={isLoading}
//                   className="flex-1"
//                 />
//               </div>
//               {errors.phoneNumber && (
//                 <p className="text-sm text-destructive">{errors.phoneNumber.message}</p>
//               )}
//             </div>
//
//             {/* Password Field */}
//             <div className="space-y-2">
//               <Label htmlFor="password">Mật khẩu</Label>
//               <div className="relative">
//                 <Input
//                   id="password"
//                   type={showPassword ? "text" : "password"}
//                   placeholder="Nhập mật khẩu"
//                   {...register("password")}
//                   disabled={isLoading}
//                 />
//                 <Button
//                   type="button"
//                   variant="ghost"
//                   size="sm"
//                   className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isLoading}
//                 >
//                   {showPassword ? (
//                     <EyeOff className="h-4 w-4" />
//                   ) : (
//                     <Eye className="h-4 w-4" />
//                   )}
//                   <span className="sr-only">
//                     {showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
//                   </span>
//                 </Button>
//               </div>
//               {errors.password && (
//                 <p className="text-sm text-destructive">{errors.password.message}</p>
//               )}
//             </div>
//
//             {/* Confirm Password Field */}
//             <div className="space-y-2">
//               <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
//               <div className="relative">
//                 <Input
//                   id="confirmPassword"
//                   type={showConfirmPassword ? "text" : "password"}
//                   placeholder="Nhập lại mật khẩu"
//                   {...register("confirmPassword")}
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
//               {errors.confirmPassword && (
//                 <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
//               )}
//             </div>
//
//             {/* Terms and Newsletter */}
//             <div className="space-y-3">
//               <div className="flex items-start space-x-2">
//                 <Checkbox
//                   id="termsAccepted"
//                   checked={watch("termsAccepted")}
//                   onCheckedChange={(checked) => setValue("termsAccepted", !!checked)}
//                   disabled={isLoading}
//                   className="mt-1"
//                 />
//                 <div className="grid leading-none">
//                   <Label htmlFor="termsAccepted" className="text-sm gap-1">
//                     <p>Đồng ý{" "}</p>
//                     <Link href="/term" className="text-primary hover:underline">
//                       Điều khoản
//                     </Link>
//                     <p>{" "}và{" "}</p>
//                     <Link href="/privacy" className="text-primary hover:underline">
//                       Chính sách
//                     </Link>
//                   </Label>
//                   {errors.termsAccepted && (
//                     <p className="text-sm text-destructive">{errors.termsAccepted.message}</p>
//                   )}
//                 </div>
//               </div>
//
//               {/*<div className="flex items-center space-x-2">*/}
//               {/*  <Checkbox*/}
//               {/*    id="newsletterSubscription"*/}
//               {/*    checked={watch("newsletterSubscription")}*/}
//               {/*    onCheckedChange={(checked) => setValue("newsletterSubscription", !!checked)}*/}
//               {/*    disabled={isLoading}*/}
//               {/*  />*/}
//               {/*  <Label htmlFor="newsletterSubscription" className="text-sm">*/}
//               {/*    Đăng ký nhận thông báo và cập nhật mới*/}
//               {/*  </Label>*/}
//               {/*</div>*/}
//             </div>
//
//             {/* Submit Button */}
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Tạo tài khoản
//             </Button>
//           </form>
//
//           <div className="text-center text-sm">
//             Đã có tài khoản?{" "}
//             <Link href="/sign-in" className="text-primary hover:underline">
//               Đăng nhập ngay
//             </Link>
//           </div>
//
//           <div className="flex flex-row items-center">
//             <Separator className="flex-1" />
//             <span className="text-muted-foreground px-4 text-sm">hoặc</span>
//             <Separator className="flex-1" />
//           </div>
//
//           {/* OAuth Buttons */}
//           <SocialConnections
//             // onOAuthSignUp={handleOAuthSignUp}
//             isLoading={isLoading}
//           />
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

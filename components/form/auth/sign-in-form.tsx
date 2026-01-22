'use client'

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import axios from 'axios'
import { SocialConnections } from "@/components/form/auth/social-connections";
import { loginSchema } from "@/schemas/auth";
import { Eye, EyeOff, Loader2 } from "lucide-react";
// import { callback } from "@/services/auth";
import { useCallbackMutation } from "@/state/api";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  // const [email, setEmail] = useState('')
  // const [password, setPassword] = useState('')
  const [callback] = useCallbackMutation()
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // const [sync, { isLoading: isSyncing }] = useSyncMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  });

  const handleLogin = async (data: any) => {
    // e.preventDefault() //, e: React.FormEvent
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.identifier,
        password: data.password,
      })
      if (error) throw error
      router.push('/')
      // Update this route to redirect to an authenticated route. The user already has an active session.
      // await sync();
      await callback().unwrap();
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
            <Link href="/apps/web/public" className="flex flex-col items-center gap-2 font-medium">
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
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">
            Vui lòng nhập thông tin để tiếp tục.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(handleLogin)} className="space-y-4">
            {/*<div className="flex flex-col gap-6">*/}
            <div
              // className="grid gap-2"
              className="space-y-2"
            >
              <Label htmlFor="identifier">Email hoặc Tên đăng nhập</Label>
              <Input
                id="identifier"
                type="identifier"
                placeholder="m@example.com"
                required
                {...register("identifier")}
                disabled={isLoading}
              // value={identifier}
              // onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div
              // className="grid gap-2"
              className="space-y-2"
            >
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  // type="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  required
                  {...register("password")}
                  disabled={isLoading}
                // value={password}
                // onChange={(e) => setPassword(e.target.value)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full hover:bg-transparent"
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
            </div>

            <div className="flex items-center gap-1">
              <Checkbox
                id="remember"
                checked={watch("remember")}
                onCheckedChange={(checked) => setValue("remember", !!checked)}
                disabled={isLoading}
              />
              <Label htmlFor="remember" className="text-sm">
                Ghi nhớ đăng nhập
              </Label>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
            {/*</div>*/}
            <div className="text-center text-sm">
              Chưa có tài khoản?{" "}
              <Link href="/sign-up" className="text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </div>
          </form>
          <div className="flex flex-row items-center">
            <Separator className="flex-1" />
            <span className="text-muted-foreground px-4 text-sm">hoặc</span>
            <Separator className="flex-1" />
          </div>

          <SocialConnections
            // onOAuthSignIn={handleOAuthSignIn}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        Bằng cách tiếp tục, bạn đồng ý với{" "}
        <Link href="/term" className="underline hover:text-primary">
          Điều khoản dịch vụ
        </Link>{" "}
        và{" "}
        <Link href="/privacy" className="underline hover:text-primary">
          Chính sách bảo mật
        </Link>
        .
      </div>
    </div>
  )
}

export function LoginFormDef({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
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
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Vui lòng nhập thông tin để tiếp tục.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin}>
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
                  <Link
                    href="/forgot-password"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" className="underline underline-offset-4">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export function SocialForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSocialLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/oauth?next=/protected`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Welcome!</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSocialLogin}>
            <div className="flex flex-col gap-6">
              {error && <p className="text-sm text-destructive-500">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Continue with GitHub'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

// export function SignInFormOld() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const next = searchParams.get('next') || '/';
//   // const { signIn, signInWithOAuth, user } = useAuth();
//
//   const {
//     register,
//     handleSubmit,
//     formState: { errors },
//     setValue,
//     watch,
//   } = useForm<any>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       identifier: "",
//       password: "",
//       remember: false,
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
//   const onSubmit = async (data: any) => {
//     setIsLoading(true);
//     try {
//       const { error } = await signIn(data.identifier, data.password);
//
//       if (error) {
//         toast.error(error.message);
//         return;
//       }
//
//       toast.success("Đăng nhập thành công!");
//       router.push("/");
//     } catch (error) {
//       toast.error("Có lỗi xảy ra khi đăng nhập");
//     } finally {
//       setIsLoading(false);
//     }
//   };
//
//   const handleOAuthSignIn = async (provider: 'google' | 'facebook' | 'apple') => {
//     setIsLoading(true);
//     // try {
//     //   const { error } = await signInWithOAuth(provider, { redirectTo: next });
//     //
//     //   if (error) {
//     //     toast.error(error.message);
//     //     return;
//     //   }
//     // } catch (error) {
//     //   toast.error("Có lỗi xảy ra khi đăng nhập");
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
//             <Link href="/apps/web/public" className="flex flex-col items-center gap-2 font-medium">
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
//           <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
//           <CardDescription className="text-center">
//             Vui lòng nhập thông tin để tiếp tục.
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-6">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//             {/* Email/Username Field */}
//             <div className="space-y-2">
//               <Label htmlFor="identifier">Email hoặc Tên đăng nhập</Label>
//               <Input
//                 id="identifier"
//                 type="text"
//                 placeholder="user@example.com hoặc username"
//                 {...register("identifier")}
//                 disabled={isLoading}
//               />
//               {errors.identifier && (
//                 <p className="text-sm text-destructive">{errors.identifier.message}</p>
//               )}
//             </div>
//
//             {/* Password Field */}
//             <div className="space-y-2">
//               <div className="flex items-center justify-between">
//                 <Label htmlFor="password">Mật khẩu</Label>
//                 <Link
//                   href="/forgot-password"
//                   className="text-sm text-primary hover:underline"
//                 >
//                   Quên mật khẩu?
//                 </Link>
//               </div>
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
//             {/* Remember Me */}
//             <div className="flex items-center gap-1">
//               <Checkbox
//                 id="remember"
//                 checked={watch("remember")}
//                 onCheckedChange={(checked) => setValue("remember", !!checked)}
//                 disabled={isLoading}
//               />
//               <Label htmlFor="remember" className="text-sm">
//                 Ghi nhớ đăng nhập
//               </Label>
//             </div>
//
//             {/* Submit Button */}
//             <Button type="submit" className="w-full" disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               Đăng nhập
//             </Button>
//           </form>
//
//           <div className="text-center text-sm">
//             Chưa có tài khoản?{" "}
//             <Link href="/sign-up" className="text-primary hover:underline">
//               Đăng ký ngay
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
//           {/*<SocialConnections*/}
//           {/*  onOAuthSignIn={handleOAuthSignIn}*/}
//           {/*  isLoading={isLoading}*/}
//           {/*/>*/}
//         </CardContent>
//       </Card>
//
//       <div className="text-center text-xs text-muted-foreground">
//         Bằng cách tiếp tục, bạn đồng ý với{" "}
//         <Link href="/term" className="underline hover:text-primary">
//           Điều khoản dịch vụ
//         </Link>{" "}
//         và{" "}
//         <Link href="/privacy" className="underline hover:text-primary">
//           Chính sách bảo mật
//         </Link>
//         .
//       </div>
//     </div>
//   );
// }

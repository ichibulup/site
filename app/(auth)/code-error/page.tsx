"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex flex-col items-center gap-2">
            <Link href="/" className="flex flex-col items-center gap-2 font-medium">
              <div className="flex size-24 items-center justify-center rounded-md">
                <Image
                  src="/logo/logo.png"
                  alt="Restaurant Chain Management"
                  width={96}
                  height={96}
                />
              </div>
              <span className="sr-only">Restaurant Chain Management</span>
            </Link>
          </div>
          <CardTitle className="text-2xl text-center">Lỗi xác thực</CardTitle>
          <CardDescription className="text-center">
            Có lỗi xảy ra trong quá trình xác thực
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Không thể xác thực</h3>
              <p className="text-sm text-muted-foreground">
                Có lỗi xảy ra trong quá trình xác thực tài khoản của bạn.
              </p>
              <p className="text-sm text-muted-foreground">
                Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/sign-in">
                Thử đăng nhập lại
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Về trang chủ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

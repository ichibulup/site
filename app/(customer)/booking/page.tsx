"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Users, MapPin, Phone, AlertCircle } from "lucide-react"
import { ReservationForm } from "@/components/form/mock/restaurant"
import { TextBanner } from "@/components/layout/banner"

export default function BookingPage() {
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleReservationSuccess = (data: any) => {
    console.log("Reservation successful:", data)
    // toast({
    //   title: "Đặt bàn thành công!",
    //   description: "Chúng tôi sẽ liên hệ xác nhận trong vòng 15 phút.",
    // })
    setIsSubmitted(true)
  }

  const handleReservationCancel = () => {
    console.log("Reservation cancelled")
    setIsLoading(false)
  }

  // if (isSubmitted) {
  //   return (
  //     <div className="flex flex-col gap-6">
  //       {/* Success Message */}
  //
  //     </div>
  //   )
  // }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      {isSubmitted ? (
        <>
          <div className="bg-gradient-to-r from-professional-green to-green-600 rounded-xl text-white py-18">
            <div className="flex flex-col gap-6 text-center">
              <div className="flex justify-center">
                <CheckCircle className="h-12 w-12" />
              </div>
              <h1 className="text-4xl font-bold">Đặt bàn thành công!</h1>
              <p className="text-xl opacity-90">
                Chúng tôi sẽ liên hệ xác nhận trong vòng 15 phút
              </p>
              <div>
                <Button 
                  variant="outline" 
                  className="bg-white text-green-600 cursor-pointer"
                  onClick={() => setIsSubmitted(false)}
                >
                  Đặt bàn mới
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <TextBanner
            title={"Đặt Bàn"}
            description={"Đặt bàn trước để đảm bảo có chỗ ngồi tốt nhất"}
          />

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <ReservationForm
                mode="create"
                onSuccess={handleReservationSuccess}
                onCancel={handleReservationCancel}
                submitText="Xác nhận đặt bàn"
                isLoading={isLoading}
                minHoursAhead={1}
                maxDaysAhead={7}
              />
            </div>

            {/* Sidebar Info */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    Thông tin liên hệ
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Hotline đặt bàn</p>
                      <p className="text-sm text-muted-foreground">1900 1234</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Giờ mở cửa</p>
                      <p className="text-sm text-muted-foreground">10:00 - 22:00</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Địa chỉ</p>
                      <p className="text-sm text-muted-foreground">
                        123 Đường ABC, Quận 1, TP.HCM
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Booking Policy */}
              <Card>
                <CardHeader>
                  <CardTitle>Chính sách đặt bàn</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Hủy đặt bàn</p>
                      <p className="text-xs text-muted-foreground">
                        Miễn phí hủy trước 2 giờ
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="h-4 w-4 text-blue-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Số người tối đa</p>
                      <p className="text-xs text-muted-foreground">
                        Mỗi bàn tối đa 20 người
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-green-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Thời gian sử dụng</p>
                      <p className="text-xs text-muted-foreground">
                        Tối thiểu 1 giờ, tối đa 4 giờ
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Popular Tables */}
              <Card>
                <CardHeader>
                  <CardTitle>Bàn phổ biến</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bàn VIP</p>
                      <p className="text-sm text-muted-foreground">8 người</p>
                    </div>
                    <Badge variant="outline">Phổ biến</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bàn gia đình</p>
                      <p className="text-sm text-muted-foreground">6 người</p>
                    </div>
                    <Badge variant="outline">Được yêu thích</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Bàn đôi</p>
                      <p className="text-sm text-muted-foreground">2 người</p>
                    </div>
                    <Badge variant="outline">Lãng mạn</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

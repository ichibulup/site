"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Clock, Users, MapPin, Phone, AlertCircle, Loader2, CheckCircle2,
  Calendar as CalendarIcon, Info
} from "lucide-react"
import Link from "next/link"
import { useGetAllRestaurantsQuery, useCreateReservationMutation, useCheckAvailabilityMutation, useGetMeQuery } from "@/state/api"
import { useRouter } from "next/navigation"

export default function ReservationsPage() {
  const router = useRouter()
  
  // API hooks
  const { data: user } = useGetMeQuery()
  const { data: restaurants = [], isLoading: isLoadingRestaurants, error: restaurantsError } = useGetAllRestaurantsQuery()
  const [createReservation, { isLoading: isCreating, isSuccess, isError: createError }] = useCreateReservationMutation()
  const [checkAvailability, { isLoading: isChecking }] = useCheckAvailabilityMutation()
  
  // Form state
  const [selectedRestaurant, setSelectedRestaurant] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [partySize, setPartySize] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [phone, setPhone] = useState<string>("")
  const [specialRequests, setSpecialRequests] = useState<string>("")
  const [windowSeat, setWindowSeat] = useState<boolean>(false)
  const [quietArea, setQuietArea] = useState<boolean>(false)
  const [highChair, setHighChair] = useState<boolean>(false)
  const [reminder, setReminder] = useState<boolean>(true)
  
  // Availability state
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [availabilityMessage, setAvailabilityMessage] = useState<string>("")
  
  const timeSlots = [
    "10:00", "10:30", "11:00", "11:30", "12:00", "12:30",
    "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30",
    "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"
  ]

  const popularTimes = ["12:00", "13:00", "18:00", "19:00", "20:00"]
  
  // Pre-fill user info
  useEffect(() => {
    if (user) {
      setName(user.fullName || user.username || "")
      setPhone(user.phone || "")
    }
  }, [user])
  
  // Check availability when date/restaurant/party size changes
  useEffect(() => {
    if (selectedRestaurant && selectedDate && partySize) {
      handleCheckAvailability()
    }
  }, [selectedRestaurant, selectedDate, partySize])
  
  // Redirect to history after successful reservation
  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        router.push('/customer/reservations/history')
      }, 2000)
    }
  }, [isSuccess, router])
  
  const handleCheckAvailability = async () => {
    if (!selectedRestaurant || !selectedDate || !partySize) return
    
    try {
      const result = await checkAvailability({
        restaurantId: selectedRestaurant,
        date: selectedDate.toISOString(),
        partySize: parseInt(partySize)
      }).unwrap()
      
      if (result.available) {
        setAvailableSlots(result.availableSlots || timeSlots)
        setAvailabilityMessage(`Có ${result.availableSlots?.length || timeSlots.length} khung giờ còn trống`)
      } else {
        setAvailableSlots([])
        setAvailabilityMessage("Rất tiếc, không còn bàn trống cho ngày này")
      }
    } catch (error) {
      // If check fails, show all slots
      setAvailableSlots(timeSlots)
      setAvailabilityMessage("")
    }
  }
  
  const handleSubmit = async () => {
    if (!selectedRestaurant || !selectedDate || !selectedTime || !partySize || !name || !phone) {
      return
    }
    
    // Combine date and time
    const [hours, minutes] = selectedTime.split(':')
    const reservationDateTime = new Date(selectedDate)
    reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
    
    // Build preferences
    const preferences = []
    if (windowSeat) preferences.push("Bàn gần cửa sổ")
    if (quietArea) preferences.push("Khu vực yên tĩnh")
    if (highChair) preferences.push("Ghế cao cho trẻ em")
    if (reminder) preferences.push("Nhắc nhở trước 30 phút")
    
    try {
      await createReservation({
        restaurantId: selectedRestaurant,
        reservationDate: reservationDateTime.toISOString(),
        partySize: parseInt(partySize),
        customerName: name,
        customerPhone: phone,
        specialRequests: specialRequests || undefined,
        preferences: preferences.length > 0 ? preferences.join(", ") : undefined
      }).unwrap()
    } catch (error) {
      console.error('Failed to create reservation:', error)
    }
  }
  
  const isFormValid = selectedRestaurant && selectedDate && selectedTime && partySize && name && phone
  
  const selectedRestaurantData = restaurants.find((r: any) => r.id === selectedRestaurant)
  
  // Loading state
  if (isLoadingRestaurants) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-64 w-full" />
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  
  // Error state
  if (restaurantsError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải danh sách nhà hàng. Vui lòng thử lại sau.
        </AlertDescription>
      </Alert>
    )
  }
  
  // Success state
  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h3 className="text-xl font-bold mb-2">Đặt bàn thành công!</h3>
            <p className="text-muted-foreground text-center mb-4">
              Chúng tôi đã nhận được yêu cầu đặt bàn của bạn. Vui lòng kiểm tra email để xác nhận.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Đang chuyển đến lịch sử đặt bàn...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Đặt bàn</h2>
          <p className="text-muted-foreground">
            Đặt trước bàn để đảm bảo có chỗ ngồi thoải mái
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/customer/reservations/history">Lịch sử đặt bàn</Link>
        </Button>
      </div>

      {createError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể đặt bàn. Vui lòng kiểm tra lại thông tin và thử lại.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Reservation Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin đặt bàn</CardTitle>
              <CardDescription>
                Vui lòng điền đầy đủ thông tin để đặt bàn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Restaurant Selection */}
              <div className="space-y-2">
                <Label>Chọn nhà hàng</Label>
                <Select value={selectedRestaurant} onValueChange={setSelectedRestaurant}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn nhà hàng" />
                  </SelectTrigger>
                  <SelectContent>
                    {restaurants.map((restaurant: any) => (
                      <SelectItem key={restaurant.id} value={restaurant.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{restaurant.name}</div>
                            <div className="text-xs text-muted-foreground">{restaurant.address}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Chọn ngày</Label>
                <div className="border rounded-md p-3">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border-0"
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  />
                </div>
              </div>

              {/* Time & Party Size */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Thời gian</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime} disabled={!selectedDate || !selectedRestaurant}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn giờ" />
                    </SelectTrigger>
                    <SelectContent>
                      {(availableSlots.length > 0 ? availableSlots : timeSlots).map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{time}</span>
                            {popularTimes.includes(time) && (
                              <Badge variant="secondary" className="text-xs">
                                Phổ biến
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isChecking && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Đang kiểm tra chỗ trống...
                    </p>
                  )}
                  {availabilityMessage && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      {availabilityMessage}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Số lượng khách</Label>
                  <Select value={partySize} onValueChange={setPartySize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn số người" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>{num} người</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên khách hàng</Label>
                  <Input 
                    id="name" 
                    placeholder="Nhập tên của bạn" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input 
                    id="phone" 
                    placeholder="Số điện thoại liên hệ" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Special Requests */}
              <div className="space-y-2">
                <Label htmlFor="requests">Yêu cầu đặc biệt</Label>
                <Textarea 
                  id="requests" 
                  placeholder="Vị trí ngồi, dị ứng thực phẩm, kỷ niệm đặc biệt..."
                  className="min-h-[100px]"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              {/* Preferences */}
              <div className="space-y-4">
                <Label>Tuỳ chọn thêm</Label>
                <div className="grid gap-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={windowSeat}
                      onChange={(e) => setWindowSeat(e.target.checked)}
                    />
                    <span className="text-sm">Bàn gần cửa sổ</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={quietArea}
                      onChange={(e) => setQuietArea(e.target.checked)}
                    />
                    <span className="text-sm">Khu vực yên tĩnh</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={highChair}
                      onChange={(e) => setHighChair(e.target.checked)}
                    />
                    <span className="text-sm">Ghế cao cho trẻ em</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded" 
                      checked={reminder}
                      onChange={(e) => setReminder(e.target.checked)}
                    />
                    <span className="text-sm">Nhắc nhở trước 30 phút</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reservation Summary & Info */}
        <div className="space-y-6">
          {selectedRestaurantData && (
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nhà hàng</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">{selectedRestaurantData.name}</p>
                    <p className="text-muted-foreground">{selectedRestaurantData.address}</p>
                  </div>
                </div>
                
                {selectedRestaurantData.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">{selectedRestaurantData.phone}</p>
                      <p className="text-muted-foreground">Hỗ trợ 24/7</p>
                    </div>
                  </div>
                )}

                {selectedRestaurantData.openingHours && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="font-medium">Giờ hoạt động</p>
                      <p className="text-muted-foreground">{selectedRestaurantData.openingHours}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đặt bàn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nhà hàng:</span>
                  <span>{selectedRestaurantData?.name || "Chưa chọn"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày:</span>
                  <span>
                    {selectedDate 
                      ? selectedDate.toLocaleDateString('vi-VN', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })
                      : "Chưa chọn"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời gian:</span>
                  <span>{selectedTime || "Chưa chọn"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số người:</span>
                  <span>{partySize ? `${partySize} người` : "Chưa chọn"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tên:</span>
                  <span>{name || "Chưa nhập"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SĐT:</span>
                  <span>{phone || "Chưa nhập"}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between font-medium">
                  <span>Phí đặt bàn:</span>
                  <span className="text-green-600">Miễn phí</span>
                </div>
              </div>

              <Button 
                className="w-full" 
                disabled={!isFormValid || isCreating}
                onClick={handleSubmit}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  "Xác nhận đặt bàn"
                )}
              </Button>
              
              <p className="text-xs text-muted-foreground text-center">
                Bằng việc đặt bàn, bạn đồng ý với{" "}
                <Link href="/terms-of-service" className="underline">
                  Điều khoản dịch vụ
                </Link>{" "}
                của chúng tôi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lưu ý quan trọng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Vui lòng đến đúng giờ đã đặt</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Bàn sẽ được giữ trong 15 phút</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Có thể huỷ miễn phí trước 2 tiếng</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <p>Liên hệ hotline nếu có thay đổi</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

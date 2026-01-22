"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  RefreshCcw,
  CalendarDays,
  Search,
  ChevronRight
} from "lucide-react"
import {
  useGetReservationsQuery,
  useUpdateReservationStatusMutation,
  useDeleteReservationMutation
} from "@/state/api"
import { toast } from "sonner"
import { formatCurrency } from "@/lib/utils/formatters"
import { ReservationStatus } from "@/lib/interfaces"

interface Reservation {
  id: string
  reservationCode: string
  status: ReservationStatus
  customerName: string
  customerEmail: string
  customerPhone: string
  guestCount: number
  reservationDate: string
  reservationTime: string
  restaurant: {
    id: string
    name: string
    address: string
    phone: string
  }
  table?: {
    id: string
    number: string
    capacity: number
  }
  specialRequests?: string
  createdAt: string
}

const statusConfig = {
  [ReservationStatus.pending]: { label: "Chờ xác nhận", color: "bg-yellow-500", icon: Clock },
  [ReservationStatus.confirmed]: { label: "Đã xác nhận", color: "bg-green-500", icon: CheckCircle },
  [ReservationStatus.seated]: { label: "Đã nhận bàn", color: "bg-blue-500", icon: CheckCircle },
  [ReservationStatus.completed]: { label: "Hoàn thành", color: "bg-green-700", icon: CheckCircle },
  [ReservationStatus.cancelled]: { label: "Đã hủy", color: "bg-red-500", icon: XCircle },
  [ReservationStatus.noShow]: { label: "Không đến", color: "bg-gray-500", icon: XCircle },
}

export default function VisitorReservationsPage() {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // API Hooks
  const { 
    data: reservations = [], 
    isLoading, 
    error, 
    refetch 
  } = useGetReservationsQuery()

  const [updateStatus, { isLoading: isUpdating }] = useUpdateReservationStatusMutation()
  const [deleteReservation, { isLoading: isDeleting }] = useDeleteReservationMutation()

  // Filter reservations
  const filteredReservations = reservations.filter((reservation: any) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      reservation.reservationCode?.toLowerCase().includes(searchLower) ||
      reservation.restaurant?.name?.toLowerCase().includes(searchLower) ||
      reservation.customerName?.toLowerCase().includes(searchLower)
    )
  })

  // Separate upcoming and past reservations
  const now = new Date()
  const upcomingReservations = filteredReservations.filter((reservation: any) => {
    const reservationDate = new Date(reservation.reservationDate)
    return reservationDate >= now && ![ReservationStatus.completed, ReservationStatus.cancelled, ReservationStatus.noShow].includes(reservation.status)
  })

  const pastReservations = filteredReservations.filter((reservation: any) => {
    const reservationDate = new Date(reservation.reservationDate)
    return reservationDate < now || [ReservationStatus.completed, ReservationStatus.cancelled, ReservationStatus.noShow].includes(reservation.status)
  })

  const handleRefresh = () => {
    refetch()
    toast.success("Đã làm mới danh sách đặt bàn")
  }

  const handleViewDetails = (reservation: any) => {
    setSelectedReservation(reservation)
    setDialogOpen(true)
  }

  const handleCancelReservation = async (reservationId: string) => {
    try {
      await updateStatus({ 
        id: reservationId, 
        data: ReservationStatus.cancelled 
      }).unwrap()
      toast.success("Đã hủy đặt bàn thành công")
      setDeleteDialogOpen(false)
      setDialogOpen(false)
      refetch()
    } catch (error) {
      toast.error("Không thể hủy đặt bàn. Vui lòng thử lại!")
    }
  }

  const handleDeleteReservation = async (reservationId: string) => {
    try {
      await deleteReservation(reservationId).unwrap()
      toast.success("Đã xóa đặt bàn thành công")
      setDeleteDialogOpen(false)
      setDialogOpen(false)
      refetch()
    } catch (error) {
      toast.error("Không thể xóa đặt bàn. Vui lòng thử lại!")
    }
  }

  // Render reservation card
  const ReservationCard = ({ reservation }: { reservation: any }) => {
    const StatusIcon = statusConfig[reservation.status as ReservationStatus]?.icon || Clock
    const statusInfo = statusConfig[reservation.status as ReservationStatus] || statusConfig[ReservationStatus.pending]
    const reservationDateTime = new Date(`${reservation.reservationDate}T${reservation.reservationTime}`)
    const isUpcoming = reservationDateTime >= new Date()
    const canCancel = [ReservationStatus.pending, ReservationStatus.confirmed].includes(reservation.status) && isUpcoming

    return (
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                {reservation.restaurant?.name || "Nhà hàng"}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                Mã: {reservation.reservationCode}
              </CardDescription>
            </div>
            <Badge className={`${statusInfo.color} text-white`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span>{new Date(reservation.reservationDate).toLocaleDateString('vi-VN')}</span>
              <Clock className="h-4 w-4 text-muted-foreground ml-2" />
              <span>{reservation.reservationTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>{reservation.guestCount} người</span>
              {reservation.table && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span>Bàn số {reservation.table.number}</span>
                </>
              )}
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <p className="text-sm font-medium">Thông tin liên hệ</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{reservation.customerPhone}</span>
            </div>
            {reservation.customerEmail && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span>{reservation.customerEmail}</span>
              </div>
            )}
          </div>

          {reservation.specialRequests && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-1">Yêu cầu đặc biệt</p>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {reservation.specialRequests}
                </p>
              </div>
            </>
          )}

          <Separator />

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => handleViewDetails(reservation)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Chi tiết
            </Button>
            {canCancel && (
              <Button 
                variant="destructive"
                onClick={() => {
                  setSelectedReservation(reservation)
                  setDeleteDialogOpen(true)
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Hủy
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Không thể tải danh sách đặt bàn</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Đã xảy ra lỗi khi tải danh sách đặt bàn. Vui lòng thử lại sau.
        </p>
        <Button onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đặt bàn của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả đặt bàn của bạn
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Làm mới
          </Button>
          <Button asChild>
            <a href="/customer/booking">
              <CalendarDays className="h-4 w-4 mr-2" />
              Đặt bàn mới
            </a>
          </Button>
        </div>
      </div>

      {/* Next Reservation Alert */}
      {upcomingReservations.length > 0 && upcomingReservations[0] && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CalendarIcon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Đặt bàn sắp tới</h3>
                <p className="text-sm text-muted-foreground">
                  {upcomingReservations[0].restaurant?.name} - {new Date(upcomingReservations[0].reservationDate).toLocaleDateString('vi-VN')} {upcomingReservations[0].reservationTime}
                </p>
              </div>
            </div>
            <Button onClick={() => handleViewDetails(upcomingReservations[0])}>
              Xem chi tiết
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Tìm kiếm theo mã đặt bàn hoặc nhà hàng..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Reservations Tabs */}
      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upcoming" className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Sắp tới ({upcomingReservations.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2">
            <Clock className="h-4 w-4" />
            Lịch sử ({pastReservations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : upcomingReservations.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <CalendarDays className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Không có đặt bàn sắp tới</h3>
                  <p className="text-muted-foreground">
                    Bạn chưa có lịch đặt bàn nào trong thời gian tới
                  </p>
                </div>
                <Button asChild>
                  <a href="/customer/booking">
                    <CalendarDays className="h-4 w-4 mr-2" />
                    Đặt bàn ngay
                  </a>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingReservations.map((reservation: any) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : pastReservations.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Clock className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Chưa có lịch sử đặt bàn</h3>
                  <p className="text-muted-foreground">
                    Lịch sử đặt bàn của bạn sẽ hiển thị ở đây
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {pastReservations.map((reservation: any) => (
                <ReservationCard key={reservation.id} reservation={reservation} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi tiết đặt bàn</DialogTitle>
            <DialogDescription>
              Mã đặt bàn: {selectedReservation?.reservationCode}
            </DialogDescription>
          </DialogHeader>

          {selectedReservation && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {React.createElement(
                    statusConfig[selectedReservation.status]?.icon || Clock,
                    { className: "h-8 w-8" }
                  )}
                  <div>
                    <p className="font-semibold">
                      {statusConfig[selectedReservation.status]?.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Đặt ngày {new Date(selectedReservation.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reservation Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Thông tin đặt bàn</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span>{new Date(selectedReservation.reservationDate).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedReservation.reservationTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedReservation.guestCount} người</span>
                    </div>
                    {selectedReservation.table && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Bàn số {selectedReservation.table.number}</span>
                        <span className="text-muted-foreground">(Sức chứa: {selectedReservation.table.capacity} người)</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Thông tin nhà hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <p className="font-medium">{selectedReservation.restaurant?.name}</p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span>{selectedReservation.restaurant?.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{selectedReservation.restaurant?.phone}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Customer Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Thông tin khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedReservation.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedReservation.customerPhone}</span>
                  </div>
                  {selectedReservation.customerEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedReservation.customerEmail}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Special Requests */}
              {selectedReservation.specialRequests && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">Yêu cầu đặc biệt</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {selectedReservation.specialRequests}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              {[ReservationStatus.pending, ReservationStatus.confirmed].includes(selectedReservation.status) && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Bạn có thể hủy đặt bàn trước 24 giờ so với thời gian đặt bàn
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel/Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận hủy đặt bàn</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn hủy đặt bàn này không? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg space-y-2">
                <p className="font-medium">{selectedReservation.restaurant?.name}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedReservation.reservationDate).toLocaleDateString('vi-VN')} - {selectedReservation.reservationTime}
                </p>
                <p className="text-sm text-muted-foreground">
                  {selectedReservation.guestCount} người
                </p>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isUpdating || isDeleting}
                >
                  Giữ đặt bàn
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleCancelReservation(selectedReservation.id)}
                  disabled={isUpdating || isDeleting}
                >
                  {isUpdating ? "Đang hủy..." : "Xác nhận hủy"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Truck,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  MapPin,
  Clock,
  User,
  Phone,
  Package,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Eye,
  Edit,
  Navigation,
} from "lucide-react"
import {
  useGetAllDeliveriesQuery,
  useGetDeliveryDriversQuery,
  useCreateDeliveryMutation,
  useUpdateDeliveryStatusMutation,
  useAssignDeliveryDriverMutation,
  useTrackDeliveryQuery,
} from "@/state/api"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

interface Delivery {
  id: string
  deliveryCode?: string
  orderId?: string
  order?: {
    id: string
    orderNumber?: string
    orderCode?: string
    customer?: {
      name: string
      phone: string
    }
    totalAmount?: number
  }
  driverId?: string
  driver?: {
    id: string
    name: string
    phone?: string
    vehicleNumber?: string
  }
  status: string
  pickupAddress?: string
  deliveryAddress: string
  customerName?: string
  customerPhone?: string
  estimatedTime?: string
  actualDeliveryTime?: string
  createdAt?: string
  notes?: string
}

interface Driver {
  id: string
  name: string
  phone?: string
  vehicleNumber?: string
  status?: string
  activeDeliveries?: number
}

export default function DeliveriesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedDeliveryId, setSelectedDeliveryId] = useState<string | null>(null)
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false)
  const [selectedDriverId, setSelectedDriverId] = useState<string>("")

  // API Hooks
  const { data: deliveries = [], isLoading, error, refetch } = useGetAllDeliveriesQuery()
  const { data: drivers = [], isLoading: isLoadingDrivers } = useGetDeliveryDriversQuery()
  const [createDelivery, { isLoading: isCreating }] = useCreateDeliveryMutation()
  const [updateDeliveryStatus, { isLoading: isUpdating }] = useUpdateDeliveryStatusMutation()
  const [assignDriver, { isLoading: isAssigning }] = useAssignDeliveryDriverMutation()

  // Filter deliveries
  const filteredDeliveries = deliveries.filter((delivery: Delivery) => {
    const matchesSearch = searchQuery === "" || 
      (delivery.deliveryCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (delivery.order?.orderNumber || delivery.order?.orderCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (delivery.customerName || delivery.order?.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || delivery.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  // Handler functions
  const handleUpdateStatus = async (deliveryId: string, newStatus: string) => {
    try {
      await updateDeliveryStatus({ id: deliveryId, status: newStatus }).unwrap()
      refetch()
      toast.success("Cập nhật trạng thái giao hàng thành công")
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái giao hàng")
    }
  }

  const handleAssignDriver = async () => {
    if (!selectedDeliveryId || !selectedDriverId) {
      toast.error("Vui lòng chọn tài xế")
      return
    }

    try {
      await assignDriver({ id: selectedDeliveryId, driverId: selectedDriverId }).unwrap()
      refetch()
      toast.success("Phân công tài xế thành công")
      setIsAssignDialogOpen(false)
      setSelectedDeliveryId(null)
      setSelectedDriverId("")
    } catch (error) {
      toast.error("Không thể phân công tài xế")
    }
  }

  const openAssignDialog = (deliveryId: string) => {
    setSelectedDeliveryId(deliveryId)
    setIsAssignDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "waiting":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Chờ xử lý</Badge>
      case "assigned":
      case "accepted":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Đã phân công</Badge>
      case "picked_up":
      case "picking":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Đang lấy hàng</Badge>
      case "in_transit":
      case "delivering":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Đang giao</Badge>
      case "delivered":
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Đã giao</Badge>
      case "cancelled":
      case "failed":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">Đã hủy</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getDriverBadge = (driver?: Driver | null) => {
    if (!driver) {
      return <Badge variant="outline" className="text-xs">Chưa phân công</Badge>
    }
    return (
      <Badge variant="outline" className="text-xs">
        <User className="h-3 w-3 mr-1" />
        {driver.name}
      </Badge>
    )
  }

  // Stats calculation
  const stats = {
    total: deliveries.length,
    pending: deliveries.filter((d: Delivery) => d.status === "pending" || d.status === "waiting").length,
    inTransit: deliveries.filter((d: Delivery) => d.status === "in_transit" || d.status === "delivering").length,
    completed: deliveries.filter((d: Delivery) => d.status === "delivered" || d.status === "completed").length,
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Skeleton className="h-20 w-full" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Không thể tải dữ liệu</h3>
              <p className="text-red-700 mb-4">Đã xảy ra lỗi khi tải danh sách giao hàng</p>
              <Button onClick={() => refetch()} variant="outline">
                <RefreshCcw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="h-8 w-8" />
            Quản lý giao hàng
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý các đơn giao hàng ({filteredDeliveries.length} đơn)
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đơn giao hàng
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Tìm kiếm đơn giao hàng..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter === "all" ? "Tất cả trạng thái" : getStatusBadge(statusFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              Tất cả trạng thái
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
              Chờ xử lý
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("assigned")}>
              Đã phân công
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("in_transit")}>
              Đang giao
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>
              Đã giao
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
              Đã hủy
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng đơn giao</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Tổng số đơn giao hàng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chờ xử lý</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Cần phân công tài xế
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang giao</CardTitle>
            <Truck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTransit}</div>
            <p className="text-xs text-muted-foreground">
              Đang trên đường giao
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã giao</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Hoàn thành giao hàng
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách giao hàng</CardTitle>
          <CardDescription>
            Quản lý và theo dõi trạng thái giao hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredDeliveries.length === 0 ? (
            <div className="text-center py-12">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có đơn giao hàng</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" 
                  ? "Không tìm thấy đơn giao hàng nào phù hợp với bộ lọc"
                  : "Chưa có đơn giao hàng nào được tạo"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredDeliveries.map((delivery: Delivery) => {
                const orderCode = delivery.order?.orderNumber || delivery.order?.orderCode || delivery.deliveryCode || `#${delivery.id}`
                const customerName = delivery.customerName || delivery.order?.customer?.name || "Khách hàng"
                const customerPhone = delivery.customerPhone || delivery.order?.customer?.phone || "N/A"
                const createdTime = delivery.createdAt

                return (
                  <div key={delivery.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <Truck className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{orderCode}</h3>
                          {getStatusBadge(delivery.status)}
                          {getDriverBadge(delivery.driver)}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p className="flex items-center gap-2">
                            <User className="h-3 w-3" />
                            {customerName}
                            <Phone className="h-3 w-3 ml-2" />
                            {customerPhone}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-3 w-3" />
                            {delivery.deliveryAddress}
                          </p>
                          {delivery.notes && (
                            <p className="text-xs italic">Ghi chú: {delivery.notes}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {createdTime && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Thời gian</p>
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(createdTime), "HH:mm", { locale: vi })}
                          </p>
                        </div>
                      )}
                      {delivery.order?.totalAmount && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Giá trị</p>
                          <p className="font-medium">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(delivery.order.totalAmount)}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2">
                        {delivery.status === "pending" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => openAssignDialog(delivery.id)}
                            disabled={isAssigning}
                          >
                            <User className="h-3 w-3 mr-1" />
                            Phân công
                          </Button>
                        )}
                        {delivery.status === "assigned" && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(delivery.id, "picked_up")}
                            disabled={isUpdating}
                          >
                            <Package className="h-3 w-3 mr-1" />
                            Đã lấy hàng
                          </Button>
                        )}
                        {delivery.status === "picked_up" && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(delivery.id, "in_transit")}
                            disabled={isUpdating}
                          >
                            <Truck className="h-3 w-3 mr-1" />
                            Đang giao
                          </Button>
                        )}
                        {delivery.status === "in_transit" && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(delivery.id, "delivered")}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Đã giao
                          </Button>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Navigation className="mr-2 h-4 w-4" />
                            Theo dõi
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openAssignDialog(delivery.id)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Đổi tài xế
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleUpdateStatus(delivery.id, "cancelled")}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Hủy giao hàng
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Assign Driver Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phân công tài xế</DialogTitle>
            <DialogDescription>
              Chọn tài xế để phân công giao đơn hàng này
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="driver">Tài xế</Label>
              {isLoadingDrivers ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Chọn tài xế" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver: Driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{driver.name}</span>
                          {driver.phone && (
                            <span className="text-xs text-muted-foreground">({driver.phone})</span>
                          )}
                          {driver.vehicleNumber && (
                            <Badge variant="outline" className="text-xs ml-2">
                              {driver.vehicleNumber}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleAssignDriver} disabled={isAssigning || !selectedDriverId}>
              {isAssigning ? "Đang xử lý..." : "Phân công"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

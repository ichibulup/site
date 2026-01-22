"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  MapPin,
  Phone,
  ShoppingBag,
  Search,
  RefreshCcw,
  Eye,
  RotateCcw,
  AlertCircle,
  ChevronRight
} from "lucide-react"
import { useGetMyOrdersQuery, useGetCurrentOrderQuery } from "@/state/api"
import { formatCurrency } from "@/lib/utils/formatters"
import { OrderStatus, PaymentMethod, PaymentStatus } from "@/lib/interfaces"
import { toast } from "sonner"

interface OrderItem {
  id: string
  menuItemId: string
  name: string
  quantity: number
  price: number
  note?: string
  image?: string
}

interface Order {
  id: string
  orderCode: string
  status: OrderStatus
  totalAmount: number
  items: OrderItem[]
  restaurant: {
    id: string
    name: string
    address: string
    phone: string
  }
  deliveryAddress?: string
  orderDate: string
  estimatedDelivery?: string
  notes?: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
}

const statusConfig = {
  [OrderStatus.pending]: { label: "Chờ xác nhận", color: "bg-yellow-500", icon: Clock },
  [OrderStatus.confirmed]: { label: "Đã xác nhận", color: "bg-blue-500", icon: CheckCircle },
  [OrderStatus.preparing]: { label: "Đang chuẩn bị", color: "bg-purple-500", icon: Package },
  [OrderStatus.ready]: { label: "Sẵn sàng", color: "bg-green-500", icon: CheckCircle },
  [OrderStatus.served]: { label: "Đã giao", color: "bg-green-600", icon: CheckCircle },
  [OrderStatus.completed]: { label: "Hoàn thành", color: "bg-green-700", icon: CheckCircle },
  [OrderStatus.cancelled]: { label: "Đã hủy", color: "bg-red-500", icon: XCircle },
}

const paymentStatusConfig = {
  [PaymentStatus.pending]: { label: "Chờ thanh toán", color: "bg-yellow-500" },
  [PaymentStatus.processing]: { label: "Đang xử lý", color: "bg-orange-500" },
  [PaymentStatus.completed]: { label: "Đã thanh toán", color: "bg-green-500" },
  [PaymentStatus.failed]: { label: "Thất bại", color: "bg-red-500" },
  [PaymentStatus.cancelled]: { label: "Đã hủy", color: "bg-gray-500" },
  [PaymentStatus.refunded]: { label: "Đã hoàn tiền", color: "bg-blue-500" },
}

export default function VisitorOrdersPage() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [dialogOpen, setDialogOpen] = useState(false)

  // API Hooks
  const { 
    data: orders = [], 
    isLoading, 
    error, 
    refetch 
  } = useGetMyOrdersQuery({})
  
  const { 
    data: currentOrder 
  } = useGetCurrentOrderQuery()

  // Filter orders
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order.orderCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.restaurant?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Separate active and history orders
  const activeOrders = filteredOrders.filter((order: any) => 
    [OrderStatus.pending, OrderStatus.confirmed, OrderStatus.preparing, OrderStatus.ready].includes(order.status)
  )
  
  const historyOrders = filteredOrders.filter((order: any) => 
    [OrderStatus.served, OrderStatus.completed, OrderStatus.cancelled].includes(order.status)
  )

  const handleRefresh = () => {
    refetch()
    toast.success("Đã làm mới danh sách đơn hàng")
  }

  const handleViewDetails = (order: any) => {
    setSelectedOrder(order)
    setDialogOpen(true)
  }

  const handleReorder = (order: any) => {
    toast.success("Đã thêm món vào giỏ hàng")
    // Logic to add items to cart
    console.log("Reorder:", order)
  }

  // Render order card
  const OrderCard = ({ order }: { order: any }) => {
    const StatusIcon = statusConfig[order.status as OrderStatus]?.icon || Clock
    const statusInfo = statusConfig[order.status as OrderStatus] || statusConfig[OrderStatus.pending]
    const paymentInfo =
      paymentStatusConfig[order.paymentStatus as PaymentStatus] || paymentStatusConfig[PaymentStatus.pending]

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleViewDetails(order)}>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg mb-1">
                Đơn hàng #{order.orderCode}
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                <MapPin className="h-3 w-3" />
                {order.restaurant?.name || "Nhà hàng"}
              </CardDescription>
            </div>
            <Badge className={`${statusInfo.color} text-white`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              <Clock className="h-4 w-4 inline mr-1" />
              {new Date(order.orderDate).toLocaleString('vi-VN')}
            </span>
            <Badge variant="outline" className={paymentInfo.color}>
              {paymentInfo.label}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2">
            {order.items?.slice(0, 2).map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm">
                <span>{item.quantity}x {item.name}</span>
                <span className="font-medium">{formatCurrency({ value: item.price * item.quantity })}</span>
              </div>
            ))}
            {order.items?.length > 2 && (
              <p className="text-xs text-muted-foreground">
                Và {order.items.length - 2} món khác...
              </p>
            )}
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Tổng cộng</span>
            <span className="text-lg font-bold text-primary">
              {formatCurrency({ value: order.totalAmount })}
            </span>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={(e) => {
                e.stopPropagation()
                handleViewDetails(order)
              }}
            >
              <Eye className="h-4 w-4 mr-2" />
              Chi tiết
            </Button>
            {[OrderStatus.served, OrderStatus.completed].includes(order.status) && (
              <Button 
                variant="default"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleReorder(order)
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Đặt lại
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
        <h2 className="text-2xl font-bold">Không thể tải đơn hàng</h2>
        <p className="text-muted-foreground text-center max-w-md">
          Đã xảy ra lỗi khi tải danh sách đơn hàng. Vui lòng thử lại sau.
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
          <h1 className="text-3xl font-bold tracking-tight">Đơn hàng của tôi</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi tất cả đơn hàng của bạn
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Làm mới
        </Button>
      </div>

      {/* Current Order Alert */}
      {currentOrder && (
        <Card className="border-primary bg-primary/5">
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="font-semibold">Đơn hàng đang hoạt động</h3>
                <p className="text-sm text-muted-foreground">
                  Đơn #{currentOrder.orderCode} - {statusConfig[currentOrder.status as OrderStatus]?.label}
                </p>
              </div>
            </div>
            <Button onClick={() => handleViewDetails(currentOrder)}>
              Xem chi tiết
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo mã đơn hoặc nhà hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as OrderStatus | "all")}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Lọc theo trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value={OrderStatus.pending}>Chờ xác nhận</SelectItem>
            <SelectItem value={OrderStatus.confirmed}>Đã xác nhận</SelectItem>
            <SelectItem value={OrderStatus.preparing}>Đang chuẩn bị</SelectItem>
            <SelectItem value={OrderStatus.ready}>Sẵn sàng</SelectItem>
            <SelectItem value={OrderStatus.served}>Đã giao</SelectItem>
            <SelectItem value={OrderStatus.completed}>Hoàn thành</SelectItem>
            <SelectItem value={OrderStatus.cancelled}>Đã hủy</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="gap-2">
            <Package className="h-4 w-4" />
            Đang hoạt động ({activeOrders.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <Clock className="h-4 w-4" />
            Lịch sử ({historyOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
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
          ) : activeOrders.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <ShoppingBag className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Không có đơn hàng đang hoạt động</h3>
                  <p className="text-muted-foreground">
                    Bạn chưa có đơn hàng nào đang được xử lý
                  </p>
                </div>
                <Button asChild>
                  <a href="/customer/menus">
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Đặt món ngay
                  </a>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
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
          ) : historyOrders.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center space-y-4">
                <Clock className="h-16 w-16 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Chưa có lịch sử đơn hàng</h3>
                  <p className="text-muted-foreground">
                    Đơn hàng đã hoàn thành của bạn sẽ hiển thị ở đây
                  </p>
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {historyOrders.map((order: any) => (
                <OrderCard key={order.id} order={order} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng #{selectedOrder?.orderCode}</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn hàng của bạn
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  {React.createElement(
                    statusConfig[selectedOrder.status]?.icon || Clock,
                    { className: "h-8 w-8" }
                  )}
                  <div>
                    <p className="font-semibold">
                      {statusConfig[selectedOrder.status]?.label}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedOrder.orderDate).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Badge className={paymentStatusConfig[selectedOrder.paymentStatus]?.color || "bg-gray-500"}>
                  {paymentStatusConfig[selectedOrder.paymentStatus]?.label}
                </Badge>
              </div>

              {/* Restaurant Info */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Thông tin nhà hàng
                </h4>
                <Card>
                  <CardContent className="pt-6 space-y-2">
                    <p className="font-medium">{selectedOrder.restaurant?.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-3 w-3" />
                      {selectedOrder.restaurant?.address}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      {selectedOrder.restaurant?.phone}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Items */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Món ăn ({selectedOrder.items?.length || 0})
                </h4>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between items-start">
                          <div className="flex gap-3 flex-1">
                            <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {formatCurrency({ value: item.price })} x {item.quantity}
                              </p>
                              {item.note && (
                                <p className="text-xs text-muted-foreground italic mt-1">
                                  Ghi chú: {item.note}
                                </p>
                              )}
                            </div>
                          </div>
                          <p className="font-medium">
                            {formatCurrency({ value: item.price * item.quantity })}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Tạm tính</span>
                        <span>{formatCurrency({ value: selectedOrder.totalAmount})}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Phí giao hàng</span>
                        <span>{formatCurrency({ value: 0})}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span>Tổng cộng</span>
                        <span className="text-primary">{formatCurrency({ value: selectedOrder.totalAmount})}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Delivery Address */}
              {selectedOrder.deliveryAddress && (
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Địa chỉ giao hàng
                  </h4>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm">{selectedOrder.deliveryAddress}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Notes */}
              {selectedOrder.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Ghi chú</h4>
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {[OrderStatus.served, OrderStatus.completed].includes(selectedOrder.status) && (
                  <Button 
                    className="flex-1" 
                    onClick={() => {
                      handleReorder(selectedOrder)
                      setDialogOpen(false)
                    }}
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Đặt lại đơn hàng
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setDialogOpen(false)}
                >
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

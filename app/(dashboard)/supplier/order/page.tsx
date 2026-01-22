"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  ClipboardList,
  Clock,
  DollarSign,
  User,
  MapPin,
  CheckCircle,
  XCircle,
  RefreshCcw
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  useGetAllOrdersQuery,
  useGetOrderStatsQuery,
  useUpdateOrderMutation,
  useDeleteOrderMutation,
  useCancelOrderMutation
} from "@/state/api"
import { toast } from "sonner"
import { format } from "date-fns"
import { vi } from "date-fns/locale"
import { Order } from "@/lib/interfaces"
import { formatCurrency } from "@/lib/utils/formatters"
import {
  getOrderStatusLabel,
  getOrderStatusVariant,
  normalizeOrderStatus,
} from "@/lib/utils/renderers"

type OrderRow = Order & {
  orderNumber?: string | null
  customerName?: string | null
  customer?: { name?: string | null; fullName?: string | null } | null
  tableName?: string | null
  table?: string | null
  orderTime?: string | Date | null
  specialRequests?: string | null
  paymentMethod?: string | null
  items?: Array<any>
  orderItems?: Array<any>
  total?: number | string | null
}

export default function OrderPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const { data: orders = [], isLoading, error, refetch } = useGetAllOrdersQuery(undefined)
  const { data: stats, isLoading: isLoadingStats } = useGetOrderStatsQuery()
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation()
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation()
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation()

  // Filter orders
  const ordersData = orders as OrderRow[]

  const filteredOrders = ordersData.filter((order: OrderRow) => {
    const matchesSearch = searchQuery === "" ||
      (order.orderNumber || order.orderCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.customerName || order.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })
  const totalRevenue =
    stats?.totalRevenue ??
    ordersData.reduce(
      (sum: number, order: OrderRow) => sum + Number(order.totalAmount ?? order.total ?? 0),
      0
    )
  const averageOrderValue =
    stats?.averageOrderValue ?? (orders.length > 0 ? totalRevenue / orders.length : 0)
  // Filter orders
  // const filteredOrders = orders.filter((order: Order) => {
  //   const matchesSearch = searchQuery === "" ||
  //     (order.orderNumber || order.orderCode || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
  //     (order.customerName || order.customer?.name || "").toLowerCase().includes(searchQuery.toLowerCase())

  //   const matchesStatus = statusFilter === "all" || order.status === statusFilter

  //   return matchesSearch && matchesStatus
  // })

  // Handler functions
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrder({ id: orderId, data: { status: newStatus } }).unwrap()
      refetch()
      toast.success("Cập nhật trạng thái đơn hàng thành công")
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái đơn hàng")
    }
  }

  const handleCancelOrder = async (orderId: string) => {
    try {
      await cancelOrder(orderId).unwrap()
      refetch()
      toast.success("Đã hủy đơn hàng")
    } catch (error) {
      toast.error("Không thể hủy đơn hàng")
    }
  }

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) return

    try {
      await deleteOrder(orderId).unwrap()
      refetch()
      toast.success("Đã xóa đơn hàng")
    } catch (error) {
      toast.error("Không thể xóa đơn hàng")
    }
  }

  const renderOrderStatusBadge = (status?: string) => {
    const normalized = normalizeOrderStatus(status)
    const label = getOrderStatusLabel(normalized, status ? String(status) : "Đang xử lý")
    const resolvedVariant: "default" | "secondary" | "outline" | "destructive" = (() => {
      const variant = getOrderStatusVariant(normalized)
      switch (variant) {
        case "success":
        case "primary-1":
        case "primary-2":
        case "primary-3":
        case "primary-4":
        case "primary-5":
          return "default"
        case "warning":
          return "secondary"
        case "danger":
          return "destructive"
        case "info":
          return "outline"
        case "secondary":
        case "outline":
        case "destructive":
        case "default":
          return variant
        default:
          return "default"
      }
    })()

    return <Badge variant={resolvedVariant}>{label}</Badge>
  }

  const getPaymentMethodBadge = (method?: string) => {
    if (!method) return <Badge variant="outline">Chưa xác định</Badge>

    switch (method.toLowerCase()) {
      case "cash":
      case "tiền mặt":
        return <Badge variant="outline">Tiền mặt</Badge>
      case "card":
      case "thẻ":
        return <Badge variant="outline">Thẻ</Badge>
      case "e_wallet":
      case "momo":
      case "zalopay":
        return <Badge variant="outline">Ví điện tử</Badge>
      default:
        return <Badge variant="outline">{method}</Badge>
    }
  }

  if (isLoading || isLoadingStats) {
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
              <p className="text-red-700 mb-4">Đã xảy ra lỗi khi tải danh sách đơn hàng</p>
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
            <ClipboardList className="h-8 w-8" />
            Quản lý đơn hàng
          </h1>
          <p className="text-muted-foreground">
            Theo dõi và xử lý các đơn hàng của khách hàng ({filteredOrders.length} đơn)
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đơn hàng mới
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm đơn hàng..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              {statusFilter === "all" ? "Tất cả trạng thái" : renderOrderStatusBadge(statusFilter)}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter("all")}>
              Tất cả trạng thái
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
              Chờ xác nhận
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("preparing")}>
              Đang chế biến
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("ready")}>
              Sẵn sàng
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
              Hoàn thành
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
            <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || orders.length}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.growth ? `${stats.growth > 0 ? '+' : ''}${stats.growth}%` : '+15%'} so với hôm qua
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.preparingOrders || orders.filter((o: Order) => o.status === "preparing" || o.status === "confirmed").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Cần theo dõi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency({ value: totalRevenue })}
            </div>
            <p className="text-xs text-muted-foreground">
              Tổng doanh thu
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trung bình/đơn</CardTitle>
            <Badge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency({ value: averageOrderValue })}
            </div>
            <p className="text-xs text-muted-foreground">
              Giá trị trung bình
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách đơn hàng</CardTitle>
          <CardDescription>
            Quản lý và theo dõi trạng thái đơn hàng
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Không có đơn hàng</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all"
                  ? "Không tìm thấy đơn hàng nào phù hợp với bộ lọc"
                  : "Chưa có đơn hàng nào được tạo"
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order: OrderRow) => {
                const orderItems = order.items || order.orderItems || []
                const customerName = order.customerName || order.customer?.name || "Khách hàng"
                const tableName = order.table || order.tableName || "N/A"
                const orderCode = order.orderNumber || order.orderCode || `#${order.id}`
                const orderTime = order.orderTime || order.createdAt
                const notes = order.notes || order.specialRequests
                const amount = order.totalAmount || order.total || 0

                return (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                        <ClipboardList className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{orderCode}</h3>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {customerName}
                          <MapPin className="h-3 w-3 ml-2" />
                          {tableName}
                        </p>
                        {orderItems.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {orderItems.map((item: any) => item.name || item.menuItem?.name || "").filter(Boolean).join(", ") || `${orderItems.length} món`}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          {renderOrderStatusBadge(order.status)}
                          {getPaymentMethodBadge(order.paymentMethod ?? undefined)}
                          {notes && (
                            <Badge variant="outline" className="text-xs">
                              Có ghi chú
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      {orderTime && (
                        <div className="text-center">
                          <p className="text-sm text-muted-foreground">Thời gian</p>
                          <p className="font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(orderTime), "HH:mm", { locale: vi })}
                          </p>
                        </div>
                      )}
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Tổng tiền</p>
                        <p className="font-medium">
                          {formatCurrency({ value: amount })}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {order.status === "pending" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Xác nhận
                          </Button>
                        )}
                        {(order.status === "confirmed" || order.status === "preparing") && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                            disabled={isUpdating}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Hoàn thành
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
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <DollarSign className="mr-2 h-4 w-4" />
                            Thanh toán
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={isCancelling}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Hủy đơn
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDeleteOrder(order.id)}
                            disabled={isDeleting}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa đơn
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
    </div>
  )
}

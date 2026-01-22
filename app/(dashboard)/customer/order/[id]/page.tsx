"use client"

import React, { useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Order,
  OrderItem,
  OrderStatus,
  OrderType,
  PaymentStatus,
  Table as RestaurantTable,
  User,
} from "@/lib/interfaces"
import { formatCurrency, formatDateTime, unwrapApiData } from "@/lib/utils/formatters"
import {
  getOrderStatusLabel,
  normalizeOrderStatus,
  normalizeOrderType,
  normalizePaymentStatus,
  renderOrderStatusBadge,
  renderPaymentStatusBadge,
} from "@/lib/utils/renderers"
import { useGetOrderByIdQuery } from "@/state/api"
import {
  Calendar,
  Clock,
  CreditCard,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User as UserIcon,
} from "lucide-react"

type OrderItemRow = OrderItem & {
  menuItem?: { name?: string | null }
}

type OrderDetail = Order & {
  customer?: User | null
  table?: RestaurantTable | null
  orderItems?: OrderItemRow[]
  items?: OrderItemRow[]
  createdAt?: Date | string
  updatedAt?: Date | string
  deliveredAt?: Date | string
  paymentMethod?: string | null
  orderNumber?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
}

const orderTypeLabels: Record<OrderType, string> = {
  [OrderType.dineIn]: "Tại chỗ",
  [OrderType.takeaway]: "Mang về",
  [OrderType.delivery]: "Giao hàng",
}

const orderTypeIcons: Record<OrderType, React.ElementType> = {
  [OrderType.dineIn]: ShoppingBag,
  [OrderType.takeaway]: Package,
  [OrderType.delivery]: Truck,
}

const orderStatusSteps: { status: OrderStatus; label: string }[] = [
  { status: OrderStatus.pending, label: "Chờ xác nhận" },
  { status: OrderStatus.confirmed, label: "Đã xác nhận" },
  { status: OrderStatus.preparing, label: "Đang chuẩn bị" },
  { status: OrderStatus.ready, label: "Sẵn sàng" },
  { status: OrderStatus.completed, label: "Hoàn thành" },
]

const toNumber = (value: string | number | null | undefined) =>
  typeof value === "number" ? value : Number(value || 0)

const getOrderCode = (order: OrderDetail) => order.orderCode || order.orderNumber || order.id

const getOrderItems = (order: OrderDetail) => order.orderItems || order.items || []

export default function CustomerOrderDetailPage() {
  const router = useRouter()
  const params = useParams()
  const orderId = Array.isArray(params?.id) ? params?.id[0] : (params?.id as string)

  const { data, isLoading, error } = useGetOrderByIdQuery(orderId, { skip: !orderId })

  const order = useMemo(() => unwrapApiData<OrderDetail | null>(data), [data])

  const normalizedStatus = normalizeOrderStatus(order?.status)
  const normalizedType = normalizeOrderType(order?.orderType) || OrderType.dineIn
  const normalizedPayment = normalizePaymentStatus(order?.paymentStatus) || PaymentStatus.pending

  const activeStepIndex = normalizedStatus
    ? orderStatusSteps.findIndex((step) => step.status === normalizedStatus)
    : -1

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
        <Badge variant="destructive">Không tìm thấy đơn hàng</Badge>
        <Button variant="outline" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    )
  }

  const orderTotal = toNumber(order.totalAmount || order.finalAmount)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn hàng #{getOrderCode(order)}</h1>
          <p className="text-muted-foreground">{getOrderStatusLabel(normalizedStatus)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Quay lại
          </Button>
          <Button onClick={() => router.push("/customer/orders")}>Danh sách đơn</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between">
              <div>
                <CardTitle>Thông tin đơn hàng</CardTitle>
                <CardDescription>
                  {order.createdAt ? formatDateTime({ date: order.createdAt }) : "—"}
                </CardDescription>
              </div>
              {renderOrderStatusBadge(normalizedStatus)}
            </CardHeader>
            <CardContent className="grid gap-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Loại đơn</span>
                <Badge variant="secondary" className="gap-1">
                  {React.createElement(orderTypeIcons[normalizedType], { className: "h-3 w-3" })}
                  {orderTypeLabels[normalizedType]}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Thanh toán</span>
                {renderPaymentStatusBadge(normalizedPayment)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tổng giá trị</span>
                <span className="font-medium">{formatCurrency({ value: orderTotal })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Thời gian dự kiến</span>
                <span className="font-medium">
                  {order.estimatedTime ? `${order.estimatedTime} phút` : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Món đã gọi</CardTitle>
              <CardDescription>Chi tiết từng món trong đơn hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Món ăn</TableHead>
                    <TableHead className="text-right">Số lượng</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getOrderItems(order).length > 0 ? (
                    getOrderItems(order).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {item.menuItem?.name || item.menuItemId || "Món ăn"}
                        </TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency({ value: toNumber(item.unitPrice) })}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency({ value: toNumber(item.totalPrice) })}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        Chưa có dữ liệu món ăn
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tiến trình đơn hàng</CardTitle>
              <CardDescription>Lộ trình xử lý đơn hàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {orderStatusSteps.map((step, index) => {
                const isActive = activeStepIndex >= 0 && index <= activeStepIndex
                return (
                  <div key={step.status} className="flex items-start gap-3">
                    <div
                      className={`mt-1 h-2.5 w-2.5 rounded-full ${
                        isActive ? "bg-professional-blue" : "bg-muted"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className={`text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>
                        {step.label}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {index === 0 && order.createdAt
                          ? formatDateTime({ date: order.createdAt })
                          : "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
              <CardDescription>Thông tin liên hệ</CardDescription>
            </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {order.customer?.fullName || order.customerName || order.customerId}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer?.phoneNumber || order.customerPhone || "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{order.customer?.email || order.customerEmail || "—"}</span>
            </div>
          </CardContent>
        </Card>

          <Card>
            <CardHeader>
              <CardTitle>Giao hàng</CardTitle>
              <CardDescription>Thông tin địa điểm & thời gian</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{order.deliveryNotes || "Chưa cập nhật địa chỉ"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {order.deliveredAt
                    ? formatDateTime({ date: order.deliveredAt })
                    : "Chưa cập nhật thời gian giao"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{order.estimatedTime ? `${order.estimatedTime} phút` : "—"}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thanh toán</CardTitle>
              <CardDescription>Phương thức & trạng thái</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{order.paymentMethod || "Chưa xác định"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Trạng thái</span>
                {renderPaymentStatusBadge(normalizedPayment)}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tổng kết</CardTitle>
              <CardDescription>Chi phí đơn hàng</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Tạm tính</span>
                <span>{formatCurrency({ value: toNumber(order.totalAmount) })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Giảm giá</span>
                <span>{formatCurrency({ value: toNumber(order.discountAmount) })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Thuế & phí</span>
                <span>{formatCurrency({ value: toNumber(order.taxAmount) })}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Phí giao hàng</span>
                <span>{formatCurrency({ value: toNumber(order.deliveryFee) })}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-base font-semibold">
                <span>Tổng thanh toán</span>
                <span>{formatCurrency({ value: toNumber(order.finalAmount || order.totalAmount) })}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

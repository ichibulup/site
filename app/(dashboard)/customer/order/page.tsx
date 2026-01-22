"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/element/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { DataTable, DataTableSortButton } from "@/components/element/data-table"
import { StatsBox } from "@/components/element/stats-box"
import {
  Order,
  OrderStatus,
  OrderType,
  PaymentStatus,
  StatsBoxProps,
} from "@/lib/interfaces"
import { formatCurrency, formatDateTime, unwrapApiData } from "@/lib/utils/formatters"
import {
  normalizeOrderStatus,
  normalizeOrderType,
  normalizePaymentStatus,
  renderOrderStatusBadge,
  renderPaymentStatusBadge,
} from "@/lib/utils/renderers"
import { useGetMyOrdersQuery } from "@/state/api"
import { toast } from "sonner"
import {
  CheckCircle,
  ClipboardList,
  Clock,
  MoreHorizontal,
  Package,
  ShoppingBag,
} from "lucide-react"

const orderTypeLabels: Record<OrderType, string> = {
  [OrderType.dineIn]: "Tại chỗ",
  [OrderType.takeaway]: "Mang về",
  [OrderType.delivery]: "Giao hàng",
}

const orderTypeIcons: Record<OrderType, React.ElementType> = {
  [OrderType.dineIn]: ShoppingBag,
  [OrderType.takeaway]: Package,
  [OrderType.delivery]: Package,
}

type OrderRow = Order & {
  orderNumber?: string | null
  orderItems?: { menuItem?: { name?: string | null } }[]
  items?: { menuItem?: { name?: string | null } }[]
  createdAt?: Date | string
}

const toNumber = (value: string | number | null | undefined) =>
  typeof value === "number" ? value : Number(value || 0)

const getOrderCode = (order: OrderRow) => order.orderCode || order.orderNumber || order.id

const getOrderItems = (order: OrderRow) => order.orderItems || order.items || []

export default function CustomerOrdersPage() {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useGetMyOrdersQuery({})

  const orders = useMemo(() => unwrapApiData<OrderRow[]>(data) ?? [], [data])

  const stats = useMemo(() => {
    const totalOrders = orders.length
    const completedOrders = orders.filter((order) =>
      [OrderStatus.completed, OrderStatus.served].includes(
        normalizeOrderStatus(order.status) ?? OrderStatus.pending
      )
    ).length
    const pendingOrders = orders.filter(
      (order) => normalizeOrderStatus(order.status) === OrderStatus.pending
    ).length
    const totalSpent = orders.reduce((sum, order) => sum + toNumber(order.finalAmount || order.totalAmount), 0)

    return { totalOrders, completedOrders, pendingOrders, totalSpent }
  }, [orders])

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng đơn",
      description: "Đơn hàng đã đặt",
      icon: ClipboardList,
      stats: stats.totalOrders,
    },
    {
      title: "Hoàn thành",
      description: "Đơn đã phục vụ",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.completedOrders,
    },
    {
      title: "Chờ xác nhận",
      description: "Cần xử lý",
      icon: Clock,
      color: "professional-yellow",
      stats: stats.pendingOrders,
    },
    {
      title: "Tổng chi tiêu",
      description: "Tổng giá trị đơn",
      icon: ShoppingBag,
      color: "professional-blue",
      stats: formatCurrency({ value: stats.totalSpent }),
    },
  ]

  const columns: ColumnDef<OrderRow, unknown>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="w-[18px] h-[18px] ml-2"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="w-[18px] h-[18px] ml-2"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      id: "orderCode",
      accessorFn: (row) =>
        `${getOrderCode(row)} ${getOrderItems(row)
          .map((item) => item.menuItem?.name || "")
          .join(" ")}`.trim(),
      header: ({ column }) => <DataTableSortButton column={column} title="Mã đơn" />,
      cell: ({ row }) => <div className="font-medium">{getOrderCode(row.original)}</div>,
      size: 160,
    },
    {
      id: "orderType",
      accessorFn: (row) => normalizeOrderType(row.orderType) ?? row.orderType,
      header: "Loại đơn",
      cell: ({ row }) => {
        const normalized = normalizeOrderType(row.original.orderType) || OrderType.dineIn
        const Icon = orderTypeIcons[normalized]
        return (
          <Badge variant="secondary" className="gap-1">
            <Icon className="h-3 w-3" />
            {orderTypeLabels[normalized]}
          </Badge>
        )
      },
      size: 140,
    },
    {
      id: "status",
      accessorFn: (row) => normalizeOrderStatus(row.status) ?? row.status,
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {renderOrderStatusBadge(normalizeOrderStatus(row.original.status))}
        </div>
      ),
      size: 140,
    },
    {
      id: "paymentStatus",
      accessorFn: (row) => normalizePaymentStatus(row.paymentStatus) ?? row.paymentStatus,
      header: "Thanh toán",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {renderPaymentStatusBadge(normalizePaymentStatus(row.original.paymentStatus) ?? PaymentStatus.pending)}
        </div>
      ),
      size: 140,
    },
    {
      id: "totalAmount",
      accessorFn: (row) => toNumber(row.finalAmount || row.totalAmount),
      header: () => <div className="text-right">Tổng tiền</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency({ value: toNumber(row.original.finalAmount || row.original.totalAmount) })}
        </div>
      ),
      size: 140,
    },
    {
      id: "createdAt",
      accessorFn: (row) => row.createdAt ?? row.updatedAt,
      header: "Thời gian",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.createdAt ? formatDateTime({ date: row.original.createdAt }) : "—"}
        </div>
      ),
      size: 170,
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => router.push(`/customer/orders/${row.original.id}`)}>
              Xem chi tiết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 64,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12 text-muted-foreground">
        Đang tải dữ liệu...
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-12">
        <Badge variant="destructive">Không thể tải danh sách đơn hàng</Badge>
        <Button variant="outline" onClick={() => refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch sử đơn hàng</h1>
          <p className="text-muted-foreground">Xem lại các đơn hàng đã đặt</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={() => router.push("/customer")}>Đặt món mới</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatsBox key={stat.title} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={orders}
        search={{
          column: "orderCode",
          placeholder: "Tìm theo mã đơn hoặc món ăn...",
        }}
        max="orderCode"
        filter={[
          {
            column: "status",
            title: "Trạng thái",
            options: [
              { label: "Chờ xác nhận", value: OrderStatus.pending },
              { label: "Đã xác nhận", value: OrderStatus.confirmed },
              { label: "Đang chuẩn bị", value: OrderStatus.preparing },
              { label: "Sẵn sàng", value: OrderStatus.ready },
              { label: "Hoàn thành", value: OrderStatus.completed },
              { label: "Đã hủy", value: OrderStatus.cancelled },
            ],
          },
          {
            column: "orderType",
            title: "Loại đơn",
            options: [
              { label: "Tại chỗ", value: OrderType.dineIn },
              { label: "Mang về", value: OrderType.takeaway },
              { label: "Giao hàng", value: OrderType.delivery },
            ],
          },
          {
            column: "paymentStatus",
            title: "Thanh toán",
            options: [
              { label: "Chờ xử lý", value: PaymentStatus.pending },
              { label: "Thành công", value: PaymentStatus.completed },
              { label: "Đang xử lý", value: PaymentStatus.processing },
              { label: "Thất bại", value: PaymentStatus.failed },
              { label: "Hoàn tiền", value: PaymentStatus.refunded },
            ],
          },
        ]}
        onReload={() => refetch()}
        onCreate={() => router.push("/customer")}
        onDownload={() => toast.info("Đang chuẩn bị file xuất dữ liệu")}
      />
    </div>
  )
}

// export function CustomerOrder() {
//   // API Hooks
//   const { data: orders = [], isLoading, error, refetch } = useGetMyOrdersQuery()
//
//   // State
//   const [searchTerm, setSearchTerm] = useState("")
//   const [statusFilter, setStatusFilter] = useState("all")
//   const [deliveryTypeFilter, setDeliveryTypeFilter] = useState("all")
//   const [timeFilter, setTimeFilter] = useState("all")
//   const [selectedOrder, setSelectedOrder] = useState<any>(null)
//   const [detailsOpen, setDetailsOpen] = useState(false)
//
//   // Helper Functions
//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case 'completed': return 'default'
//       case 'cancelled': return 'destructive'
//       case 'pending': return 'secondary'
//       case 'preparing': return 'outline'
//       case 'ready': return 'secondary'
//       case 'delivered': return 'default'
//       default: return 'outline'
//     }
//   }
//
//   const getStatusText = (status: string) => {
//     switch (status) {
//       case 'completed': return 'Hoàn thành'
//       case 'cancelled': return 'Đã hủy'
//       case 'pending': return 'Đang xử lý'
//       case 'preparing': return 'Đang chuẩn bị'
//       case 'ready': return 'Sẵn sàng'
//       case 'delivered': return 'Đã giao'
//       default: return status
//     }
//   }
//
//   const getDeliveryTypeText = (type: string) => {
//     switch (type) {
//       case 'dine-in': return 'Tại quán'
//       case 'delivery': return 'Giao hàng'
//       case 'takeaway': return 'Mang về'
//       default: return type
//     }
//   }
//
//   const getRelativeTime = (date: Date | string): string => {
//     const now = new Date()
//     const orderDate = new Date(date)
//     const diffInDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
//
//     if (diffInDays === 0) return "Hôm nay"
//     if (diffInDays === 1) return "Hôm qua"
//     if (diffInDays < 7) return `${diffInDays} ngày trước`
//     if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`
//     return `${Math.floor(diffInDays / 30)} tháng trước`
//   }
//
//   // Filtered Orders
//   const filteredOrders = useMemo(() => {
//     return orders.filter((order: any) => {
//       // Search filter
//       const searchLower = searchTerm.toLowerCase()
//       const matchesSearch =
//         searchTerm === "" ||
//         order.orderCode?.toLowerCase().includes(searchLower) ||
//         order.id?.toString().includes(searchLower) ||
//         order.orderItems?.some((item: any) =>
//           item.menuItem?.name?.toLowerCase().includes(searchLower)
//         )
//
//       // Status filter
//       const matchesStatus = statusFilter === "all" || order.status === statusFilter
//
//       // Delivery type filter
//       const matchesDeliveryType =
//         deliveryTypeFilter === "all" ||
//         order.deliveryType === deliveryTypeFilter
//
//       // Time filter
//       let matchesTime = true
//       if (timeFilter !== "all") {
//         const orderDate = new Date(order.createdAt)
//         const now = new Date()
//
//         if (timeFilter === "today") {
//           matchesTime = orderDate.toDateString() === now.toDateString()
//         } else if (timeFilter === "week") {
//           const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
//           matchesTime = orderDate >= weekAgo
//         } else if (timeFilter === "month") {
//           matchesTime =
//             orderDate.getMonth() === now.getMonth() &&
//             orderDate.getFullYear() === now.getFullYear()
//         }
//       }
//
//       return matchesSearch && matchesStatus && matchesDeliveryType && matchesTime
//     })
//   }, [orders, searchTerm, statusFilter, deliveryTypeFilter, timeFilter])
//
//   // Stats
//   const stats = useMemo(() => {
//     const totalOrders = orders.length
//     const completedOrders = orders.filter((o: any) => o.status === "completed")
//     const totalSpent = completedOrders.reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0)
//
//     const ordersWithRating = orders.filter((o: any) => o.rating)
//     const avgRating = ordersWithRating.length > 0
//       ? ordersWithRating.reduce((acc: number, o: any) => acc + o.rating, 0) / ordersWithRating.length
//       : 0
//
//     return {
//       totalOrders,
//       avgRating: avgRating.toFixed(1),
//       totalSpent
//     }
//   }, [orders])
//
//   // Loading State
//   if (isLoading) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <Skeleton className="h-9 w-64 mb-2" />
//           <Skeleton className="h-5 w-96" />
//         </div>
//
//         <Card>
//           <CardHeader>
//             <Skeleton className="h-6 w-40" />
//           </CardHeader>
//           <CardContent>
//             <Skeleton className="h-10 w-full" />
//           </CardContent>
//         </Card>
//
//         <div className="grid gap-4">
//           {Array.from({ length: 3 }).map((_, i) => (
//             <Card key={i}>
//               <CardHeader>
//                 <Skeleton className="h-6 w-32 mb-2" />
//                 <Skeleton className="h-4 w-64" />
//               </CardHeader>
//               <CardContent>
//                 <Skeleton className="h-32 w-full" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     )
//   }
//
//   // Error State
//   if (error) {
//     return (
//       <div className="space-y-6">
//         <div>
//           <h2 className="text-3xl font-bold">Lịch sử đơn hàng</h2>
//           <p className="text-muted-foreground">Xem lại các đơn hàng đã đặt</p>
//         </div>
//
//         <Alert variant="destructive">
//           <AlertCircle className="h-4 w-4" />
//           <AlertDescription className="flex items-center justify-between">
//             <span>Không thể tải danh sách đơn hàng. Vui lòng thử lại.</span>
//             <Button variant="outline" size="sm" onClick={() => refetch()}>
//               Thử lại
//             </Button>
//           </AlertDescription>
//         </Alert>
//       </div>
//     )
//   }
//
//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex justify-between items-center">
//         <div>
//           <h2 className="text-3xl font-bold">Lịch sử đơn hàng</h2>
//           <p className="text-muted-foreground">
//             Xem lại các đơn hàng đã đặt và đánh giá trải nghiệm
//           </p>
//         </div>
//         <Button asChild>
//           <Link href="/customer">Đặt món mới</Link>
//         </Button>
//       </div>
//
//       {/* Summary Stats */}
//       <div className="grid gap-4 md:grid-cols-3">
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <Clock className="h-5 w-5 text-blue-500" />
//               <div>
//                 <p className="text-sm font-medium">Tổng đơn hàng</p>
//                 <p className="text-2xl font-bold">{stats.totalOrders}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <Star className="h-5 w-5 text-yellow-500" />
//               <div>
//                 <p className="text-sm font-medium">Đánh giá trung bình</p>
//                 <p className="text-2xl font-bold">{stats.avgRating}</p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//         <Card>
//           <CardContent className="p-4">
//             <div className="flex items-center gap-2">
//               <MapPin className="h-5 w-5 text-green-500" />
//               <div>
//                 <p className="text-sm font-medium">Tổng chi tiêu</p>
//                 <p className="text-2xl font-bold">
//                   {stats.totalSpent.toLocaleString('vi-VN')}₫
//                 </p>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//
//       {/* Filters */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Tìm kiếm và lọc</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="flex gap-4 flex-wrap">
//             <div className="flex-1 min-w-[200px]">
//               <div className="relative">
//                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Tìm kiếm theo mã đơn, món ăn..."
//                   className="pl-8"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//             </div>
//             <Select value={statusFilter} onValueChange={setStatusFilter}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Trạng thái" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Tất cả</SelectItem>
//                 <SelectItem value="completed">Hoàn thành</SelectItem>
//                 <SelectItem value="cancelled">Đã hủy</SelectItem>
//                 <SelectItem value="pending">Đang xử lý</SelectItem>
//                 <SelectItem value="preparing">Đang chuẩn bị</SelectItem>
//                 <SelectItem value="ready">Sẵn sàng</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select value={deliveryTypeFilter} onValueChange={setDeliveryTypeFilter}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Loại đơn" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Tất cả</SelectItem>
//                 <SelectItem value="dine-in">Tại quán</SelectItem>
//                 <SelectItem value="delivery">Giao hàng</SelectItem>
//                 <SelectItem value="takeaway">Mang về</SelectItem>
//               </SelectContent>
//             </Select>
//             <Select value={timeFilter} onValueChange={setTimeFilter}>
//               <SelectTrigger className="w-[150px]">
//                 <SelectValue placeholder="Thời gian" />
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="all">Tất cả</SelectItem>
//                 <SelectItem value="today">Hôm nay</SelectItem>
//                 <SelectItem value="week">Tuần này</SelectItem>
//                 <SelectItem value="month">Tháng này</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </CardContent>
//       </Card>
//
//       {/* Orders List */}
//       {filteredOrders.length > 0 ? (
//         <div className="grid gap-4">
//           {filteredOrders.map((order: any) => {
//             const orderDate = new Date(order.createdAt)
//             const orderTime = orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
//
//             return (
//               <Card key={order.id}>
//                 <CardHeader>
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <CardTitle className="text-lg">{order.orderCode || order.id}</CardTitle>
//                       <CardDescription>
//                         {orderDate.toLocaleDateString('vi-VN', {
//                           year: 'numeric',
//                           month: 'long',
//                           day: 'numeric'
//                         })} • {orderTime} • {getDeliveryTypeText(order.deliveryType || 'dine-in')}
//                       </CardDescription>
//                     </div>
//                     <div className="flex flex-col items-end gap-2">
//                       <Badge variant={getStatusColor(order.status)}>
//                         {getStatusText(order.status)}
//                       </Badge>
//                       {order.rating && (
//                         <div className="flex items-center gap-1">
//                           {Array.from({ length: 5 }).map((_, i) => (
//                             <Star
//                               key={i}
//                               className={`h-3 w-3 ${
//                                 i < order.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                               }`}
//                             />
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="space-y-4">
//                     {/* Restaurant & Location */}
//                     <div className="flex items-center gap-2 text-sm text-muted-foreground">
//                       <MapPin className="h-4 w-4" />
//                       <span>{order.restaurant?.name || "Nhà hàng"}</span>
//                       {order.table?.tableNumber && <span>• Bàn {order.table.tableNumber}</span>}
//                       {order.deliveryAddress && <span>• {order.deliveryAddress}</span>}
//                     </div>
//
//                     {/* Order Items */}
//                     <div className="space-y-2">
//                       <h4 className="font-medium">Món đã gọi:</h4>
//                       <div className="space-y-1">
//                         {order.orderItems?.map((item: any, index: number) => (
//                           <div key={index} className="flex justify-between text-sm">
//                             <span>{item.quantity}x {item.menuItem?.name || "Món ăn"}</span>
//                             <span>{((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}₫</span>
//                           </div>
//                         ))}
//                       </div>
//                       <div className="border-t pt-2 space-y-1">
//                         {order.discount > 0 && (
//                           <div className="flex justify-between text-sm text-muted-foreground">
//                             <span>Giảm giá:</span>
//                             <span>-{order.discount.toLocaleString('vi-VN')}₫</span>
//                           </div>
//                         )}
//                         <div className="flex justify-between font-medium">
//                           <span>Tổng cộng:</span>
//                           <span>{(order.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
//                         </div>
//                       </div>
//                     </div>
//
//                     {/* Actions */}
//                     <div className="flex gap-2 pt-2">
//                       <Button
//                         size="sm"
//                         variant="outline"
//                         className="flex-1"
//                         onClick={() => {
//                           setSelectedOrder(order)
//                           setDetailsOpen(true)
//                         }}
//                       >
//                         <Eye className="h-4 w-4 mr-1" />
//                         Chi tiết
//                       </Button>
//
//                       {order.status === 'completed' && (
//                         <>
//                           <Button size="sm" variant="outline" className="flex-1" asChild>
//                             <Link href="/customer">
//                               <RefreshCw className="h-4 w-4 mr-1" />
//                               Đặt lại
//                             </Link>
//                           </Button>
//                           {!order.rating && (
//                             <Button size="sm" className="flex-1">
//                               <Star className="h-4 w-4 mr-1" />
//                               Đánh giá
//                             </Button>
//                           )}
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 </CardContent>
//               </Card>
//             )
//           })}
//         </div>
//       ) : (
//         <Card>
//           <CardContent className="flex flex-col items-center justify-center py-12">
//             <Package className="h-16 w-16 text-muted-foreground mb-4" />
//             <h3 className="text-lg font-medium mb-2">Không tìm thấy đơn hàng</h3>
//             <p className="text-sm text-muted-foreground text-center mb-4">
//               {searchTerm || statusFilter !== "all" || deliveryTypeFilter !== "all" || timeFilter !== "all"
//                 ? "Thử thay đổi bộ lọc để xem thêm kết quả"
//                 : "Bạn chưa có đơn hàng nào"}
//             </p>
//             <Button asChild>
//               <Link href="/customer">Đặt món ngay</Link>
//             </Button>
//           </CardContent>
//         </Card>
//       )}
//
//       {/* Order Details Dialog */}
//       <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
//         <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
//           <DialogHeader>
//             <DialogTitle>Chi tiết đơn hàng</DialogTitle>
//             <DialogDescription>
//               Mã đơn: {selectedOrder?.orderCode || selectedOrder?.id}
//             </DialogDescription>
//           </DialogHeader>
//
//           {selectedOrder && (
//             <div className="space-y-4">
//               {/* Status & Time */}
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-muted-foreground">Trạng thái</p>
//                   <Badge variant={getStatusColor(selectedOrder.status)}>
//                     {getStatusText(selectedOrder.status)}
//                   </Badge>
//                 </div>
//                 <div className="text-right">
//                   <p className="text-sm text-muted-foreground">Thời gian đặt</p>
//                   <p className="font-medium">
//                     {new Date(selectedOrder.createdAt).toLocaleString('vi-VN')}
//                   </p>
//                 </div>
//               </div>
//
//               {/* Restaurant Info */}
//               <div className="border-t pt-4">
//                 <p className="text-sm font-medium mb-2">Thông tin nhà hàng</p>
//                 <div className="space-y-1 text-sm">
//                   <p><span className="text-muted-foreground">Nhà hàng:</span> {selectedOrder.restaurant?.name || "N/A"}</p>
//                   <p><span className="text-muted-foreground">Địa chỉ:</span> {selectedOrder.restaurant?.address || "N/A"}</p>
//                   {selectedOrder.table && (
//                     <p><span className="text-muted-foreground">Bàn:</span> {selectedOrder.table.tableNumber}</p>
//                   )}
//                   {selectedOrder.deliveryAddress && (
//                     <p><span className="text-muted-foreground">Địa chỉ giao hàng:</span> {selectedOrder.deliveryAddress}</p>
//                   )}
//                 </div>
//               </div>
//
//               {/* Order Items */}
//               <div className="border-t pt-4">
//                 <p className="text-sm font-medium mb-2">Món đã gọi</p>
//                 <div className="space-y-2">
//                   {selectedOrder.orderItems?.map((item: any, index: number) => (
//                     <div key={index} className="flex justify-between text-sm">
//                       <span>{item.quantity}x {item.menuItem?.name || "Món ăn"}</span>
//                       <span>{((item.menuItem?.price || 0) * item.quantity).toLocaleString('vi-VN')}₫</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//
//               {/* Payment Info */}
//               <div className="border-t pt-4">
//                 <p className="text-sm font-medium mb-2">Thanh toán</p>
//                 <div className="space-y-1 text-sm">
//                   <div className="flex justify-between">
//                     <span className="text-muted-foreground">Tạm tính:</span>
//                     <span>{((selectedOrder.totalAmount || 0) + (selectedOrder.discount || 0)).toLocaleString('vi-VN')}₫</span>
//                   </div>
//                   {selectedOrder.discount > 0 && (
//                     <div className="flex justify-between text-green-600">
//                       <span>Giảm giá:</span>
//                       <span>-{selectedOrder.discount.toLocaleString('vi-VN')}₫</span>
//                     </div>
//                   )}
//                   <div className="flex justify-between font-medium text-base pt-2 border-t">
//                     <span>Tổng cộng:</span>
//                     <span>{(selectedOrder.totalAmount || 0).toLocaleString('vi-VN')}₫</span>
//                   </div>
//                   <div className="flex justify-between pt-1">
//                     <span className="text-muted-foreground">Phương thức:</span>
//                     <span>{selectedOrder.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản'}</span>
//                   </div>
//                 </div>
//               </div>
//
//               {/* Notes */}
//               {selectedOrder.notes && (
//                 <div className="border-t pt-4">
//                   <p className="text-sm font-medium mb-2">Ghi chú</p>
//                   <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
//                 </div>
//               )}
//
//               {/* Rating */}
//               {selectedOrder.rating && (
//                 <div className="border-t pt-4">
//                   <p className="text-sm font-medium mb-2">Đánh giá của bạn</p>
//                   <div className="flex items-center gap-1">
//                     {Array.from({ length: 5 }).map((_, i) => (
//                       <Star
//                         key={i}
//                         className={`h-4 w-4 ${
//                           i < selectedOrder.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
//                         }`}
//                       />
//                     ))}
//                   </div>
//                   {selectedOrder.review && (
//                     <p className="text-sm text-muted-foreground mt-2">{selectedOrder.review}</p>
//                   )}
//                 </div>
//               )}
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

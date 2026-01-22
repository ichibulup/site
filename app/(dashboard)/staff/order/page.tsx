"use client"

import React, { useMemo } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  PaymentStatus,
  StatsBoxProps,
  Table,
  User,
} from "@/lib/interfaces"
import { formatCurrency, formatDateTime, unwrapApiData } from "@/lib/utils/formatters"
import {
  normalizeOrderStatus,
  normalizePaymentStatus,
  renderOrderStatusBadge,
  renderPaymentStatusBadge,
} from "@/lib/utils/renderers"
import { useGetAllOrdersQuery, useUpdateOrderMutation } from "@/state/api"
import { toast } from "sonner"
import {
  CheckCircle,
  ClipboardList,
  Clock,
  MoreHorizontal,
  ShoppingBag,
} from "lucide-react"

type OrderRow = Order & {
  customer?: User | null
  table?: Table | null
  orderNumber?: string | null
  customerName?: string | null
  customerPhone?: string | null
  customerEmail?: string | null
  tableName?: string | null
  total?: number | string | null
  createdAt?: Date | string
  paymentMethod?: string | null
}

const statusOptions = [
  { label: "Chờ xác nhận", value: OrderStatus.pending, icon: Clock },
  { label: "Đã xác nhận", value: OrderStatus.confirmed, icon: CheckCircle },
  { label: "Đang chuẩn bị", value: OrderStatus.preparing, icon: ShoppingBag },
  { label: "Sẵn sàng", value: OrderStatus.ready, icon: CheckCircle },
  { label: "Hoàn thành", value: OrderStatus.completed, icon: CheckCircle },
  { label: "Đã hủy", value: OrderStatus.cancelled, icon: Clock },
]

const getCustomerLabel = (order: OrderRow) =>
  order.customer?.fullName || order.customerName || order.customerId || "Khách hàng"

const getCustomerMeta = (order: OrderRow) =>
  order.customer?.phoneNumber || order.customerPhone || order.customer?.email || order.customerEmail

const getTableLabel = (order: OrderRow) =>
  order.table?.tableNumber || order.tableName || "—"

const getTotalAmount = (order: OrderRow) =>
  Number(order.totalAmount ?? order.finalAmount ?? order.total ?? 0)

export default function StaffOrdersPage() {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useGetAllOrdersQuery(undefined)
  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation()

  const orders = useMemo(() => unwrapApiData<OrderRow[]>(data) ?? [], [data])

  const stats = useMemo(() => {
    let pending = 0
    let preparing = 0
    let ready = 0
    let completed = 0

    orders.forEach((order) => {
      const status = normalizeOrderStatus(order.status)
      if (status === OrderStatus.pending) pending += 1
      if (status === OrderStatus.confirmed || status === OrderStatus.preparing) preparing += 1
      if (status === OrderStatus.ready) ready += 1
      if (status === OrderStatus.served || status === OrderStatus.completed) completed += 1
    })

    return {
      total: orders.length,
      pending,
      preparing,
      ready,
      completed,
    }
  }, [orders])

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng đơn",
      description: "Tất cả đơn hàng",
      icon: ClipboardList,
      stats: stats.total,
    },
    {
      title: "Chờ xác nhận",
      description: "Cần xử lý",
      icon: Clock,
      color: "professional-yellow",
      stats: stats.pending,
    },
    {
      title: "Đang chuẩn bị",
      description: "Đang phục vụ",
      icon: ShoppingBag,
      color: "professional-blue",
      stats: stats.preparing,
    },
    {
      title: "Hoàn thành",
      description: "Đã hoàn tất",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.completed,
    },
  ]

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await updateOrder({ id: orderId, data: { status } }).unwrap()
      toast.success("Cập nhật trạng thái đơn hàng thành công")
      refetch()
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái đơn hàng")
    }
  }

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
        `${row.orderCode || row.orderNumber || row.id} ${getCustomerLabel(row)}`.trim(),
      header: ({ column }) => <DataTableSortButton column={column} title="Mã đơn" />,
      cell: ({ row }) => (
        <div className="font-medium text-professional-main">
          {/* {row.original.orderCode || row.original.orderNumber || row.original.id} */}
          #P2DP2CM47
        </div>
      ),
      size: 160,
    },
    {
      id: "customer",
      accessorFn: (row) => getCustomerLabel(row),
      header: ({ column }) => <DataTableSortButton column={column} title="Khách hàng" />,
      cell: ({ row }) => {
        const label = getCustomerLabel(row.original)
        const meta = getCustomerMeta(row.original)
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.customer?.avatarUrl ?? undefined} alt={label} />
              <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{label}</div>
              <div className="truncate text-xs text-muted-foreground">{meta || "—"}</div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      id: "table",
      accessorFn: (row) => getTableLabel(row),
      header: "Bàn",
      cell: ({ row }) => <div className="truncate">{getTableLabel(row.original)}</div>,
      size: 120,
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
      accessorFn: (row) => getTotalAmount(row),
      header: () => <div className="text-right">Tổng tiền</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency({ value: getTotalAmount(row.original) })}
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
          {row.original.createdAt
            ? formatDateTime({ date: row.original.createdAt })
            : "—"}
        </div>
      ),
      size: 180,
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
            <DropdownMenuItem onClick={() => toast.info("Mở chi tiết đơn hàng")}>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUpdateStatus(row.original.id, OrderStatus.confirmed)}
              disabled={isUpdating}
            >
              Xác nhận đơn
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUpdateStatus(row.original.id, OrderStatus.ready)}
              disabled={isUpdating}
            >
              Sẵn sàng phục vụ
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUpdateStatus(row.original.id, OrderStatus.completed)}
              disabled={isUpdating}
            >
              Hoàn thành đơn
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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý đơn hàng</h1>
          <p className="text-muted-foreground">Theo dõi và xử lý đơn hàng từ khách</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={() => router.push("/staff/order/new")}>Nhận đơn mới</Button>
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
          placeholder: "Tìm theo mã đơn hoặc khách hàng...",
        }}
        max="customer"
        filter={[
          {
            column: "status",
            title: "Trạng thái",
            options: statusOptions,
          },
        ]}
        onReload={() => refetch()}
        onCreate={() => router.push("/staff/order/new")}
        onDownload={() => toast.info("Đang chuẩn bị file xuất dữ liệu")}
      />
    </div>
  )
}

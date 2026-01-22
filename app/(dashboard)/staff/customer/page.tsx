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
  StatsBoxProps,
  User,
  UserRole,
  UserStatus,
} from "@/lib/interfaces"
import { formatCurrency, unwrapApiData } from "@/lib/utils/formatters"
import { renderUserStatusBadge } from "@/lib/utils/renderers"
import { useGetAllUsersQuery } from "@/state/api"
import { toast } from "sonner"
import { Award, CheckCircle, MoreHorizontal, Users } from "lucide-react"

type CustomerRow = User

const statusOptions = [
  { label: "Hoạt động", value: UserStatus.active, icon: CheckCircle },
  { label: "Không hoạt động", value: UserStatus.inactive, icon: Users },
  { label: "Tạm dừng", value: UserStatus.suspended, icon: Award },
  { label: "Bị khóa", value: UserStatus.banned, icon: Award },
]

const getUserLabel = (user: CustomerRow) =>
  user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.email

const getUserMeta = (user: CustomerRow) => user.phoneNumber || user.email

const toNumber = (value: string | number | null | undefined) =>
  typeof value === "number" ? value : Number(value || 0)

export default function CustomersPage() {
  const router = useRouter()
  const { data, isLoading, error, refetch } = useGetAllUsersQuery()

  const customers = useMemo(() => {
    const users = unwrapApiData<CustomerRow[]>(data) ?? []
    return users.filter((user) => user.role === UserRole.customer)
  }, [data])

  const stats = useMemo(() => {
    const total = customers.length
    const active = customers.filter((user) => user.status === UserStatus.active).length
    const totalOrders = customers.reduce((sum, user) => sum + Number(user.totalOrders || 0), 0)
    const totalSpent = customers.reduce((sum, user) => sum + toNumber(user.totalSpent), 0)
    const avgSpent = total > 0 ? totalSpent / total : 0

    return { total, active, totalOrders, avgSpent }
  }, [customers])

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng khách hàng",
      description: "Tất cả khách",
      icon: Users,
      stats: stats.total,
    },
    {
      title: "Đang hoạt động",
      description: "Khách hàng active",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.active,
    },
    {
      title: "Tổng đơn",
      description: "Tất cả đơn đã đặt",
      icon: Award,
      color: "professional-blue",
      stats: stats.totalOrders,
    },
    {
      title: "Chi tiêu TB",
      description: "Trung bình mỗi khách",
      icon: Award,
      color: "professional-yellow",
      stats: formatCurrency({ value: stats.avgSpent }),
    },
  ]

  const columns: ColumnDef<CustomerRow, unknown>[] = [
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
      id: "customer",
      accessorFn: (row) => `${getUserLabel(row)} ${row.email} ${row.phoneNumber || ""}`.trim(),
      header: ({ column }) => <DataTableSortButton column={column} title="Khách hàng" />,
      cell: ({ row }) => {
        const label = getUserLabel(row.original)
        const meta = getUserMeta(row.original)
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.avatarUrl ?? undefined} alt={label} />
              <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{label}</div>
              <div className="truncate text-xs text-muted-foreground">{meta || "—"}</div>
            </div>
          </div>
        )
      },
      size: 260,
    },
    {
      accessorKey: "loyaltyPoints",
      header: () => <div className="text-right">Điểm</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">{Number(row.original.loyaltyPoints || 0)}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "totalOrders",
      header: () => <div className="text-right">Đơn hàng</div>,
      cell: ({ row }) => (
        <div className="text-right">{Number(row.original.totalOrders || 0)}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "totalSpent",
      header: () => <div className="text-right">Chi tiêu</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency({ value: toNumber(row.original.totalSpent) })}
        </div>
      ),
      size: 160,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {renderUserStatusBadge(row.original.status as UserStatus)}
        </div>
      ),
      size: 140,
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
            <DropdownMenuItem onClick={() => router.push(`/staff/customer/profile/${row.original.id}`)}>
              Xem hồ sơ
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/staff/order?customerId=${row.original.id}`)}>
              Đơn hàng
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/staff/customer/reservations?customerId=${row.original.id}`)}>
              Đặt bàn
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Chức năng đang được phát triển")}>Chỉnh sửa</DropdownMenuItem>
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
        <Badge variant="destructive">Không thể tải danh sách khách hàng</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Danh sách khách hàng</h1>
          <p className="text-muted-foreground">Theo dõi thông tin khách hàng tại nhà hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={() => toast.info("Chức năng tạo khách hàng đang được phát triển")}>Thêm khách hàng</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatsBox key={stat.title} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={customers}
        search={{
          column: "customer",
          placeholder: "Tìm theo tên, email hoặc số điện thoại...",
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
        onCreate={() => toast.info("Chức năng tạo khách hàng đang được phát triển")}
        onDownload={() => toast.info("Đang chuẩn bị file xuất dữ liệu")}
      />
    </div>
  )
}

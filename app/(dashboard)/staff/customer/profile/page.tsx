"use client"

import React, { useMemo } from "react"
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
import { formatCurrency, formatDateTime, unwrapApiData } from "@/lib/utils/formatters"
import { renderUserStatusBadge } from "@/lib/utils/renderers"
import { useGetAllUsersQuery } from "@/state/api"
import { toast } from "sonner"
import { CheckCircle, MoreHorizontal, Users } from "lucide-react"

type CustomerRow = User

type LoyaltyTier = "vip" | "gold" | "silver" | "bronze"

const getTier = (points: number): LoyaltyTier => {
  if (points >= 10000) return "vip"
  if (points >= 5000) return "gold"
  if (points >= 2000) return "silver"
  return "bronze"
}

const renderTierBadge = (tier: LoyaltyTier) => {
  switch (tier) {
    case "vip":
      return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
    case "gold":
      return <Badge className="bg-yellow-100 text-yellow-800">Gold</Badge>
    case "silver":
      return <Badge className="bg-gray-100 text-gray-800">Silver</Badge>
    default:
      return <Badge className="bg-orange-100 text-orange-800">Bronze</Badge>
  }
}

const toNumber = (value: string | number | null | undefined) =>
  typeof value === "number" ? value : Number(value || 0)

export default function CustomerProfileOverviewPage() {
  const { data, isLoading, error, refetch } = useGetAllUsersQuery()

  const customers = useMemo(() => {
    const users = unwrapApiData<CustomerRow[]>(data) ?? []
    return users.filter((user) => user.role === UserRole.customer)
  }, [data])

  const stats = useMemo(() => {
    const total = customers.length
    const active = customers.filter((user) => user.status === UserStatus.active).length
    const vip = customers.filter((user) => getTier(toNumber(user.loyaltyPoints)) === "vip").length
    const totalSpent = customers.reduce((sum, user) => sum + toNumber(user.totalSpent), 0)

    return { total, active, vip, totalSpent }
  }, [customers])

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng khách",
      description: "Hồ sơ khách hàng",
      icon: Users,
      stats: stats.total,
    },
    {
      title: "Hoạt động",
      description: "Đang tương tác",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.active,
    },
    {
      title: "VIP",
      description: "Khách hàng VIP",
      icon: Users,
      color: "professional-purple",
      stats: stats.vip,
    },
    {
      title: "Tổng chi tiêu",
      description: "Tất cả khách",
      icon: Users,
      color: "professional-blue",
      stats: formatCurrency({ value: stats.totalSpent }),
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
      accessorFn: (row) => `${row.fullName || row.email} ${row.phoneNumber || ""}`.trim(),
      header: ({ column }) => <DataTableSortButton column={column} title="Khách hàng" />,
      cell: ({ row }) => {
        const label = row.original.fullName || row.original.email
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.avatarUrl ?? undefined} alt={label} />
              <AvatarFallback>{label.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{label}</div>
              <div className="truncate text-xs text-muted-foreground">{row.original.email}</div>
            </div>
          </div>
        )
      },
      size: 240,
    },
    {
      id: "tier",
      accessorFn: (row) => getTier(toNumber(row.loyaltyPoints)),
      header: "Hạng",
      cell: ({ row }) => renderTierBadge(getTier(toNumber(row.original.loyaltyPoints))),
      size: 120,
    },
    {
      accessorKey: "totalOrders",
      header: () => <div className="text-right">Đơn hàng</div>,
      cell: ({ row }) => <div className="text-right">{Number(row.original.totalOrders || 0)}</div>,
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
      id: "createdAt",
      header: "Tham gia",
      cell: ({ row }) => (
        <div className="text-sm">{formatDateTime({ date: row.original.createdAt })}</div>
      ),
      size: 170,
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
            <DropdownMenuItem onClick={() => toast.info("Xem hồ sơ chi tiết")}>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Tính năng đang được phát triển")}>Chỉnh sửa</DropdownMenuItem>
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
        <Badge variant="destructive">Không thể tải hồ sơ khách hàng</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Hồ sơ khách hàng</h1>
          <p className="text-muted-foreground">Quản lý thông tin và lịch sử khách hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={() => toast.info("Tính năng thêm khách hàng đang được phát triển")}>Thêm khách</Button>
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
            options: [
              { label: "Hoạt động", value: UserStatus.active },
              { label: "Không hoạt động", value: UserStatus.inactive },
              { label: "Tạm dừng", value: UserStatus.suspended },
              { label: "Bị khóa", value: UserStatus.banned },
            ],
          },
        ]}
        onReload={() => refetch()}
        onCreate={() => toast.info("Tính năng thêm khách hàng đang được phát triển")}
        onDownload={() => toast.info("Đang chuẩn bị file xuất dữ liệu")}
      />
    </div>
  )
}

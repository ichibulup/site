"use client"

import React, { useMemo } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
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
  ReservationDataColumn,
  ReservationStatus,
  StatsBoxProps,
} from "@/lib/interfaces"
import { formatDateTime, unwrapApiData } from "@/lib/utils/formatters"
import {
  normalizeReservationStatus,
  renderReservationStatusBadge,
} from "@/lib/utils/renderers"
import { useGetReservationsQuery } from "@/state/api"
import { toast } from "sonner"
import {
  Calendar,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Users,
} from "lucide-react"

const statusOptions = [
  { label: "Chờ xác nhận", value: ReservationStatus.pending, icon: Clock },
  { label: "Đã xác nhận", value: ReservationStatus.confirmed, icon: CheckCircle },
  { label: "Đang ngồi", value: ReservationStatus.seated, icon: Users },
  { label: "Hoàn thành", value: ReservationStatus.completed, icon: CheckCircle },
  { label: "Đã hủy", value: ReservationStatus.cancelled, icon: Clock },
  { label: "Không đến", value: ReservationStatus.noShow, icon: Clock },
]

export default function CustomerReservationsPage() {
  const { data, isLoading, error, refetch } = useGetReservationsQuery()

  const reservations = useMemo(
    () => unwrapApiData<ReservationDataColumn[]>(data) ?? [],
    [data]
  )

  const stats = useMemo(() => {
    const total = reservations.length
    const pending = reservations.filter((r) => r.status === ReservationStatus.pending).length
    const confirmed = reservations.filter((r) => r.status === ReservationStatus.confirmed).length
    const today = reservations.filter((r) => {
      const date = new Date(r.reservationDate)
      const now = new Date()
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    }).length

    return { total, pending, confirmed, today }
  }, [reservations])

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng đặt bàn",
      description: "Tất cả đơn đặt",
      icon: Calendar,
      stats: stats.total,
    },
    {
      title: "Chờ xác nhận",
      description: "Đang xử lý",
      icon: Clock,
      color: "professional-yellow",
      stats: stats.pending,
    },
    {
      title: "Đã xác nhận",
      description: "Đơn đã duyệt",
      icon: CheckCircle,
      color: "professional-blue",
      stats: stats.confirmed,
    },
    {
      title: "Hôm nay",
      description: "Đặt bàn trong ngày",
      icon: Users,
      color: "professional-green",
      stats: stats.today,
    },
  ]

  const columns: ColumnDef<ReservationDataColumn, unknown>[] = [
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
      accessorKey: "customerName",
      header: ({ column }) => <DataTableSortButton column={column} title="Khách hàng" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customerName}</div>
          <div className="text-xs text-muted-foreground">{row.original.customerPhone}</div>
        </div>
      ),
      size: 220,
    },
    {
      accessorKey: "partySize",
      header: () => <div className="text-right">Số khách</div>,
      cell: ({ row }) => <div className="text-right">{row.original.partySize}</div>,
      size: 120,
    },
    {
      accessorKey: "reservationDate",
      header: "Thời gian",
      cell: ({ row }) => (
        <div className="text-sm">
          {formatDateTime({ date: row.original.reservationDate })}
        </div>
      ),
      size: 180,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => (
        <div className="flex justify-center">
          {renderReservationStatusBadge(normalizeReservationStatus(row.original.status))}
        </div>
      ),
      size: 140,
    },
    {
      id: "table",
      header: "Bàn",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.tables?.table_number || "—"}</div>
      ),
      size: 120,
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
            <DropdownMenuItem onClick={() => toast.info("Xem chi tiết đặt bàn")}>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Tính năng đang được phát triển")}>Check-in</DropdownMenuItem>
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
        <Badge variant="destructive">Không thể tải danh sách đặt bàn</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Đặt bàn khách hàng</h1>
          <p className="text-muted-foreground">Theo dõi lịch đặt bàn tại nhà hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={() => toast.info("Tính năng tạo đặt bàn đang được phát triển")}>Tạo đặt bàn</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatsBox key={stat.title} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={reservations}
        search={{
          column: "customerName",
          placeholder: "Tìm theo tên khách hàng hoặc số điện thoại...",
        }}
        max="customerName"
        filter={[
          {
            column: "status",
            title: "Trạng thái",
            options: statusOptions,
          },
        ]}
        onReload={() => refetch()}
        onCreate={() => toast.info("Tính năng tạo đặt bàn đang được phát triển")}
        onDownload={() => toast.info("Đang chuẩn bị file xuất dữ liệu")}
      />
    </div>
  )
}

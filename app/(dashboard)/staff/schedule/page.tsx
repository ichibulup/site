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
import { StatsBoxProps } from "@/lib/interfaces"
import { formatDateTime } from "@/lib/utils/formatters"
import { toast } from "sonner"
import {
  Calendar,
  Clock,
  Download,
  Filter,
  MoreHorizontal,
  Users,
} from "lucide-react"

interface ScheduleEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  type: "shift" | "meeting" | "training" | "break"
  status: "scheduled" | "confirmed" | "completed" | "cancelled"
  location?: string
  participants?: string[]
}

const eventTypeOptions = [
  { label: "Ca làm", value: "shift" },
  { label: "Họp", value: "meeting" },
  { label: "Đào tạo", value: "training" },
  { label: "Nghỉ", value: "break" },
]

const renderEventTypeBadge = (type: ScheduleEvent["type"]) => {
  switch (type) {
    case "shift":
      return <Badge className="bg-blue-100 text-blue-800">Ca làm</Badge>
    case "meeting":
      return <Badge className="bg-green-100 text-green-800">Họp</Badge>
    case "training":
      return <Badge className="bg-purple-100 text-purple-800">Đào tạo</Badge>
    default:
      return <Badge className="bg-gray-100 text-gray-800">Nghỉ</Badge>
  }
}

const renderStatusBadge = (status: ScheduleEvent["status"]) => {
  switch (status) {
    case "scheduled":
      return <Badge variant="outline">Đã lên lịch</Badge>
    case "confirmed":
      return <Badge variant="default">Đã xác nhận</Badge>
    case "completed":
      return <Badge variant="secondary">Hoàn thành</Badge>
    default:
      return <Badge variant="destructive">Đã hủy</Badge>
  }
}

export default function StaffSchedulePage() {
  const schedule: ScheduleEvent[] = [
    {
      id: "1",
      title: "Ca sáng - Phục vụ",
      date: "2025-01-20",
      startTime: "06:00",
      endTime: "14:00",
      type: "shift",
      status: "scheduled",
      location: "Khu vực A",
    },
    {
      id: "2",
      title: "Họp nhóm tuần",
      date: "2025-01-20",
      startTime: "15:00",
      endTime: "16:00",
      type: "meeting",
      status: "confirmed",
      location: "Phòng họp",
      participants: ["Quản lý", "Nhóm phục vụ"],
    },
    {
      id: "3",
      title: "Ca sáng - Phục vụ",
      date: "2025-01-21",
      startTime: "06:00",
      endTime: "14:00",
      type: "shift",
      status: "scheduled",
      location: "Khu vực B",
    },
    {
      id: "4",
      title: "Đào tạo dịch vụ khách hàng",
      date: "2025-01-22",
      startTime: "09:00",
      endTime: "11:00",
      type: "training",
      status: "scheduled",
      location: "Phòng đào tạo",
    },
    {
      id: "5",
      title: "Ca chiều - Phục vụ",
      date: "2025-01-23",
      startTime: "14:00",
      endTime: "22:00",
      type: "shift",
      status: "scheduled",
      location: "Khu vực A",
    },
  ]

  const stats = useMemo(() => {
    const totalEvents = schedule.length
    const shifts = schedule.filter((event) => event.type === "shift").length
    const meetings = schedule.filter((event) => event.type === "meeting").length
    const trainings = schedule.filter((event) => event.type === "training").length

    const totalHours = schedule
      .filter((event) => event.type === "shift")
      .reduce((total, shift) => {
        const start = new Date(`2000-01-01 ${shift.startTime}`)
        const end = new Date(`2000-01-01 ${shift.endTime}`)
        return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60)
      }, 0)

    return { totalEvents, shifts, meetings, trainings, totalHours }
  }, [schedule])

  const statCards: StatsBoxProps[] = [
    {
      title: "Giờ làm tuần",
      description: "Tổng giờ ca",
      icon: Clock,
      stats: `${stats.totalHours}h`,
    },
    {
      title: "Ca làm",
      description: "Tổng số ca",
      icon: Calendar,
      color: "professional-blue",
      stats: stats.shifts,
    },
    {
      title: "Cuộc họp",
      description: "Lịch họp",
      icon: Users,
      color: "professional-green",
      stats: stats.meetings,
    },
    {
      title: "Đào tạo",
      description: "Buổi đào tạo",
      icon: Users,
      color: "professional-purple",
      stats: stats.trainings,
    },
  ]

  const columns: ColumnDef<ScheduleEvent, unknown>[] = [
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
      accessorKey: "title",
      header: ({ column }) => <DataTableSortButton column={column} title="Sự kiện" />,
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.title}</div>
          <div className="text-xs text-muted-foreground">{row.original.location || "—"}</div>
        </div>
      ),
      size: 260,
    },
    {
      id: "date",
      accessorFn: (row) => row.date,
      header: "Ngày",
      cell: ({ row }) => (
        <div className="text-sm">{formatDateTime({ date: row.original.date })}</div>
      ),
      size: 160,
    },
    {
      id: "time",
      header: "Thời gian",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.startTime} - {row.original.endTime}</div>
      ),
      size: 140,
    },
    {
      id: "type",
      accessorFn: (row) => row.type,
      header: "Loại",
      cell: ({ row }) => renderEventTypeBadge(row.original.type),
      size: 120,
    },
    {
      id: "status",
      accessorFn: (row) => row.status,
      header: "Trạng thái",
      cell: ({ row }) => renderStatusBadge(row.original.status),
      size: 140,
    },
    {
      id: "participants",
      header: "Tham gia",
      cell: ({ row }) => (
        <div className="text-sm">{row.original.participants?.join(", ") || "—"}</div>
      ),
      size: 200,
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
            <DropdownMenuItem onClick={() => toast.info("Xem chi tiết lịch")}>Xem chi tiết</DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Tính năng đang được phát triển")}>Yêu cầu đổi ca</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 64,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch làm việc</h1>
          <p className="text-muted-foreground">Theo dõi ca làm việc và sự kiện</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => toast.info("Đang lọc lịch")}
          >
            <Filter className="mr-2 h-4 w-4" />
            Lọc
          </Button>
          <Button variant="outline" onClick={() => toast.info("Đang tải lịch")}
          >
            <Download className="mr-2 h-4 w-4" />
            Xuất lịch
          </Button>
          <Button onClick={() => toast.info("Gửi yêu cầu nghỉ phép")}>Yêu cầu nghỉ</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <StatsBox key={stat.title} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={schedule}
        search={{
          column: "title",
          placeholder: "Tìm theo tên sự kiện hoặc địa điểm...",
        }}
        max="title"
        filter={[
          {
            column: "type",
            title: "Loại sự kiện",
            options: eventTypeOptions,
          },
        ]}
        onReload={() => toast.info("Lịch đã được làm mới")}
        onCreate={() => toast.info("Tạo lịch mới")}
        onDownload={() => toast.info("Đang chuẩn bị file xuất dữ liệu")}
      />
    </div>
  )
}

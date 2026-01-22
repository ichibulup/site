"use client"

import React, { useMemo, useState } from "react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DataTable, DataTableSortButton } from "@/components/element/data-table"
import { StatsBox } from "@/components/element/stats-box"
import { StatsBoxProps, User, UserRole } from "@/lib/interfaces"
import { formatCurrency, unwrapApiData } from "@/lib/utils/formatters"
import { useGetAllUsersQuery } from "@/state/api"
import { toast } from "sonner"
import {
  Award,
  Gift,
  MoreHorizontal,
  TrendingUp,
  Users,
} from "lucide-react"

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

export default function LoyaltyProgramPage() {
  const { data, isLoading, error, refetch } = useGetAllUsersQuery()

  const customers = useMemo(() => {
    const users = unwrapApiData<CustomerRow[]>(data) ?? []
    return users.filter((user) => user.role === UserRole.customer)
  }, [data])

  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null)
  const [isAdjustPointsDialogOpen, setIsAdjustPointsDialogOpen] = useState(false)
  const [adjustmentType, setAdjustmentType] = useState<"add" | "subtract">("add")
  const [pointsAmount, setPointsAmount] = useState(0)
  const [adjustmentReason, setAdjustmentReason] = useState("")

  const stats = useMemo(() => {
    const totalCustomers = customers.length
    const totalPoints = customers.reduce((sum, user) => sum + toNumber(user.loyaltyPoints), 0)
    const avgPoints = totalCustomers ? totalPoints / totalCustomers : 0
    const vipCount = customers.filter((user) => getTier(toNumber(user.loyaltyPoints)) === "vip").length

    return { totalCustomers, totalPoints, avgPoints, vipCount }
  }, [customers])

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng khách",
      description: "Tham gia loyalty",
      icon: Users,
      stats: stats.totalCustomers,
    },
    {
      title: "Điểm tích lũy",
      description: "Tổng điểm hiện tại",
      icon: Gift,
      color: "professional-blue",
      stats: stats.totalPoints,
    },
    {
      title: "VIP",
      description: "Khách hàng VIP",
      icon: Award,
      color: "professional-purple",
      stats: stats.vipCount,
    },
    {
      title: "Điểm TB",
      description: "Trung bình mỗi khách",
      icon: TrendingUp,
      color: "professional-yellow",
      stats: stats.avgPoints.toFixed(0),
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
              <div className="truncate text-xs text-muted-foreground">{row.original.phoneNumber || "—"}</div>
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
      accessorKey: "loyaltyPoints",
      header: () => <div className="text-right">Điểm</div>,
      cell: ({ row }) => (
        <div className="text-right font-medium">{toNumber(row.original.loyaltyPoints)}</div>
      ),
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
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setSelectedCustomer(row.original)
                setIsAdjustPointsDialogOpen(true)
              }}
            >
              Điều chỉnh điểm
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => toast.info("Xem lịch sử điểm")}>Lịch sử điểm</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 64,
    },
  ]

  const handleSaveAdjustment = () => {
    if (!selectedCustomer) return
    toast.success("Đã lưu điều chỉnh điểm")
    setIsAdjustPointsDialogOpen(false)
    setSelectedCustomer(null)
    setPointsAmount(0)
    setAdjustmentReason("")
  }

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
        <Badge variant="destructive">Không thể tải dữ liệu khách hàng</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Chương trình khách hàng thân thiết</h1>
          <p className="text-muted-foreground">Theo dõi điểm và hạng thành viên</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={() => toast.info("Tính năng tạo ưu đãi đang được phát triển")}>Thêm ưu đãi</Button>
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
            column: "tier",
            title: "Hạng thành viên",
            options: [
              { label: "VIP", value: "vip" },
              { label: "Gold", value: "gold" },
              { label: "Silver", value: "silver" },
              { label: "Bronze", value: "bronze" },
            ],
          },
        ]}
        onReload={() => refetch()}
        onCreate={() => toast.info("Tính năng tạo ưu đãi đang được phát triển")}
        onDownload={() => toast.info("Đang chuẩn bị file xuất dữ liệu")}
      />

      <Dialog open={isAdjustPointsDialogOpen} onOpenChange={setIsAdjustPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Điều chỉnh điểm</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.fullName || selectedCustomer?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Hình thức</Label>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={adjustmentType === "add" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("add")}
                >
                  Cộng điểm
                </Button>
                <Button
                  type="button"
                  variant={adjustmentType === "subtract" ? "default" : "outline"}
                  onClick={() => setAdjustmentType("subtract")}
                >
                  Trừ điểm
                </Button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Số điểm</Label>
              <Input
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(Number(e.target.value))}
              />
            </div>
            <div className="grid gap-2">
              <Label>Lý do</Label>
              <Textarea
                value={adjustmentReason}
                onChange={(e) => setAdjustmentReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAdjustPointsDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveAdjustment}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

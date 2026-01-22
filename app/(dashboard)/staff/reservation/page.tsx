"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/element/badge"
// import { Badge } from "@/components/ui/badge"
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Phone,
  Mail,
  User,
  AlertCircle,
  Ban
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from 'sonner'
import { ColumnDef } from "@tanstack/react-table";

// Import form components and services
import { DataTable, DataTableSortButton } from "@/components/element/data-table";
import { ReservationDataColumn, StatsBoxProps, ReservationStatus } from "@/lib/interfaces";
import {
  useGetAllReservationsQuery,
  useGetReservationsQuery,
  useGetTablesByRestaurantQuery,
  useUpdateReservationMutation
} from "@/state/api";
import { StatsBox } from "@/components/element/stats-box";

export default function ReservationPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  // const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  // const [editingReservation, setEditingReservation] = useState<ReservationDataColumn | null>(null)
  const [deletingReservation, setDeletingReservation] = useState<ReservationDataColumn | null>(null)

  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false)
  const [checkInReservation, setCheckInReservation] = useState<any | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string>("")
  const [checkInRestaurantId, setCheckInRestaurantId] = useState<string>("")

  const {
    data: reservations = [],
    isLoading,
    refetch: refetchReservations
  } = useGetAllReservationsQuery();

  // Mutations
  const [updateReservation, { isLoading: isUpdatingReservation }] = useUpdateReservationMutation();

  const { data: tablesByRestaurant = [], isLoading: isLoadingTables } = useGetTablesByRestaurantQuery(
    checkInRestaurantId,
    { skip: !checkInRestaurantId }
  );

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
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Khách hàng" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                <User className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {row.original.customerName}
              </div>
              <div className="truncate text-xs text-muted-foreground flex items-center gap-1">
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {row.original.customerEmail}
                </div>
                {" | "}
                <div className="flex items-center gap-1">
                  <Phone className="h-3 w-3" />
                  {row.original.customerPhone}
                </div>
              </div>
              {/* {row.original.customerEmail && (
                <div className="truncate text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {row.original.customerEmail}
                </div>
              )} */}
            </div>
          </div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "partySize",
      header: () => <div className="text-right">Số người</div>,
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-1 text-right">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{row.original.partySize}</span>
            </div>
          </div>
        )
      },
      size: 90,
    },
    {
      accessorKey: "reservationDate",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Ngày đặt" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.reservationDate);
        return (
          <div className="text-right">
            <div className="font-medium">
              {date.toLocaleDateString('vi-VN')}
            </div>
            <div className="text-xs text-muted-foreground flex items-center justify-end gap-1">
              <Clock className="h-3 w-3" />
              {date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "table",
      header: () => <div className="text-right">Bàn</div>,
      cell: ({ row }) => {
        const tableNumber = (row.original as any)?.tables?.tableNumber;
        const isVirtual = tableNumber === "ff06b1f3-52f0-4635-90b1-c082529919e4";
        return (
          <div className="text-right">
            <div className="font-medium">
              {isVirtual ? 'Chưa gán' : (tableNumber || 'N/A')}
            </div>
            <div className="text-xs text-muted-foreground text-right">
              {(row.original as any)?.tables?.capacity ? `${(row.original as any).tables.capacity} người` : ''}
            </div>
          </div>
        )
      },
      size: 80,
    },
    {
      accessorKey: "status",
      header: () => <div className="text-left">Trạng thái</div>,
      cell: ({ row }) => {
        const status = (row.original as any).status;
        const statusConfig = {
          pending: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800", icon: AlertCircle },
          confirmed: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
          seated: { label: "Đang ngồi", color: "bg-green-100 text-green-800", icon: Users },
          completed: { label: "Hoàn thành", color: "bg-gray-100 text-gray-800", icon: CheckCircle },
          cancelled: { label: "Đã hủy", color: "bg-red-100 text-red-800", icon: XCircle },
          noShow: { label: "Vắng mặt", color: "bg-orange-100 text-orange-800", icon: Ban },
        };

        const config = (statusConfig as any)[status] || statusConfig.pending;
        const Icon = config.icon;

        return (
          <div className="flex items-center">
            <Badge variant="secondary" className={`${config.color} flex items-center gap-1`}>
              <Icon className="h-3 w-3" />
              {config.label}
            </Badge>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 130,
    },
    {
      accessorKey: "durationHours",
      header: () => <div className="text-right">Thời gian</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.original.durationHours}h
          </div>
        )
      },
      size: 90,
    },
    {
      id: "actions",
      enableResizing: false,
      size: 64,
      cell: ({ row }) => {
        const r = row.original as any

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(r.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openEditDialog(r)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openCheckInDialog(r)}
                disabled={!['pending', 'confirmed'].includes(r.status)}
              >
                <Users className="mr-2 h-4 w-4" />
                Check-in (gán bàn)
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Cập nhật trạng thái</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, ReservationStatus.confirmed)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Xác nhận
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => openCheckInDialog(r)}>
                      <Users className="mr-2 h-4 w-4" />
                      Check-in (Đang ngồi)
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, ReservationStatus.completed)}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Hoàn thành
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, ReservationStatus.cancelled)}>
                      <XCircle className="mr-2 h-4 w-4" />
                      Hủy
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusUpdate(r.id, ReservationStatus.noShow)}>
                      <Ban className="mr-2 h-4 w-4" />
                      Vắng mặt
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDeleteDialog(r)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  useEffect(() => {

  }, [])

  const safeReservations = Array.isArray(reservations) ? reservations : []

  const filteredReservations = safeReservations.filter((reservation: ReservationDataColumn) => {
    const r = reservation as any;
    const matchesSearch = r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerPhone.includes(searchTerm) ||
      (r.customerEmail && r.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || r.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const stats = useMemo(() => {
    const totalReservations = reservations.length
    const pendingReservations = safeReservations.filter((r: any) => r.status === 'pending').length
    const confirmedReservations = safeReservations.filter((r: any) => r.status === 'confirmed').length
    const completedReservations = safeReservations.filter((r: any) => r.status === 'completed').length
    const cancelledReservations = safeReservations.filter((r: any) => r.status === 'cancelled').length

    return {
      totalReservations,
      pendingReservations,
      confirmedReservations,
      completedReservations,
      cancelledReservations
    }
  }, [reservations])

  const normalizeStatusForApi = (status: any) => (status === 'no_show' ? 'noShow' : status);

  const handleStatusUpdate = async (reservationId: string, newStatus: ReservationStatus) => {
    try {
      await updateReservation({
        id: reservationId,
        data: { status: normalizeStatusForApi(newStatus) },
      }).unwrap();
      toast.success(`Cập nhật trạng thái thành công`);
      refetchReservations();
    } catch (error) {
      console.error('Error updating reservation status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
    }
  };

  const openCheckInDialog = (reservation: any) => {
    const restaurantId = reservation?.restaurant_id || reservation?.tables?.restaurant_id || "";
    setCheckInReservation(reservation);
    setCheckInRestaurantId(restaurantId);
    setSelectedTableId("");
    setIsCheckInDialogOpen(true);
  };

  const handleCheckIn = async () => {
    try {
      if (!checkInReservation?.id) {
        toast.error('Thiếu thông tin đặt bàn');
        return;
      }
      if (!selectedTableId) {
        toast.error('Vui lòng chọn bàn');
        return;
      }

      await updateReservation({
        id: checkInReservation.id,
        data: {
          tableId: selectedTableId,
          status: 'seated',
        },
      }).unwrap();

      toast.success('Check-in thành công: đã gán bàn');
      setIsCheckInDialogOpen(false);
      setCheckInReservation(null);
      setSelectedTableId("");
      setCheckInRestaurantId("");
      refetchReservations();
    } catch (error) {
      console.error('Error checking in reservation:', error);
      toast.error('Có lỗi xảy ra khi check-in');
    }
  };

  const openEditDialog = (reservation: ReservationDataColumn) => {
    // setEditingReservation(reservation)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (reservation: ReservationDataColumn) => {
    setDeletingReservation(reservation)
    // setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const statsBox: StatsBoxProps[] = [
    {
      title: "Tổng đặt bàn",
      description: "Tất cả đơn đặt bàn",
      icon: Calendar,
      stats: stats.totalReservations
    },
    {
      title: "Chờ xác nhận",
      description: "Đơn chờ xử lý",
      icon: AlertCircle,
      color: "professional-yellow",
      stats: stats.pendingReservations
    },
    {
      title: "Đã xác nhận",
      description: "Đơn đã được xác nhận",
      icon: CheckCircle,
      color: "professional-blue",
      stats: stats.confirmedReservations
    },
    {
      title: "Hoàn thành",
      description: "Đơn đã hoàn thành",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.completedReservations
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsBox.map((box, index) => (
          <StatsBox
            key={index}
            title={box.title}
            description={box.description}
            icon={box.icon}
            color={box.color}
            stats={box.stats}
          />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={filteredReservations}
        search={{
          column: "customerName",
          placeholder: "Tìm kiếm theo tên khách hàng, số điện thoại..."
        }}
        max="customerName"
        filter={[
          {
            column: "status",
            title: "Trạng thái",
            options: [
              { label: "Tất cả", value: "all" },
              { label: "Chờ xác nhận", value: "pending" },
              { label: "Đã xác nhận", value: "confirmed" },
              { label: "Đang ngồi", value: "seated" },
              { label: "Hoàn thành", value: "completed" },
              { label: "Đã hủy", value: "cancelled" },
              { label: "Vắng mặt", value: "noShow" },
            ]
          }
        ]}
        onReload={refetchReservations}
        onCreate={() => toast.info("Tính năng tạo đặt bàn đang được phát triển")}
      />

      <Dialog open={isCheckInDialogOpen} onOpenChange={setIsCheckInDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check-in & gán bàn</DialogTitle>
            <DialogDescription>
              Chọn bàn thật để gán cho khách khi check-in.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-sm text-muted-foreground">
              <div><span className="font-medium text-foreground">Khách:</span> {checkInReservation?.customerName}</div>
              <div><span className="font-medium text-foreground">SĐT:</span> {checkInReservation?.customerPhone}</div>
              <div>
                <span className="font-medium text-foreground">Giờ đặt:</span>{" "}
                {checkInReservation?.reservationDate ? new Date(checkInReservation.reservationDate).toLocaleString('vi-VN') : 'N/A'}
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm font-medium">Bàn *</div>
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger>
                  <SelectValue placeholder={isLoadingTables ? 'Đang tải danh sách bàn...' : 'Chọn bàn'} />
                </SelectTrigger>
                <SelectContent>
                  {(tablesByRestaurant as any[])
                    .filter((t) => {
                      const tableNumber = t?.tableNumber;
                      return tableNumber && tableNumber !== "ff06b1f3-52f0-4635-90b1-c082529919e4";
                    })
                    .map((t) => {
                      const id = t?.id;
                      const tableNumber = t?.tableNumber;
                      const cap = t?.capacity;
                      return (
                        <SelectItem key={id} value={id}>
                          Bàn {tableNumber}{cap ? ` (${cap} người)` : ''}
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsCheckInDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={handleCheckIn} disabled={isUpdatingReservation}>
                {isUpdatingReservation ? 'Đang xử lý...' : 'Xác nhận check-in'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Danh sách đặt bàn
              </CardTitle>
              <CardDescription>
                Quản lý và theo dõi các đơn đặt bàn của nhà hàng
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Chọn trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value={ReservationStatus.pending}>Chờ xác nhận</SelectItem>
                    <SelectItem value={ReservationStatus.confirmed}>Đã xác nhận</SelectItem>
                    <SelectItem value={ReservationStatus.seated}>Đang ngồi</SelectItem>
                    <SelectItem value={ReservationStatus.completed}>Hoàn thành</SelectItem>
                    <SelectItem value={ReservationStatus.cancelled}>Đã hủy</SelectItem>
                    <SelectItem value={ReservationStatus.noShow}>Vắng mặt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" size="sm" onClick={refetchReservations}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Làm mới
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên khách hàng hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredReservations.slice(0, 6).map((reservation: ReservationDataColumn) => (
              <Card key={reservation.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{reservation.customerName}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {reservation.customerPhone}
                      </p>
                    </div>
                    <Badge variant="secondary" className={`flex items-center gap-1 ${reservation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        reservation.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                          reservation.status === 'seated' ? 'bg-green-100 text-green-800' :
                            reservation.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                              reservation.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-orange-100 text-orange-800'
                      }`}>
                      {reservation.status === 'pending' && <AlertCircle className="h-3 w-3" />}
                      {reservation.status === 'confirmed' && <CheckCircle className="h-3 w-3" />}
                      {reservation.status === 'seated' && <Users className="h-3 w-3" />}
                      {reservation.status === 'completed' && <CheckCircle className="h-3 w-3" />}
                      {reservation.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                      {reservation.status === 'noShow' && <Ban className="h-3 w-3" />}
                      {reservation.status === 'pending' ? 'Chờ xác nhận' :
                        reservation.status === 'confirmed' ? 'Đã xác nhận' :
                          reservation.status === 'seated' ? 'Đang ngồi' :
                            reservation.status === 'completed' ? 'Hoàn thành' :
                              reservation.status === 'cancelled' ? 'Đã hủy' : 'Vắng mặt'}
                    </Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số người:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {reservation.partySize}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày:</span>
                      <span className="font-medium">
                        {new Date(reservation.reservationDate).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Giờ:</span>
                      <span className="font-medium">
                        {new Date(reservation.reservationDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bàn:</span>
                      <span className="font-medium">
                        {reservation.tables?.table_number || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Xem
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(reservation)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(reservation.id, ReservationStatus.confirmed)}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Xác nhận
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(reservation.id, ReservationStatus.cancelled)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Hủy
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Reservation Dialog - Placeholder for now */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa đặt bàn</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin đặt bàn
            </DialogDescription>
          </DialogHeader>
          <div className="p-4">
            <p className="text-muted-foreground">Tính năng chỉnh sửa đang được phát triển...</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingReservation} onOpenChange={() => setDeletingReservation(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa đặt bàn</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa đặt bàn của &quot;{deletingReservation?.customerName}&quot; không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingReservation) {
                  // TODO: Implement delete reservation
                  toast.success('Tính năng xóa đang được phát triển');
                  setDeletingReservation(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

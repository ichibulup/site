"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/element/badge"
import {
  DataTable,
  DataTableColumnHeader
} from "@/components/element/data-table"
import { WarehouseTransfer, WarehouseTransferStatus } from "@/lib/interfaces"
import { useGetWarehouseTransfersQuery } from "@/state/api"
import {
  FileText,
  Calendar,
  ArrowRight
} from "lucide-react"
import { format } from "date-fns"

export default function WarehouseTransferListPage() {
  const { data: transfers = [], isLoading } = useGetWarehouseTransfersQuery()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case WarehouseTransferStatus.draft:
        return <Badge variant="outline">Nháp</Badge>
      case WarehouseTransferStatus.pending:
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case WarehouseTransferStatus.approved:
        return <Badge className="bg-blue-100 text-blue-800">Đã duyệt</Badge>
      case WarehouseTransferStatus.completed:
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>
      case WarehouseTransferStatus.cancelled:
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns: ColumnDef<WarehouseTransfer>[] = [
    {
      accessorKey: "transferNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã phiếu" />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {row.original.transferNumber}
        </div>
      ),
    },
    {
      accessorKey: "transferDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày chuyển" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.transferDate), "dd/MM/yyyy")}
        </div>
      ),
    },
    {
      id: "route",
      header: "Lộ trình",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium">{row.original.fromWarehouseId}</span>
            <ArrowRight className="h-3 w-3 text-muted-foreground" />
            <span className="font-medium">{row.original.toWarehouseId}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phiếu chuyển kho</h1>
          <p className="text-muted-foreground">
            Xem các phiếu chuyển kho đã tạo
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={transfers}
        search={{
          column: "transferNumber",
          placeholder: "Tìm kiếm mã phiếu..."
        }}
        // isLoading={isLoading}
      />
    </div>
  )
}

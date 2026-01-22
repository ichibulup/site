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
import { WarehouseReceipt, WarehouseReceiptStatus } from "@/lib/interfaces"
import { useGetWarehouseReceiptsQuery } from "@/state/api"
import {
  FileText,
  Calendar,
} from "lucide-react"
import { formatCurrency } from "@/lib/general/old/format-utils"
import { format } from "date-fns"

export default function WarehouseReceiptListPage() {
  const { data: receipts = [], isLoading } = useGetWarehouseReceiptsQuery()

  const getStatusBadge = (status: WarehouseReceiptStatus) => {
    switch (status) {
      case WarehouseReceiptStatus.draft:
        return <Badge variant="outline">Nháp</Badge>
      case WarehouseReceiptStatus.pending:
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case WarehouseReceiptStatus.approved:
        return <Badge className="bg-blue-100 text-blue-800">Đã duyệt</Badge>
      case WarehouseReceiptStatus.received:
        return <Badge className="bg-green-100 text-green-800">Đã nhập kho</Badge>
      case WarehouseReceiptStatus.cancelled:
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const columns: ColumnDef<WarehouseReceipt>[] = [
    {
      accessorKey: "receiptNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã phiếu" />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {row.original.receiptNumber}
        </div>
      ),
    },
    {
      accessorKey: "receiptDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày nhập" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.receiptDate), "dd/MM/yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "warehouseId", // Ideally this should be warehouse name, but API might return ID
      header: "Kho nhập",
      cell: ({ row }) => {
        // In a real app, we would look up the warehouse name or the API would return it populated
        return <div>{row.original.warehouseId}</div> 
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tổng tiền" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {formatCurrency({ value: Number(row.original.totalAmount), currency: "VND" })}
        </div>
      ),
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
          <h1 className="text-3xl font-bold tracking-tight">Phiếu nhập kho</h1>
          <p className="text-muted-foreground">
            Xem các phiếu nhập hàng đã tạo
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={receipts}
        search={{
          column: "receiptNumber",
          placeholder: "Tìm kiếm mã phiếu..."
        }}
        // isLoading={isLoading}
      />
    </div>
  )
}

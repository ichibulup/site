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
import { WarehouseIssue, WarehouseIssueStatus, WarehouseIssuePurpose } from "@/lib/interfaces"
import { useGetWarehouseIssuesQuery } from "@/state/api"
import {
  FileText,
  Calendar,
} from "lucide-react"
import { format } from "date-fns"

export default function WarehouseIssueListPage() {
  const { data: issues = [], isLoading } = useGetWarehouseIssuesQuery()

  const getStatusBadge = (status: WarehouseIssueStatus) => {
    switch (status) {
      case WarehouseIssueStatus.draft:
        return <Badge variant="outline">Nháp</Badge>
      case WarehouseIssueStatus.pending:
        return <Badge className="bg-yellow-100 text-yellow-800">Chờ duyệt</Badge>
      case WarehouseIssueStatus.approved:
        return <Badge className="bg-blue-100 text-blue-800">Đã duyệt</Badge>
      case WarehouseIssueStatus.issued:
        return <Badge className="bg-green-100 text-green-800">Đã xuất kho</Badge>
      case WarehouseIssueStatus.cancelled:
        return <Badge variant="destructive">Đã hủy</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPurposeLabel = (purpose: WarehouseIssuePurpose) => {
    switch (purpose) {
      case WarehouseIssuePurpose.cooking: return "Nấu ăn"
      case WarehouseIssuePurpose.waste: return "Hủy hàng"
      case WarehouseIssuePurpose.transfer: return "Chuyển kho"
      case WarehouseIssuePurpose.adjustment: return "Điều chỉnh"
      case WarehouseIssuePurpose.sample: return "Hàng mẫu"
      case WarehouseIssuePurpose.maintenance: return "Bảo trì"
      case WarehouseIssuePurpose.other: return "Khác"
      default: return purpose
    }
  }

  const columns: ColumnDef<WarehouseIssue>[] = [
    {
      accessorKey: "issueNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Mã phiếu" />
      ),
      cell: ({ row }) => (
        <div className="font-medium flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          {row.original.issueNumber}
        </div>
      ),
    },
    {
      accessorKey: "issueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày xuất" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.issueDate), "dd/MM/yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "warehouseId",
      header: "Kho xuất",
      cell: ({ row }) => {
        return <div>{row.original.warehouseId}</div> 
      },
    },
    {
      accessorKey: "purpose",
      header: "Mục đích",
      cell: ({ row }) => (
        <Badge variant="secondary">{getPurposeLabel(row.original.purpose)}</Badge>
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
          <h1 className="text-3xl font-bold tracking-tight">Phiếu xuất kho</h1>
          <p className="text-muted-foreground">
            Xem các phiếu xuất kho đã tạo
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={issues}
        search={{
          column: "issueNumber",
          placeholder: "Tìm kiếm mã phiếu..."
        }}
        // isLoading={isLoading}
      />
    </div>
  )
}

"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/element/badge"
import {
  DataTable,
  DataTableColumnHeader
} from "@/components/element/data-table"
import { WarehouseIssue, WarehouseIssueStatus, WarehouseIssuePurpose } from "@/lib/interfaces"
import { useGetWarehouseIssuesQuery, useDeleteWarehouseIssueMutation } from "@/state/api"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Calendar,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { format } from "date-fns"
import { toast } from "sonner"
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

export default function WarehouseIssueListPage() {
  const router = useRouter()
  const { data: issues = [], refetch } = useGetWarehouseIssuesQuery()
  const [deleteIssue, { isLoading: isDeleting }] = useDeleteWarehouseIssueMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteIssue(id).unwrap()
      toast.success("Xóa phiếu xuất thành công")
      setDeletingId(null)
      refetch()
    } catch (error) {
      console.error("Failed to delete issue:", error)
      toast.error("Có lỗi xảy ra khi xóa phiếu xuất")
    }
  }

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
    {
      id: "actions",
      cell: ({ row }) => {
        const issue = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/warehouse/inventory/issue/update/${issue.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingId(issue.id)}
                className="text-destructive focus:text-destructive"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Phiếu xuất kho</h1>
          <p className="text-muted-foreground">
            Quản lý các phiếu xuất hàng cho bếp hoặc mục đích khác
          </p>
        </div>
        <Button onClick={() => router.push("/warehouse/inventory/issue/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu xuất
        </Button>
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

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Phiếu xuất này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

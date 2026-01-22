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
import { WarehouseTransfer, WarehouseTransferStatus } from "@/lib/interfaces"
import { useGetWarehouseTransfersQuery, useDeleteWarehouseTransferMutation } from "@/state/api"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  FileText,
  Calendar,
  ArrowRight
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

export default function WarehouseTransferListPage() {
  const router = useRouter()
  const { data: transfers = [], refetch } = useGetWarehouseTransfersQuery()
  const [deleteTransfer, { isLoading: isDeleting }] = useDeleteWarehouseTransferMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteTransfer(id).unwrap()
      toast.success("Xóa phiếu chuyển thành công")
      setDeletingId(null)
      refetch()
    } catch (error) {
      console.error("Failed to delete transfer:", error)
      toast.error("Có lỗi xảy ra khi xóa phiếu chuyển")
    }
  }

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
    {
      id: "actions",
      cell: ({ row }) => {
        const transfer = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/warehouse/inventory/transfer/update/${transfer.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingId(transfer.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Phiếu chuyển kho</h1>
          <p className="text-muted-foreground">
            Quản lý việc điều chuyển hàng hóa giữa các kho
          </p>
        </div>
        <Button onClick={() => router.push("/warehouse/inventory/transfer/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu chuyển
        </Button>
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

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Phiếu chuyển này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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

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
import { WarehouseReceipt, WarehouseReceiptStatus } from "@/lib/interfaces"
import { useGetWarehouseReceiptsQuery, useDeleteWarehouseReceiptMutation } from "@/state/api"
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
import { formatCurrency } from "@/lib/general/old/format-utils"
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

export default function WarehouseReceiptListPage() {
  const router = useRouter()
  const { data: receipts = [], refetch } = useGetWarehouseReceiptsQuery()
  const [deleteReceipt, { isLoading: isDeleting }] = useDeleteWarehouseReceiptMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteReceipt(id).unwrap()
      toast.success("Xóa phiếu nhập thành công")
      setDeletingId(null)
      refetch()
    } catch (error) {
      console.error("Failed to delete receipt:", error)
      toast.error("Có lỗi xảy ra khi xóa phiếu nhập")
    }
  }

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
    {
      id: "actions",
      cell: ({ row }) => {
        const receipt = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/warehouse/inventory/receipt/update/${receipt.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingId(receipt.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Phiếu nhập kho</h1>
          <p className="text-muted-foreground">
            Quản lý các phiếu nhập hàng từ nhà cung cấp
          </p>
        </div>
        <Button onClick={() => router.push("/warehouse/inventory/receipt/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu nhập
        </Button>
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

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Phiếu nhập này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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

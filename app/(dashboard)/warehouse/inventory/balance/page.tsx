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
import { InventoryBalance } from "@/lib/interfaces"
import { useGetInventoryBalancesQuery, useDeleteInventoryBalanceMutation } from "@/state/api"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
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
import { formatCurrency } from "@/lib/general/old/format-utils"

export default function InventoryBalanceListPage() {
  const router = useRouter()
  const { data: balances = [], refetch } = useGetInventoryBalancesQuery()
  const [deleteBalance, { isLoading: isDeleting }] = useDeleteInventoryBalanceMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteBalance(id).unwrap()
      toast.success("Xóa cân bằng kho thành công")
      setDeletingId(null)
      refetch()
    } catch (error) {
      console.error("Failed to delete balance:", error)
      toast.error("Có lỗi xảy ra khi xóa cân bằng kho")
    }
  }

  const columns: ColumnDef<InventoryBalance>[] = [
    {
      accessorKey: "balanceDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày cân bằng" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.balanceDate), "dd/MM/yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "warehouseId",
      header: "Kho",
      cell: ({ row }) => <div className="text-sm">{row.original.warehouseId}</div>,
    },
    {
      accessorKey: "inventoryItemId",
      header: "Mặt hàng",
      cell: ({ row }) => <div className="text-sm">{row.original.inventoryItemId}</div>,
    },
    {
      accessorKey: "openingBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số dư đầu kỳ" />
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.openingBalance}
        </div>
      ),
    },
    {
      accessorKey: "receivedQty",
      header: "Số lượng nhập",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-green-50">
          +{row.original.receivedQty}
        </Badge>
      ),
    },
    {
      accessorKey: "issuedQty",
      header: "Số lượng xuất",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-red-50">
          -{row.original.issuedQty}
        </Badge>
      ),
    },
    {
      accessorKey: "adjustedQty",
      header: "Số lượng điều chỉnh",
      cell: ({ row }) => (
        <Badge variant="outline">
          {row.original.adjustedQty as any > 0 ? "+" : ""}{row.original.adjustedQty}
        </Badge>
      ),
    },
    {
      accessorKey: "closingBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số dư cuối kỳ" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.original.closingBalance}
        </div>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const balance = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/warehouse/inventory/balance/update/${balance.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingId(balance.id)}
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
          <h1 className="text-3xl font-bold tracking-tight">Cân bằng kho</h1>
          <p className="text-muted-foreground">
            Quản lý cân bằng hàng hóa trong các kho
          </p>
        </div>
        <Button onClick={() => router.push("/warehouse/inventory/balance/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo cân bằng mới
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={balances}
        search={{
          column: "inventoryItemId",
          placeholder: "Tìm kiếm mặt hàng..."
        }}
        // isLoading={isLoading}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bản ghi cân bằng này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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

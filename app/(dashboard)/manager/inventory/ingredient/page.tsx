"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/element/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableSortButton
} from "@/components/element/data-table"
import { IngredientDataColumn, StatsBoxProps } from "@/lib/interfaces"
import { useGetAllInventoryItemsQuery, useDeleteInventoryItemMutation } from "@/state/api"
import {
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  CheckCircle,
  XCircle,
  AlertTriangle,
  DollarSign,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { formatCurrency } from "@/lib/general/old/format-utils"
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
import { StatsBox } from "@/components/element/stats-box"

export default function IngredientListPage() {
  const router = useRouter()
  const { data: ingredients = [], isLoading, refetch } = useGetAllInventoryItemsQuery()
  const [deleteInventoryItem, { isLoading: isDeleting }] = useDeleteInventoryItemMutation()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    try {
      await deleteInventoryItem(id).unwrap()
      toast.success("Xóa nguyên liệu thành công")
      setDeletingId(null)
      refetch()
    } catch (error) {
      console.error("Failed to delete ingredient:", error)
      toast.error("Có lỗi xảy ra khi xóa nguyên liệu")
    }
  }

  const stats = useMemo(() => {
    const totalItems = ingredients.length
    const availableItems = ingredients.filter((item: any) => (item.quantity || 0) > (item.minQuantity || 0)).length
    const unavailableItems = ingredients.filter((item: any) => (item.quantity || 0) <= 0).length
    const nearExpiryItems = ingredients.filter((item: any) => {
      if (!item.expiryDate) return false
      const expiry = new Date(item.expiryDate)
      const now = new Date()
      const diffTime = expiry.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }).length
    const totalValue = ingredients.reduce((acc: number, item: any) => acc + ((item.quantity || 0) * (item.unitCost || 0)), 0)

    return {
      totalItems,
      availableItems,
      unavailableItems,
      nearExpiryItems,
      totalValue
    }
  }, [ingredients])

  const statsBoxes: StatsBoxProps[] = [
    {
      title: "Tổng nguyên liệu",
      description: "Trong kho",
      icon: Package,
      stats: stats.totalItems
    },
    {
      title: "Có sẵn",
      description: "Còn tồn kho",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.availableItems
    },
    {
      title: "Hết hàng",
      description: "Không còn tồn kho",
      icon: XCircle,
      color: "professional-red",
      stats: stats.unavailableItems
    },
    {
      title: "Sắp hết hạn",
      description: "Trong 7 ngày tới",
      icon: AlertTriangle,
      color: "professional-orange",
      stats: stats.nearExpiryItems
    },
    {
      title: "Tổng giá trị",
      description: "Tồn kho",
      icon: DollarSign,
      color: "professional-blue",
      stats: formatCurrency({ value: stats.totalValue, currency: "VND" })
    },
  ]

  const columns: ColumnDef<IngredientDataColumn>[] = [
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
      // enableResizing: false,
      size: 50,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Tên nguyên liệu" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {/* <span className="text-xs text-muted-foreground">{row.original.sku}</span> */}
        </div>
      ),
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Nhà cung cấp" />
      ),
      cell: ({ row }) => {
        const supplierName = row.original.supplier || "Chưa có";
        const initials = supplierName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {initials || "NA"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">{supplierName}</div>
            </div>
          </div>
        );
      },
			size: 300,
    },
    {
      accessorKey: "Đơn vị",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Đơn vị" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.original.unit}
        </div>
      ),
    },
    {
      accessorKey: "unitCost",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Đơn giá" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {formatCurrency({ value: row.original.unitCost || 0, currency: "VND" })}
        </div>
      ),
    },
    // {
    //   accessorKey: "expiryDate",
    //   header: () => <div className="text-right">Hạn sử dụng</div>,
    //   cell: ({ row }) => {
    //     if (!row.original.expiryDate) return <span className="text-muted-foreground">N/A</span>
    //     return (
    //       <div className="text-right">
    //         {new Date(row.original.expiryDate).toLocaleDateString("vi-VN")}
    //       </div>
    //     )
    //   },
    // },
    {
      id: "actions",
      enableResizing: false,
      size: 64,
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/manager/inventory/ingredient/update/${item.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingId(item.id)}
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
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
        {statsBoxes.map((stat, index) => (
          <StatsBox key={index} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={ingredients}
        search={{
          column: "name",
          placeholder: "Tìm kiếm nguyên liệu..."
        }}
        onCreate={() => router.push("/manager/inventory/ingredient/create")}
        onReload={refetch}
        max="name"
        // isLoading={isLoading}
      />

      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Nguyên liệu này sẽ bị xóa vĩnh viễn khỏi hệ thống.
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

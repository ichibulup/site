"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Warehouse,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Badge } from "@/components/element/badge"
import { toast } from 'sonner'

import { DataTable, DataTableColumnHeader, DataTableSortButton } from "@/components/element/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useGetWarehousesQuery, useDeleteWarehouseMutation } from "@/state/api"

interface WarehouseData {
  id: string
  name: string
  address: string | null
  contactName: string | null
  contactPhone: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function WarehousePage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingWarehouse, setDeletingWarehouse] = useState<WarehouseData | null>(null)

  const {
    data: warehouses = [],
    isLoading,
    refetch,
  } = useGetWarehousesQuery()

  const [deleteWarehouse] = useDeleteWarehouseMutation()

  const columns: ColumnDef<WarehouseData, unknown>[] = [
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Tên kho" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
                <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                <Warehouse className="h-4 w-4 text-primary" />
                </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {row.original.name}
              </div>
            </div>
          </div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span className="truncate max-w-[300px]">{row.original.address || "Chưa cập nhật"}</span>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "contact",
      header: "Liên hệ",
      cell: ({ row }) => {
        return (
          <div className="flex flex-col gap-1 text-sm">
            {row.original.contactName && (
              <div className="flex items-center gap-2">
                <User className="h-3 w-3 text-muted-foreground" />
                <span>{row.original.contactName}</span>
              </div>
            )}
            {row.original.contactPhone && (
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{row.original.contactPhone}</span>
              </div>
            )}
            {!row.original.contactName && !row.original.contactPhone && (
              <span className="text-muted-foreground italic">Chưa có thông tin</span>
            )}
          </div>
        )
      },
      size: 200,
    },
    {
      accessorKey: "isActive",
      header: "Trạng thái",
      cell: ({ row }) => {
        const isActive = row.original.isActive ?? (row.original as any).is_active;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Hoạt động
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" />
                Ngưng hoạt động
              </>
            )}
          </Badge>
        )
      },
      size: 150,
    },
    {
      id: "actions",
      enableResizing: false,
      size: 64,
      cell: ({ row }) => {
        const warehouse = row.original

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
                onClick={() => router.push(`/warehouse/change/update/${warehouse.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingWarehouse(warehouse)}
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

  const filteredWarehouses = warehouses?.filter((item: WarehouseData) => {
    return item.name.toLowerCase().includes(searchTerm.toLowerCase())
  })

  const handleDeleteWarehouse = async () => {
    if (!deletingWarehouse) return

    try {
      await deleteWarehouse(deletingWarehouse.id).unwrap();
      toast.success('Kho hàng đã được xóa!')
      setDeletingWarehouse(null)
      refetch()
    } catch (error) {
      console.error('Lỗi khi xóa kho hàng:', error)
      toast.error('Có lỗi xảy ra khi xóa kho hàng!')
    }
  }

  return (
    <>
      {!isLoading ? (
        <div className="space-y-6">
          <Card className="m-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Warehouse className="h-5 w-5" />
                Danh sách kho hàng
              </CardTitle>
              <CardDescription>
                Quản lý các kho hàng trong hệ thống
              </CardDescription>
            </CardHeader>
            <div className="flex items-center justify-between px-6 pb-6">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý kho hàng</h1>
                <p className="text-muted-foreground">
                  Quản lý thông tin và trạng thái các kho hàng
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => router.push('/warehouse/change/create')}>
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm kho mới
                </Button>
              </div>
            </div>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo tên kho..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Làm mới
                </Button>
              </div>

              <DataTable
                columns={columns}
                data={filteredWarehouses}
                search={{
                  column: "name",
                  placeholder: "Tìm kiếm tên kho..."
                }}
              />
            </CardContent>
          </Card>

          <AlertDialog open={!!deletingWarehouse} onOpenChange={() => setDeletingWarehouse(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Xóa kho hàng</AlertDialogTitle>
                <AlertDialogDescription>
                  Bạn có chắc chắn muốn xóa kho &quot;{deletingWarehouse?.name}&quot;? Hành động này không thể hoàn tác.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Hủy</AlertDialogCancel>
                <AlertDialogAction asChild>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteWarehouse}
                  >
                    Xóa
                  </Button>
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : (
        <div className="space-y-6">
          <Skeleton className="h-[400px] w-full rounded-xl" />
        </div>
      )}
    </>
  )
}

"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ColumnDef } from "@tanstack/react-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/element/badge"
// import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/element/pill-tabs"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableSortButton
} from "@/components/element/data-table"
import { InventoryItemForm } from "@/components/form/mock/inventory"
import { IngredientDataColumn, InventoryItem, StatsBoxProps } from '@/lib/interfaces'
import {
  useGetInventoryItemsQuery,
  useDeleteInventoryItemMutation,
  useGetAllInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  // useUpdateStatusInventoryItemMutation,
  // useDeleteHardInventoryItemMutation
} from "@/state/api"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Package2,
  AlertTriangle,
  Truck,
  Download,
  Upload,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Trash2,
  RefreshCw,
  MoreHorizontal,
  Package,
  DollarSign,
  Scale,
  TrendingUp,
  ShoppingCart,
  Copy,
  Warehouse,
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/formatters"
import { toast } from "sonner"
import { StatsBox } from "@/components/element/stats-box"
import Image from "next/image";

export default function IngredientPage() {
  const router = useRouter()
  const organizationId = "2c41b63e-4a3f-4e96-bb24-9781786ae2cf"
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

  const columnsold: ColumnDef<IngredientDataColumn>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
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
      accessorKey: "quantity",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số lượng" />
      ),
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.quantity} {row.original.unit}
        </div>
      ),
    },
    {
      accessorKey: "unitCost",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Đơn giá" />
      ),
      cell: ({ row }) => (
        <div>
          {formatCurrency({ value: row.original.unitCost || 0, currency: "VND" })}
        </div>
      ),
    },
    {
      accessorKey: "supplier",
      header: "Nhà cung cấp",
      cell: ({ row }) => row.original.supplier || "N/A",
    },
    {
      accessorKey: "expiryDate",
      header: "Hạn sử dụng",
      cell: ({ row }) => {
        if (!row.original.expiryDate) return <span className="text-muted-foreground">N/A</span>
        return new Date(row.original.expiryDate).toLocaleDateString("vi-VN")
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/warehouse/inventory/ingredient/update/${item.id}`)}>
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

  const columns: ColumnDef<IngredientDataColumn, unknown>[] = [
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
        <DataTableSortButton column={column} title="Nguyên liệu" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">{row.original.name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.description || "Không có mô tả"}
              </div>
            </div>
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: "supplier",
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Món ăn" />
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
        )
      },
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex items-center justify-center">
    //         {row.original.supplier || "Chưa có"}
    //       </div>
    //     );
    //   },
      size: 350,
    },
    {
      accessorKey: "unit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Đơn vị" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Badge variant="outline">{row.original.unit}</Badge>
          </div>
        );
      },
      size: 120,
    },
    // {
    //   accessorKey: "quantity",
    //   header: () => <div className="text-center">Số lượng</div>,
    //   cell: ({ row }) => {
    //     const quantity = typeof row.original.quantity === 'string'
    //       ? parseFloat(row.original.quantity)
    //       : row.original.quantity || 0;
    //     return (
    //       <div className="text-center font-medium">
    //         {quantity.toLocaleString()} {row.original.unit}
    //       </div>
    //     )
    //   },
    //   size: 120,
    // },
    {
      accessorKey: "unitCost",
      header: () => <div className="text-right">Đơn giá</div>,
      cell: ({ row }) => {
        const unitCost =
          typeof row.original.unitCost === "string"
            ? parseFloat(row.original.unitCost)
            : row.original.unitCost || 0;
        const formatted = formatCurrency({
          value: unitCost,
          currency: "VND",
        });
        return <div className="text-right font-medium">{formatted}</div>;
      },
      size: 120,
    },
    // {
    //   accessorKey: "expiry_date",
    //   header: "Hạn sử dụng",
    //   cell: ({ row }) => {
    //     const expiryDate = row.original.expiryDate;
    //     if (!expiryDate) {
    //       return (
    //         <div className="flex items-center justify-center">
    //           <span className="text-muted-foreground">Không có</span>
    //         </div>
    //       );
    //     }
    //
    //     const expiry = new Date(expiryDate);
    //     const now = new Date();
    //     const isExpired = expiry < now;
    //     const isNearExpiry =
    //       expiry < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    //
    //     return (
    //       <div className="flex items-center justify-center">
    //         <Badge
    //           variant={
    //             isExpired
    //               ? "destructive"
    //               : isNearExpiry
    //                 ? "secondary"
    //                 : "outline"
    //           }
    //         >
    //           {expiry.toLocaleDateString("vi-VN")}
    //         </Badge>
    //       </div>
    //     );
    //   },
    //   size: 120,
    // },
    {
      id: "actions",
      enableResizing: false,
      size: 64,
      cell: ({ row }) => {
        const ingredient = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button variant="ghost" size="icon" className="p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(ingredient.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  router.push(`/warehouse/inventory/ingredient/update/${ingredient.id}`)
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Package className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Kiểm tra tồn kho
              </DropdownMenuItem>
              <DropdownMenuItem>
                <TrendingUp className="mr-2 h-4 w-4" />
                Lịch sử giá
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Sao chép
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                // onClick={() => setDeletingIngredient(ingredient)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/*<div className="flex items-center justify-between">*/}
      {/*  <div>*/}
      {/*    <h1 className="text-3xl font-bold tracking-tight">Quản lý nguyên liệu</h1>*/}
      {/*    <p className="text-muted-foreground">*/}
      {/*      Danh sách và quản lý tồn kho nguyên liệu*/}
      {/*    </p>*/}
      {/*  </div>*/}
      {/*  <Button onClick={() => router.push("/warehouse/inventory/ingredient/create")}>*/}
      {/*    <Plus className="mr-2 h-4 w-4" />*/}
      {/*    Thêm nguyên liệu*/}
      {/*  </Button>*/}
      {/*</div>*/}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        max="name"
        onCreate={() => router.push("/warehouse/inventory/ingredient/create")}
        onReload={refetch}
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

export function IngredientListPage() {
  const router = useRouter()
  const { data: ingredients = [], isLoading, refetch } = useGetInventoryItemsQuery()
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
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
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
        <DataTableSortButton column={column} title="Tên nguyên liệu" />
      ),
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {/* <span className="text-xs text-muted-foreground">{row.original?.sku}</span> */}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <div className="text-right">
          <DataTableColumnHeader column={column} title="Số lượng" />
        </div>
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.original.quantity} {row.original.unit}
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
    },
    {
      accessorKey: "expiryDate",
      header: () => <div className="text-right">Hạn sử dụng</div>,
      cell: ({ row }) => {
        if (!row.original.expiryDate) return <span className="text-muted-foreground">N/A</span>
        return (
          <div className="text-right">
            {new Date(row.original.expiryDate).toLocaleDateString("vi-VN")}
          </div>
        )
      },
    },
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
              <DropdownMenuItem onClick={() => router.push(`/warehouse/inventory/ingredient/update/${item.id}`)}>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý nguyên liệu</h1>
          <p className="text-muted-foreground">
            Danh sách và quản lý tồn kho nguyên liệu
          </p>
        </div>
        <Button onClick={() => router.push("/warehouse/inventory/ingredient/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm nguyên liệu
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
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
        onCreate={() => router.push("/warehouse/inventory/ingredient/create")}
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

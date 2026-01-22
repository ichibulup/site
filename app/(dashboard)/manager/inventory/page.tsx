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
import { StatsBox } from "@/components/element/stats-box";
import {
  DataTable,
  DataTableSortButton,
  DataTableColumnHeader
} from "@/components/element/data-table"
import { InventoryItemForm } from "@/components/form/mock/inventory"
import { IngredientDataColumn, InventoryItem, StatsBoxProps } from '@/lib/interfaces'
import {
  useGetAllInventoryItemsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  // useUpdateStatusInventoryItemMutation,
  useDeleteInventoryItemMutation,
  // useDeleteHardInventoryItemMutation
} from "@/state/api"
import {
  Plus,
  Search,
  Filter,
  Edit,
  Eye,
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
  ArrowRightLeft,
  ArrowDownToLine,
  ArrowUpFromLine,
} from "lucide-react"
import { toast } from 'sonner'
import { formatCurrency } from "@/lib/utils/formatters"

export default function InventoryDashboardPage() {
  const router = useRouter()

  // Mock stats - in a real app these would come from an API
  const statsBoxes: StatsBoxProps[] = [
    {
      title: "Tổng giá trị kho",
      stats: formatCurrency({ value: 125000000, currency: "VND" }),
      description: "Tất cả kho hàng",
      color: "professional-blue",
      icon: BarChart3,
    },
    {
      title: "Sắp hết hàng",
      stats: 12,
      description: "Cần đặt hàng",
      color: "professional-yellow",
      icon: AlertTriangle,
    },
    {
      title: "Hết hàng",
      stats: 5,
      description: "Cần bổ sung gấp",
      color: "professional-red",
      icon: XCircle,
    },
    {
      title: "Sắp hết hạn",
      stats: 8,
      description: "Trong 7 ngày tới",
      color: "professional-orange",
      icon: Clock,
    },
    {
      title: "Tổng mục kho",
      stats: 1240,
      description: "Tất cả danh mục",
      icon: Package2,
    },
  ]

  const modules = [
    {
      title: "Nhập kho",
      description: "Tạo và quản lý phiếu nhập kho từ nhà cung cấp",
      icon: ArrowDownToLine,
      href: "/manager/inventory/receipt",
      color: "text-green-500",
      bgColor: "bg-green-50"
    },
    {
      title: "Xuất kho",
      description: "Tạo và quản lý phiếu xuất kho cho bếp/quầy",
      icon: ArrowUpFromLine,
      href: "/manager/inventory/issue",
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "Chuyển kho",
      description: "Điều chuyển hàng hóa giữa các kho nội bộ",
      icon: ArrowRightLeft,
      href: "/manager/inventory/transfer",
      color: "text-purple-500",
      bgColor: "bg-purple-50"
    },
    {
      title: "Cân bằng kho",
      description: "Theo dõi tồn kho cuối ngày",
      icon: Scale,
      href: "/manager/inventory/balance",
      color: "text-indigo-500",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Nguyên liệu",
      description: "Quản lý danh sách nguyên liệu và định mức",
      icon: Package2,
      href: "/manager/inventory/ingredient",
      color: "text-pink-500",
      bgColor: "bg-pink-50"
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tổng quan kho</h1>
        <p className="text-muted-foreground">
          Theo dõi báo cáo kho hàng
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statsBoxes.map((stat, index) => (
          <StatsBox key={index} {...stat} />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {modules.map((module, index) => (
          <Card 
            key={index} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => router.push(module.href)}
          >
            <CardHeader className="flex flex-row items-center gap-4">
              <div className={`p-3 rounded-lg ${module.bgColor}`}>
                <module.icon className={`w-6 h-6 ${module.color}`} />
              </div>
              <div className="space-y-1">
                <CardTitle className="text-xl">{module.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                {module.description}
              </CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}


export function InventoryXPage() {
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingIngredient, setEditingIngredient] = useState<IngredientDataColumn | null>(null)
  const [deletingIngredient, setDeletingIngredient] = useState<IngredientDataColumn | null>(null)

  // const { data: meData } = useGetMeQuery()
  const organizationId = "2c41b63e-4a3f-4e96-bb24-9781786ae2cf"
  // const organizationId = meData?.dbUser?.organizationId

  const {
    data: ingredients = [],
    isLoading,
    error,
    refetch: refetchIngredients,
  } = useGetAllInventoryItemsQuery()

  // Mutations
  const [createInventoryItem, { isLoading: isCreating }] = useCreateInventoryItemMutation()
  const [updateInventoryItem, { isLoading: isUpdating }] = useUpdateInventoryItemMutation()
  // const [updateStatusInventoryItem, { isLoading: isUpdatingStatus }] = useUpdateStatusInventoryItemMutation()
  const [deleteInventoryItem, { isLoading: isDeleting }] = useDeleteInventoryItemMutation()
  // const [deleteHardInventoryItem, { isLoading: isDeletingHard }] = useDeleteHardInventoryItemMutation()

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
      // enableResizing: false,
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
              <div className="truncate">
                {row.original.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.description || 'Không có mô tả'}
              </div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "unit",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Đơn vị" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center">
            <Badge variant="outline">
              {row.original.unit}
            </Badge>
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "quantity",
      header: () => <div className="text-right">Số lượng</div>,
      cell: ({ row }) => {
        const quantity = typeof row.original.quantity === 'string'
          ? parseFloat(row.original.quantity)
          : row.original.quantity || 0;
        return (
          <div className="text-right font-medium">
            {quantity.toLocaleString()} {row.original.unit}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "unitCost",
      header: () => <div className="text-right">Đơn giá</div>,
      cell: ({ row }) => {
        const unitCost = typeof row.original.unitCost === 'string'
          ? parseFloat(row.original.unitCost)
          : row.original.unitCost || 0;
        const formatted = formatCurrency({
          value: unitCost,
          currency: "VND"
        })
        return <div className="text-right font-medium">{formatted}</div>
      },
      size: 120,
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
        )
      },
      size: 150,
    },
    {
      accessorKey: "expiry_date",
      header: () => <div className="text-right">Hạn sử dụng</div>,
      cell: ({ row }) => {
        const expiryDate = row.original.expiryDate;
        if (!expiryDate) {
          return (
            <div className="text-right">
              <span className="text-muted-foreground">Không có</span>
            </div>
          )
        }

        const expiry = new Date(expiryDate);
        const now = new Date();
        const isExpired = expiry < now;
        const isNearExpiry = expiry < new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

        return (
          <div className="text-right">
            <Badge
              variant={isExpired ? "destructive" : isNearExpiry ? "secondary" : "outline"}
            >
              {expiry.toLocaleDateString('vi-VN')}
            </Badge>
          </div>
        )
      },
      size: 120,
    },
    {
      id: "actions",
      enableResizing: false,
      size: 64,
      cell: ({ row }) => {
        const ingredient = row.original

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
                onClick={() => navigator.clipboard.writeText(ingredient.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  setEditingIngredient(ingredient)
                  setIsDialogOpen(true)
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
                onClick={() => setDeletingIngredient(ingredient)}
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

  useEffect(() => {

  }, []);

  const filteredItems = inventoryItems.filter((item: any) => {
    const matchesSearch = (item?.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item?.supplier ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || item?.category === selectedCategory
    const matchesStatus = selectedStatus === "all" || item?.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  const stats = useMemo(() => {
    const totalItems = ingredients.length
    const lowStockItems = ingredients.filter((item: IngredientDataColumn) => {
      const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity || 0
      const minQuantity = typeof item.minQuantity === 'string' ? parseFloat(item.minQuantity) : item.minQuantity || 0
      return quantity <= minQuantity && quantity > 0
    }).length
    const outOfStockItems = ingredients.filter((item: IngredientDataColumn) => {
      const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity || 0
      return quantity === 0
    }).length
    const totalValue = ingredients.reduce((sum: number, item: IngredientDataColumn) => {
      const quantity = typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity || 0
      const unitCost = typeof item.unitCost === 'string' ? parseFloat(item.unitCost) : item.unitCost || 0
      return sum + (quantity * unitCost)
    }, 0)
    const expiringItems = ingredients.filter((item: IngredientDataColumn) => {
      if (!item.expiryDate) return false
      const expiryDate = new Date(item.expiryDate)
      const today = new Date()
      const diffDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      return diffDays <= 7 && diffDays > 0
    }).length

    return { totalItems, lowStockItems, outOfStockItems, totalValue, expiringItems }
  }, [ingredients])

  const statsBoxes: StatsBoxProps[] = useMemo(() => [
    {
      title: "Tổng mục kho",
      stats: stats.totalItems,
      description: "Tất cả danh mục",
      icon: Package2,
    },
    {
      title: "Sắp hết hàng",
      stats: stats.lowStockItems,
      description: "Cần đặt hàng",
      color: "professional-yellow",
      icon: AlertTriangle,
    },
    {
      title: "Hết hàng",
      stats: stats.outOfStockItems,
      description: "Cần bổ sung gấp",
      color: "professional-red",
      icon: XCircle,
    },
    {
      title: "Sắp hết hạn",
      stats: stats.expiringItems,
      description: "Trong 7 ngày tới",
      color: "professional-orange",
      icon: Clock,
    },
    {
      title: "Tổng giá trị",
      stats: formatCurrency({ value: stats.totalValue, currency: "VND" }),
      description: "Hàng tồn kho",
      color: "professional-blue",
      icon: BarChart3,
    },
  ], [stats])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'in-stock':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Còn hàng</Badge>
      case 'low-stock':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Sắp hết</Badge>
      case 'out-of-stock':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Hết hàng</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-800"><Clock className="w-3 h-3 mr-1" />Hết hạn</Badge>
      default:
        return <Badge variant="outline">Không xác định</Badge>
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'ingredient':
        return <Package2 className="w-4 h-4 text-blue-500" />
      case 'beverage':
        return <Package2 className="w-4 h-4 text-green-500" />
      case 'packaging':
        return <Package2 className="w-4 h-4 text-purple-500" />
      case 'equipment':
        return <Package2 className="w-4 h-4 text-orange-500" />
      case 'cleaning':
        return <Package2 className="w-4 h-4 text-red-500" />
      default:
        return <Package2 className="w-4 h-4 text-gray-500" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN')
  }

  // CRUD Handlers
  const handleCreateInventoryItem = async (itemData: any) => {
    try {
      await createInventoryItem(itemData).unwrap()
      toast.success('Tạo nguyên liệu thành công')
      setIsDialogOpen(false)
      refetchIngredients()
    } catch (error) {
      console.error('Error creating inventory item:', error)
      toast.error('Có lỗi xảy ra khi tạo nguyên liệu')
    }
  }

  const handleUpdateInventoryItem = async (itemData: any) => {
    if (!editingIngredient) return

    try {
      await updateInventoryItem({
        id: editingIngredient.id,
        data: itemData
      }).unwrap()
      toast.success('Cập nhật nguyên liệu thành công')
      setIsDialogOpen(false)
      setEditingIngredient(null)
      refetchIngredients()
    } catch (error) {
      console.error('Error updating inventory item:', error)
      toast.error('Có lỗi xảy ra khi cập nhật nguyên liệu')
    }
  }

  const handleDeleteInventoryItem = async (itemId: string) => {
    try {
      await deleteInventoryItem(itemId).unwrap()
      toast.success('Xóa nguyên liệu thành công')
      refetchIngredients()
    } catch (error) {
      console.error('Error deleting inventory item:', error)
      toast.error('Có lỗi xảy ra khi xóa nguyên liệu')
    }
  }

  // const handleToggleStatus = async (itemId: string, isActive: boolean) => {
  //   try {
  //     await updateStatusInventoryItem({
  //       id: itemId,
  //       status: { is_active: isActive }
  //     }).unwrap()
  //     toast.success(`Nguyên liệu đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`)
  //     refetchIngredients()
  //   } catch (error) {
  //     console.error('Error updating inventory item status:', error)
  //     toast.error('Có lỗi xảy ra khi cập nhật trạng thái nguyên liệu')
  //   }
  // }

  const handleFormSuccess = (data: any) => {
    if (editingIngredient) {
      handleUpdateInventoryItem(data)
    } else {
      handleCreateInventoryItem(data)
    }
  }

  const openEditDialog = (item: any) => {
    setEditingIngredient(item as any)
    setIsDialogOpen(true)
  }

  const openDeleteDialog = (item: any) => {
    setDeletingIngredient(item as any)
  }

  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
  //         <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingIngredient ? 'Chỉnh sửa nguyên liệu' : 'Thêm nguyên liệu mới'}
            </DialogTitle>
            <DialogDescription>
              {editingIngredient
                ? 'Cập nhật thông tin nguyên liệu'
                : 'Thêm mới nguyên liệu vào kho'
              }
            </DialogDescription>
          </DialogHeader>
          <InventoryItemForm
            mode={editingIngredient ? "update" : "create"}
            organizationId={organizationId}
            initialValues={editingIngredient || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setIsDialogOpen(false)
              setEditingIngredient(null)
            }}
            submitText={editingIngredient ? "Cập nhật" : "Tạo mới"}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingIngredient} onOpenChange={() => setDeletingIngredient(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nguyên liệu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nguyên liệu &quot;{deletingIngredient?.name}&quot; không? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingIngredient) {
                  handleDeleteInventoryItem(deletingIngredient.id)
                  setDeletingIngredient(null)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {!isLoading ? (
        <>
          <div className="space-y-6">
            {/* <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Quản lý kho</h1>
                <p className="text-muted-foreground">
                  Theo dõi và quản lý hàng tồn kho
                </p>
              </div>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm mục kho
              </Button>
            </div> */}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {statsBoxes.map((stat, index) => (
                <StatsBox key={index} {...stat} />
              ))}
            </div>

            <Tabs defaultValue="inventory" className="space-y-4">
              <TabsList>
                <TabsTrigger value="inventory">Hàng tồn kho</TabsTrigger>
                <TabsTrigger value="orders">Đơn đặt hàng</TabsTrigger>
                <TabsTrigger value="reports">Báo cáo</TabsTrigger>
              </TabsList>

              <TabsContent value="inventory" className="space-y-4">
                <DataTable
                  columns={columns}
                  data={ingredients}
                  search={{
                    column: "name",
                    placeholder: "Tìm kiếm tên nguyên liệu..."
                  }}
                  max="name"
                  filter={[
                    {
                      column: "unit",
                      title: "Đơn vị",
                      options: [
                        {
                          label: "Gram",
                          value: "gram",
                        },
                        {
                          label: "Kilogram",
                          value: "kg",
                        },
                        {
                          label: "Liter",
                          value: "liter",
                        },
                      ]
                    },
                    {
                      column: "supplier",
                      title: "Nhà cung cấp",
                      options: [
                        {
                          label: "Có nhà cung cấp",
                          value: true,
                        },
                        {
                          label: "Chưa có",
                          value: false,
                        },
                      ]
                    }
                  ]}
                  onCreate={() => {
                    setEditingIngredient(null)
                    setIsDialogOpen(true)
                  }}
                  onReload={refetchIngredients}
                  onUpdate={(item: any) => {
                    setEditingIngredient(item)
                    setIsDialogOpen(true)
                  }}
                />
                <Card>
                  <CardHeader>
                    <CardTitle>Danh sách hàng tồn kho</CardTitle>
                    <CardDescription>
                      Quản lý tất cả các mục trong kho
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Tìm kiếm theo tên hoặc nhà cung cấp..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả danh mục</SelectItem>
                          <SelectItem value="ingredient">Nguyên liệu</SelectItem>
                          <SelectItem value="beverage">Đồ uống</SelectItem>
                          <SelectItem value="packaging">Bao bì</SelectItem>
                          <SelectItem value="equipment">Thiết bị</SelectItem>
                          <SelectItem value="cleaning">Vệ sinh</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Tất cả trạng thái</SelectItem>
                          <SelectItem value="in-stock">Còn hàng</SelectItem>
                          <SelectItem value="low-stock">Sắp hết</SelectItem>
                          <SelectItem value="out-of-stock">Hết hàng</SelectItem>
                          <SelectItem value="expired">Hết hạn</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                      // onClick={() => refetch()}
                      >
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Làm mới
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Xuất báo cáo
                      </Button>
                    </div>

                    <div className="grid gap-4">
                      {filteredItems.map((item: any) => (
                        <Card key={item.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(item.category)}
                                <div>
                                  <h3 className="font-semibold">{item.name}</h3>
                                  <p className="text-sm text-muted-foreground">{item.supplier}</p>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold">{item.currentStock} {item.unit}</div>
                                <div className="text-xs text-muted-foreground">Hiện tại</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium">{formatCurrency({ value: item.unitCost ?? 0, currency: "VND" })}</div>
                                <div className="text-xs text-muted-foreground">Đơn giá</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm font-medium">{formatCurrency({ value: item.totalValue ?? 0, currency: "VND" })}</div>
                                <div className="text-xs text-muted-foreground">Tổng giá trị</div>
                              </div>
                              <div className="text-center">
                                <div className="text-sm">{item.location}</div>
                                <div className="text-xs text-muted-foreground">Vị trí</div>
                              </div>
                              <div>
                                {getStatusBadge(item.status)}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDialog(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => openDeleteDialog(item)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="mt-4">
                            <div className="flex justify-between text-sm mb-1">
                              <span>Mức tồn kho</span>
                              <span>{item.currentStock} / {item.maxThreshold} {item.unit}</span>
                            </div>
                            <Progress
                              value={((item.maxThreshold ?? 0) > 0 && (item.currentStock ?? 0) >= 0)
                                ? ((item.currentStock ?? 0) / (item.maxThreshold ?? 1)) * 100
                                : 0}
                              className="h-2"
                            />
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Đơn đặt hàng</CardTitle>
                    <CardDescription>
                      Quản lý các đơn đặt hàng từ nhà cung cấp
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Chưa có đơn đặt hàng</h3>
                      <p className="text-muted-foreground mb-4">
                        Tạo đơn đặt hàng mới để bổ sung hàng tồn kho
                      </p>
                      <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tạo đơn đặt hàng
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Báo cáo kho</CardTitle>
                    <CardDescription>
                      Thống kê và phân tích hàng tồn kho
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Báo cáo đang phát triển</h3>
                      <p className="text-muted-foreground">
                        Tính năng báo cáo chi tiết sẽ được cập nhật sớm
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
              <Skeleton className="h-36 rounded-xl" />
            </div>
            <div className="grid grid-cols-12 gap-1">
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
              <Skeleton className="h-9 rounded-md" />
            </div>
            <Skeleton className="h-screen w-full rounded-xl" />
          </div>
        </>
      )}
    </>
  )
}

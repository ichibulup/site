"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image";
import { useRouter } from "next/navigation";
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
  Eye,
  Utensils,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
import { toast } from 'sonner'

// Import form components and services
import {
  useGetAllMenuItemsQuery,
  useUpdateMenuItemMutation,
  useDeleteMenuItemMutation,
  useBulkToggleMenuItemsAvailabilityMutation
} from '@/state/api';
import { DataTable, DataTableColumnHeader, DataTableSortButton } from "@/components/element/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/lib/utils/formatters";
import { Switch } from "@/components/ui/switch";
import { MenuItemDataColumn, StatsBoxProps } from "@/lib/interfaces";
import { StatsBox } from "@/components/element/stats-box";

export default function MenuItemsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAvailability, setSelectedAvailability] = useState<string>("all")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingMenuItem, setDeletingMenuItem] = useState<MenuItemDataColumn | null>(null)
  const [selectedRows, setSelectedRows] = useState<MenuItemDataColumn[]>([])
  const [isBulkOperationLoading, setIsBulkOperationLoading] = useState(false)

  const {
    data: menuItems = [],
    error,
    isLoading,
    refetch: refetchMenuItems
  } = useGetAllMenuItemsQuery();

  // Sử dụng mutation hooks
  const [updateMenuItemMutation] = useUpdateMenuItemMutation();
  const [deleteMenuItemMutation] = useDeleteMenuItemMutation();
  const [bulkToggleAvailabilityMutation] = useBulkToggleMenuItemsAvailabilityMutation();

  const columns: ColumnDef<MenuItemDataColumn, unknown>[] = [
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
      size: 50, // Width cho checkbox column
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Món ăn" />
        <DataTableSortButton column={column} title="Món ăn" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {row.original.imageUrl ? (
                <Image
                  className="h-9 w-9 rounded-md object-cover"
                  src={row.original.imageUrl}
                  alt="avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    FD
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {row.original.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.description}
              </div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Danh mục n Phân loại" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {row.original.category.imageUrl ? (
                <Image
                  className="h-9 w-9 rounded-md object-cover bg-muted"
                  src={row.original.category.imageUrl}
                  // src={"/logo/logo.png"}
                  alt="avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    FD
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {row.original.category.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.category.description ? (
                  `${row.original.category.slug} | ${row.original.category.description}`
                ) : (row.original.category.slug)}
              </div>
            </div>
          </div>
        )
      },
      // filterFn: (row, id, value) => {
      //   return value.includes(row.getValue(id))
      // },
      size: 300,
    },
    // {
    //   accessorKey: "category",
    //   header: ({ column }) => (
    //     <DataTableColumnHeader column={column} title="" />
    //   ),
    //   cell: ({ row }) => {
    //     return (
    //       <div className="flex items-center justify-center">
    //         {row.original.category?.name || "Không có danh mục"}
    //       </div>
    //     )
    //   },
    //   filterFn: (row, id, value) => {
    //     return value.includes(row.getValue(id))
    //   },
    //   size: 140, // Width cho User column
    // },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <Switch
              checked={row.original.isAvailable}
              onCheckedChange={() => handleToggleAvailability(row.original)}
            />
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 90, // Width cho Status column
    },
    {
      accessorKey: "counter",
      header: () => <div className="text-center">Lượt order</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.displayOrder}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 90,
    },
    {
      accessorKey: "amount",
      // header: "Amount",
      header: () => <div className="text-center">Giá order</div>,
      cell: ({ row }) => {
        // const amount = parseFloat(row.getValue("amount"))
        // const formatted = new Intl.NumberFormat("vi-VN", {
        //   style: "currency",
        //   currency: "VND",
        // }).format(amount)
        const formatted = formatCurrency({
          value: row.original.price,
          // value: row.getValue("amount"),
          currency: "VND"
        })

        return <div className="text-right font-medium">{formatted}</div>
      },
      size: 120, // Width cho Amount column
    },
    {
      id: "actions",
      // accessorKey: "actions",
      // header: () => <div className="text-right">Actions</div>,
      enableResizing: false,
      size: 64, // Width cho Actions column
      cell: ({ row }) => {
        const payment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0" // h-8 w-8
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/manager/menu/item/update/${payment.id}`)}
              >
                <Edit className="mr-2 h-4 w-4"/>
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleToggleAvailability(payment)}
              >
                {payment.isAvailable ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4"/>
                    Tắt trạng thái
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4"/>
                    Bật trạng thái
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Utensils className="mr-2 h-4 w-4"/>
                Xem công thức
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="mr-2 h-4 w-4"/>
                Lịch sử thay đổi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => openDeleteDialog(payment)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4"/>
                Xóa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Pending</DropdownMenuItem>
                    <DropdownMenuItem>Confirmed</DropdownMenuItem>
                    <DropdownMenuItem>Preparing</DropdownMenuItem>
                    <DropdownMenuItem>Ready</DropdownMenuItem>
                    <DropdownMenuItem>Served</DropdownMenuItem>
                    <DropdownMenuItem>Completed</DropdownMenuItem>
                    <DropdownMenuItem>Cancelled</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  // Xử lý lỗi từ RTK Query
  useEffect(() => {
    if (error) {
      console.log('Lỗi khi tải menu items:', error);
      let errorMessage = 'Có lỗi xảy ra khi tải danh sách món ăn!';

      if ('status' in error) {
        if (error.status === 'FETCH_ERROR') {
          errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra server backend có đang chạy không!';
        } else if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!';
        } else if (error.status === 404) {
          errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra cấu hình backend!';
        } else if (error.status === 500) {
          errorMessage = 'Lỗi server nội bộ. Vui lòng thử lại sau!';
        }
      }

      toast.error(errorMessage);
    }
  }, [error]);

  const filteredMenuItems = menuItems.filter((item: MenuItemDataColumn) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesAvailability = selectedAvailability === "all" ||
      (selectedAvailability === "available" && item.isAvailable) ||
      (selectedAvailability === "unavailable" && !item.isAvailable)

    return matchesSearch && matchesAvailability
  })

  const stats = useMemo(() => {
    const totalItems = menuItems.length
    const availableItems = menuItems.filter((item: MenuItemDataColumn) => item.isAvailable).length
    const unavailableItems = menuItems.filter((item: MenuItemDataColumn) => !item.isAvailable).length
    // const vegetarianItems = menuItems.filter((item: MenuItem) => item.is_vegetarian || false).length
    // const veganItems = menuItems.filter((item: MenuItem) => item.is_vegan || false).length
    const totalValue = menuItems.reduce((sum: number, item: MenuItemDataColumn) => {
      const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price
      return sum + (price || 0)
    }, 0)

    return { totalItems, availableItems, unavailableItems, totalValue } // , vegetarianItems, veganItems
  }, [menuItems])

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false)
    setDeletingMenuItem(null)
    refetchMenuItems()
    toast.success('Món ăn đã được xóa!')
  }

  const openDeleteDialog = (menuItem: MenuItemDataColumn) => {
    setDeletingMenuItem(menuItem)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteMenuItem = async () => {
    if (!deletingMenuItem) return
    
    try {
      await deleteMenuItemMutation(deletingMenuItem.id).unwrap()
      handleDeleteSuccess()
    } catch (error) {
      console.error('Lỗi khi xóa món ăn:', error)
      toast.error('Có lỗi xảy ra khi xóa món ăn!')
    }
  }

  // Bulk Operations
  // const handleBulkUpdate = async (updates: any) => {
  //   if (selectedRows.length === 0) {
  //     toast.error('Vui lòng chọn ít nhất một món ăn!')
  //     return
  //   }
  //
  //   setIsBulkOperationLoading(true)
  //   try {
  //     const bulkData = {
  //       ids: selectedRows.map(item => item.id),
  //       updates
  //     }
  //     await bulkUpdateMenuItemsMutation(bulkData).unwrap()
  //     setSelectedRows([])
  //     refetchMenuItems()
  //     toast.success(`Đã cập nhật ${selectedRows.length} món ăn!`)
  //   } catch (error) {
  //     console.error('Lỗi khi cập nhật hàng loạt:', error)
  //     toast.error('Có lỗi xảy ra khi cập nhật hàng loạt!')
  //   } finally {
  //     setIsBulkOperationLoading(false)
  //   }
  // }

  const handleBulkToggleAvailability = async (isAvailable: boolean) => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một món ăn!')
      return
    }

    setIsBulkOperationLoading(true)
    try {
      const bulkData = {
        ids: selectedRows.map(item => item.id),
        isAvailable: isAvailable
      }
      await bulkToggleAvailabilityMutation(bulkData).unwrap()
      setSelectedRows([])
      refetchMenuItems()
      toast.success(`Đã ${isAvailable ? 'bật' : 'tắt'} ${selectedRows.length} món ăn!`)
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái hàng loạt:', error)
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái!')
    } finally {
      setIsBulkOperationLoading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedRows.length === 0) {
      toast.error('Vui lòng chọn ít nhất một món ăn!')
      return
    }

    setIsBulkOperationLoading(true)
    try {
      // Delete items one by one (since there's no bulk delete endpoint)
      const deletePromises = selectedRows.map(item => 
        deleteMenuItemMutation(item.id).unwrap()
      )
      await Promise.all(deletePromises)
      setSelectedRows([])
      refetchMenuItems()
      toast.success(`Đã xóa ${selectedRows.length} món ăn!`)
    } catch (error) {
      console.error('Lỗi khi xóa hàng loạt:', error)
      toast.error('Có lỗi xảy ra khi xóa hàng loạt!')
    } finally {
      setIsBulkOperationLoading(false)
    }
  }

  // Toggle availability for single item
  const handleToggleAvailability = async (menuItem: MenuItemDataColumn) => {
    try {
      await updateMenuItemMutation({
        id: menuItem.id,
        data: { isAvailable: !menuItem.isAvailable }
      }).unwrap()
      refetchMenuItems()
      toast.success(`Đã ${!menuItem.isAvailable ? 'bật' : 'tắt'} món ăn!`)
    } catch (error) {
      console.error('Lỗi khi thay đổi trạng thái:', error)
      toast.error('Có lỗi xảy ra khi thay đổi trạng thái!')
    }
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

  const statsBox: StatsBoxProps[] = [
    {
      title: "Tổng số món",
      description: "Trong menu",
      icon: Utensils,
      // color: "blue",
      stats: stats.totalItems
    },
    {
      title: "Có sẵn",
      description: "Đang bán",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.availableItems
    },
    {
      title: "Hết hàng",
      description: "Tạm dừng bán",
      icon: XCircle,
      color: "professional-red",
      stats: stats.unavailableItems
    },
    {
      title: "Đồ ăn chay",
      description: "Món chay",
      icon: Utensils,
      color: "professional-blue",
      stats: 123
    },
    {
      title: "Tổng giá",
      description: "Các món ăn",
      icon: DollarSign,
      color: "professional-orange",
      stats: formatCurrency({ value: stats.totalValue, currency: "VND" })
    },
  ]

  return (
    <>
      {!isLoading ? (
        <>
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {statsBox.map((box, index) => (
                <StatsBox
                  key={index}
                  title={box.title}
                  description={box.description}
                  icon={box.icon}
                  color={box.color}
                  stats={box.stats}
                />
              ))}
            </div>

            {/* Bulk Operations */}
            {selectedRows.length > 0 && (
              <Card className="mb-4">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        Đã chọn {selectedRows.length} món ăn
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkToggleAvailability(true)}
                        disabled={isBulkOperationLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Bật tất cả
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleBulkToggleAvailability(false)}
                        disabled={isBulkOperationLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Tắt tất cả
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={isBulkOperationLoading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Xóa tất cả
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedRows([])}
                      >
                        Hủy chọn
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm món ăn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={selectedAvailability} onValueChange={setSelectedAvailability}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trạng thái</SelectItem>
                  <SelectItem value="available">Đang kinh doanh</SelectItem>
                  <SelectItem value="unavailable">Ngừng kinh doanh</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={() => refetchMenuItems()}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div> */}

            <DataTable
              columns={columns}
              data={menuItems}
              // order={["select", "menu-item"]}
              search={{
                column: "name",
                placeholder: "Tìm kiếm tên món ăn..."
              }}
              max="name"
              onCreate={() => router.push('/manager/menu/item/create')}
              // isLoading={isLoading}
              filter={[
                {
                  column: "category",
                  title: "Danh mục",
                  options: [
                    {
                      label: "Món Chính",
                      value: "main",
                    },
                    {
                      label: "Đồ Uống",
                      value: "drink",
                    },
                  ]
                },
                {
                  column: "status",
                  title: "Trạng thái",
                  options: [
                    {
                      label: "Có sẵn",
                      value: true,
                    },
                    {
                      label: "Hết hàng",
                      value: false,
                    },
                  ]
                }
              ]}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xóa món</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa &quot;{deletingMenuItem?.name}&quot;? Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction asChild>
                    <Button
                      variant="destructive"
                      onClick={handleDeleteMenuItem}
                    >
                      Xóa
                    </Button>
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
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

            <Skeleton className="h-screen w-full rounded-xl"/>
          </div>
        </>
      )}
    </>
  )
}

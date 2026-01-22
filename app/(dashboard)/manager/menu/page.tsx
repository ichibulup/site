"use client"

import React, { useState, useEffect, useMemo } from "react"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Menu as MenuIcon,
  Calendar,
  CheckCircle,
  XCircle,
  RefreshCw,
  Download, Utensils, Clock, DollarSign
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from 'sonner'
import { ColumnDef } from "@tanstack/react-table";

// Import form components and services
import { DataTable, DataTableColumnHeader, DataTableSortButton } from "@/components/element/data-table";
import { useAppDispatch } from '@/state/redux';
import { formatCurrency } from "@/lib/general/old/format-utils";
import { MenuDataColumn, StatsBoxProps, Menu } from "@/lib/interfaces";
import {
  useGetAllMenusQuery,
  useUpdateMenuMutation,
  useDeleteMenuMutation,
} from "@/state/api";
import { StatsBox } from "@/components/element/stats-box";

export default function MenusPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("")

  const organizationId = "2c41b63e-4a3f-4e96-bb24-9781786ae2cf"

  const [deletingMenu, setDeletingMenu] = useState<MenuDataColumn | null>(null)
  // const [isLoading, setIsLoading] = useState(true)

  const {
    data: menus = [],
    error,
    isLoading,
    refetch: refetchMenus
  } = useGetAllMenusQuery(organizationId ? { organizationId } : undefined);

  // Mutations
  const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation();
  const [deleteMenu, { isLoading: isDeleting }] = useDeleteMenuMutation();

  const columns: ColumnDef<MenuDataColumn, unknown>[] = [
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
        // <DataTableColumnHeader column={column} title="Món ăn" />
        <DataTableSortButton column={column} title="Thực đơn" />
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
                    CY
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
      size: 300, // Width cho Profile column
    },
    {
      accessorKey: "organization",
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Món ăn" />
        <DataTableSortButton column={column} title="Tổ chức" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {row.original.organization.logoUrl ? (
                <Image
                  className="h-9 w-9 rounded-md object-cover"
                  src={row.original.organization.logoUrl}
                  alt="avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    OR
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {row.original.organization.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.organization.description}
              </div>
            </div>
          </div>
        )
      },
      size: 300, // Width cho Profile column
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <Switch 
              checked={row.original.isActive} 
              onCheckedChange={(checked) => handleToggleStatus(row.original.id, checked)}
              disabled={isUpdating}
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
      header: () => <div className="text-right">Số món ăn</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
            {row.original._count?.items}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 90,
    },
    {
      accessorKey: "counter",
      header: () => <div className="text-right">Lượt order</div>,
      cell: ({ row }) => {
        return (
          <div className="text-right font-medium">
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
      id: "actions",
      // accessorKey: "actions",
      // header: () => <div className="text-right">Actions</div>,
      enableResizing: false,
      size: 64, // Width cho Actions column
      cell: ({ row }) => {
        const r = row.original

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
                onClick={() => navigator.clipboard.writeText(r.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/manager/menu/update/${r.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem>
                <MenuIcon className="mr-2 h-4 w-4" />
                Quản lý thực đơn
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="mr-2 h-4 w-4" />
                Lịch sử thay đổi
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDeleteDialog(r)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
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

  const dispatch = useAppDispatch();

  useEffect(() => {

  }, [])

  const filteredMenus = menus.filter((menu: MenuDataColumn) => {
    return menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (menu.description && menu.description.toLowerCase().includes(searchTerm.toLowerCase()))
  })

  const stats = useMemo(() => {
    const totalMenus = menus.length
    const activeMenus = menus.filter((m: MenuDataColumn) => m.isActive).length
    const inactiveMenus = menus.filter((m: MenuDataColumn) => !m.isActive).length
    const totalMenuItems = menus.reduce((sum: number, menu: MenuDataColumn) => sum + (menu._count?.items || 0), 0)

    return { totalMenus, activeMenus, inactiveMenus, totalMenuItems }
  }, [menus])

  const handleDeleteSuccess = () => {
    setDeletingMenu(null)
    toast.success('Menu đã được xóa!')
  }

  const openDeleteDialog = (menu: MenuDataColumn) => {
    setDeletingMenu(menu)
  }

  const handleDeleteMenu = async (menuId: string) => {
    try {
      await deleteMenu(menuId).unwrap();
      toast.success('Xóa menu thành công');
      refetchMenus();
    } catch (error) {
      console.error('Error deleting menu:', error);
      toast.error('Có lỗi xảy ra khi xóa menu');
    }
  };

  const handleToggleStatus = async (menuId: string, isActive: boolean) => {
    try {
      await updateMenu({
        id: menuId,
        data: { isActive: isActive }
      }).unwrap();
      toast.success(`Menu đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
      refetchMenus();
    } catch (error) {
      console.error('Error updating menu status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái menu');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  const statsBox: StatsBoxProps[] = [
    {
      title: "Tổng số menu",
      description: "Tất cả menu trong nhà hàng",
      icon: MenuIcon,
      // color: "professional-green",
      stats: stats.totalMenus
    },
    {
      title: "Menu đang hoạt động",
      description: "Hiển thị cho khách hàng",
      icon: CheckCircle,
      color: "professional-green",
      stats: stats.activeMenus
    },
    {
      title: "Menu tạm dừng",
      description: "Không hiển thị cho khách",
      icon: XCircle,
      color: "professional-red",
      stats: stats.inactiveMenus
    },
    {
      title: "Tổng số món ăn",
      description: "Tất cả món trong các menu",
      icon: MenuIcon,
      color: "professional-blue",
      stats: stats.totalMenuItems
    },
  ]

  return (
    <div className="space-y-6">
      {/*<div className="flex items-center justify-between">*/}
      {/*  <div>*/}
      {/*    <h1 className="text-3xl font-bold tracking-tight">Quản lý menu</h1>*/}
      {/*    <p className="text-muted-foreground">*/}
      {/*      Quản lý các menu và danh mục món ăn trong nhà hàng*/}
      {/*    </p>*/}
      {/*  </div>*/}
      {/*  <div className="flex gap-2">*/}
      {/*    <Button variant="outline">*/}
      {/*      <Download className="mr-2 h-4 w-4" />*/}
      {/*      Xuất báo cáo*/}
      {/*    </Button>*/}
      {/*    <Button onClick={openCreateDialog}>*/}
      {/*      <Plus className="mr-2 h-4 w-4" />*/}
      {/*      Thêm menu*/}
      {/*    </Button>*/}
      {/*  </div>*/}
      {/*</div>*/}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
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

      <DataTable
        columns={columns}
        data={menus}
        search={{
          column: "name",
          placeholder: "Tìm kiếm thực đơn..."
        }}
        max="name"
        filter={[]}
        onCreate={() => router.push('/manager/menu/create')}
        onReload={refetchMenus}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMenu} onOpenChange={() => setDeletingMenu(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa menu</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa menu &quot;{deletingMenu?.name}&quot; không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (deletingMenu) {
                  await handleDeleteMenu(deletingMenu.id);
                  setDeletingMenu(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

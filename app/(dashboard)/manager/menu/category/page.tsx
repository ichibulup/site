'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import {
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  FolderTree,
  Clock,
  Utensils
} from 'lucide-react';
import {
  DataTable,
  DataTableSortButton
} from '@/components/element/data-table';
import { toast } from 'sonner';
import { CategoryDataColumn } from '@/lib/interfaces';
import {
  useGetAllCategoriesQuery,
  useUpdateStatusCategoryMutation,
  useDeleteCategoryMutation,
  useDeleteHardCategoryMutation
} from "@/state/api";

export default function CategoriesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingCategory, setDeletingCategory] = useState<CategoryDataColumn | null>(null);

  const {
    data: categories = [],
    error,
    isLoading,
    refetch: refetchCategories
  } = useGetAllCategoriesQuery();

  // Mutations
  const [updateStatusCategory, { isLoading: isUpdatingStatus }] = useUpdateStatusCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [deleteHardCategory, { isLoading: isDeletingHard }] = useDeleteHardCategoryMutation();

  const columns: ColumnDef<CategoryDataColumn, unknown>[] = [
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
        <DataTableSortButton column={column} title="Danh mục" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {row.original.imageUrl ? (
                <Image
                  className="h-9 w-9 rounded-md object-cover bg-muted"
                  src={row.original.imageUrl}
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
                {row.original.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.description ? (
                  `${row.original.slug} | ${row.original.description}`
                ) : (row.original.slug)}
              </div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "parent",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Phụ thuộc" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {row.original.parent && row.original.parent.imageUrl ? (
                <Image
                  className="h-9 w-9 rounded-md object-cover bg-muted"
                  src={row.original.parent.imageUrl}
                  // src={"/logo/logo.png"}
                  alt="avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    {row.original.parent ? "FD" : "KO"}
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {row.original.parent ? (
                  `${row.original.parent.name}`
                ) : "Không có"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.parent ? (
                  `${row.original.parent.slug}`
                ) : "null"}
              </div>
            </div>
          </div>
        )
      },
      size: 300,
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
              disabled={isUpdatingStatus}
            />
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 90,
    },
    {
      accessorKey: "items",
      header: () => <div className="text-center">Số món ăn</div>,
      cell: ({ row }) => (
        <div className="text-center">
          {row.original._count?.menuItems}
        </div>
      ),
      size: 90
    },
    {
      accessorKey: "counter",
      header: () => <div className="text-center">Lượt order</div>,
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.displayOrder}
        </div>
      ),
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
      size: 64,
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
                onClick={() => router.push(`/manager/menu/category/${r.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {/*<DropdownMenuItem*/}
              {/*  onClick={() => handleToggleAvailability(r)}*/}
              {/*>*/}
              {/*  {r.is_available ? (*/}
              {/*    <>*/}
              {/*      <XCircle className="mr-2 h-4 w-4" />*/}
              {/*      Tắt trạng thái*/}
              {/*    </>*/}
              {/*  ) : (*/}
              {/*    <>*/}
              {/*      <CheckCircle className="mr-2 h-4 w-4" />*/}
              {/*      Bật trạng thái*/}
              {/*    </>*/}
              {/*  )}*/}
              {/*</DropdownMenuItem>*/}
              <DropdownMenuItem>
                <Utensils className="mr-2 h-4 w-4" />
                Xem công thức
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="mr-2 h-4 w-4" />
                Lịch sử thay đổi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeletingCategory(r)}
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

  const handleDeleteHardCategory = async (categoryId: string) => {
    try {
      await deleteHardCategory(categoryId).unwrap();
      toast.success('Xóa vĩnh viễn danh mục thành công');
      refetchCategories();
    } catch (error) {
      console.error('Error hard deleting category:', error);
      toast.error('Có lỗi xảy ra khi xóa vĩnh viễn danh mục');
    }
  };

  const handleToggleStatus = async (categoryId: string, isActive: boolean) => {
    try {
      await updateStatusCategory({
        id: categoryId,
        status: { isActive }
      }).unwrap();
      toast.success(`Danh mục đã được ${isActive ? 'kích hoạt' : 'vô hiệu hóa'}`);
      refetchCategories();
    } catch (error) {
      console.error('Error updating category status:', error);
      toast.error('Có lỗi xảy ra khi cập nhật trạng thái danh mục');
    }
  };

  return (
    <>
      <AlertDialog open={!!deletingCategory} onOpenChange={() => setDeletingCategory(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa danh mục</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa danh mục &quot;{deletingCategory?.name}&quot; không? 
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingCategory) {
                  handleDeleteHardCategory(deletingCategory.id);
                  setDeletingCategory(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        <DataTable
          columns={columns}
          data={categories}
          search={{
            column: "name",
            placeholder: "Tìm kiếm danh mục..."
          }}
          max="name"
          filter={[]}
          onCreate={() => {
            router.push('/manager/menu/category/create');
          }}
          onChange={() => {}}
          onReload={refetchCategories}
          onDownload={() => {}}
          onUpdate={(category: CategoryDataColumn) => {
            router.push(`/manager/menu/category/${category.id}`);
          }}
        />
      </div>
    </>
  );
}

'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
} from 'lucide-react';
import { DataTable, DataTableSortButton } from '@/components/element/data-table';
import { toast } from 'sonner';
import { Restaurant } from '@/lib/interfaces';
import {
  useGetAllRestaurantsQuery,
  useDeleteRestaurantMutation,
} from "@/state/api";
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
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function RestaurantListPage() {
  const router = useRouter();
  const [deletingRestaurant, setDeletingRestaurant] = useState<Restaurant | null>(null);

  const {
    data: restaurants = [],
    isLoading,
    refetch: refetchRestaurants
  } = useGetAllRestaurantsQuery();

  const [deleteRestaurant, { isLoading: isDeleting }] = useDeleteRestaurantMutation();

  const columns: ColumnDef<Restaurant, unknown>[] = [
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
        <DataTableSortButton column={column} title="Tên nhà hàng" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {row.original.logoUrl ? (
                <Image
                  className="h-9 w-9 rounded-md object-cover"
                  src={row.original.logoUrl || "/logo/logo.png"}
                  alt="avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium">
                {row.original.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.code}
              </div>
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm">
          {row.original.address}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
          active: { label: 'Hoạt động', variant: 'default' },
          inactive: { label: 'Không hoạt động', variant: 'secondary' },
          maintenance: { label: 'Bảo trì', variant: 'outline' },
          closed: { label: 'Đóng cửa', variant: 'destructive' },
        };
        const status = statusMap[row.original.status] || { label: row.original.status, variant: 'outline' };
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
      size: 120,
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Ngày tạo" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy', { locale: vi })}
        </div>
      ),
      size: 120,
    },
    {
      id: "actions",
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
                  className="p-0"
                >
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(r.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/administrator/restaurant/${r.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingRestaurant(r)}
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

  const handleDeleteRestaurant = async (restaurantId: string) => {
    try {
      await deleteRestaurant(restaurantId).unwrap();
      toast.success('Nhà hàng đã được xóa thành công');
      refetchRestaurants();
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      toast.error('Có lỗi xảy ra khi xóa nhà hàng');
    }
  };

  return (
    <>
      <AlertDialog open={!!deletingRestaurant} onOpenChange={() => setDeletingRestaurant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhà hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhà hàng &quot;{deletingRestaurant?.name}&quot; không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingRestaurant) {
                  handleDeleteRestaurant(deletingRestaurant.id);
                  setDeletingRestaurant(null);
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
          data={restaurants}
          search={{
            column: "name",
            placeholder: "Tìm kiếm nhà hàng..."
          }}
          max="name"
          filter={[]}
          onCreate={() => {
            router.push('/administrator/restaurant/create');
          }}
          onChange={() => {}}
          onReload={refetchRestaurants}
          onDownload={() => {}}
          // onUpdate={(restaurant: Restaurant) => {
          //   router.push(`/administrator/restaurant/${restaurant.id}`);
          // }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Danh sách nhà hàng
            </CardTitle>
            <CardDescription>
              Quản lý các nhà hàng trong hệ thống
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}

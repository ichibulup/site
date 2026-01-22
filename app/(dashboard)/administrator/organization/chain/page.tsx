'use client';

import React, { Suspense, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { DataTable, DataTableSortButton } from '@/components/element/data-table';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Edit, MoreHorizontal, Trash2, Building2 } from 'lucide-react';
import { RestaurantChain } from '@/lib/interfaces';
import { useDeleteRestaurantChainMutation, useGetRestaurantChainsQuery } from '@/state/api';
import { unwrapApiData } from '@/lib/utils/formatters';

type ChainRow = RestaurantChain & {
  organization?: {
    id: string;
    name: string;
    code: string;
  };
  _count?: {
    restaurants: number;
  };
};

function RestaurantChainListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId') || undefined;
  const [deletingChain, setDeletingChain] = useState<ChainRow | null>(null);

  const { data, refetch } = useGetRestaurantChainsQuery(
    organizationId ? { organizationId } : undefined
  );
  const [deleteChain] = useDeleteRestaurantChainMutation();

  const chains = useMemo(
    () => unwrapApiData<ChainRow[]>(data) ?? [],
    [data]
  );

  const columns: ColumnDef<ChainRow, unknown>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          className="w-[18px] h-[18px] ml-2"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
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
      accessorKey: 'name',
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Tên chuỗi" />
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">{row.original.name}</div>
          <div className="truncate text-xs text-muted-foreground">
            {row.original.description || '—'}
          </div>
        </div>
      ),
      size: 260,
    },
    {
      accessorKey: 'organizationId',
      header: 'Tổ chức',
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate font-medium">
            {row.original.organization?.name || row.original.organizationId}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {row.original.organization?.code || row.original.organizationId}
          </div>
        </div>
      ),
      size: 220,
    },
    {
      accessorKey: '_count',
      header: 'Số nhà hàng',
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.original._count?.restaurants ?? 0}
        </Badge>
      ),
      size: 120,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Ngày tạo" />
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {format(new Date(row.original.createdAt), 'dd/MM/yyyy', { locale: vi })}
        </div>
      ),
      size: 130,
    },
    {
      id: 'actions',
      enableResizing: false,
      size: 64,
      cell: ({ row }) => {
        const r = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button variant="ghost" size="icon" className="p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(r.id)}>
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push(`/administrator/organization/chains/edit/${r.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingChain(r)}
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

  const handleDeleteChain = async (chainId: string) => {
    try {
      await deleteChain(chainId).unwrap();
      toast.success('Đã xóa chuỗi nhà hàng');
      refetch();
    } catch (error) {
      console.error('Error deleting chain:', error);
      toast.error('Có lỗi xảy ra khi xóa chuỗi nhà hàng');
    }
  };

  const createUrl = organizationId
    ? `/administrator/organization/chains/create?organizationId=${organizationId}`
    : '/administrator/organization/chains/create';

  return (
    <>
      <AlertDialog open={!!deletingChain} onOpenChange={() => setDeletingChain(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa chuỗi nhà hàng</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa chuỗi nhà hàng này không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingChain) {
                  handleDeleteChain(deletingChain.id);
                  setDeletingChain(null);
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
          data={chains}
          search={{
            column: 'name',
            placeholder: 'Tìm kiếm chuỗi nhà hàng...',
          }}
          max="name"
          filter={[]}
          onCreate={() => router.push(createUrl)}
          onChange={() => {}}
          onReload={refetch}
          onDownload={() => {}}
          // onUpdate={(chain: ChainRow) => {
          //   router.push(`/administrator/organization/chains/edit/${chain.id}`);
          // }}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="h-4 w-4" />
          Quản lý chuỗi nhà hàng thuộc tổ chức
        </div>
      </div>
    </>
  );
}

export default function RestaurantChainListPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <RestaurantChainListContent />
    </Suspense>
  );
}

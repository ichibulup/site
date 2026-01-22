'use client';

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  Building,
} from 'lucide-react';
import { DataTable, DataTableSortButton } from '@/components/element/data-table';
import { toast } from 'sonner';
import { Organization } from '@/schemas/organization';
import {
  useGetAllOrganizationsQuery,
  useDeleteOrganizationMutation,
} from "@/state/api";
import { unwrapApiData } from '@/lib/utils/formatters';
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

export default function OrganizationListPage() {
  const router = useRouter();
  const [deletingOrganization, setDeletingOrganization] = useState<Organization | null>(null);

  const {
    data: organizationsResponse,
    refetch: refetchOrganizations
  } = useGetAllOrganizationsQuery();

  const organizations = useMemo(
    () => unwrapApiData<Organization[]>(organizationsResponse) ?? [],
    [organizationsResponse]
  );

  const [deleteOrganization, { isLoading: isDeleting }] = useDeleteOrganizationMutation();

  const columns: ColumnDef<Organization, unknown>[] = [
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
        <DataTableSortButton column={column} title="Tên tổ chức" />
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
                  <Building className="h-5 w-5 text-primary" />
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
      accessorKey: "description",
      header: "Mô tả",
      cell: ({ row }) => (
        <div className="max-w-xs truncate text-sm">
          {row.original.description || '—'}
        </div>
      ),
      size: 200,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        return <Badge variant="default">Hoạt động</Badge>;
      },
      size: 100,
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
                onClick={() => router.push(`/administrator/organization/${r.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(`/administrator/organization/edit/${r.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingOrganization(r)}
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

  const handleDeleteOrganization = async (organizationId: string) => {
    try {
      await deleteOrganization(organizationId).unwrap();
      toast.success('Tổ chức đã được xóa thành công');
      refetchOrganizations();
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast.error('Có lỗi xảy ra khi xóa tổ chức');
    }
  };

  return (
    <>
      <AlertDialog open={!!deletingOrganization} onOpenChange={() => setDeletingOrganization(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa tổ chức</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tổ chức &quot;{deletingOrganization?.name}&quot; không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingOrganization) {
                  handleDeleteOrganization(deletingOrganization.id);
                  setDeletingOrganization(null);
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
          data={organizations}
          search={{
            column: "name",
            placeholder: "Tìm kiếm tổ chức..."
          }}
          max="name"
          filter={[]}
          onCreate={() => {
            router.push('/administrator/organization/create');
          }}
          onChange={() => {}}
          onReload={refetchOrganizations}
          onDownload={() => {}}
          // onUpdate={(organization: Organization) => {
          //   router.push(`/administrator/organization/${organization.id}`);
          // }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Danh sách tổ chức
            </CardTitle>
            <CardDescription>
              Quản lý các tổ chức trong hệ thống
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </>
  );
}

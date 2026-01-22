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
import { Edit, MoreHorizontal, Trash2, Users } from 'lucide-react';
import { OrganizationMembership } from '@/lib/interfaces';
import { useDeleteOrganizationMembershipMutation, useGetOrganizationMembersQuery } from '@/state/api';
import { unwrapApiData } from '@/lib/utils/formatters';

type MembershipRow = OrganizationMembership & {
  user?: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
  organization?: {
    id: string;
    name: string;
    code: string;
    logoUrl?: string | null;
  };
};

function OrganizationMembershipListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId') || undefined;
  const [deletingMembership, setDeletingMembership] = useState<MembershipRow | null>(null);

  const { data, refetch } = useGetOrganizationMembersQuery(
    organizationId ? { organizationId } : undefined
  );
  const [deleteMembership] = useDeleteOrganizationMembershipMutation();

  const memberships = useMemo(
    () => unwrapApiData<MembershipRow[]>(data) ?? [],
    [data]
  );

  const columns: ColumnDef<MembershipRow, unknown>[] = [
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
      accessorKey: 'userId',
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Thành viên" />
      ),
      cell: ({ row }) => {
        const user = row.original.user;
        const name = `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();
        const label = name || user?.email || row.original.userId;
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">{label}</div>
            <div className="truncate text-xs text-muted-foreground">
              {user?.email || row.original.userId}
            </div>
          </div>
        );
      },
      size: 240,
    },
    {
      accessorKey: 'organizationId',
      header: 'Tổ chức',
      cell: ({ row }) => {
        const organization = row.original.organization;
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">
              {organization?.name || row.original.organizationId}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {organization?.code || row.original.organizationId}
            </div>
          </div>
        );
      },
      size: 220,
    },
    {
      accessorKey: 'role',
      header: 'Vai trò',
      cell: ({ row }) => {
        const labelMap: Record<string, string> = {
          admin: 'Quản trị',
          member: 'Thành viên',
          guest: 'Khách',
        };
        return <Badge variant="outline">{labelMap[row.original.role] || row.original.role}</Badge>;
      },
      size: 120,
    },
    {
      accessorKey: 'joinedAt',
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Ngày tham gia" />
      ),
      cell: ({ row }) => {
        const date = row.original.joinedAt || row.original.createdAt;
        return (
          <div className="text-sm">
            {date ? format(new Date(date), 'dd/MM/yyyy', { locale: vi }) : '—'}
          </div>
        );
      },
      size: 140,
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
                onClick={() => router.push(`/administrator/organization/memberships/edit/${r.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setDeletingMembership(r)}
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

  const handleDeleteMembership = async (membershipId: string) => {
    try {
      await deleteMembership(membershipId).unwrap();
      toast.success('Đã xóa thành viên khỏi tổ chức');
      refetch();
    } catch (error) {
      console.error('Error deleting membership:', error);
      toast.error('Có lỗi xảy ra khi xóa thành viên');
    }
  };

  const createUrl = organizationId
    ? `/administrator/organization/memberships/create?organizationId=${organizationId}`
    : '/administrator/organization/memberships/create';

  return (
    <>
      <AlertDialog open={!!deletingMembership} onOpenChange={() => setDeletingMembership(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa thành viên</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa thành viên này khỏi tổ chức không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingMembership) {
                  handleDeleteMembership(deletingMembership.id);
                  setDeletingMembership(null);
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
          data={memberships}
          search={{
            column: 'userId',
            placeholder: 'Tìm theo ID người dùng...',
          }}
          max="userId"
          filter={[]}
          onCreate={() => router.push(createUrl)}
          onChange={() => {}}
          onReload={refetch}
          onDownload={() => {}}
          // onUpdate={(membership: MembershipRow) => {
          //   router.push(`/administrator/organization/memberships/edit/${membership.id}`);
          // }}
        />

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="h-4 w-4" />
          Quản lý danh sách thành viên trong tổ chức
        </div>
      </div>
    </>
  );
}

export default function OrganizationMembershipListPage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <OrganizationMembershipListContent />
    </Suspense>
  );
}

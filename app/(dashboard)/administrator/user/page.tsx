"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Edit, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableSortButton } from "@/components/element/data-table";
import { StatsBox } from "@/components/element/stats-box";
import {
  User,
  UserRole,
  UserStatus,
  UserActivityStatus,
  StatsBoxProps,
} from "@/lib/interfaces";
import { UserForm } from "@/components/form/mock/user";
import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllUsersQuery,
  useUpdateUserMutation,
} from "@/state/api";
import { formatDateTime } from "@/lib/utils/formatters";
import { renderUserStatusBadge } from "@/lib/utils/renderers";
import { toast } from "sonner";

const roleLabels: Record<UserRole, string> = {
  [UserRole.customer]: "Khách hàng",
  [UserRole.staff]: "Nhân viên",
  [UserRole.manager]: "Quản lý",
  [UserRole.admin]: "Quản trị",
  [UserRole.master]: "Tổng quản",
  [UserRole.delivery]: "Giao hàng",
  [UserRole.supplier]: "Nhà cung cấp",
  [UserRole.warehouse]: "Kho",
};

const activityLabels: Record<UserActivityStatus, string> = {
  [UserActivityStatus.available]: "Sẵn sàng",
  [UserActivityStatus.busy]: "Bận",
  [UserActivityStatus.doNotDisturb]: "Không làm phiền",
  [UserActivityStatus.away]: "Vắng mặt",
  [UserActivityStatus.offline]: "Ngoại tuyến",
  [UserActivityStatus.invisible]: "Ẩn",
};

export default function UsersPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  const { data: users = [], isLoading, refetch } = useGetAllUsersQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => user.status === UserStatus.active).length;
    const pending = users.filter((user) => user.status === UserStatus.pendingVerification).length;
    const staff = users.filter((user) => user.role === UserRole.staff).length;

    return { total, active, pending, staff };
  }, [users]);

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng người dùng",
      description: "Tất cả tài khoản",
      icon: Users,
      stats: stats.total,
    },
    {
      title: "Đang hoạt động",
      description: "Tài khoản active",
      icon: Users,
      stats: stats.active,
      color: "success",
    },
    {
      title: "Chờ xác thực",
      description: "Cần xác minh",
      icon: Users,
      stats: stats.pending,
      color: "warning",
    },
    {
      title: "Nhân viên",
      description: "Role staff",
      icon: Users,
      stats: stats.staff,
    },
  ];

  const columns: ColumnDef<User, unknown>[] = [
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
      accessorKey: "fullName",
      header: ({ column }) => <DataTableSortButton column={column} title="Người dùng" />,
      cell: ({ row }) => {
        const name = row.original.fullName || row.original.username || "Chưa có tên";
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={row.original.avatarUrl ?? undefined} alt={name} />
              <AvatarFallback>{name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{name}</div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.email}
              </div>
            </div>
          </div>
        );
      },
      size: 300,
    },
    {
      accessorKey: "role",
      header: "Vai trò",
      cell: ({ row }) => (
        <Badge variant="outline">{roleLabels[row.original.role] || row.original.role}</Badge>
      ),
      size: 140,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => renderUserStatusBadge(row.original.status),
      size: 150,
    },
    {
      accessorKey: "activityStatus",
      header: "Hoạt động",
      cell: ({ row }) => (
        <Badge variant="secondary">
          {activityLabels[row.original.activityStatus] || row.original.activityStatus}
        </Badge>
      ),
      size: 160,
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Ngày tạo</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.createdAt ? formatDateTime({ date: row.original.createdAt }) : "—"}
        </div>
      ),
      size: 180,
    },
    {
      id: "actions",
      enableResizing: false,
      size: 64,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-center">
              <Button variant="ghost" size="icon" className="p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => {
                setEditingUser(row.original);
                setIsFormOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeletingUser(row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const handleCreate = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  const handleSubmitUser = async (payload: any) => {
    try {
      if (editingUser?.id) {
        await updateUser({ id: editingUser.id, data: payload }).unwrap();
        toast.success("Đã cập nhật người dùng");
      } else {
        await createUser(payload).unwrap();
        toast.success("Đã tạo người dùng");
      }
      setIsFormOpen(false);
      setEditingUser(null);
      refetch();
    } catch (error) {
      toast.error("Không thể lưu người dùng");
    }
  };

  const handleDelete = async () => {
    if (!deletingUser?.id) return;
    try {
      await deleteUser(deletingUser.id).unwrap();
      toast.success("Đã xóa người dùng");
      setDeletingUser(null);
      refetch();
    } catch (error) {
      toast.error("Không thể xóa người dùng");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <StatsBox key={stat.title} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={users}
        search={{ column: "fullName", placeholder: "Tìm người dùng..." }}
        max="fullName"
        onCreate={handleCreate}
        onReload={refetch}
        onChange={() => undefined}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? "Cập nhật người dùng" : "Thêm người dùng"}
            </DialogTitle>
          </DialogHeader>
          <UserForm
            mode={editingUser ? "update" : "create"}
            initialValues={editingUser ?? undefined}
            onCancel={() => setIsFormOpen(false)}
            onSuccess={handleSubmitUser}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingUser)} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa người dùng</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa người dùng
              {deletingUser?.fullName ? ` ${deletingUser.fullName}` : ""}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isLoading && <div className="text-sm text-muted-foreground">Đang tải dữ liệu...</div>}
    </div>
  );
}

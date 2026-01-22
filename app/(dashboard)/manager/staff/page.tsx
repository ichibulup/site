"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Users, Briefcase, Clock, Plus, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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
  RestaurantStaffRole,
  RestaurantUserRole,
  StaffStatus,
  StatsBoxProps,
  User,
  Restaurant,
} from "@/lib/interfaces";
import { RestaurantUserRoleForm } from "@/components/form/mock/staff";
import {
  useCreateRestaurantUserRoleMutation,
  useDeleteRestaurantUserRoleMutation,
  useGetRestaurantUserRolesQuery,
  useUpdateRestaurantUserRoleMutation,
} from "@/state/api";
import { formatCurrency, formatDateTime, unwrapApiData } from "@/lib/utils/formatters";
import { renderStaffStatusBadge } from "@/lib/utils/renderers";
import { toast } from "sonner";

const roleLabels: Record<RestaurantStaffRole, string> = {
  [RestaurantStaffRole.staff]: "Nhân viên",
  [RestaurantStaffRole.manager]: "Quản lý",
  [RestaurantStaffRole.chef]: "Bếp trưởng",
  [RestaurantStaffRole.cashier]: "Thu ngân",
  [RestaurantStaffRole.security]: "Bảo vệ",
  [RestaurantStaffRole.cleaner]: "Tạp vụ",
  [RestaurantStaffRole.supervisor]: "Giám sát",
  [RestaurantStaffRole.sousChef]: "Bếp phó",
  [RestaurantStaffRole.waiter]: "Phục vụ",
  [RestaurantStaffRole.host]: "Lễ tân",
};

type StaffRow = RestaurantUserRole & {
  user?: Partial<User> | null;
  restaurant?: Partial<Restaurant> | null;
  userName?: string;
};

export default function StaffPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<StaffRow | null>(null);
  const [deletingRole, setDeletingRole] = useState<StaffRow | null>(null);

  const { data, isLoading, refetch } = useGetRestaurantUserRolesQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRestaurantUserRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRestaurantUserRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRestaurantUserRoleMutation();

  const roles = useMemo(() => unwrapApiData<StaffRow[]>(data) ?? [], [data]);
  const rows = useMemo(
    () =>
      roles.map((role) => ({
        ...role,
        userName: role.user?.fullName || role.user?.email || role.userId,
      })),
    [roles]
  );

  const stats = useMemo(() => {
    const total = roles.length;
    const active = roles.filter((role) => role.status === StaffStatus.active).length;
    const onLeave = roles.filter((role) => role.status === StaffStatus.onLeave).length;
    const avgHourly = roles.length
      ? roles.reduce((sum, role) => sum + Number(role.hourlyRate || 0), 0) / roles.length
      : 0;

    return { total, active, onLeave, avgHourly };
  }, [roles]);

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng nhân viên",
      description: "Tất cả nhân viên",
      icon: Users,
      stats: stats.total,
    },
    {
      title: "Đang làm việc",
      description: "Nhân viên đang hoạt động",
      icon: Briefcase,
      stats: stats.active,
      color: "success",
    },
    {
      title: "Nghỉ phép",
      description: "Nhân viên đang nghỉ",
      icon: Clock,
      stats: stats.onLeave,
      color: "warning",
    },
    {
      title: "Lương TB/giờ",
      description: "Bình quân hiện tại",
      icon: Users,
      stats: formatCurrency({ value: stats.avgHourly }),
    },
  ];

  const columns: ColumnDef<StaffRow, unknown>[] = [
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
      accessorKey: "userName",
      header: ({ column }) => <DataTableSortButton column={column} title="Nhân viên" />,
      cell: ({ row }) => {
        const user = row.original.user;
        const label = row.original.userName || row.original.userId;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl ?? undefined} alt={label} />
              <AvatarFallback>{label?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{label}</div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.email || row.original.userId}
              </div>
            </div>
          </div>
        );
      },
      size: 240,
    },
    {
      accessorKey: "restaurant",
      header: "Nhà hàng",
      cell: ({ row }) => {
        const restaurant = row.original.restaurant;
        return (
          <div className="min-w-0">
            <div className="truncate font-medium">
              {restaurant?.name || row.original.restaurantId}
            </div>
            <div className="truncate text-xs text-muted-foreground">
              {restaurant?.code || row.original.restaurantId}
            </div>
          </div>
        );
      },
      size: 200,
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
      cell: ({ row }) => renderStaffStatusBadge(row.original.status),
      size: 150,
    },
    {
      accessorKey: "hourlyRate",
      header: () => <div className="text-right">Lương/giờ</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.hourlyRate
            ? formatCurrency({ value: Number(row.original.hourlyRate) })
            : "—"}
        </div>
      ),
      size: 140,
    },
    {
      accessorKey: "joinedAt",
      header: () => <div className="text-right">Ngày vào</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.joinedAt ? formatDateTime({ date: row.original.joinedAt }) : "—"}
        </div>
      ),
      size: 160,
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
                setEditingRole(row.original);
                setIsFormOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeletingRole(row.original)}
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
    setEditingRole(null);
    setIsFormOpen(true);
  };

  const handleSubmitRole = async (payload: any) => {
    try {
      if (editingRole?.id) {
        await updateRole({ id: editingRole.id, data: payload }).unwrap();
        toast.success("Đã cập nhật nhân viên");
      } else {
        await createRole(payload).unwrap();
        toast.success("Đã thêm nhân viên");
      }
      setIsFormOpen(false);
      setEditingRole(null);
      refetch();
    } catch (error) {
      toast.error("Không thể lưu nhân viên");
    }
  };

  const handleDelete = async () => {
    if (!deletingRole?.id) return;
    try {
      await deleteRole(deletingRole.id).unwrap();
      toast.success("Đã xóa nhân viên");
      setDeletingRole(null);
      refetch();
    } catch (error) {
      toast.error("Không thể xóa nhân viên");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý nhân viên</h1>
          <p className="text-muted-foreground">Theo dõi nhân sự và vai trò tại nhà hàng</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhân viên
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <StatsBox key={stat.title} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={rows}
        search={{ column: "userName", placeholder: "Tìm nhân viên..." }}
        max="userName"
        onCreate={handleCreate}
        onReload={refetch}
        onChange={() => undefined}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Cập nhật nhân viên" : "Thêm nhân viên"}
            </DialogTitle>
          </DialogHeader>
          <RestaurantUserRoleForm
            mode={editingRole ? "update" : "create"}
            initialValues={editingRole ?? undefined}
            onCancel={() => setIsFormOpen(false)}
            onSuccess={handleSubmitRole}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingRole)} onOpenChange={(open) => !open && setDeletingRole(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa nhân viên</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa nhân viên
              {deletingRole?.user?.fullName ? ` ${deletingRole.user.fullName}` : ""}?
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

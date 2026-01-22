"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, MoreHorizontal, Edit, Trash2, LayoutGrid, CheckCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { DataTable, DataTableSortButton } from "@/components/element/data-table";
import { StatsBox } from "@/components/element/stats-box";
import { Table, TableDataColumn, TableStatus, StatsBoxProps } from "@/lib/interfaces";
import { TableForm } from "@/components/form/mock/restaurant";
import {
  useCreateTableMutation,
  useDeleteTableMutation,
  useGetAllTablesQuery,
  useUpdateTableMutation,
} from "@/state/api";
import { formatDateTime } from "@/lib/utils/formatters";
import { renderTableStatusBadge } from "@/lib/utils/renderers";
import { toast } from "sonner";

export default function TablesPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTable, setEditingTable] = useState<TableDataColumn | null>(null);
  const [deletingTable, setDeletingTable] = useState<TableDataColumn | null>(null);

  const { data: tables = [], isLoading, refetch } = useGetAllTablesQuery();
  const [createTable, { isLoading: isCreating }] = useCreateTableMutation();
  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();
  const [deleteTable, { isLoading: isDeleting }] = useDeleteTableMutation();

  const stats = useMemo(() => {
    const total = tables.length;
    const available = tables.filter((table) => table.status === TableStatus.available).length;
    const occupied = tables.filter((table) => table.status === TableStatus.occupied).length;
    const reserved = tables.filter((table) => table.status === TableStatus.reserved).length;

    return { total, available, occupied, reserved };
  }, [tables]);

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng bàn",
      description: "Tất cả bàn",
      icon: LayoutGrid,
      stats: stats.total,
    },
    {
      title: "Bàn trống",
      description: "Sẵn sàng phục vụ",
      icon: CheckCircle,
      stats: stats.available,
      color: "success",
    },
    {
      title: "Có khách",
      description: "Đang sử dụng",
      icon: Users,
      stats: stats.occupied,
      color: "warning",
    },
    {
      title: "Đã đặt",
      description: "Chờ khách",
      icon: CheckCircle,
      stats: stats.reserved,
    },
  ];

  const columns: ColumnDef<TableDataColumn, unknown>[] = [
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
      accessorKey: "tableNumber",
      header: ({ column }) => <DataTableSortButton column={column} title="Số bàn" />,
      cell: ({ row }) => <div className="font-medium">{row.original.tableNumber}</div>,
      size: 120,
    },
    {
      accessorKey: "restaurants",
      header: "Nhà hàng",
      cell: ({ row }) => {
        const restaurant = row.original.restaurants;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback>{restaurant?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="truncate font-medium">{restaurant?.name || "—"}</div>
              <div className="truncate text-xs text-muted-foreground">{restaurant?.code}</div>
            </div>
          </div>
        );
      },
      size: 220,
    },
    {
      accessorKey: "capacity",
      header: () => <div className="text-right">Sức chứa</div>,
      cell: ({ row }) => <div className="text-right">{row.original.capacity ?? "—"}</div>,
      size: 120,
    },
    {
      accessorKey: "location",
      header: "Vị trí",
      cell: ({ row }) => <div className="truncate">{row.original.location || "—"}</div>,
      size: 180,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => renderTableStatusBadge(row.original.status as TableStatus),
      size: 140,
    },
    {
      accessorKey: "_count",
      header: () => <div className="text-right">Đặt bàn</div>,
      cell: ({ row }) => (
        <div className="text-right">{row.original._count?.reservations ?? 0}</div>
      ),
      size: 120,
    },
    {
      accessorKey: "createdAt",
      header: () => <div className="text-right">Ngày tạo</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.createdAt
            ? formatDateTime({
                date:
                  typeof row.original.createdAt === "number"
                    ? new Date(row.original.createdAt)
                    : row.original.createdAt,
              })
            : "—"}
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
                setEditingTable(row.original);
                setIsFormOpen(true);
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => setDeletingTable(row.original)}
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

  const tableInitialValues: Partial<Table> | undefined = editingTable
    ? {
        id: editingTable.id,
        restaurantId: editingTable.restaurantId,
        tableNumber: editingTable.tableNumber,
        capacity: editingTable.capacity ?? undefined,
        location: editingTable.location ?? undefined,
        status: (editingTable.status ?? TableStatus.available) as TableStatus,
        qrCode:
          typeof editingTable.qrCode === "number"
            ? String(editingTable.qrCode)
            : editingTable.qrCode ?? undefined,
      }
    : undefined;

  const handleCreate = () => {
    setEditingTable(null);
    setIsFormOpen(true);
  };

  const handleSubmitTable = async (payload: any) => {
    try {
      if (editingTable?.id) {
        await updateTable({ id: editingTable.id, data: payload }).unwrap();
        toast.success("Đã cập nhật bàn");
      } else {
        await createTable(payload).unwrap();
        toast.success("Đã tạo bàn mới");
      }
      setIsFormOpen(false);
      setEditingTable(null);
      refetch();
    } catch (error) {
      toast.error("Không thể lưu bàn");
    }
  };

  const handleDelete = async () => {
    if (!deletingTable?.id) return;
    try {
      await deleteTable(deletingTable.id).unwrap();
      toast.success("Đã xóa bàn");
      setDeletingTable(null);
      refetch();
    } catch (error) {
      toast.error("Không thể xóa bàn");
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý bàn ăn</h1>
          <p className="text-muted-foreground">Theo dõi và cập nhật thông tin bàn</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            Làm mới
          </Button>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Thêm bàn
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
        data={tables}
        search={{ column: "tableNumber", placeholder: "Tìm số bàn..." }}
        max="tableNumber"
        onCreate={handleCreate}
        onReload={refetch}
        onChange={() => undefined}
      />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingTable ? "Cập nhật bàn" : "Thêm bàn"}</DialogTitle>
          </DialogHeader>
          <TableForm
            mode={editingTable ? "update" : "create"}
            initialValues={tableInitialValues}
            onCancel={() => setIsFormOpen(false)}
            onSuccess={handleSubmitTable}
            isLoading={isCreating || isUpdating}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deletingTable)} onOpenChange={(open) => !open && setDeletingTable(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa bàn</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bàn
              {deletingTable?.tableNumber ? ` ${deletingTable.tableNumber}` : ""}?
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

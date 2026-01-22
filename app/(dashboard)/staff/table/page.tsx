"use client";

import React, { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, RefreshCcw, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable, DataTableSortButton } from "@/components/element/data-table";
import { StatsBox } from "@/components/element/stats-box";
import { TableDataColumn, TableStatus, StatsBoxProps } from "@/lib/interfaces";
import { renderTableStatusBadge } from "@/lib/utils/renderers";
import { useGetAllTablesQuery, useUpdateTableMutation } from "@/state/api";
import { toast } from "sonner";

export default function StaffTablesPage() {
  const { data: tables = [], isLoading, refetch } = useGetAllTablesQuery();
  const [updateTable, { isLoading: isUpdating }] = useUpdateTableMutation();

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
      description: "Toàn bộ bàn",
      icon: Users,
      stats: stats.total,
    },
    {
      title: "Bàn trống",
      description: "Sẵn sàng",
      icon: CheckCircle,
      stats: stats.available,
      color: "success",
    },
    {
      title: "Có khách",
      description: "Đang phục vụ",
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

  const handleUpdateStatus = async (tableId: string, status: TableStatus) => {
    try {
      await updateTable({ id: tableId, data: { status } }).unwrap();
      toast.success("Đã cập nhật trạng thái bàn");
      refetch();
    } catch (error) {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

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
      id: "actions",
      enableResizing: false,
      size: 64,
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className="flex items-center justify-center">
              <Button variant="ghost" size="icon" className="p-0" disabled={isUpdating}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => handleUpdateStatus(row.original.id, TableStatus.occupied)}
            >
              Check-in khách
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUpdateStatus(row.original.id, TableStatus.available)}
            >
              Giải phóng bàn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Danh sách bàn ăn</h1>
          <p className="text-muted-foreground">Cập nhật trạng thái khi khách check-in</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Làm mới
        </Button>
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
        onReload={refetch}
        onChange={() => undefined}
      />

      {isLoading && <div className="text-sm text-muted-foreground">Đang tải dữ liệu...</div>}
    </div>
  );
}

"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, RefreshCcw, Star, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTable, DataTableSortButton } from "@/components/element/data-table";
import { StatsBox } from "@/components/element/stats-box";
import { useGetSuppliersQuery } from "@/state/api";
import { Supplier, SupplierStatus, StatsBoxProps } from "@/lib/interfaces";
import { formatDateTime } from "@/lib/utils/formatters";
import { toast } from "sonner";

const statusLabels: Record<SupplierStatus, { label: string; className: string }> = {
  [SupplierStatus.active]: { label: "Hoạt động", className: "bg-green-100 text-green-800" },
  [SupplierStatus.inactive]: { label: "Ngưng hoạt động", className: "bg-gray-100 text-gray-800" },
  [SupplierStatus.suspended]: { label: "Tạm dừng", className: "bg-yellow-100 text-yellow-800" },
  [SupplierStatus.blacklisted]: { label: "Cấm", className: "bg-red-100 text-red-800" },
};

export default function ManagerSuppliersPage() {
  const { data: suppliers = [], isLoading, refetch } = useGetSuppliersQuery();
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  const stats = useMemo(() => {
    const total = suppliers.length;
    const active = suppliers.filter((supplier) => supplier.status === SupplierStatus.active).length;
    const suspended = suppliers.filter((supplier) => supplier.status === SupplierStatus.suspended).length;
    const avgRating = suppliers.length
      ? suppliers.reduce((sum, supplier) => sum + Number(supplier.rating || 0), 0) / suppliers.length
      : 0;
    return { total, active, suspended, avgRating };
  }, [suppliers]);

  const statCards: StatsBoxProps[] = [
    {
      title: "Tổng nhà cung cấp",
      description: "Đang theo dõi",
      icon: Users,
      stats: stats.total,
    },
    {
      title: "Đang hoạt động",
      description: "Đang hợp tác",
      icon: Users,
      stats: stats.active,
      color: "success",
    },
    {
      title: "Tạm dừng",
      description: "Đang ngưng",
      icon: Users,
      stats: stats.suspended,
      color: "warning",
    },
    {
      title: "Điểm đánh giá",
      description: "Trung bình",
      icon: Star,
      stats: stats.avgRating ? stats.avgRating.toFixed(1) : "0",
    },
  ];

  const columns: ColumnDef<Supplier, unknown>[] = [
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
      header: ({ column }) => <DataTableSortButton column={column} title="Nhà cung cấp" />,
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            {/* <AvatarImage src={row.original.logoUrl ?? undefined} alt={row.original.name} /> */}
            <AvatarFallback>{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="truncate font-medium">{row.original.name}</div>
            <div className="truncate text-xs text-muted-foreground">
              {row.original.contactPerson || "—"}
            </div>
          </div>
        </div>
      ),
      size: 240,
    },
    {
      accessorKey: "email",
      header: "Liên hệ",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="truncate">{row.original.email || "—"}</div>
          <div className="truncate text-xs text-muted-foreground">
            {row.original.phone || "—"}
          </div>
        </div>
      ),
      size: 220,
    },
    {
      accessorKey: "rating",
      header: () => <div className="text-right">Đánh giá</div>,
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.rating ? Number(row.original.rating).toFixed(1) : "—"}
        </div>
      ),
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const config = statusLabels[row.original.status as SupplierStatus];
        return <Badge className={config?.className}>{config?.label || row.original.status}</Badge>;
      },
      size: 140,
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
                setSelectedSupplier(row.original);
                toast.info(`Đang xem ${row.original.name}`);
              }}
            >
              Xem chi tiết
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-4">
        {statCards.map((stat) => (
          <StatsBox key={stat.title} {...stat} />
        ))}
      </div>

      <DataTable
        columns={columns}
        data={suppliers}
        search={{ column: "name", placeholder: "Tìm nhà cung cấp..." }}
        max="name"
        onReload={refetch}
        onChange={() => undefined}
      />

      {isLoading && <div className="text-sm text-muted-foreground">Đang tải dữ liệu...</div>}
      {selectedSupplier && <div className="hidden">{selectedSupplier.id}</div>}
    </div>
  );
}

"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Badge } from "@/components/element/badge"
import {
  DataTable,
  DataTableColumnHeader
} from "@/components/element/data-table"
import { InventoryBalance } from "@/lib/interfaces"
import { useGetInventoryBalancesQuery } from "@/state/api"
import {
  Calendar,
} from "lucide-react"
import { format } from "date-fns"

export default function InventoryBalanceListPage() {
  const { data: balances = [], isLoading } = useGetInventoryBalancesQuery()

  const columns: ColumnDef<InventoryBalance>[] = [
    {
      accessorKey: "balanceDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Ngày cân bằng" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {format(new Date(row.original.balanceDate), "dd/MM/yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "warehouseId",
      header: "Kho",
      cell: ({ row }) => <div className="text-sm">{row.original.warehouseId}</div>,
    },
    {
      accessorKey: "inventoryItemId",
      header: "Mặt hàng",
      cell: ({ row }) => <div className="text-sm">{row.original.inventoryItemId}</div>,
    },
    {
      accessorKey: "openingBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số dư đầu kỳ" />
      ),
      cell: ({ row }) => (
        <div className="text-right">
          {row.original.openingBalance}
        </div>
      ),
    },
    {
      accessorKey: "receivedQty",
      header: "Số lượng nhập",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-green-50">
          +{row.original.receivedQty}
        </Badge>
      ),
    },
    {
      accessorKey: "issuedQty",
      header: "Số lượng xuất",
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-red-50">
          -{row.original.issuedQty}
        </Badge>
      ),
    },
    {
      accessorKey: "adjustedQty",
      header: "Số lượng điều chỉnh",
      cell: ({ row }) => (
        <Badge variant="outline">
          {Number(row.original.adjustedQty) > 0 ? "+" : ""}{row.original.adjustedQty}
        </Badge>
      ),
    },
    {
      accessorKey: "closingBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Số dư cuối kỳ" />
      ),
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {row.original.closingBalance}
        </div>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cân bằng kho</h1>
          <p className="text-muted-foreground">
            Xem các bản ghi cân bằng kho
          </p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={balances}
        search={{
          column: "inventoryItemId",
          placeholder: "Tìm kiếm mặt hàng..."
        }}
        // isLoading={isLoading}
      />
    </div>
  )
}

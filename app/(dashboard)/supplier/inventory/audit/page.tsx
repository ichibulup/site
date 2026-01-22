"use client"

import { ColumnDef } from "@tanstack/react-table"
import {
  DataTable,
  DataTableColumnHeader,
  DataTableSortButton
} from "@/components/element/data-table"
import { InventoryBalance } from "@/lib/interfaces"
import { useGetInventoryBalancesQuery } from "@/state/api"
import {
  Calendar
} from "lucide-react"
import { format } from "date-fns"
import { vi } from "date-fns/locale"

export default function InventoryAuditPage() {
  const { data: balances = [] } = useGetInventoryBalancesQuery({})

  const columns: ColumnDef<InventoryBalance>[] = [
    {
      accessorKey: "balanceDate",
      header: ({ column }) => (
        <DataTableSortButton column={column} title="Ngày cân bằng" />
      ),
      cell: ({ row }) => {
        const date = row.original.balanceDate ? new Date(row.original.balanceDate) : new Date()
        return (
          <div className="flex items-center">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
            {format(date, "dd/MM/yyyy", { locale: vi })}
          </div>
        )
      },
    },
    {
      accessorKey: "warehouseId",
      header: "Kho",
      cell: ({ row }) => row.original.warehouseId || "N/A",
    },
    {
      accessorKey: "inventoryItemId",
      header: "Nguyên liệu",
      cell: ({ row }) => row.original.inventoryItemId || "N/A",
    },
    {
      accessorKey: "openingBalance",
      header: "Tồn đầu",
      cell: ({ row }) => row.original.openingBalance,
    },
    {
      accessorKey: "receivedQty",
      header: "Nhập",
      cell: ({ row }) => <span className="text-green-600">+{row.original.receivedQty}</span>,
    },
    {
      accessorKey: "issuedQty",
      header: "Xuất",
      cell: ({ row }) => <span className="text-red-600">-{row.original.issuedQty}</span>,
    },
    {
      accessorKey: "adjustedQty",
      header: "Điều chỉnh",
      cell: ({ row }) => row.original.adjustedQty,
    },
    {
      accessorKey: "closingBalance",
      header: "Tồn cuối",
      cell: ({ row }) => <span className="font-bold">{row.original.closingBalance}</span>,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cân bằng kho</h1>
          <p className="text-muted-foreground">
            Theo dõi biến động tồn kho hàng ngày
          </p>
        </div>
        {/* <Button onClick={() => router.push("/supplier/inventory/audit/create")}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo phiếu kiểm kê
        </Button> */}
      </div>

      <DataTable
        columns={columns}
        data={balances}
        search={{
          column: "inventoryItemId",
          placeholder: "Tìm kiếm..."
        }}
        // isLoading={isLoading}
      />
    </div>
  )
}

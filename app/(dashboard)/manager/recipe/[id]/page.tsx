"use client"

import React from "react";
import Image from "next/image";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { DataTable, DataTableColumnHeader, DataTableSortButton } from "@/components/element/data-table";
import { CheckCircle, Clock, Edit, MoreHorizontal, Trash2, Utensils, XCircle } from "lucide-react";
import { RecipeDataColumn } from "@/lib/interfaces";
import { formatCurrency } from "@/lib/utils/formatters";

export default function RecipeDetailPage() {
  const data: RecipeDataColumn = {
    id: "827c147e-7309-44b3-9d25-0b3f3974fd3e",
    name: "Công thức Phở Bò Truyền Thống",
    description: "Hướng dẫn sơ chế và nấu Phở Bò Truyền Thống",
    createdAt: "2025-09-07T16:34:45.152Z",
    updatedAt: "2025-09-07T16:34:45.152Z",
    cookTime: null,
    instructions: "Chuẩn bị nguyên liệu, sơ chế, nấu theo thứ tự, nêm nếm và trình bày.",
    prepTime: null,
    servingSize: 1,
    ingredients: [
      {
        id: "36c9db55-2978-4aaa-b4bb-09eb8a754ca1",
        quantity: "8",
        unit: "gram",
        notes: null,
        inventory_items: {
          id: "cc1b567d-a204-4cd0-a5b6-8b8d5a1313b9",
          name: "la_qua_que",
          unit: "gram"
        }
      },
      {
        id: "bf878441-ae94-4416-b444-d38d0ddc0c39",
        quantity: "21",
        unit: "gram",
        notes: null,
        inventory_items: {
          id: "08b92cdb-9f09-4df4-83bf-cb4123344a54",
          name: "gao",
          unit: "gram"
        }
      },
      {
        id: "379b1224-97ac-4558-98ca-a624d92aa485",
        quantity: "47",
        unit: "gram",
        notes: null,
        inventory_items: {
          id: "4b08f6fe-f078-4f0a-bf1f-3c40ea5da957",
          name: "thit_lon",
          unit: "gram"
        }
      },
      {
        id: "cd1ad5c6-78f8-4641-857d-4016bdf7cef4",
        quantity: "37",
        unit: "gram",
        notes: null,
        inventory_items: {
          id: "50e343c7-43c1-44bf-b6ec-0804a18f8103",
          name: "gung",
          unit: "gram"
        }
      },
      {
        id: "0eda5849-013d-42bd-9a70-cf2c0fbd6265",
        quantity: "32",
        unit: "gram",
        notes: null,
        inventory_items: {
          id: "2e2d4c79-c413-47ed-bf25-909d014a8812",
          name: "muc_tuoi",
          unit: "gram"
        }
      },
      {
        id: "d387d317-6e04-4100-915e-155f8b81b2cf",
        quantity: "22",
        unit: "gram",
        notes: null,
        inventory_items: {
          id: "216c7541-ee70-412d-868d-94006281f92d",
          name: "dau_hao",
          unit: "gram"
        }
      }
    ],
    menuItems: {
      id: "ff6d72fb-9380-4ffb-8bc5-7fe4f24948bd",
      name: "Phở Bò Truyền Thống",
      description: "Món Phở Bò Truyền Thống hấp dẫn #1",
      price: "2217.16",
      image_url: null,
      is_available: true,
      menus: {
        id: "9f182833-569d-4e54-8f4c-6e2a8e706751",
        name: "Thực đơn chính",
        description: "Thực đơn mặc định"
      },
      categories: {
        id: "f8f78595-bf70-4faf-bce5-aae5f73d3c6c",
        name: "Món Nước",
        slug: "soup"
      }
    }
  }

  const columns: ColumnDef<RecipeDataColumn, unknown>[] = [
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
      id: "name",
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        // <DataTableColumnHeader column={column} title="Món ăn" />
        <DataTableSortButton column={column} title="Món ăn" />
      ),
      cell: ({ row }) => {
        const item = row.original.menuItems
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              {item.image_url ? (
                <Image
                  className="h-9 w-9 rounded-md object-cover"
                  src={item.image_url}
                  alt="avatar"
                  width={36}
                  height={36}
                />
              ) : (
                <div className="h-9 w-9 rounded-md bg-accent flex items-center justify-center">
                  <span className="text-sm font-medium text-primary">
                    FD
                  </span>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate">
                {row.original.name}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {row.original.description}
              </div>
            </div>
          </div>
        )
      },
      size: 300, // Width cho Profile column
    },
    // {
    //   accessorKey: "email",
    //   // header: "Email",
    //   header: ({ column }) => (
    //     <DataTableSortButton column={column} title="Email" />
    //   )
    // },
    {
      id: "categories",
      accessorFn: (row) => row.menuItems.categories?.name ?? "Không có danh mục",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phân loại" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            {row.original.menuItems.categories?.name || "Không có danh mục"}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 140, // Width cho User column
    },
    {
      id: "status",
      accessorFn: (row) => row.menuItems.is_available,
      header: "Trạng thái",
      cell: ({ row }) => {
        return (
          <div className="flex items-center justify-center">
            <Switch defaultChecked={row.original.menuItems.is_available}/>
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 90, // Width cho Status column
    },
    {
      id: "servingSize",
      accessorFn: (row) => row.servingSize ?? 0,
      header: () => <div className="text-center">Lượt order</div>,
      cell: ({ row }) => {
        return (
          <div className="text-center font-medium">
            {row.original.servingSize ?? 0}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      size: 90,
    },
    {
      id: "amount",
      accessorFn: (row) => row.menuItems.price,
      // header: "Amount",
      header: () => <div className="text-center">Giá order</div>,
      cell: ({ row }) => {
        const formatted = formatCurrency({
          value: row.getValue("amount") as number | string,
          currency: "VND"
        })

        return <div className="text-right font-medium">{formatted}</div>
      },
      size: 120, // Width cho Amount column
    },
    {
      id: "actions",
      // accessorKey: "actions",
      // header: () => <div className="text-right">Actions</div>,
      enableResizing: false,
      size: 64, // Width cho Actions column
      cell: ({ row }) => {
        const payment = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0" // h-8 w-8
                >
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(payment.id)}
              >
                Sao chép ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                // onClick={() => openEditDialog(payment)}
              >
                <Edit className="mr-2 h-4 w-4"/>
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                // onClick={() => handleToggleAvailability(payment)}
              >
                {payment.menuItems.is_available ? (
                  <>
                    <XCircle className="mr-2 h-4 w-4"/>
                    Tắt trạng thái
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4"/>
                    Bật trạng thái
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Utensils className="mr-2 h-4 w-4"/>
                Xem công thức
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Clock className="mr-2 h-4 w-4"/>
                Lịch sử thay đổi
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                // onClick={() => openDeleteDialog(payment)}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4"/>
                Xóa
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuItem>Pending</DropdownMenuItem>
                    <DropdownMenuItem>Confirmed</DropdownMenuItem>
                    <DropdownMenuItem>Preparing</DropdownMenuItem>
                    <DropdownMenuItem>Ready</DropdownMenuItem>
                    <DropdownMenuItem>Served</DropdownMenuItem>
                    <DropdownMenuItem>Completed</DropdownMenuItem>
                    <DropdownMenuItem>Cancelled</DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  return (
    <>
      <DataTable
        columns={columns}
        data={[data]}
        search={{
          column: "name",
          placeholder: "Tìm kiếm công thức...",
        }}
      />
    </>
  )
}

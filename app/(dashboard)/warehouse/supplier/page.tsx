"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DataTable } from "@/components/element/data-table"
import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, Plus, Edit, Trash2, Phone, Mail, MapPin, Building2, Star, CheckCircle, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Supplier, SupplierStatus, StatsBoxProps } from "@/lib/interfaces"
import { StatsBox } from "@/components/element/stats-box"
import { toast } from "sonner"

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: "1",
    organizationId: "org-1",
    restaurantId: "rest-1",
    name: "Fresh Meat Co.",
    contactPerson: "Nguyễn Văn Thịnh",
    email: "thinh@freshmeat.com",
    phone: "0123456789",
    address: "123 Đường ABC, Quận 1",
    taxCode: "0123456789",
    paymentTerms: "30 ngày",
    rating: 4.8 as any,
    status: SupplierStatus.active,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-20"),
  },
  {
    id: "2",
    organizationId: "org-1",
    restaurantId: "rest-1",
    name: "Green Farm",
    contactPerson: "Trần Thị Xanh",
    email: "xanh@greenfarm.vn",
    phone: "0987654321",
    address: "456 Đường XYZ, Huyện Củ Chi",
    taxCode: "0987654321",
    paymentTerms: "15 ngày",
    rating: 4.5 as any,
    status: SupplierStatus.active,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-19"),
  },
  {
    id: "3",
    organizationId: "org-1",
    restaurantId: "rest-1",
    name: "Ocean Fresh",
    contactPerson: "Lê Văn Biển",
    email: "bien@oceanfresh.com",
    phone: "0369852147",
    address: "789 Cảng Cá, Quận 4",
    taxCode: "0369852147",
    paymentTerms: "COD",
    rating: 4.7 as any,
    status: SupplierStatus.active,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-18"),
  },
  {
    id: "4",
    organizationId: "org-1",
    restaurantId: "rest-1",
    name: "Rice Wholesale",
    contactPerson: "Phạm Thị Gạo",
    email: "gao@ricewholesale.vn",
    phone: "0258741963",
    address: "321 Khu Chợ Lớn, Quận 5",
    taxCode: "0258741963",
    paymentTerms: "Trả trước",
    rating: 4.2 as any,
    status: SupplierStatus.inactive,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-10"),
  },
  {
    id: "5",
    organizationId: "org-1",
    restaurantId: "rest-1",
    name: "Dairy Co.",
    contactPerson: "Hoàng Văn Sữa",
    email: "sua@dairyco.vn",
    phone: "0741852963",
    address: "654 Khu Công Nghiệp, Bình Dương",
    taxCode: "0741852963",
    paymentTerms: "20 ngày",
    rating: 4.6 as any,
    status: SupplierStatus.active,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-20"),
  }
]

// Status configuration
const statusConfig = {
  [SupplierStatus.active]: { label: "Hoạt động", color: "bg-green-500" },
  [SupplierStatus.inactive]: { label: "Ngưng hoạt động", color: "bg-gray-500" },
  [SupplierStatus.suspended]: { label: "Tạm dừng", color: "bg-red-500" }
}

// Category options - removed since not in interface
const categoryOptions = [
  "Tất cả",
  "Thịt tươi",
  "Rau củ", 
  "Hải sản",
  "Ngũ cốc",
  "Sản phẩm sữa",
  "Gia vị",
  "Đồ uống",
  "Khác"
]

export default function SuppliersPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | SupplierStatus>("all")
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null)

  // Calculations
  const suppliers = mockSuppliers
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.status === SupplierStatus.active).length
  const avgRating = suppliers.reduce((sum, supplier) => sum + (Number(supplier.rating) || 0), 0) / suppliers.length

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(supplier => {
      const matchesSearch = 
        supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (supplier.contactPerson?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (supplier.email?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
        (supplier.phone?.includes(searchQuery) || false)
      const matchesStatus = statusFilter === "all" || (statusFilter as SupplierStatus) === supplier.status
      
      return matchesSearch && matchesStatus
    })
  }, [suppliers, searchQuery, statusFilter])

  const handleDelete = (supplier: Supplier) => {
    setDeletingSupplier(supplier)
  }

  const handleConfirmDelete = () => {
    if (deletingSupplier) {
      // TODO: Call API to delete
      toast.success("Nhà cung cấp đã được xóa!")
      setDeletingSupplier(null)
    }
  }

  const handleStatusChange = (id: string, status: SupplierStatus) => {
    // TODO: Call API to update status
    toast.success(`Trạng thái đã được cập nhật`)
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ))
  }

  const columns: ColumnDef<Supplier>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          className="w-[18px] h-[18px] ml-2"
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="w-[18px] h-[18px] ml-2"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn hàng"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: "name",
      header: "Nhà cung cấp",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex items-center space-x-3 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src="" />
              <AvatarFallback>
                {supplier.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{supplier.name}</div>
              <div className="text-sm text-muted-foreground truncate">{supplier.contactPerson}</div>
            </div>
          </div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "phone",
      header: "Liên hệ",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="space-y-1 min-w-0">
            <div className="flex items-center text-sm">
              <Phone className="mr-2 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{supplier.phone || "-"}</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Mail className="mr-2 h-3 w-3 flex-shrink-0" />
              <span className="truncate">{supplier.email || "-"}</span>
            </div>
          </div>
        )
      },
      size: 250,
    },
    {
      accessorKey: "address",
      header: "Địa chỉ",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
            <div className="text-sm">
              {supplier.address || "-"}
            </div>
          </div>
        )
      },
      size: 300,
    },
    {
      accessorKey: "rating",
      header: () => <div className="text-right">Đánh giá</div>,
      cell: ({ row }) => {
        const supplier = row.original
        const rating = (Number(supplier.rating) || 0)
        return (
          <div className="space-y-1 text-right">
            <div className="flex items-center justify-end space-x-1">
              {renderStars(rating)}
            </div>
            <div className="text-sm text-muted-foreground">
              {rating.toFixed(1)}/5.0
            </div>
          </div>
        )
      },
      size: 100,
    },
    {
      accessorKey: "paymentTerms",
      header: "Điều kiện TT",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <div className="text-sm">
            {supplier.paymentTerms || "-"}
          </div>
        )
      },
      size: 120,
    },
    {
      accessorKey: "status",
      header: "Trạng thái",
      cell: ({ row }) => {
        const status = row.getValue("status") as keyof typeof statusConfig
        const config = statusConfig[status]
        return (
          <Badge className={`${config.color} text-white`}>
            {config.label}
          </Badge>
        )
      },
      size: 120,
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const supplier = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="p-0" // h-8 w-8
                >
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(`/warehouse/supplier/update/${supplier.id}`)}>
                <Edit className="mr-2 h-4 w-4" />
                Chỉnh sửa
              </DropdownMenuItem>
              {supplier.status === SupplierStatus.active ? (
                <DropdownMenuItem 
                  onClick={() => handleStatusChange(supplier.id, SupplierStatus.inactive)}
                  className="text-yellow-600"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Ngưng hợp tác
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem 
                  onClick={() => handleStatusChange(supplier.id, SupplierStatus.active)}
                  className="text-green-600"
                >
                  <Phone className="mr-2 h-4 w-4" />
                  Kích hoạt
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => handleDelete(supplier)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
      enableResizing: false,
      size: 64,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsBox
          title="Tổng nhà cung cấp"
          description="Đối tác trong hệ thống"
          icon={Building2}
          stats={totalSuppliers}
        />
        <StatsBox
          title="Đang hoạt động"
          description="Nhà cung cấp hoạt động"
          icon={CheckCircle}
          color="professional-green"
          stats={activeSuppliers}
        />
        <StatsBox
          title="Đánh giá trung bình"
          description="Điểm đánh giá / 5.0"
          icon={Star}
          color="professional-yellow"
          stats={avgRating.toFixed(1)}
        />
        <StatsBox
          title="Ngưng hoạt động"
          description="Nhà cung cấp ngưng hợp tác"
          icon={XCircle}
          color="professional-red"
          stats={totalSuppliers - activeSuppliers}
        />
      </div>

      {/* DataTable */}
      <DataTable
        columns={columns}
        data={filteredSuppliers}
        search={{
          column: "name",
          placeholder: "Tìm nhà cung cấp..."
        }}
        filter={[]}
        max="address"
        onReload={() => setSearchQuery("")}
        onDownload={() => {}}
        onCreate={() => router.push("/warehouse/supplier/create")}
        onUpdate={() => {}}
        onChange={() => {}}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSupplier} onOpenChange={() => setDeletingSupplier(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa nhà cung cấp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa nhà cung cấp &quot;{deletingSupplier?.name}&quot; không?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { SupplierForm } from "@/app/(dashboard)/supplier/supplier/_components/supplier-form"
import { Supplier } from "@/lib/interfaces"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"

// Mock data - replace with actual API
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
    status: "active" as any,
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
    status: "active" as any,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-19"),
  },
]

export default function UpdateSupplierPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  
  const [supplier, setSupplier] = useState<Supplier | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // TODO: Replace with actual API call
    // const fetchSupplier = async () => {
    //   try {
    //     const data = await getSupplierById(id).unwrap()
    //     setSupplier(data)
    //   } catch (error) {
    //     toast.error("Không thể tải thông tin nhà cung cấp")
    //     router.push("/warehouse/supplier")
    //   } finally {
    //     setIsLoading(false)
    //   }
    // }

    // Mock fetch
    const mockSupplier = mockSuppliers.find(s => s.id === id)
    if (mockSupplier) {
      setSupplier(mockSupplier)
    } else {
      toast.error("Không tìm thấy nhà cung cấp")
      router.push("/warehouse/supplier")
    }
    setIsLoading(false)
  }, [id, router])

  const handleSubmit = async (data: Omit<Supplier, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>) => {
    setIsSubmitting(true)
    try {
      // TODO: Replace with actual API call
      // await updateSupplier({ id, ...data }).unwrap()
      
      // Mock submission
      console.log("Updating supplier:", id, data)
      
      toast.success("Nhà cung cấp đã được cập nhật thành công!")
      router.push("/warehouse/supplier")
    } catch (error) {
      console.error("Error updating supplier:", error)
      toast.error("Có lỗi xảy ra khi cập nhật nhà cung cấp")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground text-center">Đang tải dữ liệu...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex items-center justify-center h-64">
        <Card>
          <CardContent className="p-8">
            <p className="text-muted-foreground">Không tìm thấy nhà cung cấp</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <SupplierForm
      initialData={supplier}
      title="Chỉnh sửa nhà cung cấp"
      description={`Cập nhật thông tin cho ${supplier.name}`}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  )
}

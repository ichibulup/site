"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { SupplierForm } from "../_components/supplier-form"
import { Supplier, SupplierStatus } from "@/lib/interfaces"
import { toast } from "sonner"

export default function CreateSupplierPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: Omit<Supplier, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    try {
      // TODO: Replace with actual API call
      // await createSupplier(data).unwrap()
      
      // Mock submission for now
      console.log("Creating supplier:", data)
      
      toast.success("Nhà cung cấp đã được tạo thành công!")
      router.push("/warehouse/supplier")
    } catch (error) {
      console.error("Error creating supplier:", error)
      toast.error("Có lỗi xảy ra khi tạo nhà cung cấp")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SupplierForm
      title="Thêm nhà cung cấp mới"
      description="Tạo một nhà cung cấp mới trong hệ thống"
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  )
}

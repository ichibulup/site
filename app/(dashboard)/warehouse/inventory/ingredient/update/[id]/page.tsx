"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { InventoryItemForm } from "@/components/form/mock/inventory"
import { useGetInventoryItemByIdQuery, useGetMeQuery, useUpdateInventoryItemMutation } from "@/state/api"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function UpdateIngredientPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { id } = params
  const { data: itemData, isLoading: isFetching } = useGetInventoryItemByIdQuery(id)
  const { data: meData } = useGetMeQuery()
  const [updateInventoryItem, { isLoading: isUpdating }] = useUpdateInventoryItemMutation()

  const organizationId =
    itemData?.organizationId ||
    meData?.dbUser?.organizationId

  const handleUpdate = async (data: any) => {
    try {
      await updateInventoryItem({ id, data }).unwrap()
      toast.success("Cập nhật nguyên liệu thành công")
      router.push("/warehouse/inventory/ingredient")
    } catch (error) {
      console.error("Failed to update ingredient:", error)
      toast.error("Có lỗi xảy ra khi cập nhật nguyên liệu")
    }
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!itemData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Không tìm thấy nguyên liệu</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cập nhật nguyên liệu</h1>
          <p className="text-muted-foreground">
            Chỉnh sửa thông tin nguyên liệu
          </p>
        </div>
      </div>

      <InventoryItemForm
        mode="update"
        organizationId={organizationId}
        initialValues={itemData}
        onSuccess={handleUpdate}
        onCancel={() => router.back()}
        isLoading={isUpdating}
        submitText="Lưu thay đổi"
      />
    </div>
  )
}

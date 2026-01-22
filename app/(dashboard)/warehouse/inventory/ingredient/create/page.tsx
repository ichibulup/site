"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { InventoryItemForm } from "@/components/form/mock/inventory"
import { useCreateInventoryItemMutation } from "@/state/api"
import { toast } from "sonner"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function CreateIngredientPage() {
  const router = useRouter()
  const [createInventoryItem, { isLoading }] = useCreateInventoryItemMutation()

  const organizationId = "2c41b63e-4a3f-4e96-bb24-9781786ae2cf"

  const handleCreate = async (data: any) => {
    try {
      // Ensure dates are properly formatted if needed, though the form handles it mostly.
      // The API expects camelCase which the form provides.
      await createInventoryItem(data).unwrap()
      toast.success("Tạo nguyên liệu thành công")
      router.push("/warehouse/inventory/ingredient")
    } catch (error) {
      console.error("Failed to create ingredient:", error)
      toast.error("Có lỗi xảy ra khi tạo nguyên liệu")
    }
  }

  if (!organizationId) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-muted-foreground">Không xác định được organization</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <InventoryItemForm
        mode="create"
        organizationId={organizationId}
        onSuccess={handleCreate}
        onCancel={() => router.back()}
        isLoading={isLoading}
        submitText="Tạo mới"
      />
    </div>
  );
}

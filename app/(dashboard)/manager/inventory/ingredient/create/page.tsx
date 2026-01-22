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

  const handleCreate = async (data: any) => {
    try {
      // Ensure dates are properly formatted if needed, though the form handles it mostly.
      // The API expects camelCase which the form provides.
      await createInventoryItem(data).unwrap()
      toast.success("Tạo nguyên liệu thành công")
      router.push("/manager/inventory/ingredient")
    } catch (error) {
      console.error("Failed to create ingredient:", error)
      toast.error("Có lỗi xảy ra khi tạo nguyên liệu")
    }
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
        {/*<div>*/}
        {/*  <h1 className="text-3xl font-bold tracking-tight">Thêm nguyên liệu mới</h1>*/}
        {/*  <p className="text-muted-foreground">*/}
        {/*    Tạo mới nguyên liệu để quản lý trong kho*/}
        {/*  </p>*/}
        {/*</div>*/}
      </div>

      <InventoryItemForm
        mode="create"
        onSuccess={handleCreate}
        onCancel={() => router.back()}
        isLoading={isLoading}
        submitText="Tạo mới"
      />
    </div>
  )
}

"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryBalanceForm } from "@/components/form/mock/inventory"
import { useCreateInventoryBalanceMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateInventoryBalancePage() {
  const router = useRouter()
  const [createBalance, { isLoading }] = useCreateInventoryBalanceMutation()

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        restaurantId: "5dc89877-8c0b-482d-a71d-609d6e14cb9e",
      }
      
      await createBalance(payload).unwrap()
      toast.success("Tạo cân bằng kho thành công")
      router.push("/supplier/inventory/balance")
    } catch (error) {
      console.error("Failed to create balance:", error)
      toast.error("Có lỗi xảy ra khi tạo cân bằng kho")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo cân bằng kho</h1>
          <p className="text-muted-foreground">
            Tạo bản ghi cân bằng mới cho kho
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cân bằng kho</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết cho bản ghi cân bằng kho mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryBalanceForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

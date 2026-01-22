"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseTransferForm } from "@/components/form/mock/warehouse"
import { useCreateWarehouseTransferMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateWarehouseTransferPage() {
  const router = useRouter()
  const [createTransfer, { isLoading }] = useCreateWarehouseTransferMutation()

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        restaurantId: "5dc89877-8c0b-482d-a71d-609d6e14cb9e",
      }
      
      await createTransfer(payload).unwrap()
      toast.success("Tạo phiếu chuyển kho thành công")
      router.push("/warehouse/inventory/transfer")
    } catch (error) {
      console.error("Failed to create transfer:", error)
      toast.error("Có lỗi xảy ra khi tạo phiếu chuyển kho")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo phiếu chuyển kho</h1>
          <p className="text-muted-foreground">
            Tạo phiếu chuyển mới để điều chuyển hàng hóa giữa các kho
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phiếu chuyển</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết cho phiếu chuyển kho mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WarehouseTransferForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

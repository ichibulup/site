"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseReceiptForm } from "@/components/form/mock/warehouse"
import { useCreateWarehouseReceiptMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateWarehouseReceiptPage() {
  const router = useRouter()
  const [createReceipt, { isLoading }] = useCreateWarehouseReceiptMutation()

  const handleSubmit = async (values: any) => {
    try {
      // Transform data if needed
      const payload = {
        ...values,
        restaurantId: "5dc89877-8c0b-482d-a71d-609d6e14cb9e", // Hardcoded for now as per context
        createdById: "user-id-placeholder", // Should be from auth context
      }
      
      await createReceipt(payload).unwrap()
      toast.success("Tạo phiếu nhập kho thành công")
      router.push("/supplier/inventory/receipt")
    } catch (error) {
      console.error("Failed to create receipt:", error)
      toast.error("Có lỗi xảy ra khi tạo phiếu nhập kho")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo phiếu nhập kho</h1>
          <p className="text-muted-foreground">
            Tạo phiếu nhập mới để ghi nhận hàng hóa vào kho
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phiếu nhập</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết cho phiếu nhập kho mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WarehouseReceiptForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

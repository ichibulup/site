"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseReceiptForm } from "@/components/form/mock/warehouse"
import { useCreateWarehouseReceiptMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRestaurant } from "@/hooks/use-organization"

export default function CreateWarehouseReceiptPage() {
  const router = useRouter()
  const [createReceipt, { isLoading }] = useCreateWarehouseReceiptMutation()
  const { restaurantId } = useRestaurant()

  const handleSubmit = async (values: any) => {
    try {
      if (!restaurantId) {
        toast.error("Không tìm thấy nhà hàng để tạo phiếu nhập kho");
        return;
      }

      const items = (values.items ?? []).map((item: any) => {
        const quantity = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);
        const totalPrice = Number(item.totalPrice ?? quantity * unitPrice);
        return {
          inventoryItemId: item.inventoryItemId,
          quantity,
          unitPrice,
          totalPrice,
          expiryDate: item.expiryDate,
          batchNumber: item.batchNumber,
          notes: item.notes,
        };
      });

      const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.totalPrice || 0), 0);

      const payload = {
        ...values,
        restaurantId,
        supplierId: values.supplierId || undefined,
        totalAmount,
        items,
      }
      
      await createReceipt(payload).unwrap()
      toast.success("Tạo phiếu nhập kho thành công")
      router.push("/warehouse/inventory/receipt")
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

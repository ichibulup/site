"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseIssueForm } from "@/components/form/mock/warehouse"
import { useCreateWarehouseIssueMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRestaurant } from "@/hooks/use-organization"

export default function CreateWarehouseIssuePage() {
  const router = useRouter()
  const [createIssue, { isLoading }] = useCreateWarehouseIssueMutation()
  const { restaurantId } = useRestaurant()

  const handleSubmit = async (values: any) => {
    try {
      if (!restaurantId) {
        toast.error("Không tìm thấy nhà hàng để tạo phiếu xuất kho");
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
          batchNumber: item.batchNumber,
          notes: item.notes,
        };
      });

      const totalAmount = items.reduce((sum: number, item: any) => sum + Number(item.totalPrice || 0), 0);

      const payload = {
        ...values,
        restaurantId,
        totalAmount,
        items,
      }
      
      await createIssue(payload).unwrap()
      toast.success("Tạo phiếu xuất kho thành công")
      router.push("/warehouse/inventory/issue")
    } catch (error) {
      console.error("Failed to create issue:", error)
      toast.error("Có lỗi xảy ra khi tạo phiếu xuất kho")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tạo phiếu xuất kho</h1>
          <p className="text-muted-foreground">
            Tạo phiếu xuất mới để xuất hàng hóa khỏi kho
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phiếu xuất</CardTitle>
          <CardDescription>
            Điền thông tin chi tiết cho phiếu xuất kho mới
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WarehouseIssueForm
            mode="create"
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  )
}

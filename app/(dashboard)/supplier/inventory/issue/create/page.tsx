"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseIssueForm } from "@/components/form/mock/warehouse"
import { useCreateWarehouseIssueMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CreateWarehouseIssuePage() {
  const router = useRouter()
  const [createIssue, { isLoading }] = useCreateWarehouseIssueMutation()

  const handleSubmit = async (values: any) => {
    try {
      const payload = {
        ...values,
        restaurantId: "5dc89877-8c0b-482d-a71d-609d6e14cb9e",
        createdById: "user-id-placeholder",
      }
      
      await createIssue(payload).unwrap()
      toast.success("Tạo phiếu xuất kho thành công")
      router.push("/supplier/inventory/issue")
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

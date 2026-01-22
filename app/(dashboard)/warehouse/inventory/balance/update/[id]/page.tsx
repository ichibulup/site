"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InventoryBalanceForm } from "@/components/form/mock/inventory"
import { useGetInventoryBalanceByIdQuery, useUpdateInventoryBalanceMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function UpdateInventoryBalancePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: balance, isLoading: isFetching } = useGetInventoryBalanceByIdQuery(id)
  const [updateBalance, { isLoading: isUpdating }] = useUpdateInventoryBalanceMutation()

  const handleSubmit = async (values: any) => {
    try {
      await updateBalance({ id, data: values }).unwrap()
      toast.success("Cập nhật cân bằng kho thành công")
      router.push("/warehouse/inventory/balance")
    } catch (error) {
      console.error("Failed to update balance:", error)
      toast.error("Có lỗi xảy ra khi cập nhật cân bằng kho")
    }
  }

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-64" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cập nhật cân bằng kho</h1>
          <p className="text-muted-foreground">
            Chỉnh sửa thông tin cân bằng kho
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin cân bằng kho</CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết cho bản ghi cân bằng kho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryBalanceForm
            mode="update"
            initialValues={balance}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  )
}

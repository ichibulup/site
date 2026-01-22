"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseTransferForm } from "@/components/form/mock/warehouse"
import { useGetWarehouseTransferByIdQuery, useUpdateWarehouseTransferMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function UpdateWarehouseTransferPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: transfer, isLoading: isFetching } = useGetWarehouseTransferByIdQuery(id)
  const [updateTransfer, { isLoading: isUpdating }] = useUpdateWarehouseTransferMutation()

  const handleSubmit = async (values: any) => {
    try {
      await updateTransfer({ id, data: values }).unwrap()
      toast.success("Cập nhật phiếu chuyển kho thành công")
      router.push("/supplier/inventory/transfer")
    } catch (error) {
      console.error("Failed to update transfer:", error)
      toast.error("Có lỗi xảy ra khi cập nhật phiếu chuyển kho")
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
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
              <Skeleton className="h-32" />
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
          <h1 className="text-3xl font-bold tracking-tight">Cập nhật phiếu chuyển</h1>
          <p className="text-muted-foreground">
            Chỉnh sửa thông tin phiếu chuyển kho {transfer?.transferNumber}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phiếu chuyển</CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết cho phiếu chuyển kho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WarehouseTransferForm
            mode="update"
            initialValues={transfer}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  )
}

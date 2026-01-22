"use client"

import React from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { WarehouseIssueForm } from "@/components/form/mock/warehouse"
import { useGetWarehouseIssueByIdQuery, useUpdateWarehouseIssueMutation } from "@/state/api"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

export default function UpdateWarehouseIssuePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const { data: issue, isLoading: isFetching } = useGetWarehouseIssueByIdQuery(id)
  const [updateIssue, { isLoading: isUpdating }] = useUpdateWarehouseIssueMutation()

  const handleSubmit = async (values: any) => {
    try {
      await updateIssue({ id, data: values }).unwrap()
      toast.success("Cập nhật phiếu xuất kho thành công")
      router.push("/warehouse/inventory/issue")
    } catch (error) {
      console.error("Failed to update issue:", error)
      toast.error("Có lỗi xảy ra khi cập nhật phiếu xuất kho")
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
          <h1 className="text-3xl font-bold tracking-tight">Cập nhật phiếu xuất</h1>
          <p className="text-muted-foreground">
            Chỉnh sửa thông tin phiếu xuất kho {issue?.issueNumber}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin phiếu xuất</CardTitle>
          <CardDescription>
            Cập nhật thông tin chi tiết cho phiếu xuất kho
          </CardDescription>
        </CardHeader>
        <CardContent>
          <WarehouseIssueForm
            mode="update"
            initialValues={issue}
            onSubmit={handleSubmit}
            isLoading={isUpdating}
          />
        </CardContent>
      </Card>
    </div>
  )
}

"use client";

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { WarehouseForm } from '@/components/form/mock/warehouse';
import { useGetWarehouseByIdQuery, useUpdateWarehouseMutation } from '@/state/api';
import { Skeleton } from '@/components/ui/skeleton';

export default function UpdateWarehousePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: warehouseData, isLoading: isFetching } = useGetWarehouseByIdQuery(id);
  const [updateWarehouse, { isLoading: isUpdating }] = useUpdateWarehouseMutation();

  const handleSuccess = async (data: any) => {
    try {
      await updateWarehouse({ id, data }).unwrap();
      toast.success('Cập nhật kho hàng thành công!');
      router.push('/warehouse/change');
    } catch (error) {
      console.error('Error updating warehouse:', error);
      toast.error('Có lỗi xảy ra khi cập nhật kho hàng!');
    }
  };

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
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cập nhật kho hàng</h1>
          <p className="text-muted-foreground">
            Chỉnh sửa thông tin kho hàng
          </p>
        </div>
      </div>

      <WarehouseForm 
        mode="update"
        initialValues={warehouseData}
        onSuccess={handleSuccess}
        onCancel={() => router.back()}
        isLoading={isUpdating}
      />
    </div>
  );
}

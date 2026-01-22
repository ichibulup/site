"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { WarehouseForm } from '@/components/form/mock/warehouse';
import { useCreateWarehouseMutation } from '@/state/api';

export default function CreateWarehousePage() {
  const router = useRouter();
  const [createWarehouse, { isLoading }] = useCreateWarehouseMutation();

  const handleSuccess = async (data: any) => {
    try {
      await createWarehouse(data).unwrap();
      toast.success('Tạo kho hàng thành công!');
      router.push('/warehouse/change');
    } catch (error) {
      console.error('Error creating warehouse:', error);
      toast.error('Có lỗi xảy ra khi tạo kho hàng!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Thêm kho hàng mới</h1>
          <p className="text-muted-foreground">
            Tạo kho hàng mới để quản lý tồn kho
          </p>
        </div>
      </div>

      <WarehouseForm 
        mode="create"
        onSuccess={handleSuccess}
        onCancel={() => router.back()}
        isLoading={isLoading}
      />
    </div>
  );
}

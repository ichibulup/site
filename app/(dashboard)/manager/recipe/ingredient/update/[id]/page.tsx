'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { InventoryItemForm } from '@/components/form/mock/inventory';
import { useGetInventoryItemByIdQuery, useUpdateInventoryItemMutation } from '@/state/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditIngredientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: itemData, isLoading: isFetching } = useGetInventoryItemByIdQuery(id);
  const [updateInventoryItem, { isLoading: isUpdating }] = useUpdateInventoryItemMutation();

  const handleSuccess = async (data: any) => {
    try {
      await updateInventoryItem({ id, data }).unwrap();
      toast.success('Cập nhật nguyên liệu thành công');
      router.push('/manager/recipe/ingredient');
    } catch (error) {
      console.error('Failed to update inventory item:', error);
      toast.error('Có lỗi xảy ra khi cập nhật nguyên liệu');
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!itemData?.data && !itemData) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy nguyên liệu</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  // Handle both wrapped response (data.data) and direct response (data)
  const initialValues = itemData?.data || itemData;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa nguyên liệu</h1>
      </div>

      <InventoryItemForm 
        mode="update"
        initialValues={initialValues}
        onSuccess={handleSuccess} 
        onCancel={() => router.back()}
        isLoading={isUpdating}
      />
    </div>
  );
}

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { InventoryItemForm } from '@/components/form/mock/inventory';
import { useCreateInventoryItemMutation } from '@/state/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateIngredientPage() {
  const router = useRouter();
  const [createInventoryItem, { isLoading }] = useCreateInventoryItemMutation();

  const handleSuccess = async (data: any) => {
    try {
      await createInventoryItem(data).unwrap();
      toast.success('Tạo nguyên liệu thành công');
      router.push('/manager/recipe/ingredient');
    } catch (error) {
      console.error('Failed to create inventory item:', error);
      toast.error('Có lỗi xảy ra khi tạo nguyên liệu');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm nguyên liệu mới</h1>
      </div>

      <InventoryItemForm 
        mode="create"
        onSuccess={handleSuccess} 
        onCancel={() => router.back()}
        isLoading={isLoading} 
      />
    </div>
  );
}

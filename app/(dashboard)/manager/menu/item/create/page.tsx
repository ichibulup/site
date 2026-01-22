'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MenuItemForm } from '@/components/form/mock/menu';
import { useCreateMenuItemMutation } from '@/state/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateMenuItemPage() {
  const router = useRouter();
  const [createMenuItem, { isLoading }] = useCreateMenuItemMutation();

  const handleSuccess = async (data: any) => {
    try {
      await createMenuItem(data).unwrap();
      toast.success('Tạo món ăn thành công');
      router.push('/manager/menu/item');
    } catch (error) {
      console.error('Failed to create menu item:', error);
      toast.error('Có lỗi xảy ra khi tạo món ăn');
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm món ăn mới</h1>
      </div> */}

      <MenuItemForm 
        mode="create"
        onSuccess={handleSuccess} 
        onCancel={() => router.back()}
        isLoading={isLoading} 
      />
    </div>
  );
}

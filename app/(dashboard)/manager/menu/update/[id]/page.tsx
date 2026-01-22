'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { MenuForm } from '@/components/form/mock/menu';
import { useGetMenuByIdQuery, useUpdateMenuMutation } from '@/state/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditMenuPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: menuData, isLoading: isFetching } = useGetMenuByIdQuery(id);
  const [updateMenu, { isLoading: isUpdating }] = useUpdateMenuMutation();

  const handleSuccess = async (data: any) => {
    try {
      await updateMenu({ id, data }).unwrap();
      toast.success('Cập nhật menu thành công');
      router.push('/manager/menu');
    } catch (error) {
      console.error('Failed to update menu:', error);
      toast.error('Có lỗi xảy ra khi cập nhật menu');
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!menuData?.data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy menu</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa menu</h1>
      </div> */}

      <MenuForm 
        mode="update"
        initialValues={menuData.data}
        onSuccess={handleSuccess} 
        onCancel={() => router.back()}
        isLoading={isUpdating} 
      />
    </div>
  );
}

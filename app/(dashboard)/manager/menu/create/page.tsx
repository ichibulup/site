'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MenuForm } from '@/components/form/mock/menu';
import { useCreateMenuMutation, useGetMeQuery } from '@/state/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateMenuPage() {
  const router = useRouter();
  const [createMenu, { isLoading }] = useCreateMenuMutation();

  const handleSuccess = async (data: any) => {
    try {
      await createMenu(data).unwrap();
      toast.success('Tạo menu thành công');
      router.push('/manager/menu');
    } catch (error) {
      console.error('Failed to create menu:', error);
      toast.error('Có lỗi xảy ra khi tạo menu');
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm menu mới</h1>
      </div> */}

      <MenuForm 
        mode="create"
        organizationId={"2c41b63e-4a3f-4e96-bb24-9781786ae2cf"}
        onSuccess={handleSuccess} 
        onCancel={() => router.back()}
        isLoading={isLoading} 
      />
    </div>
  );
}

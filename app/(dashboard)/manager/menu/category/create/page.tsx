'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { CategoryForm } from '@/components/form/mock/category';
import { useCreateCategoryMutation } from '@/state/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function CreateCategoryPage() {
  const router = useRouter();
  const [createCategory, { isLoading }] = useCreateCategoryMutation();

  const handleSuccess = async (data: any) => {
    try {
      await createCategory(data).unwrap();
      toast.success('Tạo danh mục thành công');
      router.push('/manager/menu/category');
    } catch (error) {
      console.error('Failed to create category:', error);
      toast.error('Có lỗi xảy ra khi tạo danh mục');
    }
  };

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Thêm danh mục mới</h1>
      </div> */}

      <CategoryForm 
        mode="create"
        onSuccess={handleSuccess} 
        onCancel={() => router.back()}
        isLoading={isLoading} 
      />
    </div>
  );
}

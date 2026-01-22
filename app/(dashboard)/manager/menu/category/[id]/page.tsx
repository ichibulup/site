'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { CategoryForm } from '@/components/form/mock/category';
import { useGetCategoryByIdQuery, useUpdateCategoryMutation } from '@/state/api';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const { data: categoryData, isLoading: isFetching } = useGetCategoryByIdQuery(id);
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();

  const handleSuccess = async (data: any) => {
    try {
      await updateCategory({ id, data }).unwrap();
      toast.success('Cập nhật danh mục thành công');
      router.push('/manager/menu/category');
    } catch (error) {
      console.error('Failed to update category:', error);
      toast.error('Có lỗi xảy ra khi cập nhật danh mục');
    }
  };

  if (isFetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!categoryData?.data) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">Không tìm thấy danh mục</p>
        <Button onClick={() => router.back()}>Quay lại</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa danh mục</h1>
      </div>

      <CategoryForm
        mode="update"
        initialValues={categoryData.data}
        onSuccess={handleSuccess}
        onCancel={() => router.back()}
        isLoading={isUpdating}
      />
    </div>
  );
}

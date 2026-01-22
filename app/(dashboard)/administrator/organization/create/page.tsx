'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizationForm } from '@/components/form/mock/organization';
import { Organization } from '@/lib/interfaces';

export default function OrganizationCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = (data: Organization) => {
    router.push(`/administrator/organization/${data.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tạo tổ chức mới</h1>
          <p className="text-gray-600 mt-2">
            Điền thông tin để tạo một tổ chức mới cho hệ thống quản lý nhà hàng
          </p>
        </div>

        <OrganizationForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

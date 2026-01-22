'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { OrganizationForm } from '@/components/form/mock/organization';
import { Organization } from '@/lib/interfaces';
import { useGetOrganizationByIdQuery } from '@/state/api';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function OrganizationEditPage({ params }: EditPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch organization using RTK Query
  const { data: organization, isLoading: isFetchingOrganization, error } = useGetOrganizationByIdQuery(params.id);

  if (isFetchingOrganization) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-500 text-center">Đang tải thông tin tổ chức...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Không tìm thấy tổ chức</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">
              Tổ chức với ID "{params.id}" không được tìm thấy
            </p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuccess = (data: Organization) => {
    router.push(`/administrator/organization`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Cập nhật tổ chức</h1>
          <p className="text-gray-600 mt-2">
            Chỉnh sửa thông tin của tổ chức: <strong>{organization.name}</strong>
          </p>
        </div>

        <OrganizationForm
          mode="update"
          initialValues={organization}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

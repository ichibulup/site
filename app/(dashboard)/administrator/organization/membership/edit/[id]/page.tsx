'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrganizationMembershipForm } from '@/components/form/mock/organization';
import { OrganizationMembership } from '@/lib/interfaces';
import { useGetOrganizationMembershipByIdQuery } from '@/state/api';
import { unwrapApiData } from '@/lib/utils/formatters';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function OrganizationMembershipEditPage({ params }: EditPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetOrganizationMembershipByIdQuery(params.id);

  const membership = unwrapApiData<OrganizationMembership | null>(data);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-500 text-center">Đang tải thông tin thành viên...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !membership) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <p className="text-red-700 mb-4">
              Không tìm thấy thành viên với ID "{params.id}"
            </p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push('/administrator/organization/memberships');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Cập nhật thành viên</h1>
          <p className="text-gray-600 mt-2">
            Điều chỉnh vai trò thành viên trong tổ chức
          </p>
        </div>

        <OrganizationMembershipForm
          mode="update"
          initialValues={membership}
          onSuccess={handleSuccess}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

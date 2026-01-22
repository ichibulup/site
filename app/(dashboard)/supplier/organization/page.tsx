'use client';

import { OrganizationForm, OrganizationMembershipForm } from '@/components/form/mock/organization';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useOrganization } from '@/hooks/use-organization';

export default function SupplierOrganizationPage() {
  const { organizationId, organization, isLoading, error, refetch } = useOrganization();

  if (isLoading) {
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

  if (error || !organizationId || !organization) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <p className="text-red-700 mb-4">
              Không tìm thấy tổ chức cho tài khoản này
            </p>
            <Button onClick={() => refetch()}>Thử lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Tổ chức của bạn</h1>
          <p className="text-gray-600 mt-2">
            Quản lý thông tin tổ chức và thành viên
          </p>
        </div>

        <OrganizationForm
          mode="update"
          initialValues={organization}
          onSuccess={() => refetch()}
        />

        <OrganizationMembershipForm
          mode="create"
          organizationId={organizationId}
          onSuccess={() => refetch()}
        />
      </div>
    </div>
  );
}

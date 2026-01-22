'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { OrganizationMembershipForm } from '@/components/form/mock/organization';
import { OrganizationMembership } from '@/lib/interfaces';

function OrganizationMembershipCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId') || undefined;

  const handleSuccess = (data: OrganizationMembership) => {
    if (organizationId) {
      router.push(`/administrator/organization/memberships?organizationId=${organizationId}`);
    } else {
      router.push('/administrator/organization/memberships');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Thêm thành viên tổ chức</h1>
          <p className="text-gray-600 mt-2">
            Gán người dùng vào tổ chức với vai trò phù hợp
          </p>
        </div>

        <OrganizationMembershipForm
          mode="create"
          organizationId={organizationId}
          onSuccess={handleSuccess}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

export default function OrganizationMembershipCreatePage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <OrganizationMembershipCreateContent />
    </Suspense>
  );
}

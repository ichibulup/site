'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RestaurantChainForm } from '@/components/form/mock/organization';
import { RestaurantChain } from '@/lib/interfaces';

function RestaurantChainCreateContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationId = searchParams.get('organizationId') || undefined;

  const handleSuccess = (data: RestaurantChain) => {
    if (organizationId) {
      router.push(`/administrator/organization/chains?organizationId=${organizationId}`);
    } else {
      router.push('/administrator/organization/chains');
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tạo chuỗi nhà hàng</h1>
          <p className="text-gray-600 mt-2">
            Tạo mới chuỗi nhà hàng cho tổ chức
          </p>
        </div>

        <RestaurantChainForm
          mode="create"
          organizationId={organizationId}
          onSuccess={handleSuccess}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

export default function RestaurantChainCreatePage() {
  return (
    <Suspense fallback={<div className="p-6">Đang tải...</div>}>
      <RestaurantChainCreateContent />
    </Suspense>
  );
}

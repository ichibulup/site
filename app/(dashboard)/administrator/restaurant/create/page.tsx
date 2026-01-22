'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { RestaurantForm } from '@/components/form/mock/organization';
import { Restaurant } from '@/lib/interfaces';

export default function RestaurantCreatePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSuccess = (data: Restaurant) => {
    router.push(`/administrator/restaurant/${data.id}`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tạo nhà hàng mới</h1>
          <p className="text-gray-600 mt-2">
            Điền thông tin để tạo một nhà hàng mới cho hệ thống quản lý
          </p>
        </div>

        <RestaurantForm
          mode="create"
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

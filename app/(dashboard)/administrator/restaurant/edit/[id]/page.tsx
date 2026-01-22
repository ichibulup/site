'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RestaurantForm } from '@/components/form/mock/organization';
import { Restaurant } from '@/lib/interfaces';
import { useGetRestaurantByIdQuery } from '@/state/api';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function RestaurantEditPage({ params }: EditPageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Fetch restaurant using RTK Query
  const { data: restaurant, isLoading: isFetchingRestaurant, error } = useGetRestaurantByIdQuery(params.id);

  if (isFetchingRestaurant) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-500 text-center">Đang tải thông tin nhà hàng...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <p className="text-red-700 mb-4">
              Nhà hàng với ID "{params.id}" không được tìm thấy
            </p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuccess = (data: Restaurant) => {
    router.push(`/administrator/restaurant`);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Cập nhật nhà hàng</h1>
          <p className="text-gray-600 mt-2">
            Chỉnh sửa thông tin của nhà hàng: <strong>{restaurant.name}</strong>
          </p>
        </div>

        <RestaurantForm
          mode="update"
          initialValues={restaurant}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RestaurantChainForm } from '@/components/form/mock/organization';
import { RestaurantChain } from '@/lib/interfaces';
import { useGetRestaurantChainByIdQuery } from '@/state/api';
import { unwrapApiData } from '@/lib/utils/formatters';

interface EditPageProps {
  params: {
    id: string;
  };
}

export default function RestaurantChainEditPage({ params }: EditPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetRestaurantChainByIdQuery(params.id);

  const chain = unwrapApiData<RestaurantChain | null>(data);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card>
          <CardContent className="py-8">
            <p className="text-gray-500 text-center">Đang tải thông tin chuỗi...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !chain) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-8">
            <p className="text-red-700 mb-4">
              Không tìm thấy chuỗi nhà hàng với ID "{params.id}"
            </p>
            <Button onClick={() => router.back()}>Quay lại</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSuccess = () => {
    router.push('/administrator/organization/chains');
  };

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Cập nhật chuỗi nhà hàng</h1>
          <p className="text-gray-600 mt-2">
            Chỉnh sửa thông tin chuỗi: <strong>{chain.name}</strong>
          </p>
        </div>

        <RestaurantChainForm
          mode="update"
          initialValues={chain}
          onSuccess={handleSuccess}
          onCancel={() => router.back()}
        />
      </div>
    </div>
  );
}

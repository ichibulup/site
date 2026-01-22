'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Organization, OrganizationMembership, RestaurantChain } from '@/lib/interfaces';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useGetOrganizationByIdQuery } from '@/state/api';
import { unwrapApiData } from '@/lib/utils/formatters';

type OrganizationDetail = Organization & {
  owner?: {
    id: string;
    email?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
  };
  memberships?: (OrganizationMembership & {
    user?: {
      id: string;
      email?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      avatarUrl?: string | null;
    };
  })[];
  chains?: RestaurantChain[];
  _count?: {
    restaurants: number;
    chains: number;
    memberships: number;
  };
};

interface OrganizationDetailPageProps {
  params: {
    id: string;
  };
}

export default function OrganizationDetailPage({ params }: OrganizationDetailPageProps) {
  const router = useRouter();
  const { data, isLoading, error } = useGetOrganizationByIdQuery(params.id);
  const organization = unwrapApiData<OrganizationDetail | null>(data);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-gray-500">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !organization) {
    return (
      <div className="container mx-auto py-10">
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Lỗi</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Không thể tải tổ chức</p>
            <Link href="/administrator/organization">
              <Button variant="outline">Quay lại danh sách</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberships = organization.memberships ?? [];
  const chains = organization.chains ?? [];

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex flex-wrap justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <Badge variant="default">Hoạt động</Badge>
          </div>
          <p className="text-gray-600">
            Mã: <span className="font-mono">{organization.code}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => router.push(`/administrator/organization/edit/${organization.id}`)}>
            Chỉnh sửa
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/administrator/organization/memberships?organizationId=${organization.id}`)
            }
          >
            Quản lý thành viên
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/administrator/organization/chains?organizationId=${organization.id}`)
            }
          >
            Quản lý chuỗi
          </Button>
          <Button variant="outline" onClick={() => router.push('/administrator/organization')}>
            Quay lại
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
              <CardDescription>Thông tin cơ bản về tổ chức</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Tên tổ chức</p>
                  <p className="text-base font-semibold">{organization.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Mã tổ chức</p>
                  <p className="text-base font-mono font-semibold">{organization.code}</p>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Mô tả</p>
                <p className="text-base">{organization.description || '—'}</p>
              </div>
              {organization.logoUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">Logo</p>
                  <img
                    src={organization.logoUrl}
                    alt={organization.name}
                    className="h-20 w-20 object-cover rounded border"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thành viên tổ chức</CardTitle>
              <CardDescription>
                {organization._count?.memberships ?? memberships.length} thành viên
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {memberships.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  Chưa có thành viên nào
                </p>
              ) : (
                memberships.slice(0, 5).map((member) => {
                  const name = `${member.user?.firstName ?? ''} ${member.user?.lastName ?? ''}`.trim();
                  return (
                    <div key={member.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {name || member.user?.email || member.userId}
                        </p>
                        <p className="text-xs text-muted-foreground">{member.user?.email || member.userId}</p>
                      </div>
                      <Badge variant="outline">{member.role}</Badge>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chuỗi nhà hàng</CardTitle>
              <CardDescription>
                {organization._count?.chains ?? chains.length} chuỗi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {chains.length === 0 ? (
                <p className="text-gray-500 text-center py-6">
                  Chưa có chuỗi nhà hàng nào
                </p>
              ) : (
                chains.slice(0, 5).map((chain) => (
                  <div key={chain.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{chain.name}</p>
                      <p className="text-xs text-muted-foreground">{chain.description || '—'}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/administrator/organization/chains/edit/${chain.id}`)}
                    >
                      Sửa
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin hệ thống</CardTitle>
              <CardDescription>Metadata</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">ID</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {organization.id}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Chủ tổ chức</p>
                <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                  {organization.owner?.email || organization.ownerId}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Nhà hàng</p>
                <p className="text-sm">
                  {organization._count?.restaurants ?? 0}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Ngày tạo</p>
                <p className="text-sm">
                  {format(new Date(organization.createdAt), 'dd/MM/yyyy HH:mm', {
                    locale: vi,
                  })}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Cập nhật lần cuối</p>
                <p className="text-sm">
                  {format(new Date(organization.updatedAt), 'dd/MM/yyyy HH:mm', {
                    locale: vi,
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hành động</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full"
                variant="outline"
                onClick={() => navigator.clipboard.writeText(organization.id)}
              >
                Sao chép ID
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  router.push(`/administrator/organization/memberships/create?organizationId=${organization.id}`)
                }
              >
                Thêm thành viên
              </Button>
              <Button
                className="w-full"
                variant="outline"
                onClick={() =>
                  router.push(`/administrator/organization/chains/create?organizationId=${organization.id}`)
                }
              >
                Tạo chuỗi nhà hàng
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

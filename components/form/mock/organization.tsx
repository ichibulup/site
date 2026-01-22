import React, { useState } from "react";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Clock, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { vi } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { unwrapApiData } from "@/lib/utils/formatters";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { 
  useCreateOrganizationMutation, 
  useUpdateOrganizationMutation,
  useGetAllRestaurantsQuery,
  useCreateRestaurantMutation,
  useUpdateRestaurantMutation,
  useCreateOrganizationMembershipMutation,
  useUpdateOrganizationMembershipMutation,
  useCreateRestaurantChainMutation,
  useUpdateRestaurantChainMutation,
} from "@/state/api";
import {
  CreateOrganizationSchema,
  UpdateOrganizationSchema,
  OrganizationQuery,
  CreateOrganization,
  UpdateOrganization,
  CreateOrganizationMembershipSchema,
  UpdateOrganizationMembershipSchema,
  CreateOrganizationMembership,
  UpdateOrganizationMembership,
  CreateRestaurantSchema,
  UpdateRestaurantSchema,
  RestaurantQuery,
  CreateRestaurant,
  UpdateRestaurant,
  CreateRestaurantChainSchema,
  UpdateRestaurantChainSchema,
  CreateRestaurantChain,
  UpdateRestaurantChain,
} from '@/schemas/organization'; // Organization
import { Organization, Restaurant, OrganizationMembership, RestaurantChain } from "@/lib/interfaces";
import { toast } from 'sonner';

interface OrganizationFormProps {
  mode?: 'create' | 'update';
  initialValues?: Partial<Organization>;
  onSuccess?: (data: Organization) => void;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

export function OrganizationForm({
  mode = "create",
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false
}: OrganizationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  type OrganizationFormValues = CreateOrganization | UpdateOrganization;

  const schema = mode === 'create' ? CreateOrganizationSchema : UpdateOrganizationSchema;

  // RTK Query hooks
  const [createOrganization, { isLoading: isCreatingOrganization }] = useCreateOrganizationMutation?.() || [null, { isLoading: false }];
  const [updateOrganizationMut, { isLoading: isUpdatingOrganization }] = useUpdateOrganizationMutation?.() || [null, { isLoading: false }];

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: (mode === 'create'
      ? {
          name: initialValues?.name || '',
          code: initialValues?.code || '',
          description: initialValues?.description || '',
          ownerId: initialValues?.ownerId || '',
          logoUrl: initialValues?.logoUrl || '',
        }
      : {
          name: initialValues?.name,
          code: initialValues?.code,
          description: initialValues?.description,
          logoUrl: initialValues?.logoUrl,
        }) as any,
    mode: 'onBlur',
  });

  const onSubmit = async (data: OrganizationFormValues) => {
    try {
      setIsSubmitting(true);

      if (mode === 'create' && createOrganization) {
        const result = await createOrganization(data).unwrap();
        toast.success('Tổ chức đã được tạo thành công!');
        if (onSuccess) {
          const payload = unwrapApiData<Organization>(result) || result;
          onSuccess(payload);
        }
      } else if (mode === 'update' && updateOrganizationMut && initialValues?.id) {
        const result = await updateOrganizationMut({
          id: initialValues.id,
          data: data,
        }).unwrap();
        toast.success('Tổ chức đã được cập nhật thành công!');
        if (onSuccess) {
          const payload = unwrapApiData<Organization>(result) || result;
          onSuccess(payload);
        }
      }
    } catch (error: any) {
      console.error('Error submitting organization:', error);
      toast.error(error?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isLoading || isSubmitting || isCreatingOrganization || isUpdatingOrganization;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'create' ? 'Tạo tổ chức mới' : 'Cập nhật tổ chức'}
            </CardTitle>
            <CardDescription>
              {mode === 'create'
                ? 'Vui lòng điền đầy đủ thông tin để tạo tổ chức mới'
                : 'Cập nhật thông tin chi tiết của tổ chức'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tên tổ chức */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên tổ chức *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên tổ chức"
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    Tên tổ chức của bạn, tối đa 100 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mã tổ chức */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã tổ chức *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: ABC_ORG-01"
                      {...field}
                      disabled={mode === 'update' || isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    Mã định danh tổ chức (chỉ chữ hoa, số, dấu gạch dưới và gạch ngang). Không thể thay đổi sau khi tạo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả về tổ chức..."
                      rows={4}
                      {...field}
                      value={field.value || ''}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả chi tiết về tổ chức của bạn, tối đa 500 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Logo URL */}
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      type="url"
                      {...field}
                      value={field.value || ''}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    URL của logo tổ chức
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Owner ID (chỉ hiển thị khi tạo mới) */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="ownerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID chủ sở hữu *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập UUID của chủ sở hữu"
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormDescription>
                      UUID của người sẽ sở hữu tổ chức này
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
              )}
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  submitText || (mode === 'create' ? 'Tạo tổ chức' : 'Cập nhật tổ chức')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

interface RestaurantFormProps {
  mode?: 'create' | 'update';
  initialValues?: Partial<Restaurant>;
  onSuccess?: (data: Restaurant) => void;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

export function RestaurantForm({
  mode = 'create',
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false,
}: RestaurantFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  type RestaurantFormValues = CreateRestaurant | UpdateRestaurant;

  const schema = mode === 'create' ? CreateRestaurantSchema : UpdateRestaurantSchema;

  // RTK Query hooks
  const [createRestaurant, { isLoading: isCreatingRestaurant }] = useCreateRestaurantMutation?.() || [null, { isLoading: false }];
  const [updateRestaurantMut, { isLoading: isUpdatingRestaurant }] = useUpdateRestaurantMutation?.() || [null, { isLoading: false }];

  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: (mode === 'create'
      ? {
        name: initialValues?.name || '',
        code: initialValues?.code || '',
        address: initialValues?.address || '',
        description: initialValues?.description || '',
        phoneNumber: initialValues?.phoneNumber || '',
        email: initialValues?.email || '',
        managerId: initialValues?.managerId || '',
        logoUrl: initialValues?.logoUrl || '',
        coverUrl: initialValues?.coverUrl || '',
        organizationId: initialValues?.organizationId || '',
        chainId: initialValues?.chainId || '',
        status: initialValues?.status || 'active',
        timezone: initialValues?.timezone || 'Asia/Ho_Chi_Minh',
      }
      : {
        name: initialValues?.name,
        code: initialValues?.code,
        address: initialValues?.address,
        description: initialValues?.description,
        phoneNumber: initialValues?.phoneNumber,
        email: initialValues?.email,
        logoUrl: initialValues?.logoUrl,
        coverUrl: initialValues?.coverUrl,
        chainId: initialValues?.chainId,
        status: initialValues?.status,
        timezone: initialValues?.timezone,
      }) as any,
    mode: 'onBlur',
  });

  const onSubmit = async (data: RestaurantFormValues) => {
    try {
      setIsSubmitting(true);

      if (mode === 'create' && createRestaurant) {
        const result = await createRestaurant(data).unwrap();
        toast.success('Nhà hàng đã được tạo thành công!');
        if (onSuccess) {
          const payload = unwrapApiData<Restaurant>(result) || result;
          onSuccess(payload);
        }
      } else if (mode === 'update' && updateRestaurantMut && initialValues?.id) {
        const result = await updateRestaurantMut({
          id: initialValues.id,
          data: data,
        }).unwrap();
        toast.success('Nhà hàng đã được cập nhật thành công!');
        if (onSuccess) {
          const payload = unwrapApiData<Restaurant>(result) || result;
          onSuccess(payload);
        }
      }
    } catch (error: any) {
      console.error('Error submitting restaurant:', error);
      toast.error(error?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isLoading || isSubmitting || isCreatingRestaurant || isUpdatingRestaurant;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'create' ? 'Tạo nhà hàng mới' : 'Cập nhật nhà hàng'}
            </CardTitle>
            <CardDescription>
              {mode === 'create'
                ? 'Vui lòng điền đầy đủ thông tin để tạo nhà hàng mới'
                : 'Cập nhật thông tin chi tiết của nhà hàng'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Tên nhà hàng */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên nhà hàng *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập tên nhà hàng"
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    Tên nhà hàng của bạn, tối đa 100 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Mã nhà hàng */}
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã nhà hàng *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: REST-001"
                      {...field}
                      disabled={mode === 'update' || isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    Mã định danh nhà hàng. Không thể thay đổi sau khi tạo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Địa chỉ */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập địa chỉ"
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Số điện thoại */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số điện thoại"
                        {...field}
                        value={field.value || ''}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập email"
                        type="email"
                        {...field}
                        value={field.value || ''}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quản lý */}
              <FormField
                control={form.control}
                name="managerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Quản lý {mode === 'create' && '*'}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập UUID quản lý"
                        {...field}
                        disabled={isProcessing || mode === 'update'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Mô tả */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập mô tả về nhà hàng..."
                      rows={4}
                      {...field}
                      value={field.value || ''}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormDescription>
                    Mô tả chi tiết về nhà hàng, tối đa 500 ký tự
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              {/* Logo URL */}
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.png"
                        type="url"
                        {...field}
                        value={field.value || ''}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cover URL */}
              <FormField
                control={form.control}
                name="coverUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/cover.png"
                        type="url"
                        {...field}
                        value={field.value || ''}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Trạng thái */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Trạng thái</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange} disabled={isProcessing}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="inactive">Không hoạt động</SelectItem>
                        <SelectItem value="maintenance">Bảo trì</SelectItem>
                        <SelectItem value="closed">Đóng cửa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timezone */}
              <FormField
                control={form.control}
                name="timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Múi giờ</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Asia/Ho_Chi_Minh"
                        {...field}
                        value={field.value || ''}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Organization ID (chỉ khi tạo) */}
            {mode === 'create' && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Tổ chức *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập UUID tổ chức"
                        {...field}
                        disabled={isProcessing}
                      />
                    </FormControl>
                    <FormDescription>
                      UUID của tổ chức chứa nhà hàng này
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
              )}
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  submitText || (mode === 'create' ? 'Tạo nhà hàng' : 'Cập nhật nhà hàng')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

interface OrganizationMembershipFormProps {
  mode?: 'create' | 'update';
  organizationId?: string;
  initialValues?: Partial<OrganizationMembership>;
  onSuccess?: (data: OrganizationMembership) => void;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

export function OrganizationMembershipForm({
  mode = 'create',
  organizationId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false,
}: OrganizationMembershipFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  type MembershipFormValues = CreateOrganizationMembership | UpdateOrganizationMembership;

  const schema = mode === 'create' ? CreateOrganizationMembershipSchema : UpdateOrganizationMembershipSchema;

  const [createMembership, { isLoading: isCreating }] = useCreateOrganizationMembershipMutation?.() || [null, { isLoading: false }];
  const [updateMembership, { isLoading: isUpdating }] = useUpdateOrganizationMembershipMutation?.() || [null, { isLoading: false }];

  const form = useForm<MembershipFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: (mode === 'create'
      ? {
          organizationId: organizationId || initialValues?.organizationId || '',
          userId: initialValues?.userId || '',
          role: initialValues?.role || 'member',
        }
      : {
          role: initialValues?.role || 'member',
        }) as any,
    mode: 'onBlur',
  });

  const onSubmit = async (data: MembershipFormValues) => {
    try {
      setIsSubmitting(true);

      if (mode === 'create' && createMembership) {
        const payload = {
          ...(data as CreateOrganizationMembership),
          organizationId:
            (data as CreateOrganizationMembership).organizationId ||
            organizationId ||
            initialValues?.organizationId ||
            '',
        };

        if (!payload.organizationId) {
          toast.error('Thiếu ID tổ chức');
          return;
        }

        const result = await createMembership(payload).unwrap();
        toast.success('Thêm thành viên thành công!');
        const output = unwrapApiData<OrganizationMembership>(result) || result;
        onSuccess?.(output);
      } else if (mode === 'update' && updateMembership && initialValues?.id) {
        const result = await updateMembership({
          id: initialValues.id,
          data,
        }).unwrap();
        toast.success('Cập nhật thành viên thành công!');
        const output = unwrapApiData<OrganizationMembership>(result) || result;
        onSuccess?.(output);
      }
    } catch (error: any) {
      console.error('Error submitting membership:', error);
      toast.error(error?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isLoading || isSubmitting || isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'create' ? 'Thêm thành viên' : 'Cập nhật thành viên'}
            </CardTitle>
            <CardDescription>
              {mode === 'create'
                ? 'Thêm người dùng vào tổ chức với vai trò phù hợp'
                : 'Cập nhật vai trò thành viên trong tổ chức'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {mode === 'create' && (
              <>
                <FormField
                  control={form.control}
                  name="organizationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID tổ chức *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập UUID tổ chức"
                          {...field}
                          disabled={isProcessing || !!organizationId}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID người dùng *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập UUID người dùng"
                          {...field}
                          disabled={isProcessing}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isProcessing}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn vai trò" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Quản trị</SelectItem>
                      <SelectItem value="member">Thành viên</SelectItem>
                      <SelectItem value="guest">Khách</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
              )}
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  submitText || (mode === 'create' ? 'Thêm thành viên' : 'Cập nhật')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

interface RestaurantChainFormProps {
  mode?: 'create' | 'update';
  organizationId?: string;
  initialValues?: Partial<RestaurantChain>;
  onSuccess?: (data: RestaurantChain) => void;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

export function RestaurantChainForm({
  mode = 'create',
  organizationId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false,
}: RestaurantChainFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  type ChainFormValues = CreateRestaurantChain | UpdateRestaurantChain;

  const schema = mode === 'create' ? CreateRestaurantChainSchema : UpdateRestaurantChainSchema;

  const [createChain, { isLoading: isCreating }] = useCreateRestaurantChainMutation?.() || [null, { isLoading: false }];
  const [updateChain, { isLoading: isUpdating }] = useUpdateRestaurantChainMutation?.() || [null, { isLoading: false }];

  const form = useForm<ChainFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: (mode === 'create'
      ? {
          name: initialValues?.name || '',
          description: initialValues?.description || '',
          logoUrl: initialValues?.logoUrl || '',
          organizationId: organizationId || initialValues?.organizationId || '',
        }
      : {
          name: initialValues?.name,
          description: initialValues?.description,
          logoUrl: initialValues?.logoUrl,
        }) as any,
    mode: 'onBlur',
  });

  const onSubmit = async (data: ChainFormValues) => {
    try {
      setIsSubmitting(true);

      if (mode === 'create' && createChain) {
        const payload = {
          ...(data as CreateRestaurantChain),
          organizationId:
            (data as CreateRestaurantChain).organizationId ||
            organizationId ||
            initialValues?.organizationId ||
            '',
        };

        if (!payload.organizationId) {
          toast.error('Thiếu ID tổ chức');
          return;
        }

        const result = await createChain(payload).unwrap();
        toast.success('Chuỗi nhà hàng đã được tạo!');
        const output = unwrapApiData<RestaurantChain>(result) || result;
        onSuccess?.(output);
      } else if (mode === 'update' && updateChain && initialValues?.id) {
        const result = await updateChain({
          id: initialValues.id,
          data,
        }).unwrap();
        toast.success('Chuỗi nhà hàng đã được cập nhật!');
        const output = unwrapApiData<RestaurantChain>(result) || result;
        onSuccess?.(output);
      }
    } catch (error: any) {
      console.error('Error submitting restaurant chain:', error);
      toast.error(error?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isProcessing = isLoading || isSubmitting || isCreating || isUpdating;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              {mode === 'create' ? 'Tạo chuỗi nhà hàng' : 'Cập nhật chuỗi nhà hàng'}
            </CardTitle>
            <CardDescription>
              {mode === 'create'
                ? 'Thêm chuỗi nhà hàng mới vào tổ chức'
                : 'Chỉnh sửa thông tin chuỗi nhà hàng'}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên chuỗi *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="VD: Waddles Group"
                      {...field}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mô tả</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Mô tả chuỗi nhà hàng..."
                      rows={3}
                      {...field}
                      value={field.value || ''}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/logo.png"
                      type="url"
                      {...field}
                      value={field.value || ''}
                      disabled={isProcessing}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === 'create' && (
              <FormField
                control={form.control}
                name="organizationId"
                render={({ field }) => (
                <FormItem>
                  <FormLabel>ID tổ chức *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nhập UUID tổ chức"
                      {...field}
                      disabled={isProcessing || !!organizationId}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            )}

            <div className="flex gap-4 pt-4">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isProcessing}
                >
                  Hủy
                </Button>
              )}
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Đang xử lý...
                  </>
                ) : (
                  submitText || (mode === 'create' ? 'Tạo chuỗi' : 'Cập nhật')
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

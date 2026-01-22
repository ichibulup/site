"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateUserSchema, UpdateUserSchema } from "@/schemas/user";
import { useOrganization } from "@/hooks/use-organization";
import { useGetAllRestaurantsQuery } from "@/state/api";
import {
  User,
  UserActivityStatus,
  UserRole,
  UserStatus,
} from "@/lib/interfaces";

export interface UserFormProps {
  mode?: "create" | "update";
  initialValues?: Partial<User>;
  onSuccess?: (data: User | z.infer<typeof CreateUserSchema>) => void;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

const roleLabels: Record<UserRole, string> = {
  [UserRole.customer]: "Khách hàng",
  [UserRole.staff]: "Nhân viên",
  [UserRole.manager]: "Quản lý",
  [UserRole.admin]: "Quản trị",
  [UserRole.master]: "Tổng quản",
  [UserRole.delivery]: "Giao hàng",
  [UserRole.supplier]: "Nhà cung cấp",
  [UserRole.warehouse]: "Kho",
};

const statusLabels: Record<UserStatus, string> = {
  [UserStatus.active]: "Hoạt động",
  [UserStatus.inactive]: "Không hoạt động",
  [UserStatus.banned]: "Bị khóa",
  [UserStatus.suspended]: "Tạm dừng",
  [UserStatus.pendingVerification]: "Chờ xác thực",
  [UserStatus.locked]: "Đã khóa",
  [UserStatus.onLeave]: "Nghỉ phép",
};

const activityLabels: Record<UserActivityStatus, string> = {
  [UserActivityStatus.available]: "Sẵn sàng",
  [UserActivityStatus.busy]: "Bận",
  [UserActivityStatus.doNotDisturb]: "Không làm phiền",
  [UserActivityStatus.away]: "Vắng mặt",
  [UserActivityStatus.offline]: "Ngoại tuyến",
  [UserActivityStatus.invisible]: "Ẩn",
};

const creatableRoles: UserRole[] = [
  UserRole.manager,
  UserRole.staff,
  UserRole.delivery,
  UserRole.warehouse,
  UserRole.customer,
];

export function UserForm({
  mode = "create",
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false,
}: UserFormProps) {
  const schema = mode === "create" ? CreateUserSchema : UpdateUserSchema;
  const roleOptions = mode === "create" ? creatableRoles : Object.values(UserRole);
  const { organizationId } = useOrganization();
  const { data: restaurants = [] } = useGetAllRestaurantsQuery(undefined, {
    skip: mode !== "create",
  });

  const baseDefaults = {
    ...(mode === "create" ? { email: initialValues?.email ?? "" } : {}),
    username: initialValues?.username ?? undefined,
    fullName: initialValues?.fullName ?? undefined,
    firstName: initialValues?.firstName ?? undefined,
    lastName: initialValues?.lastName ?? undefined,
    phoneCode: initialValues?.phoneCode ?? undefined,
    phoneNumber: initialValues?.phoneNumber ?? undefined,
    avatarUrl: initialValues?.avatarUrl ?? undefined,
    role: initialValues?.role ?? UserRole.customer,
    status: initialValues?.status ?? UserStatus.active,
    activityStatus: initialValues?.activityStatus ?? UserActivityStatus.available,
  };

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema as any),
    defaultValues: (mode === "create"
      ? baseDefaults
      : { ...baseDefaults, id: initialValues?.id ?? "" }) as z.infer<typeof schema>,
    mode: "onBlur",
  });

  const organizationRestaurants = React.useMemo(() => {
    if (!organizationId) return [];
    return restaurants.filter((restaurant) => restaurant.organizationId === organizationId);
  }, [organizationId, restaurants]);

  const selectedRole = form.watch("role");
  const shouldSelectRestaurant =
    mode === "create" && (selectedRole ?? UserRole.customer) !== UserRole.customer;

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (onSuccess) {
      onSuccess(data as User);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {submitText || (mode === "create" ? "Tạo người dùng" : "Cập nhật")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin người dùng</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {mode === "create" && (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {shouldSelectRestaurant && (
              <FormField
                control={form.control}
                name="restaurantId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nhà hàng</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                      disabled={!organizationId || organizationRestaurants.length === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn nhà hàng" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {organizationRestaurants.map((restaurant) => (
                          <SelectItem key={restaurant.id} value={restaurant.id}>
                            {restaurant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input placeholder="Nguyễn Văn A" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên đăng nhập</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Số điện thoại</FormLabel>
                  <FormControl>
                    <Input placeholder="0123456789" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Avatar URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quyền & trạng thái</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vai trò</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {roleOptions.map((role) => (
                  <SelectItem key={role} value={role}>
                    {roleLabels[role]}
                  </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UserStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {statusLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="activityStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoạt động</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn trạng thái" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.values(UserActivityStatus).map((status) => (
                        <SelectItem key={status} value={status}>
                          {activityLabels[status]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

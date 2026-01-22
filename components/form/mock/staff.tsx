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
import {
  CreateRestaurantUserRoleSchema,
  UpdateRestaurantUserRoleSchema,
} from "@/schemas/organization";
import {
  RestaurantStaffRole,
  StaffStatus,
  RestaurantUserRole,
  Restaurant,
  User,
} from "@/lib/interfaces";
import { useGetAllRestaurantsQuery, useGetAllUsersQuery } from "@/state/api";

export interface RestaurantUserRoleFormProps {
  mode?: "create" | "update";
  initialValues?: Partial<RestaurantUserRole> & {
    user?: Partial<User> | null;
    restaurant?: Partial<Restaurant> | null;
  };
  onSuccess?: (data: RestaurantUserRole | z.infer<typeof CreateRestaurantUserRoleSchema>) => void;
  onCancel?: () => void;
  submitText?: string;
  isLoading?: boolean;
}

const roleLabels: Record<RestaurantStaffRole, string> = {
  [RestaurantStaffRole.staff]: "Nhân viên",
  [RestaurantStaffRole.manager]: "Quản lý",
  [RestaurantStaffRole.chef]: "Bếp trưởng",
  [RestaurantStaffRole.cashier]: "Thu ngân",
  [RestaurantStaffRole.security]: "Bảo vệ",
  [RestaurantStaffRole.cleaner]: "Tạp vụ",
  [RestaurantStaffRole.supervisor]: "Giám sát",
  [RestaurantStaffRole.sousChef]: "Bếp phó",
  [RestaurantStaffRole.waiter]: "Phục vụ",
  [RestaurantStaffRole.host]: "Lễ tân",
};

const statusLabels: Record<StaffStatus, string> = {
  [StaffStatus.active]: "Đang làm việc",
  [StaffStatus.inactive]: "Tạm nghỉ",
  [StaffStatus.onLeave]: "Nghỉ phép",
  [StaffStatus.suspended]: "Tạm dừng",
  [StaffStatus.terminated]: "Đã nghỉ việc",
};

export function RestaurantUserRoleForm({
  mode = "create",
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false,
}: RestaurantUserRoleFormProps) {
  const schema = mode === "create" ? CreateRestaurantUserRoleSchema : UpdateRestaurantUserRoleSchema;

  const { data: restaurants = [] } = useGetAllRestaurantsQuery();
  const { data: users = [] } = useGetAllUsersQuery();

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      restaurantId: initialValues?.restaurantId ?? "",
      userId: initialValues?.userId ?? "",
      role: initialValues?.role ?? RestaurantStaffRole.staff,
      status: initialValues?.status ?? StaffStatus.active,
      hourlyRate: initialValues?.hourlyRate ? Number(initialValues.hourlyRate) : undefined,
    } as z.infer<typeof schema>,
    mode: "onBlur",
  });

  const onSubmit = (data: z.infer<typeof schema>) => {
    if (onSuccess) {
      onSuccess(data as RestaurantUserRole);
    }
  };

  const restaurantLabel =
    initialValues?.restaurant?.name ||
    initialValues?.restaurantId ||
    "Chưa chọn nhà hàng";
  const userLabel =
    initialValues?.user?.fullName ||
    initialValues?.user?.email ||
    initialValues?.userId ||
    "Chưa chọn nhân viên";

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {submitText || (mode === "create" ? "Thêm nhân viên" : "Cập nhật")}
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Thông tin nhân viên</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {mode === "create" ? (
              <>
                <FormField
                  control={form.control}
                  name="restaurantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà hàng *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhà hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {restaurants.map((restaurant) => (
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

                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhân viên *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhân viên" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.fullName || user.email}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <FormLabel>Nhà hàng</FormLabel>
                  <Input value={restaurantLabel} readOnly />
                </div>
                <div className="space-y-2">
                  <FormLabel>Nhân viên</FormLabel>
                  <Input value={userLabel} readOnly />
                </div>
              </>
            )}

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
                      {Object.values(RestaurantStaffRole).map((role) => (
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
                      {Object.values(StaffStatus).map((status) => (
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
              name="hourlyRate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lương theo giờ</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={field.value ?? ""}
                      onChange={(event) => {
                        const value = event.target.value;
                        field.onChange(value ? Number(value) : undefined);
                      }}
                    />
                  </FormControl>
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

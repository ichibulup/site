import React from "react";
import {
  CreatePromotionSchema,
  CreateVoucherSchema,
  UpdatePromotionSchema,
  UpdateVoucherSchema,
} from "@/schemas/promotion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Promotion, Voucher } from "@/lib/interfaces";

export interface PromotionFormProps {
  mode?: "create" | "update"
  restaurantId?: string
  initialValues?: Partial<Promotion>
  onSuccess?: (data: Promotion) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export function PromotionForm({
  mode = "create",
  restaurantId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false
}: PromotionFormProps) {
  const schema = mode === "create" ? CreatePromotionSchema : UpdatePromotionSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      restaurantId: restaurantId || initialValues?.restaurantId || "",
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      type: initialValues?.type || "percentage",
      discountValue: initialValues?.discountValue ? Number(initialValues.discountValue as any) : 0,
      conditions: initialValues?.conditions ? JSON.stringify(initialValues.conditions, null, 2) : "",
      menuItemIds: (initialValues as any)?.menuItemIds || (initialValues as any)?.applicableItems || [],
      timeRestrictions: initialValues?.timeRestrictions ? JSON.stringify(initialValues.timeRestrictions, null, 2) : "",
      startDate: initialValues?.startDate ? new Date(initialValues.startDate) : undefined,
      endDate: initialValues?.endDate ? new Date(initialValues.endDate) : undefined,
      isActive: initialValues?.isActive ?? true,
    },
    mode: "onBlur"
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      // Convert date strings to Date objects and parse JSON fields
      const processedData = {
        ...data,
        startDate: data.startDate,
        endDate: data.endDate,
        menuItemIds: (() => {
          const raw = (data as any).menuItemIds ?? (data as any).applicableItems;
          if (Array.isArray(raw)) return raw;
          if (typeof raw === 'string') return raw.split(',').map((id: string) => id.trim()).filter(Boolean);
          return [];
        })(),
        conditions: data.conditions ? JSON.parse(data.conditions as string) : undefined,
        timeRestrictions: data.timeRestrictions ? JSON.parse(data.timeRestrictions as string) : undefined,
      };

      console.log("Submitting promotion:", processedData);

      // Here you would call your API mutation
      // For now, just call onSuccess with the data
      if (onSuccess) {
        onSuccess(processedData as any);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end gap-4 mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              submitText || (mode === "create" ? "Tạo khuyến mãi" : "Cập nhật khuyến mãi")
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên khuyến mãi</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Giảm giá 20% cho combo" {...field} />
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
                        <Textarea placeholder="Mô tả chi tiết về khuyến mãi..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại khuyến mãi</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                              <SelectItem value="fixedAmount">Số tiền cố định</SelectItem>
                              <SelectItem value="buyOneGetOne">Mua 1 tặng 1</SelectItem>
                              <SelectItem value="comboDeal">Combo</SelectItem>
                              <SelectItem value="happyHour">Giờ vàng</SelectItem>
                              <SelectItem value="seasonal">Theo mùa</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị giảm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thời gian áp dụng</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value
                                ? typeof field.value === 'string'
                                  ? field.value
                                  : field.value.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value
                                ? typeof field.value === 'string'
                                  ? field.value
                                  : field.value.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Điều kiện áp dụng (JSON)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="conditions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Điều kiện (JSON format)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`{
  "min_order_value": 100000,
  "min_quantity": 2,
  "customer_type": "vip",
  "order_type": "dine_in"
}`}
                          className="font-mono text-sm"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Định nghĩa điều kiện áp dụng khuyến mãi dưới dạng JSON. Có thể bao gồm: min_order_value, min_quantity, customer_type, order_type, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giới hạn thời gian (JSON)</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="timeRestrictions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới hạn thời gian (JSON format)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={`{
  "start_time": "17:00",
  "end_time": "21:00",
  "days_of_week": [1, 2, 3, 4, 5],
  "exclude_holidays": false
}`}
                          className="font-mono text-sm"
                          rows={6}
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Định nghĩa giới hạn thời gian áp dụng khuyến mãi dưới dạng JSON. Có thể bao gồm: start_time, end_time, days_of_week, exclude_holidays.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Kích hoạt</FormLabel>
                        <FormDescription>
                          Khuyến mãi có đang hoạt động hay không
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Áp dụng cho</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="menuItemIds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ID món ăn (cách nhau bởi dấu phẩy)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="uuid1, uuid2, uuid3"
                          {...field}
                          value={Array.isArray(field.value) ? field.value.join(', ') : field.value || ''}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      </FormControl>
                      <FormDescription>
                        Để trống để áp dụng cho tất cả món ăn, hoặc nhập ID các món ăn cụ thể.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

export interface VoucherFormProps {
  mode?: "create" | "update"
  restaurantId?: string
  initialValues?: Partial<Voucher>
  onSuccess?: (data: Voucher) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export function VoucherForm({
  mode = "create",
  restaurantId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false,
}: VoucherFormProps) {
  const schema = mode === "create" ? CreateVoucherSchema : UpdateVoucherSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      code: initialValues?.code || "",
      name: initialValues?.name || "",
      description: initialValues?.description ?? "",
      discountType: initialValues?.discountType || "percentage",
      discountValue: initialValues?.discountValue ? Number(initialValues.discountValue as any) : 0,
      minOrderValue: initialValues?.minOrderValue ? Number(initialValues.minOrderValue as any) : undefined,
      maxDiscount: initialValues?.maxDiscount ? Number(initialValues.maxDiscount as any) : undefined,
      restaurantId: restaurantId || initialValues?.restaurantId || undefined,
      startDate: initialValues?.startDate ? new Date(initialValues.startDate) : undefined,
      endDate: initialValues?.endDate ? new Date(initialValues.endDate) : undefined,
      usageLimit: initialValues?.usageLimit ?? undefined,
      isActive: initialValues?.isActive ?? true,
    },
    mode: "onBlur",
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const processedData = {
        ...data,
        // restaurantId: data.restaurantId || restaurantId,
        startDate: data.startDate,
        endDate: data.endDate,
      };

      console.log("Submitting voucher:", processedData);

      if (onSuccess) {
        onSuccess(processedData as any);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-end gap-4 mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Hủy
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              submitText || (mode === "create" ? "Tạo mã giảm giá" : "Cập nhật mã giảm giá")
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin cơ bản</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {mode === "create" && (
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mã giảm giá</FormLabel>
                        <FormControl>
                          <Input placeholder="VD: WELCOME10" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tên mã giảm giá</FormLabel>
                      <FormControl>
                        <Input placeholder="Ví dụ: Giảm 10% cho khách mới" {...field} />
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
                        <Textarea placeholder="Mô tả chi tiết về mã giảm giá..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="discountType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Loại giảm giá</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn loại" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Phần trăm (%)</SelectItem>
                              <SelectItem value="fixedAmount">Số tiền cố định</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị giảm</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Thời gian áp dụng</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày bắt đầu</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value
                                ? typeof field.value === 'string'
                                  ? field.value
                                  : field.value.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ngày kết thúc</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            {...field}
                            value={
                              field.value
                                ? typeof field.value === 'string'
                                  ? field.value
                                  : field.value.toISOString().split('T')[0]
                                : ''
                            }
                            onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giới hạn áp dụng</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="minOrderValue"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Giá trị tối thiểu</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxDiscount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mức giảm tối đa</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value === "" ? undefined : Number(value));
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="usageLimit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Giới hạn lượt sử dụng</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="1"
                          placeholder="0"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value === "" ? undefined : Number(value));
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Để trống nếu không giới hạn số lượt sử dụng.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Trạng thái</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Kích hoạt</FormLabel>
                        <FormDescription>
                          Mã giảm giá có đang hoạt động hay không
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}

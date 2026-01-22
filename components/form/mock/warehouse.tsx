"use client";

import React, { useEffect, useState } from 'react';
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from '@/components/ui/calendar';
import {
  CreateWarehouseSchema,
  UpdateWarehouseSchema,
  WarehouseReceiptSchema,
  WarehouseTransferSchema,
  WarehouseIssueSchema
} from "@/schemas/inventory";
import { 
  CreatePurchaseOrderSchema,
  CreatePurchaseOrder,
  CreatePurchaseOrderItem,
  PurchaseOrder
} from '@/schemas/supply';
import {
  useGetSuppliersQuery,
  useGetAllInventoryItemsQuery,
  useCreatePurchaseOrderMutation,
  useGetWarehousesQuery
} from '@/state/api';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import {
  WarehouseIssueStatus, WarehouseReceipt, WarehouseReceiptStatus, WarehouseTransfer, WarehouseIssue,
  WarehouseIssuePurpose, WarehouseTransferStatus
} from "@/lib/interfaces"

export interface WarehouseFormProps {
  mode?: "create" | "update"
  restaurantId?: string
  initialValues?: any
  onSuccess?: (data: any) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export function WarehouseForm({
  mode = "create",
  restaurantId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false
}: WarehouseFormProps) {
  const schema = mode === "create" ? CreateWarehouseSchema : UpdateWarehouseSchema;
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      restaurantId: restaurantId || initialValues?.restaurantId || "4ac60dce-ce60-4df4-a950-3585cbef426f",
      name: initialValues?.name || "",
      address: initialValues?.address || "",
      contactName: initialValues?.contactName || initialValues?.contact_name || "",
      contactPhone: initialValues?.contactPhone || initialValues?.contact_phone || "",
      isActive: initialValues?.isActive ?? initialValues?.is_active ?? true,
    },
    mode: "onBlur"
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      if (onSuccess) {
        onSuccess(data);
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
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              submitText || (mode === "create" ? "Tạo kho" : "Cập nhật")
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="col-span-full">
            <CardHeader>
              <CardTitle>Thông tin kho hàng</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên kho *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Kho chính, Kho lạnh" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Địa chỉ</FormLabel>
                    <FormControl>
                      <Input placeholder="Địa chỉ kho hàng" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Người liên hệ</FormLabel>
                      <FormControl>
                        <Input placeholder="Tên người quản lý kho" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Số điện thoại</FormLabel>
                      <FormControl>
                        <Input placeholder="Số điện thoại liên hệ" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Hoạt động
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Kho hàng này đang hoạt động và có thể nhập/xuất hàng
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>
      </form>
    </Form>
  );
}

interface CreatePurchaseOrderFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultRestaurantId?: string;
  defaultUserId?: string;
}

export function CreatePurchaseOrderForm({
  onSuccess,
  onCancel,
  defaultRestaurantId = '',
  defaultUserId = '',
}: {
  onSuccess?: () => void,
  onCancel?: () => void,
  defaultRestaurantId?: string,
  defaultUserId?: string,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // API hooks
  const { data: suppliersData = [], isLoading: loadingSuppliers } = useGetSuppliersQuery();
  const { data: inventoryItems = [], isLoading: loadingInventoryItems } = useGetAllInventoryItemsQuery();
  const [createPurchaseOrder] = useCreatePurchaseOrderMutation();

  // React Hook Form với Zod validation
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(CreatePurchaseOrderSchema),
    defaultValues: {
      supplierId: '',
      restaurantId: defaultRestaurantId,
      orderNumber: `PO-${Date.now()}`,
      status: 'draft',
      orderDate: new Date(),
      totalAmount: 0,
      notes: '',
      createdById: defaultUserId || undefined,
      items: [
        {
          inventoryItemId: '',
          quantity: 1,
          unitPrice: 0,
          totalPrice: 0,
          receivedQty: 0,
          notes: '',
        },
      ],
    },
  });

  // useFieldArray để quản lý danh sách items động
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  // Watch để tính toán tự động
  const watchedItems = watch('items') ?? [];
  const watchedSupplierId = watch('supplierId');

  // Tự động tính totalPrice cho từng item khi quantity hoặc unitPrice thay đổi
  useEffect(() => {
    watchedItems.forEach((item: any, index: number) => {
      const quantity = Number(item.quantity) || 0;
      const unitPrice = Number(item.unitPrice) || 0;
      const totalPrice = quantity * unitPrice;
      
      if (item.totalPrice !== totalPrice) {
        setValue(`items.${index}.totalPrice`, totalPrice);
      }
    });
  }, [watchedItems, setValue]);

  // Tự động tính totalAmount cho đơn hàng
  useEffect(() => {
    const total = watchedItems.reduce((sum: number, item: any) => {
      return sum + (Number(item.totalPrice) || 0);
    }, 0);
    setValue('totalAmount', total);
  }, [watchedItems, setValue]);

  // Thêm item mới vào danh sách
  const handleAddItem = () => {
    append({
      inventoryItemId: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      receivedQty: 0,
      notes: '',
    });
  };

  // Xóa item khỏi danh sách
  const handleRemoveItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    } else {
      toast.error('Đơn hàng phải có ít nhất 1 sản phẩm');
    }
  };

  // Submit form
  const onSubmit = async (data: any) => {
    try {
      if (!data.restaurantId) {
        toast.error('Vui lòng chọn nhà hàng trước khi tạo đơn');
        return;
      }

      setIsSubmitting(true);

      // Format dữ liệu để gửi lên API
      const payload = {
        ...data,
        orderDate: data.orderDate.toISOString(),
        expectedDate: data.expectedDate ? data.expectedDate.toISOString() : undefined,
        receivedDate: data.receivedDate ? data.receivedDate.toISOString() : undefined,
        totalAmount: Number(data.totalAmount),
        notes: data.notes || undefined,
        createdById: data.createdById || undefined,
        items: data.items.map((item: any) => ({
          inventoryItemId: item.inventoryItemId,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          receivedQty: Number(item.receivedQty || 0),
          notes: item.notes || undefined,
        })),
      };

      await createPurchaseOrder(payload).unwrap();
      
      toast.success('Tạo đơn đặt hàng thành công!');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error creating purchase order:', error);
      toast.error(error?.data?.message || 'Có lỗi xảy ra khi tạo đơn đặt hàng');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lấy supplier items theo supplierId để suggest unitPrice
  const getSupplierItemPrice = (inventoryItemId: string): number => {
    // TODO: Implement logic để lấy giá từ SupplierItem nếu có
    // Hiện tại return 0, có thể mở rộng sau
    return 0;
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Thông tin cơ bản */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin đơn hàng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nhà cung cấp */}
            <div className="space-y-2">
              <Label htmlFor="supplierId">
                Nhà cung cấp <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="supplierId"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={cn(errors.supplierId && 'border-red-500')}>
                      <SelectValue placeholder="Chọn nhà cung cấp" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingSuppliers ? (
                        <SelectItem value="loading" disabled>
                          Đang tải...
                        </SelectItem>
                      ) : suppliersData.length === 0 ? (
                        <SelectItem value="empty" disabled>
                          Không có nhà cung cấp
                        </SelectItem>
                      ) : (
                        suppliersData.map((supplier: any) => (
                          <SelectItem key={supplier.id} value={supplier.id}>
                            {supplier.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.supplierId && (
                <p className="text-sm text-red-500">{errors.supplierId.message}</p>
              )}
            </div>

            {/* Mã đơn hàng */}
            <div className="space-y-2">
              <Label htmlFor="orderNumber">
                Mã đơn hàng <span className="text-red-500">*</span>
              </Label>
              <Input
                id="orderNumber"
                {...register('orderNumber')}
                className={cn(errors.orderNumber && 'border-red-500')}
                placeholder="VD: PO-2024-001"
              />
              {errors.orderNumber && (
                <p className="text-sm text-red-500">{errors.orderNumber.message}</p>
              )}
            </div>

            {/* Trạng thái */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Nháp</SelectItem>
                      <SelectItem value="sent">Đã gửi</SelectItem>
                      <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                      <SelectItem value="partiallyReceived">Nhận một phần</SelectItem>
                      <SelectItem value="received">Đã nhận</SelectItem>
                      <SelectItem value="cancelled">Đã hủy</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* Ngày đặt hàng */}
            <div className="space-y-2">
              <Label>
                Ngày đặt hàng <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="orderDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground',
                          errors.orderDate && 'border-red-500'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value as any, 'PPP', { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        locale={vi}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.orderDate && (
                <p className="text-sm text-red-500">{errors.orderDate.message}</p>
              )}
            </div>

            {/* Ngày dự kiến */}
            <div className="space-y-2">
              <Label>Ngày dự kiến nhận hàng</Label>
              <Controller
                name="expectedDate"
                control={control}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? (
                          format(field.value as any, 'PPP', { locale: vi })
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value as Date}
                        onSelect={field.onChange}
                        locale={vi}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
            </div>

            {/* Tổng tiền */}
            <div className="space-y-2">
              <Label htmlFor="totalAmount">Tổng tiền (tự động tính)</Label>
              <Input
                id="totalAmount"
                {...register('totalAmount')}
                type="number"
                step="0.01"
                readOnly
                className="bg-gray-50 cursor-not-allowed"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Nhập ghi chú cho đơn hàng..."
              rows={3}
              className={cn(errors.notes && 'border-red-500')}
            />
            {errors.notes && (
              <p className="text-sm text-red-500">{errors.notes.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Danh sách sản phẩm */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Danh sách sản phẩm</CardTitle>
          <Button type="button" onClick={handleAddItem} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm sản phẩm
          </Button>
        </CardHeader>
        <CardContent>
          {errors.items && !Array.isArray(errors.items) && (
            <p className="text-sm text-red-500 mb-4">{errors.items.message}</p>
          )}
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="border-2">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-12 gap-4">
                    {/* Sản phẩm */}
                    <div className="col-span-12 md:col-span-4 space-y-2">
                      <Label>
                        Sản phẩm <span className="text-red-500">*</span>
                      </Label>
                      <Controller
                        name={`items.${index}.inventoryItemId`}
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger
                              className={cn(
                                errors.items?.[index]?.inventoryItemId && 'border-red-500'
                              )}
                            >
                              <SelectValue placeholder="Chọn sản phẩm" />
                            </SelectTrigger>
                            <SelectContent>
                              {loadingInventoryItems ? (
                                <SelectItem value="loading" disabled>
                                  Đang tải...
                                </SelectItem>
                              ) : inventoryItems.length === 0 ? (
                                <SelectItem value="empty" disabled>
                                  Không có sản phẩm
                                </SelectItem>
                              ) : (
                                inventoryItems.map((item: any) => (
                                  <SelectItem key={item.id} value={item.id}>
                                    {item.name} ({item.unit})
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.items?.[index]?.inventoryItemId && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.inventoryItemId?.message}
                        </p>
                      )}
                    </div>

                    {/* Số lượng */}
                    <div className="col-span-6 md:col-span-2 space-y-2">
                      <Label>
                        Số lượng <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.quantity`)}
                        className={cn(errors.items?.[index]?.quantity && 'border-red-500')}
                        placeholder="0"
                      />
                      {errors.items?.[index]?.quantity && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.quantity?.message}
                        </p>
                      )}
                    </div>

                    {/* Đơn giá */}
                    <div className="col-span-6 md:col-span-2 space-y-2">
                      <Label>
                        Đơn giá <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.unitPrice`)}
                        className={cn(errors.items?.[index]?.unitPrice && 'border-red-500')}
                        placeholder="0"
                      />
                      {errors.items?.[index]?.unitPrice && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.unitPrice?.message}
                        </p>
                      )}
                    </div>

                    {/* Thành tiền */}
                    <div className="col-span-6 md:col-span-2 space-y-2">
                      <Label>Thành tiền</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`items.${index}.totalPrice`)}
                        readOnly
                        className="bg-gray-50 cursor-not-allowed"
                        placeholder="0"
                      />
                    </div>

                    {/* Nút xóa */}
                    <div className="col-span-6 md:col-span-2 space-y-2 flex items-end">
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        onClick={() => handleRemoveItem(index)}
                        disabled={fields.length === 1}
                        className="w-full"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Ghi chú cho item */}
                    <div className="col-span-12 space-y-2">
                      <Label>Ghi chú sản phẩm</Label>
                      <Input
                        {...register(`items.${index}.notes`)}
                        placeholder="Nhập ghi chú cho sản phẩm này..."
                        className={cn(errors.items?.[index]?.notes && 'border-red-500')}
                      />
                      {errors.items?.[index]?.notes && (
                        <p className="text-sm text-red-500">
                          {errors.items[index]?.notes?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Đang tạo...' : 'Tạo đơn hàng'}
        </Button>
      </div>
    </form>
  );
}

interface WarehouseTransferFormProps {
  initialValues?: Partial<WarehouseTransfer> & { items?: any[] }
  onSubmit: (values: WarehouseTransfer) => void
  isLoading?: boolean
  mode?: "create" | "update"
}

export function WarehouseTransferForm({
  initialValues,
  onSubmit,
  isLoading,
  mode = "create"
}: WarehouseTransferFormProps) {
  const { data: warehouses = [] } = useGetWarehousesQuery()
  const { data: inventoryItems = [] } = useGetAllInventoryItemsQuery()

  const form = useForm<any>({
    resolver: zodResolver(WarehouseTransferSchema),
    defaultValues: {
      fromWarehouseId: initialValues?.fromWarehouseId || "",
      toWarehouseId: initialValues?.toWarehouseId || "",
      transferDate: initialValues?.transferDate ? new Date(initialValues.transferDate) : new Date(),
      status: (initialValues?.status as WarehouseTransferStatus) || WarehouseTransferStatus.draft,
      notes: initialValues?.notes || "",
      items: initialValues?.items || [{
        inventoryItemId: "",
        quantity: 1,
      }]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="fromWarehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kho xuất</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kho xuất" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map((warehouse: any) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
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
            name="toWarehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kho nhập</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kho nhập" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map((warehouse: any) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
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
            name="transferDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày chuyển</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={WarehouseTransferStatus.draft}>Nháp</SelectItem>
                    <SelectItem value={WarehouseTransferStatus.pending}>Chờ duyệt</SelectItem>
                    <SelectItem value={WarehouseTransferStatus.approved}>Đã duyệt</SelectItem>
                    <SelectItem value={WarehouseTransferStatus.completed}>Hoàn thành</SelectItem>
                    <SelectItem value={WarehouseTransferStatus.cancelled}>Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea placeholder="Ghi chú thêm..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Chi tiết hàng hóa</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                inventoryItemId: "",
                quantity: 1,
              })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm hàng hóa
            </Button>
          </div>

          <div className="border rounded-md p-4 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-start border-b pb-4 last:border-0 last:pb-0">
                <div className="col-span-12 md:col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.inventoryItemId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Hàng hóa</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hàng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventoryItems.map((item: any) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Số lượng</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-5 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Ghi chú</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ghi chú" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 flex items-center justify-center pt-2 md:pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : mode === "create" ? "Tạo phiếu chuyển" : "Cập nhật phiếu chuyển"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
interface WarehouseReceiptFormProps {
  initialValues?: Partial<WarehouseReceipt> & { items?: any[] }
  onSubmit: (values: WarehouseReceipt) => void
  isLoading?: boolean
  mode?: "create" | "update"
}

export function WarehouseReceiptForm({
  initialValues,
  onSubmit,
  isLoading,
  mode = "create"
}: WarehouseReceiptFormProps) {
  const { data: warehouses = [] } = useGetWarehousesQuery()
  const { data: suppliers = [] } = useGetSuppliersQuery()
  const { data: inventoryItems = [] } = useGetAllInventoryItemsQuery()

  const form = useForm<any>({
    resolver: zodResolver(WarehouseReceiptSchema),
    defaultValues: {
      warehouseId: initialValues?.warehouseId || "",
      supplierId: initialValues?.supplierId || undefined,
      receiptDate: initialValues?.receiptDate ? new Date(initialValues.receiptDate) : new Date(),
      status: initialValues?.status || WarehouseReceiptStatus.draft,
      notes: initialValues?.notes || "",
      items: initialValues?.items?.map(item => ({
        ...item,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined
      })) || [{
        inventoryItemId: "",
        quantity: 1,
        unitPrice: 0,
      }]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  const calculateTotal = () => {
    const items = form.watch("items")
    return items.reduce((sum: number, item: { quantity: any; unitPrice: any; }) => {
      return sum + (Number(item.quantity || 0) * Number(item.unitPrice || 0))
    }, 0)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kho nhập</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kho" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map((warehouse: any) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
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
            name="supplierId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nhà cung cấp</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn nhà cung cấp (tùy chọn)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suppliers.map((supplier: any) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
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
            name="receiptDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày nhập</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={WarehouseReceiptStatus.draft}>Nháp</SelectItem>
                    <SelectItem value={WarehouseReceiptStatus.pending}>Chờ duyệt</SelectItem>
                    <SelectItem value={WarehouseReceiptStatus.approved}>Đã duyệt</SelectItem>
                    <SelectItem value={WarehouseReceiptStatus.received}>Đã nhập kho</SelectItem>
                    <SelectItem value={WarehouseReceiptStatus.cancelled}>Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea placeholder="Ghi chú thêm..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Chi tiết hàng hóa</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                inventoryItemId: "",
                quantity: 1,
                unitPrice: 0,
              })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm hàng hóa
            </Button>
          </div>

          <div className="border rounded-md p-4 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-start border-b pb-4 last:border-0 last:pb-0">
                <div className="col-span-12 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.inventoryItemId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Hàng hóa</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hàng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventoryItems.map((item: any) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Số lượng</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.unitPrice`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Đơn giá</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.expiryDate`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Hạn sử dụng</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>Chọn ngày</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-5 md:col-span-2">
                  <FormField
                    control={form.control}
                    name={`items.${index}.batchNumber`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Số lô</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Số lô" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 flex items-center justify-center pt-2 md:pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end text-lg font-semibold">
            Tổng tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(calculateTotal())}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : mode === "create" ? "Tạo phiếu nhập" : "Cập nhật phiếu nhập"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
interface WarehouseIssueFormProps {
  initialValues?: Partial<WarehouseIssue> & { items?: any[] }
  onSubmit: (values: WarehouseIssue) => void
  isLoading?: boolean
  mode?: "create" | "update"
}

export function WarehouseIssueForm({
  initialValues,
  onSubmit,
  isLoading,
  mode = "create"
}: WarehouseIssueFormProps) {
  const { data: warehouses = [] } = useGetWarehousesQuery()
  const { data: inventoryItems = [] } = useGetAllInventoryItemsQuery()

  const form = useForm<any>({
    resolver: zodResolver(WarehouseIssueSchema),
    defaultValues: {
      warehouseId: initialValues?.warehouseId || "",
      issueDate: initialValues?.issueDate ? new Date(initialValues.issueDate) : new Date(),
      status: initialValues?.status || WarehouseIssueStatus.draft,
      purpose: initialValues?.purpose || WarehouseIssuePurpose.cooking,
      notes: initialValues?.notes || "",
      items: initialValues?.items || [{
        inventoryItemId: "",
        quantity: 1,
      }]
    },
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kho xuất</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kho" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {warehouses.map((warehouse: any) => (
                      <SelectItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
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
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mục đích xuất</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mục đích" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={WarehouseIssuePurpose.cooking}>Nấu ăn</SelectItem>
                    <SelectItem value={WarehouseIssuePurpose.waste}>Hủy hàng</SelectItem>
                    <SelectItem value={WarehouseIssuePurpose.transfer}>Chuyển kho</SelectItem>
                    <SelectItem value={WarehouseIssuePurpose.adjustment}>Điều chỉnh</SelectItem>
                    <SelectItem value={WarehouseIssuePurpose.sample}>Hàng mẫu</SelectItem>
                    <SelectItem value={WarehouseIssuePurpose.maintenance}>Bảo trì</SelectItem>
                    <SelectItem value={WarehouseIssuePurpose.other}>Khác</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày xuất</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>Chọn ngày</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={WarehouseIssueStatus.draft}>Nháp</SelectItem>
                    <SelectItem value={WarehouseIssueStatus.pending}>Chờ duyệt</SelectItem>
                    <SelectItem value={WarehouseIssueStatus.approved}>Đã duyệt</SelectItem>
                    <SelectItem value={WarehouseIssueStatus.issued}>Đã xuất kho</SelectItem>
                    <SelectItem value={WarehouseIssueStatus.cancelled}>Đã hủy</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ghi chú</FormLabel>
              <FormControl>
                <Textarea placeholder="Ghi chú thêm..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Chi tiết hàng hóa</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                inventoryItemId: "",
                quantity: 1,
              })}
            >
              <Plus className="mr-2 h-4 w-4" />
              Thêm hàng hóa
            </Button>
          </div>

          <div className="border rounded-md p-4 space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-12 gap-4 items-start border-b pb-4 last:border-0 last:pb-0">
                <div className="col-span-12 md:col-span-5">
                  <FormField
                    control={form.control}
                    name={`items.${index}.inventoryItemId`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Hàng hóa</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn hàng" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {inventoryItems.map((item: any) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.unit})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-6 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.quantity`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Số lượng</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-5 md:col-span-3">
                  <FormField
                    control={form.control}
                    name={`items.${index}.notes`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={index !== 0 ? "sr-only" : ""}>Ghi chú</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ghi chú" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1 flex items-center justify-center pt-2 md:pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : mode === "create" ? "Tạo phiếu xuất" : "Cập nhật phiếu xuất"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { IngredientDataColumn, InventoryItem } from "@/lib/interfaces";
import {
  CreateInventoryBalanceSchema,
  CreateInventoryItemSchema,
  UpdateInventoryItemSchema
} from "@/schemas/inventory";
import { ArrowLeft } from "lucide-react";
import { useGetAllInventoryItemsQuery, useGetSuppliersQuery, useGetWarehousesQuery } from "@/state/api";

export interface InventoryItemFormProps {
  mode?: "create" | "update"
  organizationId?: string
  initialValues?: any // Using any to handle potential snake_case input
  onSuccess?: (data: InventoryItem) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export function InventoryItemForm({
  mode = "create",
  organizationId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false
}: InventoryItemFormProps) {
  const schema = mode === "create" ? CreateInventoryItemSchema : UpdateInventoryItemSchema;

  const { data: suppliers = [] } = useGetSuppliersQuery();

  const supplierOptions = React.useMemo(() => {
    const names = suppliers
      .map((s: any) => (s?.name ?? s?.companyName ?? s?.supplierName ?? s?.supplier_name ?? "") as string)
      .map((n) => n.trim())
      .filter(Boolean);
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  }, [suppliers]);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId:
        organizationId ||
        initialValues?.organizationId ||
        initialValues?.organization_id ||
        "",
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      category: initialValues?.category || "",
      unit: initialValues?.unit || "kg",
      unitCost: initialValues?.unitCost ?? initialValues?.unit_cost ?? 0,
      supplierName: initialValues?.supplierName ?? initialValues?.supplier ?? "",
      sku: initialValues?.sku || "",
      barcode: initialValues?.barcode || "",
      isActive: initialValues?.isActive ?? initialValues?.is_active ?? true,
    },
    mode: "onBlur"
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const cleaned: any = {
        ...data,
        // Allow optional fields to be left blank in the UI
        description: data.description?.trim() ? data.description : undefined,
        category: (data as any).category?.trim() ? (data as any).category : undefined,
        supplierName: data.supplierName?.trim() ? data.supplierName : undefined,
        sku: data.sku?.trim() ? data.sku : undefined,
        barcode: data.barcode?.trim() ? data.barcode : undefined,
      };

      console.log("Submitting inventory item:", cleaned);
      if (onSuccess) {
        onSuccess(cleaned as any);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex justify-between gap-4 mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
            {/* Huỷ */}
          </Button>
          <Button type="submit" disabled={isLoading} className="min-w-[120px]">
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              submitText || (mode === "create" ? "Tạo nguyên liệu" : "Cập nhật")
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin nguyên liệu</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="">Tên nguyên liệu *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: Thịt bò, Cà rốt, Gà ta"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">
                          Đơn vị tính *
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn đơn vị tính" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="kg">Kilogram (kg)</SelectItem>
                            <SelectItem value="gram">Gram (g)</SelectItem>
                            <SelectItem value="liter">Lít (l)</SelectItem>
                            <SelectItem value="ml">Mililit (ml)</SelectItem>
                            <SelectItem value="piece">Cái/Chiếc</SelectItem>
                            <SelectItem value="box">Hộp</SelectItem>
                            <SelectItem value="bottle">Chai</SelectItem>
                            <SelectItem value="can">Lon</SelectItem>
                            <SelectItem value="pack">Gói</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Danh mục
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Rau củ, Thịt, Gia vị..."
                          {...field}
                          value={field.value || ""}
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
                      <FormLabel className="text-sm font-medium">
                        Mô tả
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết về nguyên liệu..."
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Giá cả</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="unitCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Giá đơn vị (VNĐ)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined,
                            )
                          }
                          value={field.value || ""}
                        />
                      </FormControl>
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
                <CardTitle>Thông tin bổ sung</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="supplierName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Nhà cung cấp
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ""}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="(Có thể để trống)" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">(Không chọn)</SelectItem>
                            {supplierOptions.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sku"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Mã SKU
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mã SKU"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="barcode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">
                        Mã vạch
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mã vạch"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
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

interface InventoryBalanceFormProps {
  initialValues?: any
  onSubmit: (values: z.infer<typeof CreateInventoryBalanceSchema>) => void
  isLoading?: boolean
  mode?: "create" | "update"
}

export function InventoryBalanceForm({
  initialValues,
  onSubmit,
  isLoading,
  mode = "create"
}: InventoryBalanceFormProps) {
  const { data: warehouses = [] } = useGetWarehousesQuery()
  const { data: inventoryItems = [] } = useGetAllInventoryItemsQuery()

  const form = useForm<z.infer<typeof CreateInventoryBalanceSchema>>({
    resolver: zodResolver(CreateInventoryBalanceSchema as any),
    defaultValues: {
      restaurantId: initialValues?.restaurantId || "5dc89877-8c0b-482d-a71d-609d6e14cb9e",
      warehouseId: initialValues?.warehouseId || "",
      inventoryItemId: initialValues?.inventoryItemId || "",
      balanceDate: initialValues?.balanceDate ? new Date(initialValues.balanceDate) : new Date(),
      openingBalance: initialValues?.openingBalance || 0,
      receivedQty: initialValues?.receivedQty || 0,
      issuedQty: initialValues?.issuedQty || 0,
      adjustedQty: initialValues?.adjustedQty || 0,
      closingBalance: initialValues?.closingBalance || 0,
    },
  })

  const openingBalance = form.watch("openingBalance")
  const receivedQty = form.watch("receivedQty")
  const issuedQty = form.watch("issuedQty")
  const adjustedQty = form.watch("adjustedQty")

  // Auto-calculate closing balance
  React.useEffect(() => {
    const calculated = openingBalance + receivedQty - issuedQty + adjustedQty
    form.setValue("closingBalance", calculated)
  }, [openingBalance, receivedQty, issuedQty, adjustedQty, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="warehouseId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kho *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn kho" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(warehouses as any[]).map((wh) => (
                      <SelectItem key={wh.id} value={wh.id}>
                        {wh.name}
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
            name="inventoryItemId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mặt hàng *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn mặt hàng" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {(inventoryItems as any[]).map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
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
            name="balanceDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Ngày cân bằng *</FormLabel>
                <Input
                  type="date"
                  {...field}
                  value={field.value ? field.value.toISOString().split('T')[0] : ''}
                  onChange={(e) => field.onChange(new Date(e.target.value))}
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi tiết cân bằng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="openingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số dư đầu kỳ</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receivedQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng nhập</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issuedQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng xuất</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adjustedQty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số lượng điều chỉnh</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="pt-4 border-t">
              <FormField
                control={form.control}
                name="closingBalance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Số dư cuối kỳ (Tự động tính)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        disabled
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : mode === "create" ? "Tạo cân bằng" : "Cập nhật"}
          </Button>
        </div>
      </form>
    </Form>
  )
}


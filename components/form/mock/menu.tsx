"use client";

import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/element/pill-tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { z } from "zod";
import {
  Image as ImageIcon,
  X,
  Plus,
  CalendarIcon,
  Upload,
  Loader2,
  Users,
  MapPin,
  DollarSign
} from "lucide-react";

import {
  CreateMenuItemSchema,
  UpdateMenuItemSchema,
  CreateMenuSchema,
  UpdateMenuSchema
} from "@/schemas/menu";
import {
  CreateCategorySchema,
  UpdateCategorySchema
} from "@/schemas/category";
import {
  CreateTableSchema,
  UpdateTableSchema
} from "@/schemas/restaurant";
import {
  CreateInventoryItemSchema,
  UpdateInventoryItemSchema
} from "@/schemas/inventory";
import {
  CreateReservationSchema,
  UpdateReservationSchema
} from "@/schemas/restaurant";
import {
  CreatePromotionSchema,
  UpdatePromotionSchema
} from "@/schemas/promotion";
import {
  MenuItem,
  Menu,
  InventoryItem,
  CategoryDataColumn,
  IngredientDataColumn
} from "@/lib/interfaces";
import { FileUploadServer } from "@/components/upload/file-upload-server";
import {
  useGetAllTablesQuery,
  useGetTablesQuery,
  useGetAllUsersQuery,
  useCreateReservationMutation,
  useCheckAvailabilityMutation,
  useGetAllCategoriesQuery,
  useGetAllMenusQuery,
} from "@/state/api";
import { ArrowLeft } from "lucide-react";

export interface MenuItemFormProps {
  mode?: "create" | "update"
  menuId?: string
  categoryId?: string
  initialValues?: any
  onSuccess?: (data: any) => void
  onCancel?: () => void
  title?: string
  submitText?: string
  isLoading?: boolean
}

export interface MenuFormProps {
  mode?: "create" | "update"
  organizationId?: string
  initialValues?: Partial<Menu>
  onSuccess?: (data: Menu) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export interface InventoryItemFormProps {
  mode?: "create" | "update"
  restaurantId?: string
  initialValues?: IngredientDataColumn
  onSuccess?: (data: InventoryItem) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export function MenuItemForm({
  mode = "create",
  menuId,
  categoryId,
  initialValues,
  onSuccess,
  onCancel,
  title,
  submitText,
  isLoading = false
}: MenuItemFormProps) {
  const { data: categories = [] } = useGetAllCategoriesQuery();
  const organizationId = "2c41b63e-4a3f-4e96-bb24-9781786ae2cf";
  const { data: menus = [] } = useGetAllMenusQuery(organizationId ? { organizationId } : undefined);
  
  const [allergens, setAllergens] = useState<string[]>(initialValues?.allergens || []);
  const [dietaryInfo, setDietaryInfo] = useState<string[]>(initialValues?.dietaryInfo || []);
  const [newAllergen, setNewAllergen] = useState("");
  const [newDietaryInfo, setNewDietaryInfo] = useState("");

  const onDrop = (acceptedFiles: File[]) => {
    // Handle file upload here
    console.log('Files dropped:', acceptedFiles);
  };

  const accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
  };

  const multiple = false;
  const maxFiles = 1;
  const disabled = false;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxFiles,
    disabled
  });

  const schema = mode === "create" ? CreateMenuItemSchema : UpdateMenuItemSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      menuId: menuId || initialValues?.menuId || "",
      categoryId: categoryId || initialValues?.categoryId || undefined,
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      price: initialValues?.price !== undefined
        ? (typeof initialValues.price === 'number' ? initialValues.price : Number(initialValues.price || 0))
        : 0,
      imageUrl: initialValues?.imageUrl ?? undefined,
      isAvailable: initialValues?.isAvailable ?? true,
      allergens: initialValues?.allergens || [],
      calories: initialValues?.calories || undefined,
      dietaryInfo: initialValues?.dietaryInfo || [],
      displayOrder: initialValues?.displayOrder || 0,
      isFeatured: initialValues?.isFeatured ?? false,
      preparationTime: initialValues?.preparationTime || undefined,
    },
    mode: "onBlur"
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      // Merge allergens and dietaryInfo from state
      const submitData = {
        ...data,
        allergens,
        dietaryInfo: dietaryInfo,
      };

      console.log("Submitting menu item:", submitData);

      if (onSuccess) {
        onSuccess(submitData);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const addAllergen = () => {
    if (newAllergen.trim() && !allergens.includes(newAllergen.trim())) {
      setAllergens([...allergens, newAllergen.trim()]);
      setNewAllergen("");
    }
  };

  const removeAllergen = (allergen: string) => {
    setAllergens(allergens.filter(a => a !== allergen));
  };

  const addDietaryInfo = () => {
    if (newDietaryInfo.trim() && !dietaryInfo.includes(newDietaryInfo.trim())) {
      setDietaryInfo([...dietaryInfo, newDietaryInfo.trim()]);
      setNewDietaryInfo("");
    }
  };

  const removeDietaryInfo = (info: string) => {
    setDietaryInfo(dietaryInfo.filter(i => i !== info));
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
                submitText || (mode === "create" ? "Thêm món ăn" : "Cập nhật")
              )}
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin món ăn</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <FormLabel className="">Tên món ăn *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Nhập tên món ăn..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem className="col-span-1">
                          <FormLabel className="">Giá *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                              <Input
                                type="number"
                                className="pl-8"
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="menuId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Thực đơn *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn thực đơn" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {menus.map((menu: any) => (
                                <SelectItem key={menu.id} value={menu.id}>
                                  {menu.name}
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
                      name="categoryId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Danh mục</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value || undefined}
                            value={field.value || undefined}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn danh mục" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Mô tả</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Mô tả chi tiết về món ăn..."
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
                  <CardTitle>Hình ảnh món ăn</CardTitle>
                </CardHeader>
                <CardContent className="">
                  <div
                    {...getRootProps()}
                    className={`
                      border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/24'}
                      ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
                    `}
                  >
                    <input {...getInputProps()} />
                    <Badge className="h-9 w-9 p-0 bg-muted">
                      <Upload style={{ width: 16, height: 16 }} className="h-4 w-4 text-foreground" />
                    </Badge>
                    {/* <Badge className="h-9 w-9 p-0 bg-professional-indigo/24">
                      <Upload style={{ width: 16, height: 16 }} className="h-4 w-4 text-professional-indigo" />
                    </Badge> */}
                    {isDragActive ? (
                      <p className="text-lg font-medium">Drop files here...</p>
                    ) : (
                      <div>
                        <p className="text-lg font-medium">
                          Drag & drop files here, or click to select
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {multiple ? `Up to ${maxFiles} files` : 'Single file only'}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max size: 10MB per file
                        </p>
                      </div>
                    )}

                    {form.watch("imageUrl") && (
                      <div className="mt-4">
                        <Label className="text-sm font-medium">URL hình ảnh</Label>
                        <Input
                          value={form.watch("imageUrl")}
                          readOnly
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Nguyên liệu</CardTitle>
                </CardHeader>
              </Card>
            </div>
            <div className="col-span-1 flex flex-col gap-6">
              <Card>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isAvailable"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Có sẵn</FormLabel>
                          <FormDescription>
                            Món ăn có thể được đặt hàng
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="isFeatured"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Nổi bật</FormLabel>
                          <FormDescription>
                            Hiển thị món ăn ở vị trí nổi bật
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Kích thước</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="preparationTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Thời gian chuẩn bị (phút)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="15"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="displayOrder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">Thứ tự hiển thị</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                  <CardTitle>Giá trị</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <FormField
                    control={form.control}
                    name="calories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Calories (kcal)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Nhập số calories..."
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Allergens */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Chất gây dị ứng</Label>
                    <div className="flex gap-4">
                      <Input
                        placeholder="Thêm chất gây dị ứng..."
                        value={newAllergen}
                        onChange={(e) => setNewAllergen(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addAllergen} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {allergens.map((allergen, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {allergen}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeAllergen(allergen)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Dietary Information */}
                  <div className="flex flex-col gap-2">
                    <Label className="text-sm font-medium">Thông tin dinh dưỡng</Label>
                    <div className="flex gap-4">
                      <Input
                        placeholder="Thêm thông tin dinh dưỡng..."
                        value={newDietaryInfo}
                        onChange={(e) => setNewDietaryInfo(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDietaryInfo())}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addDietaryInfo} size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {dietaryInfo.map((info, index) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          {info}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-500"
                            onClick={() => removeDietaryInfo(info)}
                          />
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}

export function MenuForm({
  mode = "create",
  organizationId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false
}: MenuFormProps) {
  const schema = mode === "create" ? CreateMenuSchema : UpdateMenuSchema;
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      organizationId: organizationId || (initialValues as any)?.organizationId || "2c41b63e-4a3f-4e96-bb24-9781786ae2cf",
      name: initialValues?.name || "",
      description: initialValues?.description || "",
      isActive: initialValues?.isActive ?? true,
      displayOrder: initialValues?.displayOrder ?? 0,
      imageUrl: initialValues?.imageUrl ?? undefined,
    },
    mode: "onBlur"
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      console.log("Submitting menu:", data);

      if (onSuccess) {
        onSuccess(data as Menu);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex justify-between gap-4 mb-6">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại
            {/* Hủy */}
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
              submitText || (mode === "create" ? "Thêm menu" : "Cập nhật")
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin menu</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="">Tên menu *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nhập tên menu..."
                          {...field}
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
                      <FormLabel className="text-sm font-medium">Mô tả</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Mô tả chi tiết về menu..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle>Hình ảnh menu</CardTitle>*/}
            {/*  </CardHeader>*/}
            {/*  <CardContent className="">*/}
            {/*    <FormField*/}
            {/*      control={form.control}*/}
            {/*      name="image_url"*/}
            {/*      render={({ field }) => (*/}
            {/*        <FormItem>*/}
            {/*          <FormLabel className="text-sm font-medium">URL hình ảnh</FormLabel>*/}
            {/*          <FormControl>*/}
            {/*            <Input*/}
            {/*              placeholder="https://example.com/image.jpg"*/}
            {/*              {...field}*/}
            {/*            />*/}
            {/*          </FormControl>*/}
            {/*          <FormMessage />*/}
            {/*        </FormItem>*/}
            {/*      )}*/}
            {/*    />*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}
          </div>

          <div className="col-span-1 flex flex-col gap-6">
            <Card>
              <CardContent>
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Hoạt động</FormLabel>
                        <FormDescription>
                          Menu có thể được sử dụng
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={Boolean(field.value)}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle>Cài đặt hiển thị</CardTitle>*/}
            {/*  </CardHeader>*/}
            {/*  <CardContent className="flex flex-col gap-4">*/}
            {/*    <FormField*/}
            {/*      control={form.control}*/}
            {/*      name="display_order"*/}
            {/*      render={({ field }) => (*/}
            {/*        <FormItem>*/}
            {/*          <FormLabel className="text-sm font-medium">Thứ tự hiển thị</FormLabel>*/}
            {/*          <FormControl>*/}
            {/*            <Input*/}
            {/*              type="number"*/}
            {/*              placeholder="0"*/}
            {/*              {...field}*/}
            {/*              onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}*/}
            {/*            />*/}
            {/*          </FormControl>*/}
            {/*          <FormMessage />*/}
            {/*        </FormItem>*/}
            {/*      )}*/}
            {/*    />*/}
            {/*  </CardContent>*/}
            {/*</Card>*/}
          </div>
        </div>
      </form>
    </Form>
  );
}

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
}

function DatePicker({ date, onDateChange, placeholder = "Chọn ngày" }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "dd/MM/yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          // onSelect={(selectedDate) => {
          //   // Create date in local timezone to match input[type="date"] behavior
          //   // Convert selectedDate to YYYY-MM-DD format and parse as local date
          //   const dateValue = selectedDate ? new Date(selectedDate.toISOString().split('T')[0]) : undefined;
          //   onDateChange?.(dateValue);
          // }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

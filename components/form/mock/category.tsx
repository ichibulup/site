"use client";

import React, { useState, useEffect } from "react";
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
  ArrowLeft
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
  useGetAllCategoriesQuery
} from "@/state/api";

export interface CategoryFormProps {
  mode?: "create" | "update"
  initialValues?: CategoryDataColumn
  // initialValues?: Partial<Category>
  onSuccess?: (data: any) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export function CategoryForm({
  mode = "create",
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false
}: CategoryFormProps) {
  const [imageTab, setImageTab] = useState<'upload' | 'url' | 'none'>(initialValues?.imageUrl ? 'url' : 'none');
  const { data: categories = [] } = useGetAllCategoriesQuery();
  const schema = mode === "create" ? CreateCategorySchema : UpdateCategorySchema;
  const form = useForm({
    resolver: zodResolver(schema),
    // defaultValues: normalizedDefaults,
    defaultValues: {
      parentId: initialValues?.parentId ?? null,
      name: initialValues?.name || "",
      slug: initialValues?.slug || "",
      description: initialValues?.description || "",
      imageUrl: (initialValues?.imageUrl as string | undefined) ?? undefined,
      displayOrder: initialValues?.displayOrder ?? 0,
      isActive: initialValues?.isActive ?? true,
    },
    mode: "onBlur"
  });

  // Watch name field to auto-generate slug
  // const watchedName = form.watch("name");
  // useEffect(() => {
  //   if (mode === "create" && watchedName && !form.getValues("slug")) {
  //     const generatedSlug = watchedName.toString()
  //       .toLowerCase()
  //       .trim()
  //         form.setValue("slug", generatedSlug);
  //       }
  // }, [watchedName, form, mode]);

  // Clear imageUrl when switching to 'none' tab
  useEffect(() => {
    if (imageTab === 'none') {
      form.setValue("imageUrl", undefined);
    }
  }, [imageTab, form]);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      // console.log("Submitting category:", data);

      // Here you would call your API mutation
      // For now, just call onSuccess with the data
      if (onSuccess) {
        onSuccess(data);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  // Filter out current category and its children to prevent circular references (basic check)
  const parentOptions = categories.filter(c => c.id !== initialValues?.id);

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
              submitText || (mode === "create" ? "Thêm danh mục" : "Cập nhật")
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin danh mục</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="">Tên danh mục *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Nhập tên danh mục..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="slug"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="">Slug *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="ten-danh-muc"
                            {...field}
                            // disabled={mode === "create"}
                          />
                        </FormControl>
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
                          placeholder="Mô tả chi tiết về danh mục..."
                          {...field}
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
                <CardTitle>Hình ảnh danh mục</CardTitle>
              </CardHeader>
              <CardContent className="">
                <Tabs value={imageTab} onValueChange={(value) => setImageTab(value as 'upload' | 'url' | 'none')}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="url">URL</TabsTrigger>
                    <TabsTrigger value="none">Không có</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="mt-4">
                    <FileUploadServer
                      onUpload={(response) => {
                        form.setValue("imageUrl", response.data?.publicUrl);
                        setImageTab('url'); // Switch to URL tab to show the uploaded URL
                      }}
                      maxFiles={1}
                      accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }}
                    />
                  </TabsContent>
                  <TabsContent value="url" className="mt-4">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium">URL hình ảnh</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="https://example.com/image.jpg"
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value === "" ? undefined : e.target.value)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="none" className="mt-4">
                    <p className="text-sm text-muted-foreground">Không sử dụng hình ảnh cho danh mục này.</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-1 flex flex-col gap-6">
            <Card>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Hoạt động</FormLabel>
                        <FormDescription>
                          Danh mục có thể được sử dụng
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

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục cha</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value === "root" ? null : value)}
                        defaultValue={field.value || "root"}
                        value={field.value || "root"}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn danh mục cha" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="root">Không có (Danh mục gốc)</SelectItem>
                          {parentOptions.map((category) => (
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
              </CardContent>
            </Card>

            {/*<Card>*/}
            {/*  <CardHeader>*/}
            {/*    <CardTitle>Cài đặt hiển thị</CardTitle>*/}
            {/*  </CardHeader>*/}
            {/*  <CardContent className="flex flex-col gap-4">*/}
            {/*    <FormField*/}
            {/*      control={form.control}*/}
            {/*      name="displayOrder"*/}
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

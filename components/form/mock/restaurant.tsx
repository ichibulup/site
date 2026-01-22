import {
  useCreateReservationMutation,
  useGetAllRestaurantsQuery,
  useUpdateReservationMutation,
} from "@/state/api";
import React, { useState } from "react";
import {
  CreateReservationSchema,
  CreateTableSchema,
  UpdateReservationSchema,
  UpdateTableSchema,
} from "@/schemas/restaurant";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, MapPin, Clock } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Reservation, Table } from "@/lib/interfaces";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";

export interface ReservationFormProps {
  mode?: "create" | "update"
  restaurantId?: string
  initialValues?: Partial<Reservation>
  onSuccess?: (data: Reservation) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
  minHoursAhead?: number
  maxDaysAhead?: number
}

export interface TableFormProps {
  mode?: "create" | "update"
  restaurantId?: string
  initialValues?: Partial<Table>
  onSuccess?: (data: Table) => void
  onCancel?: () => void
  submitText?: string
  isLoading?: boolean
}

export function ReservationForm({
  mode = "create",
  restaurantId: propRestaurantId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false,
  minHoursAhead = 0,
  maxDaysAhead = 0,
}: ReservationFormProps) {
  // const { isLoading } = useAuthContext()
  const { user } = useUser()

  // RTK Query hooks
  const { data: restaurantsData = [], isLoading: isLoadingRestaurants } = useGetAllRestaurantsQuery();
  const [createReservation, { isLoading: isCreatingReservation }] = useCreateReservationMutation();
  const [updateReservation, { isLoading: isUpdatingReservation }] = useUpdateReservationMutation();

  const resolvedRestaurantId = propRestaurantId || initialValues?.restaurantId || "";
  const resolvedTableId = initialValues?.tableId || "ff06b1f3-52f0-4635-90b1-c082529919e4";
  const defaultCustomerName = initialValues?.customerName || user?.fullName || "";
  const defaultCustomerPhone = initialValues?.customerPhone || user?.phoneNumber || "";
  const defaultCustomerEmail = initialValues?.customerEmail || user?.email || undefined;
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>(resolvedRestaurantId);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialValues?.reservationDate ? new Date(initialValues.reservationDate) : undefined
  );
  const [selectedTime, setSelectedTime] = useState(() => {
    if (!initialValues?.reservationDate) return "";
    const d = new Date(initialValues.reservationDate);
    return format(d, "HH:mm");
  });
  const [guestCount, setGuestCount] = useState("");
  const now = new Date();
  const minSelectableDate =
    minHoursAhead > 0 ? new Date(now.getTime() + minHoursAhead * 60 * 60 * 1000) : now;
  const maxDateTime =
    maxDaysAhead > 0 ? new Date(now.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000) : null;
  const minDate = new Date(minSelectableDate);
  minDate.setHours(0, 0, 0, 0);
  const maxDate = maxDateTime ? new Date(maxDateTime) : null;
  if (maxDate) maxDate.setHours(23, 59, 59, 999);

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
    "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
    "20:00", "20:30", "21:00"
  ];

  type CreateReservationFormValues = z.infer<typeof CreateReservationSchema>;
  type UpdateReservationFormValues = z.infer<typeof UpdateReservationSchema>;
  type ReservationFormValues = CreateReservationFormValues | UpdateReservationFormValues;

  const schema = mode === "create" ? CreateReservationSchema : UpdateReservationSchema;
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(schema as any),
    defaultValues: (mode === "create"
      ? {
          restaurantId: resolvedRestaurantId,
          tableId: resolvedTableId,
          customerId: initialValues?.customerId ?? user?.id,
          customerName: defaultCustomerName,
          customerPhone: defaultCustomerPhone,
          customerEmail: defaultCustomerEmail,
          partySize: initialValues?.partySize || 2,
          reservationDate: initialValues?.reservationDate
            ? new Date(initialValues.reservationDate)
            : undefined,
          durationHours: initialValues?.durationHours
            ? Number(initialValues.durationHours as any)
            : 2,
          specialRequests: initialValues?.specialRequests || "",
          notes: initialValues?.notes || "",
        }
      : {
          tableId: initialValues?.tableId ?? undefined,
          customerId: initialValues?.customerId ?? user?.id,
          customerName: initialValues?.customerName || "",
          customerPhone: initialValues?.customerPhone || "",
          customerEmail: initialValues?.customerEmail || undefined,
          partySize: initialValues?.partySize || 2,
          reservationDate: initialValues?.reservationDate
            ? new Date(initialValues.reservationDate)
            : undefined,
          durationHours: initialValues?.durationHours
            ? Number(initialValues.durationHours as any)
            : 2,
          specialRequests: initialValues?.specialRequests || "",
          notes: initialValues?.notes || "",
        }) as any,
    mode: "onBlur",
  });

  React.useEffect(() => {
    if (mode !== "create") return;
    const currentName = form.getValues("customerName");
    const currentPhone = form.getValues("customerPhone");
    const currentEmail = form.getValues("customerEmail");
    const currentCustomerId = form.getValues("customerId" as any);

    if (!currentName && user?.fullName) {
      form.setValue("customerName", user.fullName);
    }
    if (!currentPhone && user?.phoneNumber) {
      form.setValue("customerPhone", user.phoneNumber);
    }
    if (!currentEmail && user?.email) {
      form.setValue("customerEmail", user.email);
    }
    if (!currentCustomerId && user?.id) {
      form.setValue("customerId" as any, user.id);
    }
  }, [form, mode, user]);

  const onSubmit = async (data: ReservationFormValues) => {
    try {
      const isCreateMode = mode === "create";
      const createData = data as CreateReservationFormValues;

      if (isCreateMode && !selectedRestaurantId && !createData.restaurantId) {
        toast.error("Vui lòng chọn nhà hàng");
      return;
    }

      const effectiveDate = data.reservationDate ?? selectedDate;
      if (!effectiveDate) {
        toast.error("Vui lòng chọn ngày đặt bàn");
        return;
      }

      if (!selectedTime) {
        toast.error("Vui lòng chọn giờ đặt bàn");
        return;
      }

      // Combine date and time into a single Date object
      const [hours, minutes] = selectedTime.split(":");
      const reservationDateTime = new Date(effectiveDate);
      reservationDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      const submitNow = new Date();
      const submitMinDateTime =
        minHoursAhead > 0 ? new Date(submitNow.getTime() + minHoursAhead * 60 * 60 * 1000) : null;
      const submitMaxDateTime =
        maxDaysAhead > 0 ? new Date(submitNow.getTime() + maxDaysAhead * 24 * 60 * 60 * 1000) : null;

      if (submitMinDateTime && reservationDateTime < submitMinDateTime) {
        toast.error(`Vui lòng chọn thời gian trước ít nhất ${minHoursAhead} tiếng.`);
        return;
      }

      if (submitMaxDateTime && reservationDateTime > submitMaxDateTime) {
        toast.error(`Bạn chỉ có thể đặt trước tối đa ${maxDaysAhead} ngày.`);
        return;
      }

      if (isCreateMode) {
        // Prepare data for submission (no tableId; backend assigns virtual table)
        const reservationData = {
          restaurantId: selectedRestaurantId || createData.restaurantId,
          tableId: createData.tableId || resolvedTableId,
          customerId: createData.customerId || user?.id,
          customerName: createData.customerName,
          customerPhone: createData.customerPhone,
          customerEmail: createData.customerEmail || undefined,
          partySize: Number(createData.partySize),
          reservationDate: reservationDateTime.toISOString(),
          durationHours: Number(createData.durationHours),
          specialRequests: createData.specialRequests || undefined,
          notes: createData.notes || undefined,
        };

        console.log("Submitting reservation:", reservationData);

        const result = await createReservation(reservationData).unwrap();
        toast.success("Đặt bàn thành công!");

        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        if (!initialValues?.id) {
          toast.error("Thiếu ID đặt bàn để cập nhật");
          return;
        }

        const updateData = {
          ...data,
          reservationDate: reservationDateTime.toISOString(),
        };

        const result = await updateReservation({ id: initialValues.id, data: updateData }).unwrap();
        toast.success("Cập nhật đặt bàn thành công!");

        if (onSuccess) {
          onSuccess(result);
        }
      }
    } catch (error: any) {
      console.error("Error submitting reservation:", error);
      toast.error(error?.data?.message || "Có lỗi xảy ra khi đặt bàn");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/*<div className="flex justify-end gap-4 mb-6">*/}
        {/*  <Button*/}
        {/*    type="button"*/}
        {/*    variant="outline"*/}
        {/*    onClick={onCancel}*/}
        {/*    disabled={isLoading}*/}
        {/*  >*/}
        {/*    Hủy*/}
        {/*  </Button>*/}
        {/*  <Button*/}
        {/*    type="submit"*/}
        {/*    disabled={isLoading || isCreatingReservation || (selectedTable && !isTableAvailable)}*/}
        {/*    className="min-w-[120px]"*/}
        {/*  >*/}
        {/*    {isLoading || isCreatingReservation ? (*/}
        {/*      <>*/}
        {/*        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>*/}
        {/*        Đang xử lý...*/}
        {/*      </>*/}
        {/*    ) : (*/}
        {/*      submitText || (mode === "create" ? "Tạo đặt bàn" : "Cập nhật đặt bàn")*/}
        {/*    )}*/}
        {/*  </Button>*/}
        {/*</div>*/}

        <Card>
          <CardHeader>
            <CardTitle>Thông tin đặt bàn</CardTitle>
            <CardDescription>
              Vui lòng điền đầy đủ thông tin để đặt bàn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">

            {/* Thông tin khách hàng */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Họ và tên *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập họ và tên"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số điện thoại *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nhập số điện thoại"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="customerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Nhập email (tùy chọn)"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Chọn nhà hàng + số người (không chọn bàn trước) */}
            <div className="grid md:grid-cols-2 gap-4">
              {mode === "create" && (
                <FormField
                  control={form.control}
                  name={"restaurantId" as any}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nhà hàng *</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          setSelectedRestaurantId(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn nhà hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {isLoadingRestaurants ? (
                            <SelectItem value="loading" disabled>
                              Đang tải...
                            </SelectItem>
                          ) : restaurantsData.length === 0 ? (
                            <SelectItem value="empty" disabled>
                              Không có nhà hàng
                            </SelectItem>
                          ) : (
                            restaurantsData.map((restaurant: any) => (
                              <SelectItem key={restaurant.id} value={restaurant.id}>
                                <div className="flex items-center gap-2">
                                  <MapPin className="h-4 w-4" />
                                  <span>{restaurant.name}</span>
                                </div>
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="partySize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số người *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="20"
                        {...field}
                        onChange={(e) => {
                          field.onChange(parseInt(e.target.value));
                          setGuestCount(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Số người và thời gian */}
            {/* Ngày và giờ */}
            <div className="grid grid-cols-8 gap-4">
              <div className="col-span-4">
                <FormField
                  control={form.control}
                  name="reservationDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ngày đặt bàn *</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {field.value ? (
                                format(field.value as any, "PPP", { locale: vi })
                              ) : (
                                <span>Chọn ngày</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={(date) => {
                              field.onChange(date);
                              setSelectedDate(date);
                              console.log("Selected date:", date);
                            }}
                            locale={vi}
                            disabled={(date) => {
                              if (date < minDate) return true;
                              if (maxDate && date > maxDate) return true;
                              return false;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="col-span-3 space-y-2">
                <Label>Giờ đặt bàn *</Label>
                <Select value={selectedTime} onValueChange={setSelectedTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn giờ" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="">
                <FormField
                  control={form.control}
                  name="durationHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thời gian (giờ)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="8"
                          step="0.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Yêu cầu đặc biệt */}
            <FormField
              control={form.control}
              name="specialRequests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yêu cầu đặc biệt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="VD: Cần ghế em bé, bàn gần cửa sổ..."
                      rows={3}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ghi chú */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú thêm..."
                      rows={2}
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit button */}
            <Button
              type="submit"
              className="w-full"
              size="default"
              disabled={isLoading || isCreatingReservation || isUpdatingReservation}
            >
              {isLoading || isCreatingReservation || isUpdatingReservation ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                submitText || "Xác nhận đặt bàn"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

export function TableForm({
  mode = "create",
  restaurantId,
  initialValues,
  onSuccess,
  onCancel,
  submitText,
  isLoading = false
}: TableFormProps) {
  const schema = mode === "create" ? CreateTableSchema : UpdateTableSchema;
  const { data: restaurantsData = [] } = useGetAllRestaurantsQuery();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      restaurantId: restaurantId || initialValues?.restaurantId || "",
      tableNumber: initialValues?.tableNumber || "",
      capacity: initialValues?.capacity || 4,
      location: initialValues?.location || "",
      status: initialValues?.status || "available",
      qrCode: initialValues?.qrCode || "",
    },
    mode: "onBlur"
  });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      console.log("Submitting table:", data);

      // Here you would call your API mutation
      // For now, just call onSuccess with the data
      if (onSuccess) {
        onSuccess(data as Table);
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
              submitText || (mode === "create" ? "Tạo bàn" : "Cập nhật bàn")
            )}
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin bàn</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FormField
                  control={form.control}
                  name="restaurantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="">Nhà hàng *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        disabled={Boolean(restaurantId)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn nhà hàng" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {restaurantsData.map((restaurant) => (
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
                <div className="grid grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tableNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="">Số bàn *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="VD: A01, B05, 001"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="capacity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium">Sức chứa *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="4"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 4)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Vị trí</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="VD: Tầng 1, Góc phải, Bên cửa sổ"
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
                <CardTitle>Mã QR</CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="qrCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium">Mã QR</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Mã QR để quét đặt bàn"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Mã QR duy nhất cho bàn này (tùy chọn)
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
              <CardContent>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base">Trạng thái</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Chọn trạng thái" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Có sẵn</SelectItem>
                          <SelectItem value="occupied">Đang sử dụng</SelectItem>
                          <SelectItem value="reserved">Đã đặt</SelectItem>
                          <SelectItem value="maintenance">Bảo trì</SelectItem>
                          <SelectItem value="out_of_order">Hỏng</SelectItem>
                        </SelectContent>
                      </Select>
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

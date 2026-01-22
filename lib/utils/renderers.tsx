import React from "react";
import { Badge } from "@/components/element/badge";
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Users,
} from "lucide-react";
import {
  DeliveryStatus,
  OrderStatus,
  OrderType,
  PaymentStatus,
  PurchaseOrderStatus,
  ReservationStatus,
  TableStatus,
  UserStatus,
  StaffStatus,
  TableDataColumn
} from "@/lib/interfaces";

export type BadgeVariant = React.ComponentProps<typeof Badge>["variant"];

export const normalizeKey = (value: unknown) =>
  String(value ?? "")
    .trim()
    .replace(/[_\s-]/g, "")
    .toLowerCase();

export const normalizeOrderStatus = (status?: unknown): OrderStatus | null => {
  const key = normalizeKey(status);
  switch (key) {
    case "pending":
      return OrderStatus.pending;
    case "confirmed":
      return OrderStatus.confirmed;
    case "preparing":
      return OrderStatus.preparing;
    case "ready":
      return OrderStatus.ready;
    case "served":
      return OrderStatus.served;
    case "completed":
      return OrderStatus.completed;
    case "cancelled":
    case "canceled":
      return OrderStatus.cancelled;
    default:
      return null;
  }
};

export const normalizeDeliveryStatus = (status?: unknown): DeliveryStatus | null => {
  const key = normalizeKey(status);
  switch (key) {
    case "assigned":
      return DeliveryStatus.assigned;
    case "accepted":
      return DeliveryStatus.accepted;
    case "pickedup":
    case "pickup":
      return DeliveryStatus.pickedUp;
    case "intransit":
    case "ontheway":
    case "delivering":
      return DeliveryStatus.inTransit;
    case "delivered":
      return DeliveryStatus.delivered;
    case "failed":
      return DeliveryStatus.failed;
    case "cancelled":
    case "canceled":
      return DeliveryStatus.cancelled;
    default:
      return null;
  }
};

export const normalizeOrderType = (type?: unknown): OrderType | null => {
  const key = normalizeKey(type);
  switch (key) {
    case "dinein":
    case "dine":
      return OrderType.dineIn;
    case "takeout":
    case "takeaway":
      return OrderType.takeaway;
    case "delivery":
      return OrderType.delivery;
    default:
      return null;
  }
};

export const normalizeReservationStatus = (status?: unknown): ReservationStatus | null => {
  const key = normalizeKey(status);
  switch (key) {
    case "pending":
      return ReservationStatus.pending;
    case "confirmed":
      return ReservationStatus.confirmed;
    case "seated":
    case "checkedin":
      return ReservationStatus.seated;
    case "completed":
      return ReservationStatus.completed;
    case "cancelled":
    case "canceled":
      return ReservationStatus.cancelled;
    case "noshow":
      return ReservationStatus.noShow;
    default:
      return null;
  }
};

export const normalizePaymentStatus = (status?: unknown): PaymentStatus | null => {
  const key = normalizeKey(status);
  switch (key) {
    case "pending":
      return PaymentStatus.pending;
    case "completed":
    case "paid":
    case "succeeded":
      return PaymentStatus.completed;
    case "processing":
      return PaymentStatus.processing;
    case "failed":
      return PaymentStatus.failed;
    case "cancelled":
    case "canceled":
      return PaymentStatus.cancelled;
    case "refunded":
      return PaymentStatus.refunded;
    default:
      return null;
  }
};

export const normalizePurchaseStatus = (status?: unknown): PurchaseOrderStatus | null => {
  const key = normalizeKey(status);
  switch (key) {
    case "draft":
      return PurchaseOrderStatus.draft;
    case "sent":
      return PurchaseOrderStatus.sent;
    case "confirmed":
      return PurchaseOrderStatus.confirmed;
    case "partiallyreceived":
      return PurchaseOrderStatus.partiallyReceived;
    case "received":
      return PurchaseOrderStatus.received;
    case "cancelled":
    case "canceled":
      return PurchaseOrderStatus.cancelled;
    default:
      return null;
  }
};

export const getOrderStatusLabel = (
  status?: OrderStatus | null,
  fallback = "Đang xử lý"
) => {
  switch (status) {
    case OrderStatus.pending:
      return "Chờ xác nhận";
    case OrderStatus.confirmed:
      return "Đã xác nhận";
    case OrderStatus.preparing:
      return "Đang chuẩn bị";
    case OrderStatus.ready:
      return "Sẵn sàng";
    case OrderStatus.served:
      return "Đã phục vụ";
    case OrderStatus.completed:
      return "Hoàn thành";
    case OrderStatus.cancelled:
      return "Đã hủy";
    default:
      return fallback;
  }
};

export const getReservationStatusLabel = (
  status?: ReservationStatus | null,
  fallback = "Đang xử lý"
) => {
  switch (status) {
    case ReservationStatus.pending:
      return "Chờ xác nhận";
    case ReservationStatus.confirmed:
      return "Đã xác nhận";
    case ReservationStatus.seated:
      return "Đang ngồi";
    case ReservationStatus.completed:
      return "Hoàn thành";
    case ReservationStatus.cancelled:
      return "Đã hủy";
    case ReservationStatus.noShow:
      return "Không đến";
    default:
      return fallback;
  }
};

export const getPaymentStatusLabel = (
  status?: PaymentStatus | null,
  fallback = "Đang xử lý"
) => {
  switch (status) {
    case PaymentStatus.pending:
      return "Chờ thanh toán";
    case PaymentStatus.completed:
      return "Đã thanh toán";
    case PaymentStatus.failed:
      return "Thất bại";
    case PaymentStatus.processing:
      return "Đang xử lý";
    case PaymentStatus.cancelled:
      return "Đã hủy";
    case PaymentStatus.refunded:
      return "Đã hoàn tiền";
    default:
      return fallback;
  }
};

export const getDeliveryStatusLabel = (
  status?: DeliveryStatus | null,
  fallback = "Đang xử lý"
) => {
  switch (status) {
    case DeliveryStatus.assigned:
      return "Chờ nhận";
    case DeliveryStatus.accepted:
      return "Đã nhận";
    case DeliveryStatus.pickedUp:
      return "Đã lấy hàng";
    case DeliveryStatus.inTransit:
      return "Đang giao";
    case DeliveryStatus.delivered:
      return "Đã giao";
    case DeliveryStatus.failed:
      return "Thất bại";
    case DeliveryStatus.cancelled:
      return "Đã hủy";
    default:
      return fallback;
  }
};

export const getPurchaseStatusLabel = (
  status?: PurchaseOrderStatus | null,
  fallback = "Đang xử lý"
) => {
  switch (status) {
    case PurchaseOrderStatus.draft:
      return "Nháp";
    case PurchaseOrderStatus.sent:
      return "Đã gửi";
    case PurchaseOrderStatus.confirmed:
      return "Đã xác nhận";
    case PurchaseOrderStatus.partiallyReceived:
      return "Nhận một phần";
    case PurchaseOrderStatus.received:
      return "Đã nhận hàng";
    case PurchaseOrderStatus.cancelled:
      return "Đã hủy";
    default:
      return fallback;
  }
};

export const getOrderStatusVariant = (
  status?: OrderStatus | null,
  fallback: BadgeVariant = "secondary"
): BadgeVariant => {
  switch (status) {
    case OrderStatus.pending:
      return "warning";
    case OrderStatus.cancelled:
      return "danger";
    case OrderStatus.confirmed:
      return "primary-1";
    case OrderStatus.preparing:
      return "warning";
    case OrderStatus.ready:
      return "info";
    case OrderStatus.served:
      return "primary-2";
    case OrderStatus.completed:
      return "success";
    default:
      return fallback;
  }
};

export const getReservationStatusVariant = (
  status?: ReservationStatus | null,
  fallback: BadgeVariant = "secondary"
): BadgeVariant => {
  switch (status) {
    case ReservationStatus.pending:
      return "warning";
    case ReservationStatus.cancelled:
      return "danger";
    case ReservationStatus.noShow:
      return "default";
    case ReservationStatus.confirmed:
      return "info";
    case ReservationStatus.seated:
      return "warning";
    case ReservationStatus.completed:
      return "success";
    default:
      return fallback;
  }
};

export const getPaymentStatusVariant = (
  status?: PaymentStatus | null,
  fallback: BadgeVariant = "secondary"
): BadgeVariant => {
  switch (status) {
    case PaymentStatus.pending:
      return "primary-2";
    case PaymentStatus.processing:
      return "info";
    case PaymentStatus.refunded:
      return "primary-1";
    case PaymentStatus.completed:
      return "success";
    case PaymentStatus.failed:
      return "warning";
    case PaymentStatus.cancelled:
      return "danger";
    default:
      return fallback;
  }
};

export const getPurchaseStatusVariant = (
  status?: PurchaseOrderStatus | null,
  fallback: BadgeVariant = "secondary"
): BadgeVariant => {
  switch (status) {
    case PurchaseOrderStatus.draft:
      return "secondary";
    case PurchaseOrderStatus.cancelled:
      return "destructive";
    case PurchaseOrderStatus.sent:
    case PurchaseOrderStatus.confirmed:
    case PurchaseOrderStatus.partiallyReceived:
    case PurchaseOrderStatus.received:
      return "default";
    default:
      return fallback;
  }
};

export const getDeliveryStatusVariant = (
  status?: DeliveryStatus | null,
  fallback: BadgeVariant = "secondary"
): BadgeVariant => {
  switch (status) {
    case DeliveryStatus.assigned:
      return "secondary";
    case DeliveryStatus.failed:
      return "danger";
    case DeliveryStatus.cancelled:
      return "danger";
    case DeliveryStatus.accepted:
      return "primary-1";
    case DeliveryStatus.pickedUp:
      return "info";
    case DeliveryStatus.inTransit:
      return "warning";
    case DeliveryStatus.delivered:
      return "success";
    default:
      return fallback;
  }
};

export const renderOrderStatusBadge = (status?: OrderStatus | null) => (
  <Badge variant={getOrderStatusVariant(status)}>
    {getOrderStatusLabel(status)}
  </Badge>
);

export const renderReservationStatusBadge = (status?: ReservationStatus | null) => (
  <Badge variant={getReservationStatusVariant(status)}>
    {getReservationStatusLabel(status)}
  </Badge>
);

export const renderPaymentStatusBadge = (status?: PaymentStatus | null) => (
  <Badge variant={getPaymentStatusVariant(status)}>
    {getPaymentStatusLabel(status)}
  </Badge>
);

export const renderDeliveryStatusBadge = (status?: DeliveryStatus | null) => (
  <Badge variant={getDeliveryStatusVariant(status)}>
    {getDeliveryStatusLabel(status)}
  </Badge>
);

export const renderPurchaseStatusBadge = (status?: PurchaseOrderStatus | null) => (
  <Badge variant={getPurchaseStatusVariant(status)}>
    {getPurchaseStatusLabel(status)}
  </Badge>
);

export const renderTableStatusBadge = (status?: TableStatus | null) => {
  let label = "Không xác định";
  let variant: BadgeVariant = "outline";
  let Icon: React.ComponentType<{ className?: string }> | null = null;

  switch (status) {
    case TableStatus.available:
      label = "Trống";
      variant = "success";
      Icon = CheckCircle;
      break;
    case TableStatus.occupied:
      label = "Có khách";
      variant = "danger";
      Icon = Users;
      break;
    case TableStatus.reserved:
      label = "Đã đặt";
      variant = "info";
      Icon = Calendar;
      break;
    case TableStatus.maintenance:
      label = "Bảo trì";
      variant = "warning";
      Icon = AlertTriangle;
      break;
    case TableStatus.outOfOrder:
      label = "Hỏng";
      variant = "danger";
      Icon = AlertTriangle;
      break;
  }

  return (
    <Badge variant={variant}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
};

export const getUserStatusVariant = (
  status?: UserStatus | null,
  fallback: BadgeVariant = "secondary"
): BadgeVariant => {
  switch (status) {
    case UserStatus.active:
      return "success";
    case UserStatus.inactive:
      return "secondary";
    case UserStatus.banned:
      return "danger";
    case UserStatus.suspended:
      return "warning";
    case UserStatus.pendingVerification:
      return "info";
    case UserStatus.locked:
      return "danger";
    case UserStatus.onLeave:
      return "warning";
    default:
      return fallback;
  }
};

export const getUserStatusLabel = (
  status?: UserStatus | null,
): string => {
  switch (status) {
    case UserStatus.active:
      return "Hoạt động";
    case UserStatus.inactive:
      return "Không hoạt động";
    case UserStatus.banned:
      return "Bị khóa";
    case UserStatus.suspended:
      return "Tạm dừng";
    case UserStatus.pendingVerification:
      return "Chờ xác thực";
    case UserStatus.locked:
      return "Bị khóa";
    case UserStatus.onLeave:
      return "Nghỉ phép";
    default:
      return "Không xác định";
  }
};

export const renderUserStatusBadge = (status?: UserStatus | null) => (
  <Badge variant={getUserStatusVariant(status, "outline")}>
    {getUserStatusLabel(status)}
  </Badge>
);

export const getStaffStatusVariant = (
  status?: StaffStatus | null,
  fallback: BadgeVariant = "secondary"
): BadgeVariant => {
  switch (status) {
    case StaffStatus.active:
      return "success";
    case StaffStatus.inactive:
      return "info";
    case StaffStatus.suspended:
      return "warning";
    case StaffStatus.onLeave:
      return "danger";
    case StaffStatus.terminated:
      return "default";
    default:
      return fallback;
  }
};

export const getStaffStatusLabel = (
  status?: StaffStatus | null,
): string => {
  switch (status) {
    case StaffStatus.active:
      return "Đang làm việc";
    case StaffStatus.inactive:
      return "Tạm nghỉ";
    case StaffStatus.onLeave:
      return "Nghỉ phép";
    case StaffStatus.suspended:
      return "Tạm dừng";
    case StaffStatus.terminated:
      return "Đã nghỉ việc";
    default:
      return "Không xác định";
  }
};

export const renderStaffStatusBadge = (status?: StaffStatus | null) => (
  <Badge variant={getStaffStatusVariant(status, "outline")}>
    {getStaffStatusLabel(status)}
  </Badge>
);

// export function getUserStatus(status: string): { text: string; color: string } {
//   switch (status) {
//     case "active":
//       return { text: "Hoạt động", color: "text-green-500" };
//     case "offline":
//       return { text: "Ngoại tuyến", color: "text-gray-500" };
//     case "idle":
//       return { text: "Không hoạt động", color: "text-yellow-500" };
//     case "invisible":
//       return { text: "Ẩn trạng thái", color: "text-gray-400" };
//     default:
//       return { text: "Không xác định", color: "text-gray-400" };
//   }
// }
//
// export function getTableStatus(status: TableDataColumn['status']) {
//   switch (status) {
//     case 'available':
//       return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Trống</Badge>
//     case 'occupied':
//       return <Badge className="bg-red-100 text-red-800"><Users className="w-3 h-3 mr-1" />Có khách</Badge>
//     case 'reserved':
//       return <Badge className="bg-blue-100 text-blue-800"><Calendar className="w-3 h-3 mr-1" />Đã đặt</Badge>
//     case 'maintenance':
//       return <Badge className="bg-gray-100 text-gray-800"><AlertTriangle className="w-3 h-3 mr-1" />Bảo trì</Badge>
//     case 'out_of_order':
//       return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Hỏng</Badge>
//     default:
//       return <Badge variant="outline">Không xác định</Badge>
//   }
// }

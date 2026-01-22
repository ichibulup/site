"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Gift,
  TrendingUp,
  ShoppingBag,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Award,
  DollarSign,
  Star,
  Clock,
  AlertCircle,
  RefreshCcw,
  User,
  CreditCard,
  Package,
  CalendarClock,
  History,
} from "lucide-react"
import { useGetUserByIdQuery, useGetAllOrdersQuery } from "@/state/api"

// Helper functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

const formatDateTime = (date: string | Date) => {
  return new Date(date).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getTierBadge = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case "vip":
      return (
        <Badge className="bg-purple-100 text-purple-800">
          <Award className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      )
    case "gold":
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          <Award className="w-3 h-3 mr-1" />
          Gold
        </Badge>
      )
    case "silver":
      return (
        <Badge className="bg-gray-100 text-gray-800">
          <Award className="w-3 h-3 mr-1" />
          Silver
        </Badge>
      )
    case "bronze":
      return (
        <Badge className="bg-orange-100 text-orange-800">
          <Award className="w-3 h-3 mr-1" />
          Bronze
        </Badge>
      )
    default:
      return (
        <Badge variant="outline">
          <Award className="w-3 h-3 mr-1" />
          Thường
        </Badge>
      )
  }
}

const getOrderStatusBadge = (status: string) => {
  const statusMap: { [key: string]: { label: string; variant: any } } = {
    pending: { label: "Chờ xử lý", variant: "outline" },
    confirmed: { label: "Đã xác nhận", variant: "default" },
    preparing: { label: "Đang chuẩn bị", variant: "default" },
    ready: { label: "Sẵn sàng", variant: "default" },
    delivering: { label: "Đang giao", variant: "default" },
    completed: { label: "Hoàn thành", variant: "default" },
    cancelled: { label: "Đã hủy", variant: "destructive" },
  }
  const statusInfo = statusMap[status.toLowerCase()] || { label: status, variant: "outline" }
  return <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
}

export default function CustomerDetailPage() {
  const params = useParams()
  const router = useRouter()
  const customerId = params.id as string

  // API Integration
  const {
    data: customer,
    isLoading,
    error,
    refetch,
  } = useGetUserByIdQuery(customerId, {
    skip: !customerId,
  })
  const { data: allOrders = [] } = useGetAllOrdersQuery(undefined)

  // State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isGiftPointsDialogOpen, setIsGiftPointsDialogOpen] = useState(false)
  const [editForm, setEditForm] = useState({
    username: "",
    email: "",
    phone: "",
  })
  const [giftPoints, setGiftPoints] = useState(0)
  const [giftReason, setGiftReason] = useState("")

  // Customer Orders
  const customerOrders = useMemo(() => {
    return allOrders.filter((order: any) => order.userId === parseInt(customerId))
  }, [allOrders, customerId])

  // Statistics
  const statistics = useMemo(() => {
    if (!customer) return null

    const totalOrders = customerOrders.length
    const totalSpent = customerOrders.reduce(
      (sum: number, order: any) => sum + (order.totalAmount || 0),
      0
    )
    const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0
    const completedOrders = customerOrders.filter(
      (order: any) => order.orderStatus?.toLowerCase() === "completed"
    ).length

    return {
      totalOrders,
      completedOrders,
      totalSpent,
      avgOrderValue,
      loyaltyPoints: customer.loyaltyPoints || 0,
    }
  }, [customer, customerOrders])

  // Handlers
  const handleRefresh = () => {
    refetch()
  }

  const handleEditCustomer = () => {
    if (customer) {
      setEditForm({
        username: customer.username || "",
        email: customer.email || "",
        phone: customer.phone || "",
      })
      setIsEditDialogOpen(true)
    }
  }

  const handleSaveEdit = () => {
    // TODO: Implement API call to update customer
    console.log("Saving customer edit:", editForm)
    setIsEditDialogOpen(false)
  }

  const handleGiftPoints = () => {
    // TODO: Implement API call to gift points
    console.log("Gifting points:", giftPoints, giftReason)
    setIsGiftPointsDialogOpen(false)
    setGiftPoints(0)
    setGiftReason("")
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div className="flex-1">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-96" />
          </div>
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-1">
            <CardHeader className="text-center">
              <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-32 mx-auto mb-2" />
              <Skeleton className="h-5 w-24 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-24" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error State
  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/staff/customer/profile")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chi tiết khách hàng</h1>
            <p className="text-muted-foreground">Thông tin chi tiết về khách hàng</p>
          </div>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Không thể tải thông tin khách hàng. Vui lòng thử lại sau.
          </AlertDescription>
        </Alert>

        <div className="flex justify-center gap-4">
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Thử lại
          </Button>
          <Button onClick={() => router.push("/staff/customer/profile")} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại danh sách
          </Button>
        </div>
      </div>
    )
  }

  // Success State
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/staff/customer/profile")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {customer.username || "Khách hàng"}
            </h1>
            <p className="text-muted-foreground">Thông tin chi tiết về khách hàng</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="mr-2 h-4 w-4" />
            Làm mới
          </Button>
          <Button onClick={handleEditCustomer} variant="outline" size="sm">
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </Button>
          <Button onClick={() => setIsGiftPointsDialogOpen(true)} size="sm">
            <Gift className="mr-2 h-4 w-4" />
            Tặng điểm
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Customer Profile Card */}
        <Card className="md:col-span-1">
          <CardHeader className="text-center">
            <Avatar className="h-24 w-24 mx-auto mb-4">
              <AvatarFallback className="text-2xl">
                {(customer.username
                  ?.split(" ")
                  .map((n: string) => n.charAt(0))
                  .join("")
                  .toUpperCase()) || "?"}
              </AvatarFallback>
            </Avatar>
            <CardTitle>{customer.username || "Chưa có tên"}</CardTitle>
            <div className="flex items-center justify-center gap-2 mt-2">
              {getTierBadge(customer.loyaltyTier || "")}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>ID: {customer.userId}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="truncate">{customer.email || "Chưa có email"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{customer.phone || "Chưa có SĐT"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{customer.address || "Chưa có địa chỉ"}</span>
            </div>
            <Separator />
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Tham gia: {formatDate(customer.createdAt)}</span>
            </div>
            {customer.updatedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Cập nhật: {formatDate(customer.updatedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Thống kê
            </CardTitle>
            <CardDescription>Tổng quan hoạt động của khách hàng</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng đơn hàng</CardTitle>
                  <ShoppingBag className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{statistics?.totalOrders || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Hoàn thành: {statistics?.completedOrders || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tổng chi tiêu</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(statistics?.totalSpent || 0)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Trung bình: {formatCurrency(statistics?.avgOrderValue || 0)}/đơn
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Điểm tích lũy</CardTitle>
                  <Gift className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {(statistics?.loyaltyPoints || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">Điểm thưởng</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Hạng thành viên</CardTitle>
                  <Award className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {customer.loyaltyTier?.toUpperCase() || "REGULAR"}
                  </div>
                  <p className="text-xs text-muted-foreground">Cấp bậc hiện tại</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Lịch sử đơn hàng
          </TabsTrigger>
          <TabsTrigger value="reservations" className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" />
            Đặt bàn
          </TabsTrigger>
          <TabsTrigger value="loyalty" className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            Điểm thưởng
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Lịch sử hoạt động
          </TabsTrigger>
        </TabsList>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đơn hàng</CardTitle>
              <CardDescription>
                Danh sách tất cả đơn hàng của khách hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              {customerOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có đơn hàng</h3>
                  <p className="text-sm text-muted-foreground">
                    Khách hàng chưa thực hiện đơn hàng nào
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Ngày đặt</TableHead>
                      <TableHead>Tổng tiền</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead>Thanh toán</TableHead>
                      <TableHead>Hành động</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerOrders.map((order: any) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-medium">
                          #{order.orderId}
                        </TableCell>
                        <TableCell>{formatDateTime(order.orderDate)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatCurrency(order.totalAmount)}
                        </TableCell>
                        <TableCell>
                          {getOrderStatusBadge(order.orderStatus)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.paymentStatus?.toLowerCase() === "paid"
                                ? "default"
                                : "outline"
                            }
                          >
                            <CreditCard className="w-3 h-3 mr-1" />
                            {order.paymentStatus === "paid"
                              ? "Đã thanh toán"
                              : "Chưa thanh toán"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Link href={`/staff/order?orderId=${order.orderId}`}>
                            <Button size="sm" variant="outline">
                              Xem
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reservations Tab */}
        <TabsContent value="reservations">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử đặt bàn</CardTitle>
              <CardDescription>Thông tin đặt bàn của khách hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <CalendarClock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Đang phát triển</h3>
                <p className="text-sm text-muted-foreground">
                  Chức năng xem lịch sử đặt bàn đang được phát triển
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loyalty Tab */}
        <TabsContent value="loyalty">
          <Card>
            <CardHeader>
              <CardTitle>Điểm thưởng & Ưu đãi</CardTitle>
              <CardDescription>Thông tin chương trình khách hàng thân thiết</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-medium">Điểm hiện tại</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(customer.loyaltyPoints || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Điểm tích lũy</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-medium">Hạng thành viên</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="flex justify-center mb-2">
                      {getTierBadge(customer.loyaltyTier || "")}
                    </div>
                    <p className="text-xs text-muted-foreground">Cấp bậc</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-sm font-medium">Điểm cần tích</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-blue-600">-</div>
                    <p className="text-xs text-muted-foreground mt-1">Để lên hạng</p>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Lịch sử tích điểm</h4>
                <div className="text-center py-8 border rounded-lg">
                  <History className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Chưa có lịch sử giao dịch điểm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Activity History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử hoạt động</CardTitle>
              <CardDescription>Theo dõi các hoạt động của khách hàng</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customerOrders.slice(0, 10).map((order: any) => (
                  <div key={order.orderId} className="flex items-start gap-4 pb-4 border-b last:border-0">
                    <div className="rounded-full p-2 bg-blue-100">
                      <ShoppingBag className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Đặt đơn hàng #{order.orderId}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(order.orderDate)} • {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    {getOrderStatusBadge(order.orderStatus)}
                  </div>
                ))}
                {customerOrders.length === 0 && (
                  <div className="text-center py-12">
                    <History className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Chưa có hoạt động</h3>
                    <p className="text-sm text-muted-foreground">
                      Khách hàng chưa có hoạt động nào
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa thông tin khách hàng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin cá nhân của khách hàng
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Họ và tên</Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={(e) =>
                  setEditForm({ ...editForm, username: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Gift Points Dialog */}
      <Dialog open={isGiftPointsDialogOpen} onOpenChange={setIsGiftPointsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tặng điểm thưởng</DialogTitle>
            <DialogDescription>
              Thêm điểm thưởng cho khách hàng {customer.username}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="points">Số điểm tặng</Label>
              <Input
                id="points"
                type="number"
                value={giftPoints}
                onChange={(e) => setGiftPoints(parseInt(e.target.value) || 0)}
                placeholder="Nhập số điểm..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Lý do</Label>
              <Textarea
                id="reason"
                value={giftReason}
                onChange={(e) => setGiftReason(e.target.value)}
                placeholder="Nhập lý do tặng điểm..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsGiftPointsDialogOpen(false)
                setGiftPoints(0)
                setGiftReason("")
              }}
            >
              Hủy
            </Button>
            <Button onClick={handleGiftPoints} disabled={giftPoints <= 0 || !giftReason}>
              <Gift className="mr-2 h-4 w-4" />
              Tặng điểm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

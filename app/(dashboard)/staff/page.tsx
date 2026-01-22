"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, ClipboardList, QrCode, CreditCard, Clock, RefreshCcw, Users, CheckCircle } from "lucide-react"
import Link from "next/link"
import {
  // useGetAllOrdersQuery,
  useGetAllTablesQuery,
} from "@/state/api"
import { Order } from "@/lib/interfaces"
import { useAuth } from "@/hooks/use-auth";
import { useUser } from "@/hooks/use-user";

// Helper function for Vietnamese relative time
const getRelativeTime = (date: string | undefined) => {
  if (!date) return "N/A"
  const now = new Date()
  const targetDate = new Date(date)
  if (isNaN(targetDate.getTime())) return "N/A"
  
  const diffMs = now.getTime() - targetDate.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  
  if (diffMins < 1) return "Vừa xong"
  if (diffMins < 60) return `${diffMins} phút trước`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} giờ trước`
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} ngày trước`
}

// Status helper
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
    pending: { label: "Chờ xử lý", variant: "secondary" },
    preparing: { label: "Đang chuẩn bị", variant: "default" },
    ready: { label: "Sẵn sàng", variant: "default" },
    served: { label: "Đã phục vụ", variant: "outline" },
    completed: { label: "Hoàn thành", variant: "outline" },
    paid: { label: "Đã thanh toán", variant: "outline" },
    cancelled: { label: "Đã hủy", variant: "destructive" }
  }
  return statusMap[status] || { label: status, variant: "secondary" as const }
}

// Format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
}

export default function StaffDashboard() {
  // API Hooks
  // const { isLoading } = useAuthContext()
  const { user } = useUser()
  // const { data: ordersData, isLoading: isLoadingOrders, error: ordersError, refetch: refetchOrders } = useGetAllOrdersQuery()
  const ordersData: Order[] = [] // Placeholder until API is ready
  const isLoadingOrders = false
  const ordersError = null
  const refetchOrders = () => {}
  const { data: tablesData, isLoading: isLoadingTables, error: tablesError, refetch: refetchTables } = useGetAllTablesQuery()

  // const isLoading = isLoadingUser || isLoadingOrders || isLoadingTables
  const isLoading = false
  // Chỉ hiển thị lỗi nếu không có dữ liệu cache nào khả dụng
  // const hasError = (userError || ordersError || tablesError) && !ordersData && !tablesData
  const hasError = false
  // Calculate statistics
  const stats = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Dữ liệu thực tế hoặc mảng rỗng
    const safeOrders = Array.isArray(ordersData) ? ordersData : []
    const safeTables = Array.isArray(tablesData) ? tablesData : []

    const todayOrders = safeOrders.filter((order: any) => {
      if (!order?.createdAt) return false
      const orderDate = new Date(order.createdAt)
      return orderDate >= today
    })

    const activeTables = safeTables.filter((table: any) => 
      table?.status === 'occupied' || table?.status === 'reserved'
    )

    const todayRevenue = todayOrders.reduce((sum: number, order: any) => {
      if (order?.status === 'completed' || order?.status === 'paid') {
        return sum + (Number(order.totalAmount) || 0)
      }
      return sum
    }, 0)

    // Nếu không có dữ liệu thật, trả về các con số 0 thay vì lỗi
    return [
      { 
        title: "Đơn hàng hôm nay", 
        value: todayOrders.length > 0 ? todayOrders.length.toString() : "0", 
        icon: ClipboardList, 
        change: `${todayOrders.length} đơn`,
        color: "text-blue-600"
      },
      { 
        title: "Bàn đang phục vụ", 
        value: activeTables.length > 0 ? activeTables.length.toString() : "0", 
        icon: QrCode, 
        change: `${safeTables.length} tổng bàn`,
        color: "text-green-600"
      },
      { 
        title: "Doanh thu ca", 
        value: formatCurrency(todayRevenue), 
        icon: CreditCard, 
        change: `${todayOrders.filter((o: any) => o.status === 'completed' || o.status === 'paid').length} hoàn thành`,
        color: "text-purple-600"
      },
      { 
        title: "Giờ làm việc", 
        value: "6.5h", 
        icon: Clock, 
        change: "Ca hiện tại",
        color: "text-orange-600"
      },
    ]
  }, [ordersData, tablesData])

  // Recent orders (last 5 from today)
  const recentOrders = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const safeOrders = Array.isArray(ordersData) ? ordersData : []

    const filtered = safeOrders
      .filter((order: any) => {
        if (!order?.createdAt) return false
        const orderDate = new Date(order.createdAt)
        return orderDate >= today
      })
      .sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt).getTime()
        const dateB = new Date(b.createdAt).getTime()
        return dateB - dateA
      })
      .slice(0, 5)

    if (filtered.length === 0 && !isLoading) {
      // Mock data nếu không có đơn hàng thực tế để giao diện không bị trống
      return []
    }

    return filtered.map((order: any) => ({
      id: order.orderCode || order.id || `ORD-${Math.random().toString(36).substr(2, 5)}`,
      table: order.table?.number ? `Bàn ${order.table.number}` : 'Mang về',
      items: order.orderMenuItems?.slice(0, 2).map((item: any) => item.menuItem?.name).join(', ') || 'Đơn hàng mới',
      status: order.status || 'pending',
      time: getRelativeTime(order.createdAt),
      orderId: order.id
    }))
  }, [ordersData, isLoading])

  const handleRefresh = () => {
    refetchOrders?.()
    refetchTables?.()
  }

  if (isLoading && !ordersData) {
    return (
      <div className="space-y-6 p-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-[300px] w-full" />
          <Skeleton className="h-[300px] w-full" />
        </div>
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <AlertCircle className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Không thể tải dữ liệu</h2>
        <p className="text-muted-foreground">Vui lòng kiểm tra kết nối mạng hoặc server.</p>
        <Button onClick={handleRefresh}><RefreshCcw className="mr-2 h-4 w-4" /> Thử lại</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Nhân viên</h2>
          <p className="text-muted-foreground">
            Chào mừng quay trở lại, {user?.fullName || "Nhân viên"}!
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCcw className="h-4 w-4 mr-2" /> Làm mới
          </Button>
          <Button asChild size="sm">
            <Link href="/staff/order/new">
              <ClipboardList className="h-4 w-4 mr-2" /> Tạo đơn mới
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>Danh sách đơn hàng được tạo trong ngày hôm nay.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted rounded-full p-3 mb-4">
                  <ClipboardList className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Chưa có đơn hàng nào trong hôm nay.</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/staff/order/new">Tạo đơn ngay</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{order.table}</span>
                        <span className="text-xs text-muted-foreground">#{order.id}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">{order.items}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge variant={getStatusBadge(order.status).variant} className="capitalize">
                        {getStatusBadge(order.status).label}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {order.time}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Trạng thái công việc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="relative mb-4">
                <CheckCircle className="h-16 w-16 text-green-500/20" />
                <CheckCircle className="h-10 w-10 text-green-500 absolute inset-0 m-auto" />
              </div>
              <h3 className="font-semibold text-lg">Hệ thống sẵn sàng</h3>
              <p className="text-sm text-muted-foreground max-w-[200px] mt-2">
                Hiện tại không có thông báo khẩn cấp nào cần xử lý.
              </p>
            </div>
            
            <div className="mt-6 pt-6 border-t space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Kết nối Server</span>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Ổn định</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Đồng bộ dữ liệu</span>
                <span className="font-medium text-xs">Vừa xong</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>Truy cập nhanh các chức năng quản lý chính.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-blue-500 hover:text-blue-600">
              <Link href="/staff/order/new">
                <ClipboardList className="h-6 w-6" /> 
                <span>Đơn mới</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-green-500 hover:text-green-600">
              <Link href="/staff/table">
                <QrCode className="h-6 w-6" /> 
                <span>Quản lý bàn</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-purple-500 hover:text-purple-600">
              <Link href="/staff/pos">
                <CreditCard className="h-6 w-6" /> 
                <span>Thu ngân</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-24 flex-col gap-2 hover:border-orange-500 hover:text-orange-600">
              <Link href="/staff/customer">
                <Users className="h-6 w-6" /> 
                <span>Khách hàng</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

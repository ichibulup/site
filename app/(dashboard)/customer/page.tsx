"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Star, Heart, Clock, Gift, CreditCard, Calendar, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import {
  // useGetMyOrdersQuery,
  useGetReservationsQuery
} from "@/state/api"
import { useMemo } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUser } from "@/hooks/use-user"

// Helper function to get relative time
const getRelativeTime = (date: Date | string): string => {
  const now = new Date()
  const orderDate = new Date(date)
  const diffInDays = Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return "Hôm nay"
  if (diffInDays === 1) return "Hôm qua"
  if (diffInDays < 7) return `${diffInDays} ngày trước`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} tuần trước`
  return `${Math.floor(diffInDays / 30)} tháng trước`
}

// Helper function to get membership level
const getMembershipLevel = (points: number): { level: string; nextLevel: string; nextPoints: number; progress: number } => {
  if (points >= 5000) return { level: "Platinum", nextLevel: "Diamond", nextPoints: 10000, progress: (points / 10000) * 100 }
  if (points >= 3000) return { level: "Gold", nextLevel: "Platinum", nextPoints: 5000, progress: ((points - 3000) / 2000) * 100 }
  if (points >= 1000) return { level: "Silver", nextLevel: "Gold", nextPoints: 3000, progress: ((points - 1000) / 2000) * 100 }
  return { level: "Bronze", nextLevel: "Silver", nextPoints: 1000, progress: (points / 1000) * 100 }
}

export default function CustomerDashboard() {
  const { user } = useUser()
  // API Hooks
  // const { data: user, isLoading: isLoadingUser, error: userError, refetch: refetchUser } = useGetMeQuery()
  // const { data: orders = [], isLoading: isLoadingOrders, error: ordersError, refetch: refetchOrders } = useGetMyOrdersQuery()
  const orders: any = [] // Placeholder until API is ready
  const isLoadingOrders = false
  const ordersError = null
  const refetchOrders = () => {}
  const { data: reservations = [], isLoading: isLoadingReservations } = useGetReservationsQuery()

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!user || !orders) return []

    const loyaltyPoints = user.loyaltyPoints || 0
    const totalOrders = orders.length
    const thisMonthOrders = orders.filter((order: any) => {
      const orderDate = new Date(order.createdAt)
      const now = new Date()
      return orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear()
    }).length
    
    // Calculate total savings from discounts
    const totalSavings = orders.reduce((sum: number, order: any) => {
      const discount = order.discount || 0
      return sum + discount
    }, 0)

    const membership = getMembershipLevel(loyaltyPoints)
    const pointsToNext = membership.nextPoints - loyaltyPoints

    return [
      { title: "Điểm tích lũy", value: loyaltyPoints.toLocaleString('vi-VN'), icon: Gift, change: `Cấp ${membership.level}` },
      { title: "Đơn hàng", value: totalOrders.toString(), icon: Clock, change: `${thisMonthOrders} đơn tháng này` },
      { title: "Tiết kiệm", value: `${totalSavings.toLocaleString('vi-VN')}₫`, icon: CreditCard, change: "Từ ưu đãi" },
      { title: "Thành viên", value: membership.level, icon: Star, change: `Còn ${pointsToNext.toLocaleString('vi-VN')} điểm lên ${membership.nextLevel}` },
    ]
  }, [user, orders])

  // Get recent orders (last 3)
  const recentOrders = useMemo(() => {
    if (!orders.length) return []
    
    return orders
      .slice()
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3)
      .map((order: any) => {
        const itemNames = order.orderItems?.map((item: any) => item.menuItem?.name || "Món ăn").slice(0, 2).join(", ") || "Đơn hàng"
        const itemCount = order.orderItems?.length || 0
        const displayItems = itemCount > 2 ? `${itemNames}, +${itemCount - 2}` : itemNames
        
        return {
          id: order.orderCode || order.id,
          date: getRelativeTime(order.createdAt),
          items: displayItems,
          total: order.totalAmount || 0,
          status: order.status
        }
      })
  }, [orders])

  // Calculate favorite items from order history
  const favoriteItems = useMemo(() => {
    if (!orders.length) return []

    const itemCounts: Record<string, { name: string; count: number; ratings: number[] }> = {}

    orders.forEach((order: any) => {
      order.orderItems?.forEach((item: any) => {
        const itemName = item.menuItem?.name || "Món ăn"
        if (!itemCounts[itemName]) {
          itemCounts[itemName] = { name: itemName, count: 0, ratings: [] }
        }
        itemCounts[itemName].count += item.quantity || 1
        if (order.rating) {
          itemCounts[itemName].ratings.push(order.rating)
        }
      })
    })

    return Object.values(itemCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => ({
        name: item.name,
        orders: item.count,
        rating: item.ratings.length > 0 
          ? Math.round(item.ratings.reduce((sum, r) => sum + r, 0) / item.ratings.length) 
          : 5
      }))
  }, [orders])

  // Static offers (would come from promotions API in production)
  const offers = [
    { title: "Giảm 20% món phở", desc: "Áp dụng đến hết tháng", code: "PHO20", expires: "7 ngày" },
    { title: "Miễn phí giao hàng", desc: "Đơn từ 200k", code: "FREESHIP", expires: "14 ngày" },
    { title: "Tặng trà sữa", desc: "Khi mua combo", code: "COMBO01", expires: "3 ngày" },
  ]

  const isLoading = isLoadingOrders || isLoadingReservations
  const hasError = ordersError

  // Loading State
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-7 w-20 mb-1" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-48 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error State
  if (hasError) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Chào mừng bạn trở lại</p>
        </div>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Không thể tải dữ liệu dashboard. Vui lòng thử lại.</span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // refetchUser()
                refetchOrders()
              }}
            >
              Thử lại
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  // Get membership info
  const membershipInfo = user && user.loyaltyPoints 
    ? getMembershipLevel(user.loyaltyPoints)
    : { level: "Bronze", nextLevel: "Silver", nextPoints: 1000, progress: 0 }

  const userName = user?.fullName || user?.username || "Khách hàng"
  const loyaltyPoints = user?.loyaltyPoints || 0
  const pointsToNext = membershipInfo.nextPoints - loyaltyPoints

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold">Xin chào, {userName}! 👋</h2>
        <p className="text-muted-foreground">
          Chào mừng bạn trở lại. Hãy khám phá những ưu đãi mới nhất.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Đơn hàng gần đây</CardTitle>
            <CardDescription>
              Các đơn hàng của bạn trong thời gian qua
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length > 0 ? (
              <>
                <div className="space-y-4">
                  {recentOrders.map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-medium">{order.id}</span>
                        <span className="text-sm text-muted-foreground">{order.items}</span>
                        <span className="text-xs text-muted-foreground">{order.date}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-medium">{order.total.toLocaleString('vi-VN')}₫</span>
                        <Badge variant="outline" className="text-xs">
                          {order.status === "completed" ? "Hoàn thành" :
                           order.status === "pending" ? "Đang xử lý" :
                           order.status === "preparing" ? "Đang chuẩn bị" :
                           order.status === "ready" ? "Sẵn sàng" :
                           order.status === "delivered" ? "Đã giao" : "Đã hủy"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <Link href="/customer/orders">Xem tất cả đơn hàng</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Bạn chưa có đơn hàng nào
                </p>
                <Button asChild size="sm">
                  <Link href="/customer">Đặt món ngay</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favorite Items */}
        <Card>
          <CardHeader>
            <CardTitle>Món yêu thích</CardTitle>
            <CardDescription>
              Những món bạn gọi nhiều nhất
            </CardDescription>
          </CardHeader>
          <CardContent>
            {favoriteItems.length > 0 ? (
              <>
                <div className="space-y-4">
                  {favoriteItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Heart className="h-4 w-4 text-red-500" />
                        <div className="flex flex-col">
                          <span className="font-medium">{item.name}</span>
                          <span className="text-sm text-muted-foreground">
                            Đã gọi {item.orders} lần
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/customer">Đặt lại món yêu thích</Link>
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Bạn chưa có món yêu thích
                </p>
                <p className="text-xs text-muted-foreground">
                  Đặt món và đánh giá để tạo danh sách món yêu thích
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Membership Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Tiến độ thành viên</CardTitle>
          <CardDescription>
            Bạn đang ở cấp {membershipInfo.level}, còn {pointsToNext.toLocaleString('vi-VN')} điểm nữa để lên {membershipInfo.nextLevel}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span>{membershipInfo.level}</span>
              <span>{membershipInfo.nextLevel}</span>
            </div>
            <Progress value={membershipInfo.progress} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{loyaltyPoints.toLocaleString('vi-VN')} điểm</span>
              <span>{membershipInfo.nextPoints.toLocaleString('vi-VN')} điểm</span>
            </div>
          </div>
          <div className="mt-4">
            <Button asChild className="w-full">
              <Link href="/customer">Đặt món để tích điểm</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Special Offers */}
      <Card>
        <CardHeader>
          <CardTitle>Ưu đãi đặc biệt</CardTitle>
          <CardDescription>
            Các mã giảm giá và ưu đãi dành riêng cho bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {offers.map((offer, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{offer.title}</h4>
                  <Gift className="h-4 w-4 text-orange-500" />
                </div>
                <p className="text-sm text-muted-foreground">{offer.desc}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{offer.code}</Badge>
                  <span className="text-xs text-muted-foreground">
                    Còn {offer.expires}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
          <CardDescription>
            Các chức năng thường sử dụng
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Button asChild className="h-auto flex-col py-6">
              <Link href="/customer/reservations">
                <Calendar className="h-8 w-8 mb-2" />
                Đặt bàn
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/customer">
                <Clock className="h-8 w-8 mb-2" />
                Đặt món
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/customer/orders">
                <CreditCard className="h-8 w-8 mb-2" />
                Đơn hàng
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto flex-col py-6">
              <Link href="/setting">
                <Star className="h-8 w-8 mb-2" />
                Hồ sơ
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

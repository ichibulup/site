"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarDateRangePicker } from "../../components/date-range-picker"
import { Button } from "@/components/ui/button"
import { Download, TrendingUp, TrendingDown, DollarSign, Receipt, Target } from "lucide-react"
import { useAnimatedCurrency, useAnimatedPercentage } from "@/hooks/use-counter-animation"
import { DateRange } from "react-day-picker"
import { addDays } from "date-fns"

// TODO: Replace with actual API when available
// import { useGetRevenueAnalyticsQuery, useGetRevenueSummaryQuery } from "@/state/api"

type DailyComparisonItem = {
  day: string
  amount: number
  change: number
}

type QuarterlyRevenueItem = {
  quarter: string
  amount: number
  progress: number
}

type ChannelRevenueItem = {
  channel: string
  amount: number
  percentage: number
}

export default function RevenuePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  // TODO: Uncomment when API is available
  // const {
  //   data: revenueAnalytics,
  //   isLoading: isLoadingAnalytics,
  // } = useGetRevenueAnalyticsQuery({
  //   startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
  //   endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  // })

  // const {
  //   data: revenueSummary,
  //   isLoading: isLoadingSummary,
  // } = useGetRevenueSummaryQuery({
  //   startDate: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
  //   endDate: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
  // })

  // Temporary static data - will be replaced with API data
  const revenueAnalytics = {
    monthlyRevenue: 125430000,
    weeklyRevenue: 32120000,
    dailyRevenue: 4580000,
    avgDailyRevenue: 4175000,
    monthlyChange: 20.1,
    weeklyChange: 15.3,
    dailyChange: 8.7,
    avgChange: 12.5,
    dailyComparison: [
      { day: "Hôm nay", amount: 5240000, change: 12.5 },
      { day: "Hôm qua", amount: 4650000, change: 8.2 },
      { day: "2 ngày trước", amount: 4200000, change: -3.1 },
      { day: "3 ngày trước", amount: 4890000, change: 15.7 },
      { day: "4 ngày trước", amount: 3960000, change: -5.2 },
      { day: "5 ngày trước", amount: 4180000, change: 2.8 },
      { day: "6 ngày trước", amount: 3750000, change: -8.9 },
    ] as DailyComparisonItem[],
  }

  const revenueSummary = {
    quarterlyRevenue: [
      { quarter: "Q3 2024 (Hiện tại)", amount: 380450000, progress: 78.6 },
      { quarter: "Q2 2024", amount: 425200000, progress: 100 },
      { quarter: "Q1 2024", amount: 398100000, progress: 100 },
      { quarter: "Q4 2023", amount: 456800000, progress: 100 },
    ] as QuarterlyRevenueItem[],
    channelRevenue: [
      { channel: "Tại chỗ", amount: 78320000, percentage: 62.4 },
      { channel: "Giao hàng", amount: 31210000, percentage: 24.9 },
      { channel: "Đặt bàn", amount: 15900000, percentage: 12.7 },
    ] as ChannelRevenueItem[],
  }

  // Revenue animation hooks - use real data or fallback
  const monthlyRevenue = useAnimatedCurrency(revenueAnalytics?.monthlyRevenue || 125430000, 0)
  const weeklyRevenue = useAnimatedCurrency(revenueAnalytics?.weeklyRevenue || 32120000, 200)
  const dailyRevenue = useAnimatedCurrency(revenueAnalytics?.dailyRevenue || 4580000, 400)
  const avgDailyRevenue = useAnimatedCurrency(revenueAnalytics?.avgDailyRevenue || 4175000, 600)

  const monthlyChange = useAnimatedPercentage((revenueAnalytics?.monthlyChange || 0) / 100, 1, 800)
  const weeklyChange = useAnimatedPercentage((revenueAnalytics?.weeklyChange || 0) / 100, 1, 1000)
  const dailyChange = useAnimatedPercentage((revenueAnalytics?.dailyChange || 0) / 100, 1, 1200)
  const avgChange = useAnimatedPercentage((revenueAnalytics?.avgChange || 0) / 100, 1, 1400)

  // TODO: Add loading skeleton when API is available
  // if (isLoadingAnalytics || isLoadingSummary) {
  //   return (
  //     <div className="flex-1 space-y-4 p-8 pt-6">
  //       <Skeleton className="h-10 w-64" />
  //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  //         {[1, 2, 3, 4].map((i) => (
  //           <Skeleton key={i} className="h-32" />
  //         ))}
  //       </div>
  //       <Skeleton className="h-96" />
  //     </div>
  //   )
  // }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Phân tích doanh thu</h2>
        <div className="flex items-center space-x-2">
          <CalendarDateRangePicker />
          <Button size="sm">
            <Download className="mr-2 h-4 w-4" />
            Xuất báo cáo
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tháng này</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyRevenue}</div>
            <div className={`flex items-center text-xs ${(revenueAnalytics?.monthlyChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(revenueAnalytics?.monthlyChange || 0) >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {(revenueAnalytics?.monthlyChange || 0) >= 0 ? '+' : ''}{monthlyChange} so với tháng trước
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu tuần này</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{weeklyRevenue}</div>
            <div className={`flex items-center text-xs ${(revenueAnalytics?.weeklyChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(revenueAnalytics?.weeklyChange || 0) >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {(revenueAnalytics?.weeklyChange || 0) >= 0 ? '+' : ''}{weeklyChange} so với tuần trước
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Doanh thu hôm nay</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyRevenue}</div>
            <div className={`flex items-center text-xs ${(revenueAnalytics?.dailyChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(revenueAnalytics?.dailyChange || 0) >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {(revenueAnalytics?.dailyChange || 0) >= 0 ? '+' : ''}{dailyChange} so với hôm qua
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trung bình mỗi ngày</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgDailyRevenue}</div>
            <div className={`flex items-center text-xs ${(revenueAnalytics?.avgChange || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {(revenueAnalytics?.avgChange || 0) >= 0 ? (
                <TrendingUp className="mr-1 h-3 w-3" />
              ) : (
                <TrendingDown className="mr-1 h-3 w-3" />
              )}
              {(revenueAnalytics?.avgChange || 0) >= 0 ? '+' : ''}{avgChange} so với kỳ trước
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList>
          <TabsTrigger value="daily">Theo ngày</TabsTrigger>
          <TabsTrigger value="weekly">Theo tuần</TabsTrigger>
          <TabsTrigger value="monthly">Theo tháng</TabsTrigger>
          <TabsTrigger value="quarterly">Theo quý</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Doanh thu theo giờ hôm nay</CardTitle>
                <CardDescription>
                  Phân bổ doanh thu trong ngày
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  Biểu đồ doanh thu theo giờ
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>So sánh 7 ngày gần nhất</CardTitle>
                <CardDescription>
                  Xu hướng doanh thu tuần qua
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(revenueAnalytics?.dailyComparison || [
                    { day: "Hôm nay", amount: 5240000, change: 12.5 },
                    { day: "Hôm qua", amount: 4650000, change: 8.2 },
                    { day: "2 ngày trước", amount: 4200000, change: -3.1 },
                    { day: "3 ngày trước", amount: 4890000, change: 15.7 },
                    { day: "4 ngày trước", amount: 3960000, change: -5.2 },
                    { day: "5 ngày trước", amount: 4180000, change: 2.8 },
                    { day: "6 ngày trước", amount: 3750000, change: -8.9 },
                  ] as Array<{ day: string; amount: number; change: number }>).map((item: { day: string; amount: number; change: number }, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{item.day}</p>
                        <p className="text-lg font-bold">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.amount)}
                        </p>
                      </div>
                      <div className={`text-sm ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change >= 0 ? (
                          <TrendingUp className="inline mr-1 h-3 w-3" />
                        ) : (
                          <TrendingDown className="inline mr-1 h-3 w-3" />
                        )}
                        {item.change >= 0 ? '+' : ''}{item.change.toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tuần</CardTitle>
              <CardDescription>
                So sánh doanh thu các tuần trong tháng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Biểu đồ doanh thu theo tuần
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Doanh thu theo tháng</CardTitle>
              <CardDescription>
                Xu hướng doanh thu 12 tháng gần nhất
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                Biểu đồ doanh thu theo tháng
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quarterly" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Doanh thu theo quý</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(revenueSummary?.quarterlyRevenue || [
                    { quarter: "Q3 2024 (Hiện tại)", amount: 380450000, progress: 78.6 },
                    { quarter: "Q2 2024", amount: 425200000, progress: 100 },
                    { quarter: "Q1 2024", amount: 398100000, progress: 100 },
                    { quarter: "Q4 2023", amount: 456800000, progress: 100 },
                  ] as Array<{ quarter: string; amount: number; progress: number }>).map((item: { quarter: string; amount: number; progress: number }, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{item.quarter}</span>
                        <span className="text-sm font-bold">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.progress}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {item.progress.toFixed(1)}% hoàn thành
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Phân tích theo kênh</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(revenueSummary?.channelRevenue || [
                    { channel: "Tại chỗ", amount: 78320000, percentage: 62.4 },
                    { channel: "Giao hàng", amount: 31210000, percentage: 24.9 },
                    { channel: "Đặt bàn", amount: 15900000, percentage: 12.7 },
                  ] as Array<{ channel: string; amount: number; percentage: number }>).map((item: { channel: string; amount: number; percentage: number }, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{item.channel}</p>
                          <p className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</p>
                        </div>
                        <div className="text-sm font-bold">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND',
                          }).format(item.amount)}
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

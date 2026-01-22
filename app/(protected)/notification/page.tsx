"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  Filter,
  Mail,
  MailOpen,
  Clock,
  AlertCircle,
  Info,
  CheckCircle
} from "lucide-react"
import { 
  useGetMyNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useDeleteNotificationMutation 
} from "@/state/api"
import { formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  isRead: boolean
  createdAt: string
}

export default function NotificationPage() {
  const [filterType, setFilterType] = useState<string>("all")
  
  const { 
    data: notifications = [], 
    isLoading,
    refetch 
  } = useGetMyNotificationsQuery()
  
  const [markAsRead] = useMarkNotificationAsReadMutation()
  const [markAllAsRead] = useMarkAllNotificationsAsReadMutation()
  const [deleteNotification] = useDeleteNotificationMutation()

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap()
      refetch()
      toast.success("Đã đánh dấu là đã đọc")
    } catch (error) {
      toast.error("Không thể đánh dấu thông báo")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead().unwrap()
      refetch()
      toast.success("Đã đánh dấu tất cả là đã đọc")
    } catch (error) {
      toast.error("Không thể đánh dấu tất cả thông báo")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id).unwrap()
      refetch()
      toast.success("Đã xóa thông báo")
    } catch (error) {
      toast.error("Không thể xóa thông báo")
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const filteredNotifications = notifications.filter((notif: Notification) => {
    if (filterType === "all") return true
    if (filterType === "unread") return !notif.isRead
    if (filterType === "read") return notif.isRead
    return notif.type === filterType
  })

  const unreadCount = notifications.filter((n: Notification) => !n.isRead).length

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Thông báo</h1>
          <p className="text-muted-foreground mt-1">
            Bạn có {unreadCount} thông báo chưa đọc
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Đánh dấu tất cả đã đọc
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Bộ lọc</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "all", label: "Tất cả" },
              { value: "unread", label: "Chưa đọc" },
              { value: "read", label: "Đã đọc" },
              { value: "info", label: "Thông tin" },
              { value: "success", label: "Thành công" },
              { value: "warning", label: "Cảnh báo" },
              { value: "error", label: "Lỗi" },
            ].map((filter) => (
              <Button
                key={filter.value}
                variant={filterType === filter.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType(filter.value)}
              >
                {filter.label}
                {filter.value === "unread" && unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BellOff className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">Không có thông báo</p>
              <p className="text-sm text-muted-foreground">
                {filterType === "all" 
                  ? "Bạn chưa có thông báo nào"
                  : `Không có thông báo ${filterType === "unread" ? "chưa đọc" : "nào"}`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification: Notification) => (
            <Card 
              key={notification.id}
              className={`transition-all ${!notification.isRead ? "border-l-4 border-l-primary bg-accent/5" : ""}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.isRead && (
                            <Badge variant="secondary" className="text-xs">
                              Mới
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {!notification.isRead && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleMarkAsRead(notification.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(notification.createdAt), {
                        addSuffix: true,
                        locale: vi,
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
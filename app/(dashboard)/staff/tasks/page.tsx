import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CheckCircle, Clock, AlertCircle, Plus, Search, Filter, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  assignedBy: string
  assignedByAvatar?: string
  dueDate: string
  createdDate: string
  category: 'cleaning' | 'service' | 'kitchen' | 'maintenance' | 'admin'
  estimatedTime?: number // in minutes
}

export default function StaffTasksPage() {
  const tasks: Task[] = [
    {
      id: "1",
      title: "Dọn dẹp khu vực bàn A1-A10",
      description: "Lau chùi bàn ghế, quét dọn sàn nhà và sắp xếp lại bàn ghế",
      priority: "high",
      status: "pending",
      assignedBy: "Nguyễn Văn Quản lý",
      assignedByAvatar: "/avatar/manager.jpg",
      dueDate: "2025-01-20T10:00:00",
      createdDate: "2025-01-20T08:00:00",
      category: "cleaning",
      estimatedTime: 30
    },
    {
      id: "2",
      title: "Phục vụ bàn số 15",
      description: "Nhận order và phục vụ khách hàng tại bàn 15",
      priority: "urgent",
      status: "in-progress",
      assignedBy: "Hệ thống POS",
      dueDate: "2025-01-20T09:30:00",
      createdDate: "2025-01-20T09:15:00",
      category: "service",
      estimatedTime: 15
    },
    {
      id: "3",
      title: "Kiểm tra thiết bị âm thanh",
      description: "Kiểm tra và đảm bảo hệ thống âm thanh hoạt động bình thường",
      priority: "medium",
      status: "pending",
      assignedBy: "Trần Thị Kỹ thuật",
      dueDate: "2025-01-20T14:00:00",
      createdDate: "2025-01-20T08:30:00",
      category: "maintenance",
      estimatedTime: 45
    },
    {
      id: "4",
      title: "Chuẩn bị món ăn đặc biệt",
      description: "Hỗ trợ bếp chuẩn bị món ăn cho sự kiện đặc biệt",
      priority: "high",
      status: "completed",
      assignedBy: "Lê Văn Bếp trưởng",
      dueDate: "2025-01-19T16:00:00",
      createdDate: "2025-01-19T14:00:00",
      category: "kitchen",
      estimatedTime: 60
    },
    {
      id: "5",
      title: "Cập nhật thông tin menu",
      description: "Cập nhật giá và mô tả các món ăn mới trên hệ thống",
      priority: "low",
      status: "overdue",
      assignedBy: "Nguyễn Văn Quản lý",
      dueDate: "2025-01-19T17:00:00",
      createdDate: "2025-01-19T15:00:00",
      category: "admin",
      estimatedTime: 30
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />
      case 'overdue': return <AlertCircle className="h-4 w-4 text-red-500" />
      default: return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return <Badge variant="outline">Chờ xử lý</Badge>
      case 'in-progress': return <Badge variant="default">Đang thực hiện</Badge>
      case 'completed': return <Badge variant="secondary">Hoàn thành</Badge>
      case 'overdue': return <Badge variant="destructive">Quá hạn</Badge>
      default: return <Badge variant="outline">{status}</Badge>
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'cleaning': return 'Dọn dẹp'
      case 'service': return 'Phục vụ'
      case 'kitchen': return 'Bếp'
      case 'maintenance': return 'Bảo trì'
      case 'admin': return 'Hành chính'
      default: return category
    }
  }

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    overdue: tasks.filter(t => t.status === 'overdue').length
  }

  const todayTasks = tasks.filter(task => {
    const taskDate = new Date(task.dueDate).toDateString()
    const today = new Date().toDateString()
    return taskDate === today
  })

  const urgentTasks = tasks.filter(task => 
    task.priority === 'urgent' || task.status === 'overdue'
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Nhiệm vụ</h2>
          <p className="text-muted-foreground">
            Quản lý và theo dõi các công việc được giao
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Lọc
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Tạo nhiệm vụ
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Tổng nhiệm vụ</p>
                <p className="text-2xl font-bold">{taskStats.total}</p>
              </div>
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Chờ xử lý</p>
                <p className="text-2xl font-bold text-orange-600">{taskStats.pending}</p>
              </div>
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Đang làm</p>
                <p className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</p>
              </div>
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Hoàn thành</p>
                <p className="text-2xl font-bold text-green-600">{taskStats.completed}</p>
              </div>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Quá hạn</p>
                <p className="text-2xl font-bold text-red-600">{taskStats.overdue}</p>
              </div>
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Tìm kiếm nhiệm vụ..." 
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="today">Hôm nay ({todayTasks.length})</TabsTrigger>
          <TabsTrigger value="urgent">Khẩn cấp ({urgentTasks.length})</TabsTrigger>
          <TabsTrigger value="my-tasks">Của tôi</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {tasks.map(task => (
              <Card key={task.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <Checkbox 
                        checked={task.status === 'completed'}
                        className="mt-1"
                      />
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <h4 className="font-medium">{task.title}</h4>
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority === 'urgent' ? 'Khẩn cấp' : 
                             task.priority === 'high' ? 'Cao' :
                             task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">{task.description}</p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>📂 {getCategoryLabel(task.category)}</span>
                          <span>⏱️ {task.estimatedTime} phút</span>
                          <span>📅 {new Date(task.dueDate).toLocaleString('vi-VN')}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={task.assignedByAvatar} />
                            <AvatarFallback className="text-xs">
                              {task.assignedBy.split(' ')[0][0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Giao bởi {task.assignedBy}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(task.status)}
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm">Chi tiết</Button>
                        {task.status !== 'completed' && (
                          <Button size="sm">
                            {task.status === 'pending' ? 'Bắt đầu' : 'Hoàn thành'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="today">
          <div className="space-y-4">
            {todayTasks.length > 0 ? (
              todayTasks.map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Checkbox 
                          checked={task.status === 'completed'}
                          className="mt-1"
                        />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'urgent' ? 'Khẩn cấp' : 
                               task.priority === 'high' ? 'Cao' :
                               task.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(task.status)}
                        <Button size="sm">
                          {task.status === 'pending' ? 'Bắt đầu' : 'Hoàn thành'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-medium mb-2">Không có nhiệm vụ hôm nay</h3>
                  <p className="text-muted-foreground">Bạn đã hoàn thành tất cả nhiệm vụ của ngày hôm nay!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="urgent">
          <div className="space-y-4">
            {urgentTasks.length > 0 ? (
              urgentTasks.map(task => (
                <Card key={task.id} className="border-red-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <Checkbox 
                          checked={task.status === 'completed'}
                          className="mt-1"
                        />
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(task.status)}
                            <h4 className="font-medium">{task.title}</h4>
                            <Badge variant="outline" className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority === 'urgent' ? 'Khẩn cấp' : 
                               task.status === 'overdue' ? 'Quá hạn' : 'Cao'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{task.description}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(task.status)}
                        <Button size="sm" variant={task.status === 'overdue' ? 'destructive' : 'default'}>
                          {task.status === 'pending' ? 'Bắt đầu ngay' : 'Hoàn thành'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="font-medium mb-2">Không có nhiệm vụ khẩn cấp</h3>
                  <p className="text-muted-foreground">Tất cả nhiệm vụ khẩn cấp đã được xử lý!</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-tasks">
          <Card>
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Tính năng đang phát triển</h3>
              <p className="text-muted-foreground">Lọc nhiệm vụ được giao riêng cho bạn</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

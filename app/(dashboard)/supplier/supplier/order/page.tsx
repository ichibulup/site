'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Calendar,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  RefreshCw,
  Package,
  DollarSign,
  ShoppingCart,
  TruckIcon
} from 'lucide-react';
import { toast } from 'sonner';
import { StatsBox } from '@/components/element/stats-box';
// Import form components and API hooks
import { CreatePurchaseOrderForm } from '@/components/form/mock/warehouse';
import {
  useGetPurchaseOrdersQuery,
} from '@/state/api';
import { PurchaseOrder } from "@/lib/interfaces";

export default function PurchaseOrderPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingOrder, setDeletingOrder] = useState<PurchaseOrder | null>(null);

  // API hooks
  const { data: purchaseOrders = [], isLoading, refetch } = useGetPurchaseOrdersQuery();

  const filteredOrders = purchaseOrders.filter((order: PurchaseOrder) => {
    const matchesSearch = (
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order as any).supplier?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const getOrderStats = () => {
    const total = purchaseOrders.length;
    const draft = purchaseOrders.filter((o: PurchaseOrder) => o.status === 'draft').length;
    const sent = purchaseOrders.filter((o: PurchaseOrder) => o.status === 'sent').length;
    const confirmed = purchaseOrders.filter((o: PurchaseOrder) => o.status === 'confirmed').length;
    const received = purchaseOrders.filter((o: PurchaseOrder) => o.status === 'received').length;
    const totalAmount = purchaseOrders.reduce((sum: number, o: PurchaseOrder) => 
      sum + (Number(o.totalAmount) || 0), 0
    );
    
    return { total, draft, sent, confirmed, received, totalAmount };
  };

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Edit className="w-3 h-3 mr-1" />Nháp</Badge>;
      case 'sent':
        return <Badge className="bg-blue-100 text-blue-800"><TruckIcon className="w-3 h-3 mr-1" />Đã gửi</Badge>;
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Đã xác nhận</Badge>;
      case 'partiallyReceived':
        return <Badge className="bg-yellow-100 text-yellow-800"><Package className="w-3 h-3 mr-1" />Nhận một phần</Badge>;
      case 'received':
        return <Badge className="bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" />Đã nhận</Badge>;
      case 'cancelled':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string | Date) => {
    return dateString ? new Date(dateString).toLocaleDateString('vi-VN') : '';
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refetch();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setDeletingOrder(null);
    refetch();
    toast.success('Đơn đặt hàng đã được xóa!');
  };

  const openCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };

  const openDeleteDialog = (order: PurchaseOrder) => {
    setDeletingOrder(order);
    setIsDeleteDialogOpen(true);
  };

  const stats = getOrderStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn đặt hàng</h1>
          <p className="text-muted-foreground">
            Quản lý đơn đặt hàng từ nhà cung cấp
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Tạo đơn đặt hàng mới
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatsBox
          title="Tổng đơn hàng"
          stats={stats.total.toString()}
          icon={ShoppingCart}
          description="Tất cả thời gian"
        />
        <StatsBox
          title="Nháp"
          stats={stats.draft.toString()}
          icon={Edit}
          description="Chưa gửi"
          color="professional-gray"
        />
        <StatsBox
          title="Đã gửi"
          stats={stats.sent.toString()}
          icon={TruckIcon}
          description="Chờ xác nhận"
          color="professional-blue"
        />
        <StatsBox
          title="Đã xác nhận"
          stats={stats.confirmed.toString()}
          icon={CheckCircle}
          description="Chờ nhận hàng"
          color="professional-green"
        />
        <StatsBox
          title="Đã nhận"
          stats={stats.received.toString()}
          icon={Package}
          description="Hoàn thành"
          color="professional-green"
        />
        <StatsBox
          title="Tổng giá trị"
          stats={formatCurrency(stats.totalAmount)}
          icon={DollarSign}
          description="Tất cả đơn hàng"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Danh sách đơn đặt hàng
          </CardTitle>
          <CardDescription>
            Quản lý và theo dõi tất cả đơn đặt hàng từ nhà cung cấp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo mã đơn, nhà cung cấp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Mã đơn hàng</TableHead>
                <TableHead>Nhà cung cấp</TableHead>
                <TableHead>Ngày đặt</TableHead>
                <TableHead>Ngày dự kiến</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Chưa có đơn đặt hàng nào
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order: PurchaseOrder) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold">{order.orderNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {(order as any).supplier?.name || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{formatDate(order.orderDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.expectedDate ? (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{formatDate(order.expectedDate)}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold">
                        {formatCurrency(Number(order.totalAmount))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                        {order.notes || '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="mr-2 h-4 w-4" />
                            Xuất PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteDialog(order)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Purchase Order Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tạo đơn đặt hàng mới</DialogTitle>
            <DialogDescription>
              Tạo đơn đặt hàng từ nhà cung cấp với nhiều sản phẩm
            </DialogDescription>
          </DialogHeader>
          <CreatePurchaseOrderForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setIsCreateDialogOpen(false)}
            defaultRestaurantId="your-restaurant-id" // TODO: Get from context or auth
            defaultUserId="your-user-id" // TODO: Get from context or auth
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xóa đơn đặt hàng</DialogTitle>
            <DialogDescription>
              {deletingOrder && `Bạn có chắc chắn muốn xóa đơn hàng ${deletingOrder.orderNumber}?`}
              Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-4 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                // TODO: Implement delete mutation
                toast.info('Chức năng xóa đang được phát triển');
                setIsDeleteDialogOpen(false);
              }}
            >
              Xóa
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

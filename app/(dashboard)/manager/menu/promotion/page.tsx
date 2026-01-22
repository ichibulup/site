'use client';

import React, { useMemo, useState } from 'react';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  Percent,
  Gift,
  Target,
  TrendingUp,
  Star,
  Copy,
  Eye,
  Play,
  Pause,
  RefreshCw,
  Download
} from 'lucide-react';
import { toast } from 'sonner';

// Import form components and API hooks
import { PromotionForm, VoucherForm } from '@/components/form/mock/promotion';
import { useRestaurant } from '@/hooks/use-organization';
import { unwrapApiData } from '@/lib/utils/formatters';
import {
  useCreatePromotionMutation,
  useCreateVoucherMutation,
  useDeletePromotionMutation,
  useDeleteVoucherMutation,
  useGetPromotionsQuery,
  useGetVouchersQuery,
  useUpdatePromotionMutation,
  useUpdateVoucherMutation,
} from '@/state/api';
import { Promotion, PromotionType, Voucher, VoucherDiscountType } from "@/lib/interfaces"

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Xóa",
  cancelText = "Hủy",
  isLoading = false,
  onConfirm,
}: DeleteConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              className="bg-destructive"
              onClick={onConfirm}
              disabled={isLoading}
            >
              {confirmText}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default function PromotionsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [activeTab, setActiveTab] = useState<'promotions' | 'vouchers'>('promotions');
  
  // Promotion dialogs
  const [isCreatePromotionDialogOpen, setIsCreatePromotionDialogOpen] = useState(false);
  const [isEditPromotionDialogOpen, setIsEditPromotionDialogOpen] = useState(false);
  const [isDeletePromotionDialogOpen, setIsDeletePromotionDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [deletingPromotion, setDeletingPromotion] = useState<Promotion | null>(null);

  // Voucher dialogs
  const [isCreateVoucherDialogOpen, setIsCreateVoucherDialogOpen] = useState(false);
  const [isEditVoucherDialogOpen, setIsEditVoucherDialogOpen] = useState(false);
  const [isDeleteVoucherDialogOpen, setIsDeleteVoucherDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);
  const [deletingVoucher, setDeletingVoucher] = useState<Voucher | null>(null);

  // API hooks
  const { restaurantId } = useRestaurant();
  const promotionsQuery = useGetPromotionsQuery(
    restaurantId ? { restaurantId } : undefined,
    { skip: !restaurantId }
  );
  const vouchersQuery = useGetVouchersQuery(
    restaurantId ? { restaurantId } : undefined,
    { skip: !restaurantId }
  );

  const promotions = useMemo(
    () => unwrapApiData<Promotion[]>(promotionsQuery.data) ?? [],
    [promotionsQuery.data]
  );
  const vouchers = useMemo(
    () => unwrapApiData<Voucher[]>(vouchersQuery.data) ?? [],
    [vouchersQuery.data]
  );

  const promotionsLoading = promotionsQuery.isLoading;
  const vouchersLoading = vouchersQuery.isLoading;
  const refetchPromotions = promotionsQuery.refetch;
  const refetchVouchers = vouchersQuery.refetch;

  const [createPromotion, { isLoading: isCreatingPromotion }] = useCreatePromotionMutation();
  const [updatePromotion, { isLoading: isUpdatingPromotion }] = useUpdatePromotionMutation();
  const [deletePromotion, { isLoading: isDeletingPromotion }] = useDeletePromotionMutation();

  const [createVoucher, { isLoading: isCreatingVoucher }] = useCreateVoucherMutation();
  const [updateVoucher, { isLoading: isUpdatingVoucher }] = useUpdateVoucherMutation();
  const [deleteVoucher, { isLoading: isDeletingVoucher }] = useDeleteVoucherMutation();

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredPromotions = promotions.filter((promotion: Promotion) => {
    const matchesSearch = !normalizedSearch ||
      promotion.name.toLowerCase().includes(normalizedSearch) ||
      (promotion.description ?? "").toLowerCase().includes(normalizedSearch);
    const matchesType = selectedType === 'all' || promotion.type === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && promotion.isActive) ||
                         (selectedStatus === 'inactive' && !promotion.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const filteredVouchers = vouchers.filter((voucher: Voucher) => {
    const matchesSearch = !normalizedSearch ||
      voucher.name.toLowerCase().includes(normalizedSearch) ||
      voucher.code.toLowerCase().includes(normalizedSearch) ||
      (voucher.description ?? "").toLowerCase().includes(normalizedSearch);
    const matchesType = selectedType === 'all' || voucher.discountType === selectedType;
    const matchesStatus = selectedStatus === 'all' || 
                         (selectedStatus === 'active' && voucher.isActive) ||
                         (selectedStatus === 'inactive' && !voucher.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  const toDate = (value: Date | string | null | undefined) => {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  };

  const toNumber = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return null;
    const numeric = typeof value === "number" ? value : Number(value);
    return Number.isFinite(numeric) ? numeric : null;
  };

  const getPromotionStats = () => {
    const totalPromotions = promotions.length;
    const activePromotions = promotions.filter((p: Promotion) => p.isActive).length;
    const now = new Date();
    const soon = new Date();
    soon.setDate(now.getDate() + 7);
    const expiringSoonPromotions = promotions.filter((p: Promotion) => {
      const endDate = toDate(p.endDate);
      return !!endDate && endDate >= now && endDate <= soon;
    }).length;
    const totalVouchers = vouchers.length;
    const activeVouchers = vouchers.filter((v: Voucher) => v.isActive).length;
    const totalVoucherUsage = vouchers.reduce((sum: number, v: Voucher) => sum + (v.usedCount ?? 0), 0);

    return { 
      totalPromotions, 
      activePromotions, 
      expiringSoonPromotions, 
      totalVouchers, 
      activeVouchers, 
      totalVoucherUsage 
    };
  };

  const getPromotionTypeBadge = (type: Promotion['type']) => {
    switch (type) {
      case PromotionType.percentage:
        return <Badge className="bg-blue-100 text-blue-800"><Percent className="w-3 h-3 mr-1" />Phần trăm</Badge>;
      case PromotionType.fixedAmount:
        return <Badge className="bg-green-100 text-green-800"><Gift className="w-3 h-3 mr-1" />Số tiền cố định</Badge>;
      case PromotionType.buyOneGetOne:
        return <Badge className="bg-purple-100 text-purple-800"><Target className="w-3 h-3 mr-1" />Mua 1 tặng 1</Badge>;
      case PromotionType.comboDeal:
        return <Badge className="bg-orange-100 text-orange-800"><TrendingUp className="w-3 h-3 mr-1" />Combo</Badge>;
      case PromotionType.happyHour:
        return <Badge className="bg-yellow-100 text-yellow-800"><Calendar className="w-3 h-3 mr-1" />Giờ vàng</Badge>;
      case PromotionType.seasonal:
        return <Badge className="bg-rose-100 text-rose-800"><Star className="w-3 h-3 mr-1" />Theo mùa</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getVoucherTypeBadge = (type: Voucher['discountType']) => {
    switch (type) {
      case VoucherDiscountType.percentage:
        return <Badge className="bg-blue-100 text-blue-800"><Percent className="w-3 h-3 mr-1" />Phần trăm</Badge>;
      case VoucherDiscountType.fixedAmount:
        return <Badge className="bg-green-100 text-green-800"><Gift className="w-3 h-3 mr-1" />Số tiền cố định</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? 
      <Badge className="bg-green-100 text-green-800"><Play className="w-3 h-3 mr-1" />Đang hoạt động</Badge> :
      <Badge className="bg-gray-100 text-gray-800"><Pause className="w-3 h-3 mr-1" />Tạm dừng</Badge>;
  };

  const formatCurrency = (amount: number | string | null | undefined) => {
    const numeric = toNumber(amount);
    if (numeric === null) return "—";
    return new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(numeric);
  };

  const formatPercent = (amount: number | string | null | undefined) => {
    const numeric = toNumber(amount);
    return numeric === null ? "—" : `${numeric}%`;
  };

  const formatDate = (value: Date | string | null | undefined) => {
    const date = toDate(value);
    return date ? date.toLocaleDateString('vi-VN') : "—";
  };

  // Promotion handlers
  const handleCreatePromotionSuccess = async (payload: any) => {
    if (!restaurantId) {
      toast.error('Không tìm thấy nhà hàng để tạo khuyến mãi!');
      return;
    }

    try {
      await createPromotion({ ...payload, restaurantId }).unwrap();
      setIsCreatePromotionDialogOpen(false);
      refetchPromotions();
      toast.success('Khuyến mãi đã được tạo thành công!');
    } catch (error) {
      console.error('Failed to create promotion:', error);
      toast.error('Có lỗi xảy ra khi tạo khuyến mãi!');
    }
  };

  const handleUpdatePromotionSuccess = async (payload: any) => {
    if (!editingPromotion) return;

    try {
      await updatePromotion({ id: editingPromotion.id, data: payload }).unwrap();
      setIsEditPromotionDialogOpen(false);
      setEditingPromotion(null);
      refetchPromotions();
      toast.success('Khuyến mãi đã được cập nhật!');
    } catch (error) {
      console.error('Failed to update promotion:', error);
      toast.error('Có lỗi xảy ra khi cập nhật khuyến mãi!');
    }
  };

  const handleDeletePromotionSuccess = () => {
    setIsDeletePromotionDialogOpen(false);
    setDeletingPromotion(null);
    refetchPromotions();
    toast.success('Khuyến mãi đã được xóa!');
  };

  const openCreatePromotionDialog = () => {
    if (!restaurantId) {
      toast.error('Không tìm thấy nhà hàng để tạo khuyến mãi!');
      return;
    }
    setIsCreatePromotionDialogOpen(true);
  };

  const openEditPromotionDialog = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setIsEditPromotionDialogOpen(true);
  };

  const openDeletePromotionDialog = (promotion: Promotion) => {
    setDeletingPromotion(promotion);
    setIsDeletePromotionDialogOpen(true);
  };

  // Voucher handlers
  const handleCreateVoucherSuccess = async (payload: any) => {
    if (!restaurantId) {
      toast.error('Không tìm thấy nhà hàng để tạo mã giảm giá!');
      return;
    }

    try {
      await createVoucher({ ...payload, restaurantId }).unwrap();
      setIsCreateVoucherDialogOpen(false);
      refetchVouchers();
      toast.success('Mã giảm giá đã được tạo thành công!');
    } catch (error) {
      console.error('Failed to create voucher:', error);
      toast.error('Có lỗi xảy ra khi tạo mã giảm giá!');
    }
  };

  const handleUpdateVoucherSuccess = async (payload: any) => {
    if (!editingVoucher) return;

    try {
      await updateVoucher({ id: editingVoucher.id, data: payload }).unwrap();
      setIsEditVoucherDialogOpen(false);
      setEditingVoucher(null);
      refetchVouchers();
      toast.success('Mã giảm giá đã được cập nhật!');
    } catch (error) {
      console.error('Failed to update voucher:', error);
      toast.error('Có lỗi xảy ra khi cập nhật mã giảm giá!');
    }
  };

  const handleDeleteVoucherSuccess = () => {
    setIsDeleteVoucherDialogOpen(false);
    setDeletingVoucher(null);
    refetchVouchers();
    toast.success('Mã giảm giá đã được xóa!');
  };

  const openCreateVoucherDialog = () => {
    if (!restaurantId) {
      toast.error('Không tìm thấy nhà hàng để tạo mã giảm giá!');
      return;
    }
    setIsCreateVoucherDialogOpen(true);
  };

  const openEditVoucherDialog = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setIsEditVoucherDialogOpen(true);
  };

  const openDeleteVoucherDialog = (voucher: Voucher) => {
    setDeletingVoucher(voucher);
    setIsDeleteVoucherDialogOpen(true);
  };

  const stats = getPromotionStats();
  const isLoading = promotionsLoading || vouchersLoading;

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
          <h1 className="text-3xl font-bold tracking-tight">Quản lý khuyến mãi</h1>
          <p className="text-muted-foreground">
            Quản lý khuyến mãi và mã giảm giá
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={openCreatePromotionDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo khuyến mãi
          </Button>
          <Button variant="outline" onClick={openCreateVoucherDialog}>
            <Gift className="mr-2 h-4 w-4" />
            Tạo mã giảm giá
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng khuyến mãi
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPromotions}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả khuyến mãi
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Đang hoạt động
            </CardTitle>
            <Play className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.activePromotions}</div>
            <p className="text-xs text-muted-foreground">
              Khuyến mãi hiện tại
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Sắp hết hạn
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.expiringSoonPromotions}</div>
            <p className="text-xs text-muted-foreground">
              Khuyến mãi sắp hết hạn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng mã giảm giá
            </CardTitle>
            <Gift className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.totalVouchers}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả mã giảm giá
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Mã đang hoạt động
            </CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.activeVouchers}</div>
            <p className="text-xs text-muted-foreground">
              Mã hiện tại
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lượt dùng mã
            </CardTitle>
            <Gift className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.totalVoucherUsage}</div>
            <p className="text-xs text-muted-foreground">
              Tổng lượt dùng mã
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quản lý khuyến mãi và mã giảm giá
          </CardTitle>
          <CardDescription>
            Tạo và quản lý các chương trình khuyến mãi, mã giảm giá
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, mô tả..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="sm" onClick={() => {
              if (activeTab === 'promotions') refetchPromotions();
              else refetchVouchers();
            }}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Làm mới
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>

          <div className="flex gap-4 mb-6">
            <Button
              variant={activeTab === 'promotions' ? 'default' : 'outline'}
              onClick={() => setActiveTab('promotions')}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Khuyến mãi ({stats.totalPromotions})
            </Button>
            <Button
              variant={activeTab === 'vouchers' ? 'default' : 'outline'}
              onClick={() => setActiveTab('vouchers')}
            >
              <Gift className="mr-2 h-4 w-4" />
              Mã giảm giá ({stats.totalVouchers})
            </Button>
          </div>

          {activeTab === 'promotions' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên khuyến mãi</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPromotions.map((promotion: Promotion) => (
                  <TableRow key={promotion.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{promotion.name}</div>
                        <div className="text-sm text-muted-foreground">{promotion.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getPromotionTypeBadge(promotion.type)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {promotion.type === PromotionType.percentage
                            ? formatPercent(promotion.discountValue)
                            : formatCurrency(promotion.discountValue)
                          }
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(promotion.startDate)}
                        </div>
                        <div className="text-sm">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(promotion.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(promotion.isActive)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditPromotionDialog(promotion)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Sao chép
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeletePromotionDialog(promotion)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {activeTab === 'vouchers' && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã giảm giá</TableHead>
                  <TableHead>Tên</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Giá trị</TableHead>
                  <TableHead>Thời gian</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Sử dụng</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVouchers.map((voucher: Voucher) => (
                  <TableRow key={voucher.id}>
                    <TableCell className="font-medium">
                      <div className="font-mono text-sm bg-muted px-2 py-1 rounded">
                        {voucher.code}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{voucher.name}</div>
                        <div className="text-sm text-muted-foreground">{voucher.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getVoucherTypeBadge(voucher.discountType)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">
                          {voucher.discountType === VoucherDiscountType.percentage
                            ? formatPercent(voucher.discountValue)
                            : formatCurrency(voucher.discountValue)
                          }
                        </div>
                        {voucher.minOrderValue && (
                          <div className="text-xs text-muted-foreground">
                            Tối thiểu: {formatCurrency(voucher.minOrderValue)}
                          </div>
                        )}
                        {voucher.maxDiscount && (
                          <div className="text-xs text-muted-foreground">
                            Tối đa: {formatCurrency(voucher.maxDiscount)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(voucher.startDate)}
                        </div>
                        <div className="text-sm">
                          <Calendar className="w-3 h-3 inline mr-1" />
                          {formatDate(voucher.endDate)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(voucher.isActive)}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {voucher.usedCount}
                        {voucher.usageLimit && ` / ${voucher.usageLimit}`}
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
                          <DropdownMenuItem onClick={() => openEditVoucherDialog(voucher)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Sao chép mã
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => openDeleteVoucherDialog(voucher)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Promotion Dialog */}
      <Dialog open={isCreatePromotionDialogOpen} onOpenChange={setIsCreatePromotionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tạo khuyến mãi mới</DialogTitle>
            <DialogDescription>
              Tạo mới chương trình khuyến mãi
            </DialogDescription>
          </DialogHeader>
          <PromotionForm
            mode="create"
            restaurantId={restaurantId ?? undefined}
            onSuccess={handleCreatePromotionSuccess}
            onCancel={() => setIsCreatePromotionDialogOpen(false)}
            isLoading={isCreatingPromotion}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Promotion Dialog */}
      <Dialog open={isEditPromotionDialogOpen} onOpenChange={setIsEditPromotionDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa khuyến mãi</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin khuyến mãi
            </DialogDescription>
          </DialogHeader>
          {editingPromotion && (
            <PromotionForm
              mode="update"
              restaurantId={restaurantId ?? undefined}
              initialValues={editingPromotion}
              onSuccess={handleUpdatePromotionSuccess}
              onCancel={() => setIsEditPromotionDialogOpen(false)}
              isLoading={isUpdatingPromotion}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Promotion Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeletePromotionDialogOpen}
        onOpenChange={setIsDeletePromotionDialogOpen}
        title="Xóa khuyến mãi"
        description={`Bạn có chắc chắn muốn xóa "${deletingPromotion?.name}"?`}
        isLoading={isDeletingPromotion}
        onConfirm={async () => {
          if (!deletingPromotion) return;
          try {
            await deletePromotion(deletingPromotion.id).unwrap();
            handleDeletePromotionSuccess();
          } catch (error) {
            console.error('Failed to delete promotion:', error);
            toast.error('Có lỗi xảy ra khi xóa khuyến mãi!');
          }
        }}
      />

      {/* Create Voucher Dialog */}
      <Dialog open={isCreateVoucherDialogOpen} onOpenChange={setIsCreateVoucherDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tạo mã giảm giá mới</DialogTitle>
            <DialogDescription>
              Tạo mới mã giảm giá
            </DialogDescription>
          </DialogHeader>
          <VoucherForm
            mode="create"
            restaurantId={restaurantId ?? undefined}
            onSuccess={handleCreateVoucherSuccess}
            onCancel={() => setIsCreateVoucherDialogOpen(false)}
            isLoading={isCreatingVoucher}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Voucher Dialog */}
      <Dialog open={isEditVoucherDialogOpen} onOpenChange={setIsEditVoucherDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa mã giảm giá</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin mã giảm giá
            </DialogDescription>
          </DialogHeader>
          {editingVoucher && (
            <VoucherForm
              mode="update"
              restaurantId={restaurantId ?? undefined}
              initialValues={editingVoucher}
              onSuccess={handleUpdateVoucherSuccess}
              onCancel={() => setIsEditVoucherDialogOpen(false)}
              isLoading={isUpdatingVoucher}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Voucher Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteVoucherDialogOpen}
        onOpenChange={setIsDeleteVoucherDialogOpen}
        title="Xóa mã giảm giá"
        description={`Bạn có chắc chắn muốn xóa "${deletingVoucher?.name}"?`}
        isLoading={isDeletingVoucher}
        onConfirm={async () => {
          if (!deletingVoucher) return;
          try {
            await deleteVoucher(deletingVoucher.id).unwrap();
            handleDeleteVoucherSuccess();
          } catch (error) {
            console.error('Failed to delete voucher:', error);
            toast.error('Có lỗi xảy ra khi xóa mã giảm giá!');
          }
        }}
      />
    </div>
  );
}

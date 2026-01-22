'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
import { DataTable } from '@/components/element/data-table';
import { Checkbox } from '@/components/ui/checkbox';
import { ColumnDef } from '@tanstack/react-table';
import {
  MoreHorizontal,
  Eye,
  ShoppingBag,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Package,
  CheckCircle,
  XCircle,
  Activity,
} from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from '@/lib/interfaces';
import { StatsBox } from '@/components/element/stats-box';

interface PurchaseOrderItemDetail extends PurchaseOrderItem {
  itemName: string;
  itemCode: string;
  unit: string;
}

interface PurchaseOrderWithDetails extends PurchaseOrder {
  supplierName: string;
  supplierPhone: string;
  supplierEmail: string;
  supplierAddress: string;
  items: PurchaseOrderItemDetail[];
  createdByName: string;
  warehouseName: string;
}

// Mock data - đơn đặt hàng từ nhà cung cấp
const mockPurchaseOrders: PurchaseOrderWithDetails[] = [
  {
    id: 'PO001',
    supplierId: 'SUP001',
    restaurantId: 'rest-1',
    orderNumber: 'PO-2024-001',
    status: PurchaseOrderStatus.received,
    orderDate: new Date('2024-03-25T08:00:00Z'),
    expectedDate: new Date('2024-03-30T00:00:00Z'),
    receivedDate: new Date('2024-03-30T14:30:00Z'),
    totalAmount: 15750000 as any,
    notes: 'Đơn hàng định kỳ tháng 3',
    createdById: 'USER001',
    createdAt: new Date('2024-03-25T08:00:00Z'),
    updatedAt: new Date('2024-03-30T14:30:00Z'),
    supplierName: 'Công ty TNHH Thực phẩm Sạch ABC',
    supplierPhone: '0281234567',
    supplierEmail: 'contact@thucphamabc.vn',
    supplierAddress: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
    items: [
      {
        id: 'ITEM001',
        purchaseOrderId: 'PO001',
        inventoryItemId: 'ITEM001',
        itemName: 'Thịt bò úc nhập khẩu',
        itemCode: 'BEEF-001',
        quantity: 50 as any,
        unitPrice: 180000 as any,
        totalPrice: 9000000 as any,
        receivedQty: 50 as any,
        unit: 'kg',
        notes: 'Chất lượng A',
      },
      {
        id: 'ITEM002',
        purchaseOrderId: 'PO001',
        inventoryItemId: 'ITEM002',
        itemName: 'Rau xà lách organic',
        itemCode: 'VEG-002',
        quantity: 30 as any,
        unitPrice: 25000 as any,
        totalPrice: 750000 as any,
        receivedQty: 30 as any,
        unit: 'kg',
        notes: 'Chất lượng B',
      },
      {
        id: 'ITEM003',
        purchaseOrderId: 'PO001',
        inventoryItemId: 'ITEM003',
        itemName: 'Gạo ST25',
        itemCode: 'RICE-001',
        quantity: 100 as any,
        unitPrice: 60000 as any,
        totalPrice: 6000000 as any,
        receivedQty: 100 as any,
        unit: 'kg',
        notes: 'Chất lượng C',
      },
    ],
    createdByName: 'Nguyễn Văn A',
    warehouseName: 'Kho trung tâm Q1',
  },
  {
    id: 'PO002',
    supplierId: 'SUP002',
    restaurantId: 'rest-1',
    orderNumber: 'PO-2024-002',
    status: PurchaseOrderStatus.partiallyReceived,
    orderDate: new Date('2024-03-28T09:00:00Z'),
    expectedDate: new Date('2024-04-02T00:00:00Z'),
    receivedDate: null,
    totalAmount: 8500000 as any,
    notes: 'Đơn khẩn',
    createdById: 'USER002',
    createdAt: new Date('2024-03-28T09:00:00Z'),
    updatedAt: new Date('2024-03-31T10:00:00Z'),
    supplierName: 'Công ty Hải sản Tươi Sống XYZ',
    supplierPhone: '0287654321',
    supplierEmail: 'sales@haisanxyz.com',
    supplierAddress: '456 Đường Lê Lợi, Quận 1, TP.HCM',
    items: [
      {
        id: 'ITEM004',
        purchaseOrderId: 'PO002',
        inventoryItemId: 'ITEM004',
        itemName: 'Tôm sú tươi size 1',
        itemCode: 'SHRIMP-001',
        quantity: 20 as any,
        unitPrice: 350000 as any,
        totalPrice: 7000000 as any,
        receivedQty: 15 as any,
        unit: 'kg',
        notes: 'Nhận một phần',
      },
      {
        id: 'ITEM005',
        purchaseOrderId: 'PO002',
        inventoryItemId: 'ITEM005',
        itemName: 'Mực ống tươi',
        itemCode: 'SQUID-001',
        quantity: 10 as any,
        unitPrice: 150000 as any,
        totalPrice: 1500000 as any,
        receivedQty: 0 as any,
        unit: 'kg',
        notes: 'Chưa nhận',
      },
    ],
    createdByName: 'Trần Thị B',
    warehouseName: 'Kho trung tâm Q1',
  },
  {
    id: 'PO003',
    supplierId: 'SUP001',
    restaurantId: 'rest-1',
    orderNumber: 'PO-2024-003',
    status: PurchaseOrderStatus.confirmed,
    orderDate: new Date('2024-04-01T10:00:00Z'),
    expectedDate: new Date('2024-04-05T00:00:00Z'),
    receivedDate: null,
    totalAmount: 12300000 as any,
    notes: null,
    createdById: 'USER001',
    createdAt: new Date('2024-04-01T10:00:00Z'),
    updatedAt: new Date('2024-04-01T10:30:00Z'),
    supplierName: 'Công ty TNHH Thực phẩm Sạch ABC',
    supplierPhone: '0281234567',
    supplierEmail: 'contact@thucphamabc.vn',
    supplierAddress: '123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM',
    items: [
      {
        id: 'ITEM006',
        purchaseOrderId: 'PO003',
        inventoryItemId: 'ITEM006',
        itemName: 'Thịt heo ba chỉ',
        itemCode: 'PORK-001',
        quantity: 40 as any,
        unitPrice: 120000 as any,
        totalPrice: 4800000 as any,
        receivedQty: 0 as any,
        unit: 'kg',
        notes: 'Chất lượng C',
      },
      {
        id: 'ITEM007',
        purchaseOrderId: 'PO003',
        inventoryItemId: 'ITEM007',
        itemName: 'Cà chua bi',
        itemCode: 'VEG-003',
        quantity: 50 as any,
        unitPrice: 30000 as any,
        totalPrice: 1500000 as any,
        receivedQty: 0 as any,
        unit: 'kg',
        notes: 'Chất lượng A',
      },
      {
        id: 'ITEM008',
        purchaseOrderId: 'PO003',
        inventoryItemId: 'ITEM008',
        itemName: 'Dầu ăn cao cấp',
        itemCode: 'OIL-001',
        quantity: 30 as any,
        unitPrice: 200000 as any,
        totalPrice: 6000000 as any,
        receivedQty: 0 as any,
        unit: 'lít',
        notes: 'Chất lượng C',
      },
    ],
    createdByName: 'Nguyễn Văn A',
    warehouseName: 'Kho trung tâm Q1',
  },
];

export default function PurchaseOrdersPage() {
  const [purchaseOrders] = useState<PurchaseOrderWithDetails[]>(mockPurchaseOrders);
  const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState<PurchaseOrderWithDetails | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const filteredPurchaseOrders = useMemo(() => purchaseOrders, [purchaseOrders]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const getPurchaseOrderStats = () => {
    const totalOrders = purchaseOrders.length;
    const totalAmount = purchaseOrders.reduce((sum, po) => sum + Number(po.totalAmount), 0);
    const avgOrderValue = totalOrders === 0 ? 0 : totalAmount / totalOrders;
    const receivedOrders = purchaseOrders.filter((po) => po.status === PurchaseOrderStatus.received).length;
    const pendingOrders = purchaseOrders.filter(
      (po) =>
        po.status === PurchaseOrderStatus.draft ||
        po.status === PurchaseOrderStatus.sent ||
        po.status === PurchaseOrderStatus.confirmed,
    ).length;
    const partiallyReceivedOrders = purchaseOrders.filter((po) => po.status === PurchaseOrderStatus.partiallyReceived).length;
    const totalItems = purchaseOrders.reduce(
      (sum, po) => sum + po.items.reduce((itemSum, item) => itemSum + Number(item.quantity), 0),
      0,
    );

    return { totalOrders, totalAmount, avgOrderValue, receivedOrders, pendingOrders, partiallyReceivedOrders, totalItems };
  };

  const getPurchaseOrderStatusBadge = (status: PurchaseOrderStatus) => {
    switch (status) {
      case PurchaseOrderStatus.draft:
        return (
          <Badge variant="outline">
            <Clock className="w-3 h-3 mr-1" />Nháp
          </Badge>
        );
      case PurchaseOrderStatus.sent:
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Package className="w-3 h-3 mr-1" />Đã gửi NCC
          </Badge>
        );
      case PurchaseOrderStatus.confirmed:
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <CheckCircle className="w-3 h-3 mr-1" />NCC xác nhận
          </Badge>
        );
      case PurchaseOrderStatus.partiallyReceived:
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Package className="w-3 h-3 mr-1" />Nhận một phần
          </Badge>
        );
      case PurchaseOrderStatus.received:
        return (
          <Badge className="bg-emerald-100 text-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" />Đã nhận đủ
          </Badge>
        );
      case PurchaseOrderStatus.cancelled:
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />Đã hủy
          </Badge>
        );
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const openDetailDialog = (po: PurchaseOrderWithDetails) => {
    setSelectedPurchaseOrder(po);
    setIsDetailDialogOpen(true);
  };

  const stats = getPurchaseOrderStats();

  const columns: ColumnDef<PurchaseOrderWithDetails, unknown>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          className="w-[18px] h-[18px] ml-2"
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          className="w-[18px] h-[18px] ml-2"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 50,
    },
    {
      accessorKey: 'supplierName',
      header: 'Nhà cung cấp',
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{po.supplierName.split(' ').map((n) => n.charAt(0)).join('').slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <div className="font-medium truncate">{po.supplierName}</div>
              <div className="text-sm text-muted-foreground truncate">{po.supplierPhone}</div>
            </div>
          </div>
        );
      },
      size: 250,
    },
    {
      accessorKey: 'orderNumber',
      header: 'Số đơn hàng',
      cell: ({ row }) => {
        return <div className="font-mono text-sm font-medium">{row.original.orderNumber}</div>;
      },
      size: 130,
    },
    {
      accessorKey: 'orderDate',
      header: () => <div className="text-right">Ngày đặt</div>,
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="space-y-1 text-right">
            <div className="flex items-center justify-end gap-1">
              <Calendar className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm">{formatDate(po.orderDate.toISOString())}</span>
            </div>
            <div className="flex items-center justify-end gap-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-sm font-medium">{formatTime(po.orderDate.toISOString())}</span>
            </div>
          </div>
        );
      },
      size: 150,
    },
    {
      accessorKey: 'expectedDate',
      header: () => <div className="text-right">Ngày dự kiến</div>,
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="space-y-1 text-right">
            {po.expectedDate ? (
              <div className="flex items-center justify-end gap-1">
                <Calendar className="w-3 h-3 text-muted-foreground" />
                <span className="text-sm">{formatDate(po.expectedDate.toISOString())}</span>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">Chưa xác định</span>
            )}
          </div>
        );
      },
      size: 130,
    },
    {
      accessorKey: 'items',
      header: () => <div className="text-right">Mặt hàng</div>,
      cell: ({ row }) => {
        const po = row.original;
        return (
          <div className="space-y-1 text-right">
            <div className="text-sm">
              {po.items.length} mặt hàng ({po.items.reduce((sum, item) => sum + Number(item.quantity), 0)} {po.items[0]?.unit || 'đơn vị'})
            </div>
            <div className="text-xs text-muted-foreground">
              {po.items.slice(0, 2).map((item) => item.itemName).join(', ')}
              {po.items.length > 2 && '...'}
            </div>
          </div>
        );
      },
      size: 200,
    },
    {
      accessorKey: 'status',
      header: 'Trạng thái',
      cell: ({ row }) => {
        return getPurchaseOrderStatusBadge(row.original.status);
      },
      size: 150,
    },
    {
      accessorKey: 'totalAmount',
      header: () => <div className="text-right">Tổng giá trị</div>,
      cell: ({ row }) => {
        const po = row.original;
        const receivedPercentage =
          (po.items.reduce((sum, item) => sum + Number(item.receivedQty), 0) /
            po.items.reduce((sum, item) => sum + Number(item.quantity), 0)) *
          100;
        return (
          <div className="text-right space-y-1">
            <div className="font-semibold">{formatCurrency(Number(po.totalAmount))}</div>
            {po.status === PurchaseOrderStatus.partiallyReceived && (
              <div className="flex items-center justify-end gap-1 text-xs text-yellow-600">
                <Package className="w-3 h-3" />
                {receivedPercentage.toFixed(0)}% đã nhận
              </div>
            )}
          </div>
        );
      },
      size: 150,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const po = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center justify-center">
                <Button variant="ghost" size="icon" className="p-0">
                  <span className="sr-only">Mở menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openDetailDialog(po)}>
                <Eye className="mr-2 h-4 w-4" />
                Xem chi tiết
              </DropdownMenuItem>
              <DropdownMenuItem>Sao chép số đơn</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      enableResizing: false,
      size: 64,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đơn mua nhà cung cấp</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý tất cả Purchase Order với nhà cung cấp</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <StatsBox title="Tổng đơn đặt" description="Tất cả PO" icon={ShoppingBag} stats={stats.totalOrders} />
        <StatsBox
          title="Tổng giá trị"
          description="Tất cả PO"
          icon={DollarSign}
          color="professional-green"
          stats={formatCurrency(stats.totalAmount)}
        />
        <StatsBox
          title="Giá trị TB"
          description="Mỗi PO"
          icon={TrendingUp}
          color="professional-blue"
          stats={formatCurrency(stats.avgOrderValue)}
        />
        <StatsBox
          title="Tổng số dòng"
          description="Số mặt hàng"
          icon={Package}
          color="professional-yellow"
          stats={stats.totalItems}
        />
        <StatsBox
          title="Đang chờ"
          description="Nháp/Gửi/Xác nhận"
          icon={Activity}
          color="professional-red"
          stats={stats.pendingOrders}
        />
        <StatsBox
          title="Nhận một phần"
          description="PO còn hàng chưa nhận"
          icon={Package}
          color="professional-yellow"
          stats={stats.partiallyReceivedOrders}
        />
        <StatsBox title="Đã nhận" description="PO hoàn tất" icon={CheckCircle} color="professional-green" stats={stats.receivedOrders} />
      </div>

      <DataTable
        columns={columns}
        data={filteredPurchaseOrders}
        search={{
          column: 'supplierName',
          placeholder: 'Tìm kiếm NCC, SĐT hoặc mã đơn...',
        }}
        filter={[
          {
            column: 'status',
            title: 'Trạng thái',
            options: [
              { label: 'Tất cả', value: 'all' },
              { label: 'Nháp', value: PurchaseOrderStatus.draft },
              { label: 'Đã gửi', value: PurchaseOrderStatus.sent },
              { label: 'Xác nhận', value: PurchaseOrderStatus.confirmed },
              { label: 'Nhận một phần', value: PurchaseOrderStatus.partiallyReceived },
              { label: 'Đã nhận', value: PurchaseOrderStatus.received },
              { label: 'Đã hủy', value: PurchaseOrderStatus.cancelled },
            ],
          },
        ]}
        max="items"
        onReload={() => {}}
        onDownload={() => {}}
        onCreate={() => {}}
        onUpdate={() => {}}
        onChange={() => {}}
      />

      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[900px]">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn mua {selectedPurchaseOrder?.orderNumber}</DialogTitle>
            <DialogDescription>Thông tin chi tiết về Purchase Order với nhà cung cấp</DialogDescription>
          </DialogHeader>
          {selectedPurchaseOrder && (
            <div className="grid gap-6 py-4 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin nhà cung cấp</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {selectedPurchaseOrder.supplierName
                            .split(' ')
                            .map((n) => n.charAt(0))
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{selectedPurchaseOrder.supplierName}</div>
                        <div className="text-sm text-muted-foreground">{selectedPurchaseOrder.supplierEmail}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">SĐT:</span>
                      <span>{selectedPurchaseOrder.supplierPhone}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-sm text-muted-foreground">Địa chỉ:</span>
                      <span className="text-sm">{selectedPurchaseOrder.supplierAddress}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thông tin đơn mua</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Số PO:</span>
                      <span className="font-mono font-medium">{selectedPurchaseOrder.orderNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngày đặt:</span>
                      <span>
                        {formatDate(selectedPurchaseOrder.orderDate.toISOString())} {formatTime(selectedPurchaseOrder.orderDate.toISOString())}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ngày dự kiến:</span>
                      {selectedPurchaseOrder.expectedDate ? (
                        <span>{formatDate(selectedPurchaseOrder.expectedDate.toISOString())}</span>
                      ) : (
                        <span className="text-muted-foreground">Chưa xác định</span>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span>Trạng thái:</span>
                      {getPurchaseOrderStatusBadge(selectedPurchaseOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span>Tạo bởi:</span>
                      <span>{selectedPurchaseOrder.createdByName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kho nhận:</span>
                      <span>{selectedPurchaseOrder.warehouseName}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Danh sách mặt hàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedPurchaseOrder.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <div className="font-medium">{item.itemName}</div>
                          <div className="text-xs text-muted-foreground font-mono">{item.itemCode}</div>
                          {item.notes && <div className="text-sm text-muted-foreground">Ghi chú: {item.notes}</div>}
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm">SL: {Number(item.quantity)} {item.unit}</div>
                          <div className="text-sm">Đã nhận: {Number(item.receivedQty)} {item.unit}</div>
                          <div className="font-medium">{formatCurrency(Number(item.totalPrice))}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Giá trị</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Tổng cộng:</span>
                      <span className="font-semibold">{formatCurrency(Number(selectedPurchaseOrder.totalAmount))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số dòng:</span>
                      <span>{selectedPurchaseOrder.items.length} mặt hàng</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tổng số lượng:</span>
                      <span>
                        {selectedPurchaseOrder.items.reduce((sum, item) => sum + Number(item.quantity), 0)}{' '}
                        {selectedPurchaseOrder.items[0]?.unit || ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Trạng thái nhận hàng</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Trạng thái:</span>
                      {getPurchaseOrderStatusBadge(selectedPurchaseOrder.status)}
                    </div>
                    <div className="flex justify-between">
                      <span>Ngày nhận:</span>
                      {selectedPurchaseOrder.receivedDate ? (
                        <span>
                          {formatDate(selectedPurchaseOrder.receivedDate.toISOString())}{' '}
                          {formatTime(selectedPurchaseOrder.receivedDate.toISOString())}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Chưa nhận</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {selectedPurchaseOrder.notes && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Ghi chú</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{selectedPurchaseOrder.notes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Đóng
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

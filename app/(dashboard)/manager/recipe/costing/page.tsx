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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calculator,
  Percent,
  FileText,
  Eye,
  Download,
  PieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Banknote,
  ShoppingCart,
  Clock,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface RecipeCosting {
  id: string;
  recipeId: string;
  recipeName: string;
  portionSize: number;
  ingredientCost: number;
  laborCost: number;
  overheadCost: number;
  totalCost: number;
  sellingPrice: number;
  profitMargin: number;
  profitAmount: number;
  costPerPortion: number;
  markupPercentage: number;
  breakEvenPrice: number;
  lastUpdated: string;
  notes?: string;
  status: 'active' | 'draft' | 'archived';
}

// Mock data for recipe costing
const mockCostings: RecipeCosting[] = [
  {
    id: '1',
    recipeId: '1',
    recipeName: 'Phở Bò Đặc Biệt',
    portionSize: 1,
    ingredientCost: 65000,
    laborCost: 25000,
    overheadCost: 15000,
    totalCost: 105000,
    sellingPrice: 180000,
    profitMargin: 41.67,
    profitAmount: 75000,
    costPerPortion: 105000,
    markupPercentage: 71.43,
    breakEvenPrice: 120000,
    lastUpdated: '2024-01-15T10:00:00Z',
    status: 'active',
    notes: 'Giá nguyên liệu có xu hướng tăng, cần theo dõi'
  },
  {
    id: '2',
    recipeId: '2',
    recipeName: 'Cơm Gà Nướng Mật Ong',
    portionSize: 1,
    ingredientCost: 45000,
    laborCost: 20000,
    overheadCost: 12000,
    totalCost: 77000,
    sellingPrice: 150000,
    profitMargin: 48.67,
    profitAmount: 73000,
    costPerPortion: 77000,
    markupPercentage: 94.81,
    breakEvenPrice: 88000,
    lastUpdated: '2024-01-18T10:00:00Z',
    status: 'active',
    notes: 'Margin tốt, có thể xem xét khuyến mãi'
  },
  {
    id: '3',
    recipeId: '3',
    recipeName: 'Trà Đá Chanh Tươi',
    portionSize: 1,
    ingredientCost: 8000,
    laborCost: 5000,
    overheadCost: 3000,
    totalCost: 16000,
    sellingPrice: 35000,
    profitMargin: 54.29,
    profitAmount: 19000,
    costPerPortion: 16000,
    markupPercentage: 118.75,
    breakEvenPrice: 18000,
    lastUpdated: '2024-01-20T10:00:00Z',
    status: 'active',
    notes: 'Margin cao nhất trong menu đồ uống'
  },
  {
    id: '4',
    recipeId: '4',
    recipeName: 'Bánh Tiramisu',
    portionSize: 1,
    ingredientCost: 25000,
    laborCost: 15000,
    overheadCost: 8000,
    totalCost: 48000,
    sellingPrice: 85000,
    profitMargin: 43.53,
    profitAmount: 37000,
    costPerPortion: 48000,
    markupPercentage: 77.08,
    breakEvenPrice: 55000,
    lastUpdated: '2024-01-22T10:00:00Z',
    status: 'active',
    notes: 'Thời gian chế biến lâu, cần tối ưu'
  },
  {
    id: '5',
    recipeId: '5',
    recipeName: 'Salad Caesar',
    portionSize: 1,
    ingredientCost: 35000,
    laborCost: 12000,
    overheadCost: 8000,
    totalCost: 55000,
    sellingPrice: 120000,
    profitMargin: 54.17,
    profitAmount: 65000,
    costPerPortion: 55000,
    markupPercentage: 118.18,
    breakEvenPrice: 63000,
    lastUpdated: '2024-01-25T10:00:00Z',
    status: 'draft',
    notes: 'Đang xem xét điều chỉnh giá bán'
  }
];

const availableRecipes = [
  { id: '1', name: 'Phở Bò Đặc Biệt' },
  { id: '2', name: 'Cơm Gà Nướng Mật Ong' },
  { id: '3', name: 'Trà Đá Chanh Tươi' },
  { id: '4', name: 'Bánh Tiramisu' },
  { id: '5', name: 'Salad Caesar' },
  { id: '6', name: 'Spaghetti Carbonara' },
  { id: '7', name: 'Cà Phê Sữa Đá' }
];

export default function CostingPage() {
  const [costings, setCostings] = useState<RecipeCosting[]>(mockCostings);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCosting, setEditingCosting] = useState<RecipeCosting | null>(null);
  
  const [formData, setFormData] = useState<{
    recipeId: string;
    portionSize: number;
    ingredientCost: number;
    laborCost: number;
    overheadCost: number;
    sellingPrice: number;
    notes: string;
    status: RecipeCosting['status'];
  }>({
    recipeId: '',
    portionSize: 1,
    ingredientCost: 0,
    laborCost: 0,
    overheadCost: 0,
    sellingPrice: 0,
    notes: '',
    status: 'draft'
  });

  const filteredCostings = costings.filter(costing => {
    const matchesSearch = costing.recipeName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || costing.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const calculateMetrics = (ingredientCost: number, laborCost: number, overheadCost: number, sellingPrice: number) => {
    const totalCost = ingredientCost + laborCost + overheadCost;
    const profitAmount = sellingPrice - totalCost;
    const profitMargin = sellingPrice > 0 ? (profitAmount / sellingPrice) * 100 : 0;
    const markupPercentage = totalCost > 0 ? (profitAmount / totalCost) * 100 : 0;
    const breakEvenPrice = totalCost * 1.15; // 15% buffer
    
    return {
      totalCost,
      profitAmount,
      profitMargin,
      markupPercentage,
      breakEvenPrice
    };
  };

  const getCostingStats = () => {
    const activeCostings = costings.filter(c => c.status === 'active');
    const totalRecipes = activeCostings.length;
    const avgProfitMargin = totalRecipes > 0 
      ? activeCostings.reduce((sum, c) => sum + c.profitMargin, 0) / totalRecipes 
      : 0;
    const totalRevenue = activeCostings.reduce((sum, c) => sum + c.sellingPrice, 0);
    const totalCost = activeCostings.reduce((sum, c) => sum + c.totalCost, 0);
    const highMarginCount = activeCostings.filter(c => c.profitMargin >= 50).length;
    
    return { totalRecipes, avgProfitMargin, totalRevenue, totalCost, highMarginCount };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getMarginStatus = (margin: number) => {
    if (margin >= 50) return { label: 'Xuất sắc', variant: 'default' as const, color: 'text-green-600' };
    if (margin >= 40) return { label: 'Tốt', variant: 'secondary' as const, color: 'text-blue-600' };
    if (margin >= 25) return { label: 'Khá', variant: 'outline' as const, color: 'text-yellow-600' };
    return { label: 'Thấp', variant: 'destructive' as const, color: 'text-red-600' };
  };

  const handleCreate = () => {
    const recipe = availableRecipes.find(r => r.id === formData.recipeId);
    
    if (!recipe) {
      toast.error('Vui lòng chọn công thức!');
      return;
    }

    const metrics = calculateMetrics(
      formData.ingredientCost,
      formData.laborCost,
      formData.overheadCost,
      formData.sellingPrice
    );

    const newCosting: RecipeCosting = {
      id: Date.now().toString(),
      recipeName: recipe.name,
      costPerPortion: metrics.totalCost / formData.portionSize,
      ...formData,
      ...metrics,
      lastUpdated: new Date().toISOString()
    };
    
    setCostings([...costings, newCosting]);
    toast.success('Tính giá thành đã được thêm thành công!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdate = () => {
    if (!editingCosting) return;
    
    const recipe = availableRecipes.find(r => r.id === formData.recipeId);
    
    if (!recipe) {
      toast.error('Vui lòng chọn công thức!');
      return;
    }

    const metrics = calculateMetrics(
      formData.ingredientCost,
      formData.laborCost,
      formData.overheadCost,
      formData.sellingPrice
    );
    
    setCostings(costings.map(costing => 
      costing.id === editingCosting.id 
        ? { 
            ...costing, 
            ...formData,
            recipeName: recipe.name,
            costPerPortion: metrics.totalCost / formData.portionSize,
            ...metrics,
            lastUpdated: new Date().toISOString() 
          }
        : costing
    ));
    toast.success('Tính giá thành đã được cập nhật thành công!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setCostings(costings.filter(costing => costing.id !== id));
    toast.success('Tính giá thành đã được xóa thành công!');
  };

  const handleUpdateStatus = (id: string, status: RecipeCosting['status']) => {
    setCostings(costings.map(costing => 
      costing.id === id 
        ? { ...costing, status, lastUpdated: new Date().toISOString() }
        : costing
    ));
    toast.success(`Trạng thái đã được cập nhật thành ${status}!`);
  };

  const resetForm = () => {
    setFormData({
      recipeId: '',
      portionSize: 1,
      ingredientCost: 0,
      laborCost: 0,
      overheadCost: 0,
      sellingPrice: 0,
      notes: '',
      status: 'draft'
    });
    setEditingCosting(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (costing: RecipeCosting) => {
    setEditingCosting(costing);
    setFormData({
      recipeId: costing.recipeId,
      portionSize: costing.portionSize,
      ingredientCost: costing.ingredientCost,
      laborCost: costing.laborCost,
      overheadCost: costing.overheadCost,
      sellingPrice: costing.sellingPrice,
      notes: costing.notes || '',
      status: costing.status
    });
    setIsDialogOpen(true);
  };

  const previewMetrics = calculateMetrics(
    formData.ingredientCost,
    formData.laborCost,
    formData.overheadCost,
    formData.sellingPrice
  );

  const stats = getCostingStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tính giá thành</h1>
          <p className="text-muted-foreground">
            Phân tích chi phí và lợi nhuận cho từng món ăn trong menu
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm tính giá thành
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {editingCosting ? 'Chỉnh sửa tính giá thành' : 'Thêm tính giá thành mới'}
              </DialogTitle>
              <DialogDescription>
                {editingCosting 
                  ? 'Cập nhật thông tin chi phí và giá bán'
                  : 'Thêm thông tin chi phí và tính toán lợi nhuận cho món ăn'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="recipeId" className="text-right">
                  Công thức
                </Label>
                <Select value={formData.recipeId} onValueChange={(value) => setFormData({...formData, recipeId: value})}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Chọn công thức" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRecipes.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="portionSize" className="text-right">
                  Khẩu phần
                </Label>
                <Input
                  id="portionSize"
                  type="number"
                  min="1"
                  value={formData.portionSize}
                  onChange={(e) => setFormData({...formData, portionSize: parseInt(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Chi phí (VND)</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="ingredientCost" className="text-right">
                      Nguyên liệu
                    </Label>
                    <Input
                      id="ingredientCost"
                      type="number"
                      value={formData.ingredientCost}
                      onChange={(e) => setFormData({...formData, ingredientCost: parseInt(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="laborCost" className="text-right">
                      Nhân công
                    </Label>
                    <Input
                      id="laborCost"
                      type="number"
                      value={formData.laborCost}
                      onChange={(e) => setFormData({...formData, laborCost: parseInt(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="overheadCost" className="text-right">
                      Chi phí chung
                    </Label>
                    <Input
                      id="overheadCost"
                      type="number"
                      value={formData.overheadCost}
                      onChange={(e) => setFormData({...formData, overheadCost: parseInt(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Giá bán & Trạng thái</h4>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sellingPrice" className="text-right">
                      Giá bán
                    </Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      value={formData.sellingPrice}
                      onChange={(e) => setFormData({...formData, sellingPrice: parseInt(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Trạng thái
                    </Label>
                    <Select value={formData.status} onValueChange={(value: RecipeCosting['status']) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Nháp</SelectItem>
                        <SelectItem value="active">Hoạt động</SelectItem>
                        <SelectItem value="archived">Lưu trữ</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {(formData.ingredientCost > 0 || formData.laborCost > 0 || formData.sellingPrice > 0) && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-4">Xem trước kết quả</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Tổng chi phí</div>
                      <div className="font-semibold">{formatCurrency(previewMetrics.totalCost)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Lợi nhuận</div>
                      <div className="font-semibold text-green-600">{formatCurrency(previewMetrics.profitAmount)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Margin</div>
                      <div className="font-semibold">{previewMetrics.profitMargin.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Markup</div>
                      <div className="font-semibold">{previewMetrics.markupPercentage.toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="col-span-3"
                  rows={3}
                  placeholder="Ghi chú về chi phí, lợi nhuận hoặc chiến lược giá..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={editingCosting ? handleUpdate : handleCreate}>
                {editingCosting ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng món ăn
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecipes}</div>
            <p className="text-xs text-muted-foreground">
              Món ăn đang hoạt động
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margin trung bình
            </CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProfitMargin.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {stats.avgProfitMargin >= 40 ? (
                <span className="text-green-600 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Tốt
                </span>
              ) : (
                <span className="text-yellow-600 flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Cần cải thiện
                </span>
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Doanh thu ước tính
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Chi phí: {formatCurrency(stats.totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Margin cao
            </CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highMarginCount}</div>
            <p className="text-xs text-muted-foreground">
              {((stats.highMarginCount / stats.totalRecipes) * 100).toFixed(1)}% menu (≥50%)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bảng tính giá thành
          </CardTitle>
          <CardDescription>
            Phân tích chi phí và lợi nhuận chi tiết cho từng món ăn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="archived">Lưu trữ</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Xuất Excel
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Món ăn</TableHead>
                <TableHead>Chi phí</TableHead>
                <TableHead>Giá bán</TableHead>
                <TableHead>Lợi nhuận</TableHead>
                <TableHead>Margin</TableHead>
                <TableHead>Markup</TableHead>
                <TableHead>Đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCostings.map((costing) => {
                const marginStatus = getMarginStatus(costing.profitMargin);
                return (
                  <TableRow key={costing.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <ShoppingCart className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-semibold">{costing.recipeName}</div>
                          <div className="text-sm text-muted-foreground">
                            {costing.portionSize} phần
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{formatCurrency(costing.totalCost)}</div>
                        <div className="text-xs text-muted-foreground">
                          NL: {formatCurrency(costing.ingredientCost)} •&nbsp;
                          NC: {formatCurrency(costing.laborCost)} •&nbsp;
                          CC: {formatCurrency(costing.overheadCost)}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Banknote className="w-4 h-4 text-muted-foreground" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(costing.sellingPrice)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-semibold text-green-600">
                          {formatCurrency(costing.profitAmount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`font-semibold ${marginStatus.color}`}>
                        {costing.profitMargin.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {costing.markupPercentage.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={marginStatus.variant}>
                        {marginStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={
                        costing.status === 'active' ? 'default' : 
                        costing.status === 'draft' ? 'secondary' : 'outline'
                      }>
                        {costing.status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {costing.status === 'draft' && <Clock className="w-3 h-3 mr-1" />}
                        {costing.status === 'archived' && <FileText className="w-3 h-3 mr-1" />}
                        {costing.status === 'active' ? 'Hoạt động' : 
                         costing.status === 'draft' ? 'Nháp' : 'Lưu trữ'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(costing.lastUpdated).toLocaleDateString('vi-VN')}
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
                          <DropdownMenuItem onClick={() => openEditDialog(costing)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <PieChart className="mr-2 h-4 w-4" />
                            Phân tích
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Biểu đồ
                          </DropdownMenuItem>
                          {costing.status === 'draft' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(costing.id, 'active')}
                              className="text-green-600"
                            >
                              <Zap className="mr-2 h-4 w-4" />
                              Kích hoạt
                            </DropdownMenuItem>
                          )}
                          {costing.status === 'active' && (
                            <DropdownMenuItem 
                              onClick={() => handleUpdateStatus(costing.id, 'archived')}
                              className="text-yellow-600"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Lưu trữ
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleDelete(costing.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Xóa
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

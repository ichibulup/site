'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Progress } from '@/components/ui/progress';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Star,
  Award,
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  Calendar,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  FileText,
  Download,
  BarChart3,
  Clock,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  UserCheck,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface StaffReview {
  id: string;
  staffId: string;
  staffName: string;
  staffPosition: string;
  reviewerId: string;
  reviewerName: string;
  reviewPeriodStart: string;
  reviewPeriodEnd: string;
  overallScore: number;
  qualityScore: number;
  productivityScore: number;
  teamworkScore: number;
  punctualityScore: number;
  communicationScore: number;
  strengths: string;
  areasForImprovement: string;
  goalsNextPeriod: string;
  reviewerComments: string;
  status: 'draft' | 'completed' | 'approved' | 'disputed';
  createdAt: string;
  updatedAt: string;
}

const mockReviews: StaffReview[] = [
  {
    id: '1',
    staffId: 'EMP001',
    staffName: 'Nguyễn Văn An',
    staffPosition: 'Đầu bếp trưởng',
    reviewerId: 'MGR001',
    reviewerName: 'Trần Quản Lý',
    reviewPeriodStart: '2024-01-01',
    reviewPeriodEnd: '2024-03-31',
    overallScore: 9.2,
    qualityScore: 9.5,
    productivityScore: 9.0,
    teamworkScore: 8.8,
    punctualityScore: 9.5,
    communicationScore: 8.5,
    strengths: 'Kỹ năng nấu ăn xuất sắc, khả năng lãnh đạo tốt, luôn đảm bảo chất lượng món ăn. Có khả năng đào tạo nhân viên mới hiệu quả.',
    areasForImprovement: 'Cần cải thiện kỹ năng giao tiếp với khách hàng, đôi khi có thể căng thẳng trong giờ cao điểm.',
    goalsNextPeriod: 'Phát triển thêm 3 món ăn mới cho menu, đào tạo 2 đầu bếp phụ, cải thiện thời gian phục vụ trong giờ cao điểm.',
    reviewerComments: 'Nhân viên xuất sắc với đóng góp lớn cho nhà hàng. Đề xuất tăng lương và xem xét thăng chức.',
    status: 'approved',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-20T15:30:00Z'
  },
  {
    id: '2',
    staffId: 'EMP002',
    staffName: 'Trần Thị Mai',
    staffPosition: 'Quản lý ca',
    reviewerId: 'MGR001',
    reviewerName: 'Trần Quản Lý',
    reviewPeriodStart: '2024-01-01',
    reviewPeriodEnd: '2024-03-31',
    overallScore: 8.8,
    qualityScore: 9.0,
    productivityScore: 8.5,
    teamworkScore: 9.2,
    punctualityScore: 9.0,
    communicationScore: 9.0,
    strengths: 'Khả năng quản lý nhóm tốt, xử lý tình huống nhanh, luôn đảm bảo ca làm việc vận hành trơn tru.',
    areasForImprovement: 'Cần cải thiện khả năng quản lý thời gian trong ca làm việc, đôi khi các công việc bị chồng chéo.',
    goalsNextPeriod: 'Tối ưu quy trình phục vụ, đào tạo kỹ năng bán hàng cho nhân viên, tăng điểm đánh giá khách hàng lên 4.5 sao.',
    reviewerComments: 'Nhân viên có tiềm năng phát triển cao, rất phù hợp với vị trí quản lý.',
    status: 'completed',
    createdAt: '2024-03-18T14:00:00Z',
    updatedAt: '2024-03-25T09:15:00Z'
  },
  {
    id: '3',
    staffId: 'EMP003',
    staffName: 'Lê Hoàng Nam',
    staffPosition: 'Thu ngân',
    reviewerId: 'EMP002',
    reviewerName: 'Trần Thị Mai',
    reviewPeriodStart: '2024-01-01',
    reviewPeriodEnd: '2024-03-31',
    overallScore: 8.5,
    qualityScore: 8.8,
    productivityScore: 8.5,
    teamworkScore: 8.0,
    punctualityScore: 9.0,
    communicationScore: 8.5,
    strengths: 'Thành thạo hệ thống POS, xử lý thanh toán nhanh chóng, thái độ thân thiện với khách hàng.',
    areasForImprovement: 'Cần tích cực hơn trong việc tương tác với đồng nghiệp, phát triển kỹ năng bán hàng.',
    goalsNextPeriod: 'Học thêm về các phương thức thanh toán mới, tăng doanh số bán món phụ và đồ uống.',
    reviewerComments: 'Nhân viên đáng tin cậy, có thể phát triển thêm về mặt kỹ năng mềm.',
    status: 'completed',
    createdAt: '2024-03-20T11:30:00Z',
    updatedAt: '2024-03-22T16:45:00Z'
  },
  {
    id: '4',
    staffId: 'EMP004',
    staffName: 'Phạm Minh Tuấn',
    staffPosition: 'Bồi bàn',
    reviewerId: 'EMP002',
    reviewerName: 'Trần Thị Mai',
    reviewPeriodStart: '2024-01-01',
    reviewPeriodEnd: '2024-03-31',
    overallScore: 7.8,
    qualityScore: 8.0,
    productivityScore: 7.5,
    teamworkScore: 8.2,
    punctualityScore: 7.0,
    communicationScore: 8.0,
    strengths: 'Phục vụ nhiệt tình, nhớ tốt thông tin khách hàng thường xuyên, có thái độ lịch sự.',
    areasForImprovement: 'Cần cải thiện tính đúng giờ, đôi khi chậm trong việc ghi nhận đơn hàng.',
    goalsNextPeriod: 'Cải thiện kỹ năng ghi chép đơn hàng, học thêm về thực đơn để tư vấn khách hàng tốt hơn.',
    reviewerComments: 'Nhân viên có tinh thần làm việc tốt, cần hỗ trợ thêm về kỹ năng.',
    status: 'completed',
    createdAt: '2024-03-25T10:00:00Z',
    updatedAt: '2024-03-25T10:00:00Z'
  },
  {
    id: '5',
    staffId: 'EMP005',
    staffName: 'Vũ Thành Long',
    staffPosition: 'Bảo vệ',
    reviewerId: 'MGR001',
    reviewerName: 'Trần Quản Lý',
    reviewPeriodStart: '2024-01-01',
    reviewPeriodEnd: '2024-03-31',
    overallScore: 8.0,
    qualityScore: 8.5,
    productivityScore: 8.0,
    teamworkScore: 7.5,
    punctualityScore: 9.0,
    communicationScore: 7.8,
    strengths: 'Đảm bảo an ninh tốt, phản ứng nhanh trong các tình huống khẩn cấp.',
    areasForImprovement: 'Cần cải thiện kỹ năng giao tiếp với khách hàng, đôi khi có thái độ hơi cứng nhắc.',
    goalsNextPeriod: 'Tham gia khóa đào tạo dịch vụ khách hàng, nâng cao kỹ năng xử lý tình huống.',
    reviewerComments: 'Nhân viên có ý thức trách nhiệm cao, cần phát triển thêm kỹ năng mềm.',
    status: 'completed',
    createdAt: '2024-03-22T09:00:00Z',
    updatedAt: '2024-03-28T14:20:00Z'
  }
];

const mockStaff = [
  { id: 'EMP001', name: 'Nguyễn Văn An', position: 'Đầu bếp trưởng' },
  { id: 'EMP002', name: 'Trần Thị Mai', position: 'Quản lý ca' },
  { id: 'EMP003', name: 'Lê Hoàng Nam', position: 'Thu ngân' },
  { id: 'EMP004', name: 'Phạm Minh Tuấn', position: 'Bồi bàn' },
  { id: 'EMP005', name: 'Vũ Thành Long', position: 'Bảo vệ' },
  { id: 'EMP006', name: 'Hoàng Thị Linh', position: 'Kế toán' }
];

const mockReviewers = [
  { id: 'MGR001', name: 'Trần Quản Lý' },
  { id: 'EMP002', name: 'Trần Thị Mai' },
  { id: 'EMP001', name: 'Nguyễn Văn An' }
];

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<StaffReview[]>(mockReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<StaffReview | null>(null);
  
  const [formData, setFormData] = useState<{
    staffId: string;
    reviewerId: string;
    reviewPeriodStart: string;
    reviewPeriodEnd: string;
    overallScore: number;
    qualityScore: number;
    productivityScore: number;
    teamworkScore: number;
    punctualityScore: number;
    communicationScore: number;
    strengths: string;
    areasForImprovement: string;
    goalsNextPeriod: string;
    reviewerComments: string;
    status: StaffReview['status'];
  }>({
    staffId: '',
    reviewerId: '',
    reviewPeriodStart: '',
    reviewPeriodEnd: '',
    overallScore: 5.0,
    qualityScore: 5.0,
    productivityScore: 5.0,
    teamworkScore: 5.0,
    punctualityScore: 5.0,
    communicationScore: 5.0,
    strengths: '',
    areasForImprovement: '',
    goalsNextPeriod: '',
    reviewerComments: '',
    status: 'draft'
  });

  const filteredReviews = reviews.filter(review => {
    const matchesSearch = review.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.staffPosition.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         review.reviewerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus;
    const matchesPeriod = selectedPeriod === 'all' || 
                         (selectedPeriod === 'q1' && review.reviewPeriodEnd.includes('03-31')) ||
                         (selectedPeriod === 'q2' && review.reviewPeriodEnd.includes('06-30')) ||
                         (selectedPeriod === 'q3' && review.reviewPeriodEnd.includes('09-30')) ||
                         (selectedPeriod === 'q4' && review.reviewPeriodEnd.includes('12-31'));
    return matchesSearch && matchesStatus && matchesPeriod;
  });

  const getReviewStats = () => {
    const totalReviews = reviews.length;
    const completedReviews = reviews.filter(r => r.status === 'completed' || r.status === 'approved').length;
    const avgOverallScore = reviews.length > 0 
      ? reviews.reduce((sum, r) => sum + r.overallScore, 0) / reviews.length 
      : 0;
    const highPerformers = reviews.filter(r => r.overallScore >= 9.0).length;
    const needsImprovement = reviews.filter(r => r.overallScore < 7.0).length;
    
    return { totalReviews, completedReviews, avgOverallScore, highPerformers, needsImprovement };
  };

  const getStatusBadge = (status: StaffReview['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline"><Edit className="w-3 h-3 mr-1" />Nháp</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Hoàn thành</Badge>;
      case 'approved':
        return <Badge className="bg-green-100 text-green-800"><Award className="w-3 h-3 mr-1" />Đã duyệt</Badge>;
      case 'disputed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Tranh chấp</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return 'text-green-600';
    if (score >= 8) return 'text-blue-600';
    if (score >= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 9) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 7) return <Target className="w-4 h-4 text-blue-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  const calculateAverageScores = (review: StaffReview) => {
    const scores = [
      review.qualityScore,
      review.productivityScore,
      review.teamworkScore,
      review.punctualityScore,
      review.communicationScore
    ];
    return scores.reduce((sum, score) => sum + score, 0) / scores.length;
  };

  const handleCreate = () => {
    const staff = mockStaff.find(s => s.id === formData.staffId);
    const reviewer = mockReviewers.find(r => r.id === formData.reviewerId);
    
    if (!staff || !reviewer) {
      toast.error('Vui lòng chọn nhân viên và người đánh giá!');
      return;
    }

    const avgScore = calculateAverageScores({
      ...formData,
      qualityScore: formData.qualityScore,
      productivityScore: formData.productivityScore,
      teamworkScore: formData.teamworkScore,
      punctualityScore: formData.punctualityScore,
      communicationScore: formData.communicationScore
    } as StaffReview);

    const newReview: StaffReview = {
      id: Date.now().toString(),
      staffId: formData.staffId,
      staffName: staff.name,
      staffPosition: staff.position,
      reviewerId: formData.reviewerId,
      reviewerName: reviewer.name,
      reviewPeriodStart: formData.reviewPeriodStart,
      reviewPeriodEnd: formData.reviewPeriodEnd,
      overallScore: avgScore,
      qualityScore: formData.qualityScore,
      productivityScore: formData.productivityScore,
      teamworkScore: formData.teamworkScore,
      punctualityScore: formData.punctualityScore,
      communicationScore: formData.communicationScore,
      strengths: formData.strengths,
      areasForImprovement: formData.areasForImprovement,
      goalsNextPeriod: formData.goalsNextPeriod,
      reviewerComments: formData.reviewerComments,
      status: formData.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setReviews([...reviews, newReview]);
    toast.success('Đánh giá đã được thêm thành công!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdate = () => {
    if (!editingReview) return;
    
    const staff = mockStaff.find(s => s.id === formData.staffId);
    const reviewer = mockReviewers.find(r => r.id === formData.reviewerId);
    
    if (!staff || !reviewer) {
      toast.error('Vui lòng chọn nhân viên và người đánh giá!');
      return;
    }

    const avgScore = calculateAverageScores({
      ...formData,
      qualityScore: formData.qualityScore,
      productivityScore: formData.productivityScore,
      teamworkScore: formData.teamworkScore,
      punctualityScore: formData.punctualityScore,
      communicationScore: formData.communicationScore
    } as StaffReview);
    
    setReviews(reviews.map(review => 
      review.id === editingReview.id 
        ? { 
            ...review, 
            staffId: formData.staffId,
            staffName: staff.name,
            staffPosition: staff.position,
            reviewerId: formData.reviewerId,
            reviewerName: reviewer.name,
            reviewPeriodStart: formData.reviewPeriodStart,
            reviewPeriodEnd: formData.reviewPeriodEnd,
            overallScore: avgScore,
            qualityScore: formData.qualityScore,
            productivityScore: formData.productivityScore,
            teamworkScore: formData.teamworkScore,
            punctualityScore: formData.punctualityScore,
            communicationScore: formData.communicationScore,
            strengths: formData.strengths,
            areasForImprovement: formData.areasForImprovement,
            goalsNextPeriod: formData.goalsNextPeriod,
            reviewerComments: formData.reviewerComments,
            status: formData.status,
            updatedAt: new Date().toISOString() 
          }
        : review
    ));
    toast.success('Đánh giá đã được cập nhật!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setReviews(reviews.filter(review => review.id !== id));
    toast.success('Đánh giá đã được xóa!');
  };

  const handleUpdateStatus = (id: string, status: StaffReview['status']) => {
    setReviews(reviews.map(review => 
      review.id === id 
        ? { ...review, status, updatedAt: new Date().toISOString() }
        : review
    ));
    toast.success(`Trạng thái đã được cập nhật!`);
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      reviewerId: '',
      reviewPeriodStart: '',
      reviewPeriodEnd: '',
      overallScore: 5.0,
      qualityScore: 5.0,
      productivityScore: 5.0,
      teamworkScore: 5.0,
      punctualityScore: 5.0,
      communicationScore: 5.0,
      strengths: '',
      areasForImprovement: '',
      goalsNextPeriod: '',
      reviewerComments: '',
      status: 'draft'
    });
    setEditingReview(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (review: StaffReview) => {
    setEditingReview(review);
    setFormData({
      staffId: review.staffId,
      reviewerId: review.reviewerId,
      reviewPeriodStart: review.reviewPeriodStart,
      reviewPeriodEnd: review.reviewPeriodEnd,
      overallScore: review.overallScore,
      qualityScore: review.qualityScore,
      productivityScore: review.productivityScore,
      teamworkScore: review.teamworkScore,
      punctualityScore: review.punctualityScore,
      communicationScore: review.communicationScore,
      strengths: review.strengths,
      areasForImprovement: review.areasForImprovement,
      goalsNextPeriod: review.goalsNextPeriod,
      reviewerComments: review.reviewerComments,
      status: review.status
    });
    setIsDialogOpen(true);
  };

  const stats = getReviewStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Đánh giá hiệu suất</h1>
          <p className="text-muted-foreground">
            Quản lý và theo dõi hiệu suất làm việc của nhân viên
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm đánh giá
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[825px]">
            <DialogHeader>
              <DialogTitle>
                {editingReview ? 'Chỉnh sửa đánh giá' : 'Tạo đánh giá hiệu suất mới'}
              </DialogTitle>
              <DialogDescription>
                {editingReview 
                  ? 'Cập nhật thông tin đánh giá hiệu suất'
                  : 'Tạo đánh giá hiệu suất cho nhân viên'
                }
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="staffId" className="text-right">
                    Nhân viên
                  </Label>
                  <Select value={formData.staffId} onValueChange={(value) => setFormData({...formData, staffId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStaff.map(staff => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} - {staff.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reviewerId" className="text-right">
                    Người đánh giá
                  </Label>
                  <Select value={formData.reviewerId} onValueChange={(value) => setFormData({...formData, reviewerId: value})}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn người đánh giá" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockReviewers.map(reviewer => (
                        <SelectItem key={reviewer.id} value={reviewer.id}>
                          {reviewer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reviewPeriodStart" className="text-right">
                    Từ ngày
                  </Label>
                  <Input
                      id="reviewPeriodStart"
                    type="date"
                      value={formData.reviewPeriodStart}
                      onChange={(e) => setFormData({...formData, reviewPeriodStart: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="reviewPeriodEnd" className="text-right">
                    Đến ngày
                  </Label>
                  <Input
                      id="reviewPeriodEnd"
                    type="date"
                      value={formData.reviewPeriodEnd}
                      onChange={(e) => setFormData({...formData, reviewPeriodEnd: e.target.value})}
                    className="col-span-3"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-4">Điểm đánh giá (1-10)</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="qualityScore" className="text-right">
                        Chất lượng công việc
                      </Label>
                      <Input
                        id="qualityScore"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.qualityScore}
                        onChange={(e) => setFormData({...formData, qualityScore: parseFloat(e.target.value)})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="productivityScore" className="text-right">
                        Năng suất
                      </Label>
                      <Input
                        id="productivityScore"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.productivityScore}
                        onChange={(e) => setFormData({...formData, productivityScore: parseFloat(e.target.value)})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="teamworkScore" className="text-right">
                        Làm việc nhóm
                      </Label>
                      <Input
                        id="teamworkScore"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.teamworkScore}
                        onChange={(e) => setFormData({...formData, teamworkScore: parseFloat(e.target.value)})}
                        className="col-span-3"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="punctualityScore" className="text-right">
                        Tính đúng giờ
                      </Label>
                      <Input
                        id="punctualityScore"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.punctualityScore}
                        onChange={(e) => setFormData({...formData, punctualityScore: parseFloat(e.target.value)})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="communicationScore" className="text-right">
                        Giao tiếp
                      </Label>
                      <Input
                        id="communicationScore"
                        type="number"
                        min="1"
                        max="10"
                        step="0.1"
                        value={formData.communicationScore}
                        onChange={(e) => setFormData({...formData, communicationScore: parseFloat(e.target.value)})}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="status" className="text-right">
                        Trạng thái
                      </Label>
                      <Select value={formData.status} onValueChange={(value: StaffReview['status']) => setFormData({...formData, status: value})}>
                        <SelectTrigger className="col-span-3">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Nháp</SelectItem>
                          <SelectItem value="completed">Hoàn thành</SelectItem>
                          <SelectItem value="approved">Đã duyệt</SelectItem>
                          <SelectItem value="disputed">Tranh chấp</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="strengths" className="text-right">
                    Điểm mạnh
                  </Label>
                  <Textarea
                    id="strengths"
                    value={formData.strengths}
                    onChange={(e) => setFormData({...formData, strengths: e.target.value})}
                    className="col-span-3"
                    rows={3}
                    placeholder="Mô tả những điểm mạnh của nhân viên..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="areasForImprovement" className="text-right">
                    Cần cải thiện
                  </Label>
                  <Textarea
                    id="areasForImprovement"
                    value={formData.areasForImprovement}
                    onChange={(e) => setFormData({...formData, areasForImprovement: e.target.value})}
                    className="col-span-3"
                    rows={3}
                    placeholder="Mô tả những điểm cần cải thiện..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="goalsNextPeriod" className="text-right">
                    Mục tiêu kỳ tới
                  </Label>
                  <Textarea
                    id="goalsNextPeriod"
                    value={formData.goalsNextPeriod}
                    onChange={(e) => setFormData({...formData, goalsNextPeriod: e.target.value})}
                    className="col-span-3"
                    rows={3}
                    placeholder="Đặt mục tiêu cho kỳ đánh giá tiếp theo..."
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="reviewerComments" className="text-right">
                    Nhận xét của người đánh giá
                  </Label>
                  <Textarea
                    id="reviewerComments"
                    value={formData.reviewerComments}
                    onChange={(e) => setFormData({...formData, reviewerComments: e.target.value})}
                    className="col-span-3"
                    rows={3}
                    placeholder="Nhận xét tổng quan về nhân viên..."
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={editingReview ? handleUpdate : handleCreate}>
                {editingReview ? 'Cập nhật' : 'Tạo đánh giá'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng đánh giá
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedReviews} đã hoàn thành
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Điểm TB
            </CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(stats.avgOverallScore)}`}>
              {stats.avgOverallScore.toFixed(1)}/10
            </div>
            <p className="text-xs text-muted-foreground">
              Điểm trung bình tổng thể
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Xuất sắc
            </CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.highPerformers}</div>
            <p className="text-xs text-muted-foreground">
              Điểm ≥ 9.0
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cần cải thiện
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.needsImprovement}</div>
            <p className="text-xs text-muted-foreground">
              Điểm &lt; 7.0
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tỷ lệ hoàn thành
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalReviews > 0 ? ((stats.completedReviews / stats.totalReviews) * 100).toFixed(1) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Đánh giá đã hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Danh sách đánh giá hiệu suất
          </CardTitle>
          <CardDescription>
            Quản lý và theo dõi kết quả đánh giá hiệu suất của nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên hoặc người đánh giá..."
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
                <SelectItem value="draft">Nháp</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="approved">Đã duyệt</SelectItem>
                <SelectItem value="disputed">Tranh chấp</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo kỳ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả kỳ đánh giá</SelectItem>
                <SelectItem value="q1">Quý 1</SelectItem>
                <SelectItem value="q2">Quý 2</SelectItem>
                <SelectItem value="q3">Quý 3</SelectItem>
                <SelectItem value="q4">Quý 4</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Xuất báo cáo
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nhân viên</TableHead>
                <TableHead>Kỳ đánh giá</TableHead>
                <TableHead>Điểm tổng</TableHead>
                <TableHead>Chi tiết điểm</TableHead>
                <TableHead>Người đánh giá</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Cập nhật</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {review.staffName.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{review.staffName}</div>
                        <div className="text-sm text-muted-foreground">{review.staffPosition}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {formatDate(review.reviewPeriodStart)} - {formatDate(review.reviewPeriodEnd)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getScoreIcon(review.overallScore)}
                      <span className={`font-bold text-lg ${getScoreColor(review.overallScore)}`}>
                        {review.overallScore.toFixed(1)}
                      </span>
                      <span className="text-muted-foreground">/10</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16">Chất lượng:</span>
                        <Progress value={review.qualityScore * 10} className="w-16 h-2" />
                        <span className="font-medium">{review.qualityScore.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16">Năng suất:</span>
                        <Progress value={review.productivityScore * 10} className="w-16 h-2" />
                        <span className="font-medium">{review.productivityScore.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16">Nhóm:</span>
                        <Progress value={review.teamworkScore * 10} className="w-16 h-2" />
                        <span className="font-medium">{review.teamworkScore.toFixed(1)}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{review.reviewerName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(review.status)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(review.updatedAt)}
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
                        <DropdownMenuItem onClick={() => openEditDialog(review)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          In báo cáo
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Gửi phản hồi
                        </DropdownMenuItem>
                        {review.status === 'completed' && (
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(review.id, 'approved')}
                            className="text-green-600"
                          >
                            <ThumbsUp className="mr-2 h-4 w-4" />
                            Duyệt đánh giá
                          </DropdownMenuItem>
                        )}
                        {review.status === 'completed' && (
                          <DropdownMenuItem 
                            onClick={() => handleUpdateStatus(review.id, 'disputed')}
                            className="text-red-600"
                          >
                            <ThumbsDown className="mr-2 h-4 w-4" />
                            Tranh chấp
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(review.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}

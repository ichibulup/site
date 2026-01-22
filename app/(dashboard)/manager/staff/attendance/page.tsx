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
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Clock,
  Calendar,
  UserCheck,
  UserX,
  CheckCircle,
  XCircle,
  AlertCircle,
  Timer,
  Coffee,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Smartphone,
  Camera,
  FileText,
  Download,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { StaffAttendance } from '@/lib/interfaces';

type AttendanceStatus = 'present' | 'absent' | 'late' | 'earlyLeave' | 'halfDay';

type AttendanceRecord = StaffAttendance & {
  staffName: string;
  staffPosition: string;
  status: AttendanceStatus;
  locationCheckIn?: string;
  locationCheckOut?: string;
  breakStartTime?: string;
  breakEndTime?: string;
  totalHours: string;
  overtimeHours: string;
  approvedBy?: string;
};

// Mock data cho chấm công
const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    staffId: 'EMP001',
    restaurantId: 'REST001',
    staffName: 'Nguyễn Văn An',
    staffPosition: 'Đầu bếp trưởng',
    workDate: new Date('2024-01-26'),
    checkInTime: new Date('2024-01-26T05:45:00'),
    checkOutTime: new Date('2024-01-26T14:30:00'),
    breakStartTime: '12:00',
    breakEndTime: '13:00',
    breakMinutes: 60,
    totalHours: '7.75',
    overtimeHours: '0.75',
    status: 'present',
    locationCheckIn: 'Nhà hàng chính',
    locationCheckOut: 'Nhà hàng chính',
    notes: 'Đến sớm để chuẩn bị menu đặc biệt',
    approvedBy: 'Quản lý',
    createdAt: new Date('2024-01-26T05:45:00Z'),
    updatedAt: new Date('2024-01-26T14:30:00Z')
  },
  {
    id: '2',
    staffId: 'EMP002',
    restaurantId: 'REST001',
    staffName: 'Trần Thị Mai',
    staffPosition: 'Quản lý ca',
    workDate: new Date('2024-01-26'),
    checkInTime: new Date('2024-01-26T13:55:00'),
    checkOutTime: new Date('2024-01-26T22:15:00'),
    breakStartTime: '18:30',
    breakEndTime: '19:15',
    breakMinutes: 45,
    totalHours: '7.50',
    overtimeHours: '0.25',
    status: 'late',
    locationCheckIn: 'Nhà hàng chính',
    locationCheckOut: 'Nhà hàng chính',
    notes: 'Muộn 5 phút do kẹt xe',
    createdAt: new Date('2024-01-26T13:55:00Z'),
    updatedAt: new Date('2024-01-26T22:15:00Z')
  },
  {
    id: '3',
    staffId: 'EMP003',
    restaurantId: 'REST001',
    staffName: 'Lê Hoàng Nam',
    staffPosition: 'Thu ngân',
    workDate: new Date('2024-01-26'),
    checkInTime: new Date('2024-01-26T08:00:00'),
    checkOutTime: new Date('2024-01-26T17:30:00'),
    breakStartTime: '12:30',
    breakEndTime: '14:00',
    breakMinutes: 90,
    totalHours: '8.00',
    overtimeHours: '0.00',
    status: 'earlyLeave',
    locationCheckIn: 'Nhà hàng chính',
    locationCheckOut: 'Nhà hàng chính',
    notes: 'Nghỉ sớm 30 phút do việc gia đình',
    approvedBy: 'Quản lý ca',
    createdAt: new Date('2024-01-26T08:00:00Z'),
    updatedAt: new Date('2024-01-26T17:30:00Z')
  },
  {
    id: '4',
    staffId: 'EMP004',
    restaurantId: 'REST001',
    staffName: 'Phạm Minh Tuấn',
    staffPosition: 'Bồi bàn',
    workDate: new Date('2024-01-26'),
    totalHours: '0.00',
    overtimeHours: '0.00',
    status: 'absent',
    notes: 'Nghỉ ốm có giấy bác sĩ',
    approvedBy: 'Quản lý',
    createdAt: new Date('2024-01-26T08:00:00Z'),
    updatedAt: new Date('2024-01-26T08:00:00Z')
  },
  {
    id: '5',
    staffId: 'EMP005',
    restaurantId: 'REST001',
    staffName: 'Vũ Thành Long',
    staffPosition: 'Bảo vệ',
    workDate: new Date('2024-01-26'),
    checkInTime: new Date('2024-01-26T22:00:00'),
    checkOutTime: new Date('2024-01-27T06:00:00'),
    breakStartTime: '02:00',
    breakEndTime: '03:00',
    breakMinutes: 60,
    totalHours: '7.00',
    overtimeHours: '0.00',
    status: 'present',
    locationCheckIn: 'Nhà hàng chính',
    locationCheckOut: 'Nhà hàng chính',
    notes: 'Ca đêm bình thường',
    createdAt: new Date('2024-01-26T22:00:00Z'),
    updatedAt: new Date('2024-01-27T06:00:00Z')
  },
  {
    id: '6',
    staffId: 'EMP006',
    restaurantId: 'REST001',
    staffName: 'Hoàng Thị Linh',
    staffPosition: 'Kế toán',
    workDate: new Date('2024-01-26'),
    checkInTime: new Date('2024-01-26T09:00:00'),
    checkOutTime: new Date('2024-01-26T13:00:00'),
    totalHours: '4.00',
    overtimeHours: '0.00',
    status: 'halfDay',
    locationCheckIn: 'Nhà hàng chính',
    locationCheckOut: 'Nhà hàng chính',
    notes: 'Chỉ làm nửa ngày theo yêu cầu',
    approvedBy: 'Quản lý',
    createdAt: new Date('2024-01-26T09:00:00Z'),
    updatedAt: new Date('2024-01-26T13:00:00Z')
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

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(mockAttendance);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAttendance, setEditingAttendance] = useState<AttendanceRecord | null>(null);
  
  const [formData, setFormData] = useState<{
    staffId: string;
    workDate: string;
    checkInTime: string;
    checkOutTime: string;
    breakStartTime: string;
    breakEndTime: string;
    status: AttendanceStatus;
    locationCheckIn: string;
    locationCheckOut: string;
    notes: string;
  }>({
    staffId: '',
    workDate: '',
    checkInTime: '',
    checkOutTime: '',
    breakStartTime: '',
    breakEndTime: '',
    status: 'present',
    locationCheckIn: '',
    locationCheckOut: '',
    notes: ''
  });

  const filteredAttendance = attendance.filter(record => {
    const matchesSearch = record.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.staffPosition.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = record.workDate.toISOString().split('T')[0] === selectedDate;
    const matchesStatus = selectedStatus === 'all' || record.status === selectedStatus;
    return matchesSearch && matchesDate && matchesStatus;
  });

  const parseHours = (value?: string | null) => {
    if (!value) return 0;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const getAttendanceStats = () => {
    const todayRecords = attendance.filter(
      (r) => r.workDate.toISOString().split('T')[0] === selectedDate
    );
    const totalStaff = todayRecords.length;
    const presentCount = todayRecords.filter(r => ['present', 'late', 'earlyLeave', 'halfDay'].includes(r.status)).length;
    const absentCount = todayRecords.filter(r => r.status === 'absent').length;
    const lateCount = todayRecords.filter(r => r.status === 'late').length;
    const totalHours = todayRecords.reduce((sum, r) => sum + parseHours(r.totalHours), 0);
    const overtimeHours = todayRecords.reduce((sum, r) => sum + parseHours(r.overtimeHours), 0);
    
    return { totalStaff, presentCount, absentCount, lateCount, totalHours, overtimeHours };
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Có mặt</Badge>;
      case 'absent':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Vắng mặt</Badge>;
      case 'late':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Muộn</Badge>;
      case 'earlyLeave':
        return <Badge variant="outline" className="bg-orange-100 text-orange-800"><Clock className="w-3 h-3 mr-1" />Về sớm</Badge>;
      case 'halfDay':
        return <Badge variant="secondary"><Timer className="w-3 h-3 mr-1" />Nửa ngày</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const formatTime = (time?: string | Date | null) => {
    if (!time) return '-';
    if (typeof time === 'string') return time.substring(0, 5);
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTimeInputValue = (time?: Date | null) => {
    if (!time) return '';
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const calculateTotalHours = (checkIn?: string, checkOut?: string, breakStart?: string, breakEnd?: string) => {
    if (!checkIn || !checkOut) return 0;
    
    const start = new Date(`2024-01-01T${checkIn}`);
    const end = new Date(`2024-01-01T${checkOut}`);
    if (end < start) end.setDate(end.getDate() + 1); // Handle overnight shifts
    
    let totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    
    // Subtract break time
    if (breakStart && breakEnd) {
      const breakStartTime = new Date(`2024-01-01T${breakStart}`);
      const breakEndTime = new Date(`2024-01-01T${breakEnd}`);
      const breakMinutes = (breakEndTime.getTime() - breakStartTime.getTime()) / (1000 * 60);
      totalMinutes -= breakMinutes;
    }
    
    return totalMinutes / 60;
  };

  const calculateBreakMinutes = (breakStart?: string, breakEnd?: string) => {
    if (!breakStart || !breakEnd) return null;
    const start = new Date(`2024-01-01T${breakStart}`);
    const end = new Date(`2024-01-01T${breakEnd}`);
    if (end < start) end.setDate(end.getDate() + 1);
    return (end.getTime() - start.getTime()) / (1000 * 60);
  };

  const buildDateTime = (date: string, time?: string) => {
    if (!time) return null;
    return new Date(`${date}T${time}`);
  };

  const handleCreate = () => {
    const staff = mockStaff.find(s => s.id === formData.staffId);
    
    if (!staff) {
      toast.error('Vui lòng chọn nhân viên!');
      return;
    }

    const totalHours = calculateTotalHours(
      formData.checkInTime,
      formData.checkOutTime,
      formData.breakStartTime,
      formData.breakEndTime
    );
    const overtimeHours = Math.max(0, totalHours - 8);
    const breakMinutes = calculateBreakMinutes(formData.breakStartTime, formData.breakEndTime);
    const checkInTime = buildDateTime(formData.workDate, formData.checkInTime);
    let checkOutTime = buildDateTime(formData.workDate, formData.checkOutTime);
    if (checkInTime && checkOutTime && checkOutTime < checkInTime) {
      checkOutTime = new Date(checkOutTime.getTime() + 24 * 60 * 60 * 1000);
    }

    const newAttendance: AttendanceRecord = {
      id: Date.now().toString(),
      staffId: formData.staffId,
      restaurantId: 'REST001',
      staffName: staff.name,
      staffPosition: staff.position,
      workDate: new Date(formData.workDate),
      checkInTime,
      checkOutTime,
      breakMinutes,
      totalHours: totalHours.toFixed(2),
      overtimeHours: overtimeHours.toFixed(2),
      status: formData.status,
      locationCheckIn: formData.locationCheckIn,
      locationCheckOut: formData.locationCheckOut,
      notes: formData.notes,
      breakStartTime: formData.breakStartTime,
      breakEndTime: formData.breakEndTime,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setAttendance([...attendance, newAttendance]);
    toast.success('Bản ghi chấm công đã được thêm!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdate = () => {
    if (!editingAttendance) return;
    
    const staff = mockStaff.find(s => s.id === formData.staffId);
    
    if (!staff) {
      toast.error('Vui lòng chọn nhân viên!');
      return;
    }

    const totalHours = calculateTotalHours(
      formData.checkInTime,
      formData.checkOutTime,
      formData.breakStartTime,
      formData.breakEndTime
    );
    const overtimeHours = Math.max(0, totalHours - 8);
    const breakMinutes = calculateBreakMinutes(formData.breakStartTime, formData.breakEndTime);
    const checkInTime = buildDateTime(formData.workDate, formData.checkInTime);
    let checkOutTime = buildDateTime(formData.workDate, formData.checkOutTime);
    if (checkInTime && checkOutTime && checkOutTime < checkInTime) {
      checkOutTime = new Date(checkOutTime.getTime() + 24 * 60 * 60 * 1000);
    }
    
    setAttendance(attendance.map(record => 
      record.id === editingAttendance.id 
        ? { 
            ...record, 
            staffId: formData.staffId,
            staffName: staff.name,
            staffPosition: staff.position,
            workDate: new Date(formData.workDate),
            checkInTime,
            checkOutTime,
            breakMinutes,
            totalHours: totalHours.toFixed(2),
            overtimeHours: overtimeHours.toFixed(2),
            status: formData.status,
            locationCheckIn: formData.locationCheckIn,
            locationCheckOut: formData.locationCheckOut,
            notes: formData.notes,
            breakStartTime: formData.breakStartTime,
            breakEndTime: formData.breakEndTime,
            updatedAt: new Date() 
          }
        : record
    ));
    toast.success('Bản ghi chấm công đã được cập nhật!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAttendance(attendance.filter(record => record.id !== id));
    toast.success('Bản ghi chấm công đã được xóa!');
  };

  const handleQuickCheckIn = (staffId: string) => {
    const staff = mockStaff.find(s => s.id === staffId);
    if (!staff) return;

    const now = new Date();
    const timeString = now.toTimeString().substring(0, 5);
    
    const newAttendance: AttendanceRecord = {
      id: Date.now().toString(),
      staffId,
      restaurantId: 'REST001',
      staffName: staff.name,
      staffPosition: staff.position,
      workDate: new Date(selectedDate),
      checkInTime: new Date(`${selectedDate}T${timeString}`),
      totalHours: '0.00',
      overtimeHours: '0.00',
      status: 'present',
      locationCheckIn: 'Nhà hàng chính',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    setAttendance([...attendance, newAttendance]);
    toast.success(`${staff.name} đã check-in thành công!`);
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  const resetForm = () => {
    setFormData({
      staffId: '',
      workDate: '',
      checkInTime: '',
      checkOutTime: '',
      breakStartTime: '',
      breakEndTime: '',
      status: 'present',
      locationCheckIn: '',
      locationCheckOut: '',
      notes: ''
    });
    setEditingAttendance(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setFormData(prev => ({ ...prev, workDate: selectedDate }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (record: AttendanceRecord) => {
    setEditingAttendance(record);
    setFormData({
      staffId: record.staffId,
      workDate: record.workDate.toISOString().split('T')[0],
      checkInTime: formatTimeInputValue(record.checkInTime),
      checkOutTime: formatTimeInputValue(record.checkOutTime),
      breakStartTime: record.breakStartTime || '',
      breakEndTime: record.breakEndTime || '',
      status: record.status,
      locationCheckIn: record.locationCheckIn || '',
      locationCheckOut: record.locationCheckOut || '',
      notes: record.notes || ''
    });
    setIsDialogOpen(true);
  };

  const stats = getAttendanceStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chấm công</h1>
          <p className="text-muted-foreground">
            Theo dõi và quản lý thời gian làm việc của nhân viên
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Camera className="mr-2 h-4 w-4" />
            Check-in nhanh
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreateDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Thêm chấm công
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>
                  {editingAttendance ? 'Chỉnh sửa chấm công' : 'Thêm bản ghi chấm công'}
                </DialogTitle>
                <DialogDescription>
                  {editingAttendance 
                    ? 'Cập nhật thông tin chấm công'
                    : 'Tạo bản ghi chấm công mới cho nhân viên'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
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
                    <Label htmlFor="workDate" className="text-right">
                      Ngày
                    </Label>
                    <Input
                      id="workDate"
                      type="date"
                      value={formData.workDate}
                      onChange={(e) => setFormData({...formData, workDate: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="checkInTime" className="text-right">
                      Giờ vào
                    </Label>
                    <Input
                      id="checkInTime"
                      type="time"
                      value={formData.checkInTime}
                      onChange={(e) => setFormData({...formData, checkInTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="checkOutTime" className="text-right">
                      Giờ ra
                    </Label>
                    <Input
                      id="checkOutTime"
                      type="time"
                      value={formData.checkOutTime}
                      onChange={(e) => setFormData({...formData, checkOutTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="breakStartTime" className="text-right">
                      Bắt đầu nghỉ
                    </Label>
                    <Input
                      id="breakStartTime"
                      type="time"
                      value={formData.breakStartTime}
                      onChange={(e) => setFormData({...formData, breakStartTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="breakEndTime" className="text-right">
                      Kết thúc nghỉ
                    </Label>
                    <Input
                      id="breakEndTime"
                      type="time"
                      value={formData.breakEndTime}
                      onChange={(e) => setFormData({...formData, breakEndTime: e.target.value})}
                      className="col-span-3"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="status" className="text-right">
                      Trạng thái
                    </Label>
                    <Select value={formData.status} onValueChange={(value: AttendanceStatus) => setFormData({...formData, status: value})}>
                      <SelectTrigger className="col-span-3">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="present">Có mặt</SelectItem>
                        <SelectItem value="absent">Vắng mặt</SelectItem>
                        <SelectItem value="late">Muộn</SelectItem>
                        <SelectItem value="earlyLeave">Về sớm</SelectItem>
                        <SelectItem value="halfDay">Nửa ngày</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="locationCheckIn" className="text-right">
                      Vị trí check-in
                    </Label>
                    <Input
                      id="locationCheckIn"
                      value={formData.locationCheckIn}
                      onChange={(e) => setFormData({...formData, locationCheckIn: e.target.value})}
                      className="col-span-3"
                      placeholder="VD: Nhà hàng chính"
                    />
                  </div>
                </div>

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
                    placeholder="Ghi chú về chấm công..."
                  />
                </div>

                {formData.checkInTime && formData.checkOutTime && (
                  <div className="border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                      <strong>Tổng giờ làm:</strong> {calculateTotalHours(
                        formData.checkInTime,
                        formData.checkOutTime,
                        formData.breakStartTime,
                        formData.breakEndTime
                      ).toFixed(1)} giờ
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={editingAttendance ? handleUpdate : handleCreate}>
                  {editingAttendance ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng nhân viên
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">
              Hôm nay ({new Date(selectedDate).toLocaleDateString('vi-VN')})
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Có mặt
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.presentCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalStaff > 0 ? ((stats.presentCount / stats.totalStaff) * 100).toFixed(1) : 0}% tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Vắng mặt / Muộn
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absentCount + stats.lateCount}</div>
            <p className="text-xs text-muted-foreground">
              {stats.absentCount} vắng, {stats.lateCount} muộn
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tổng giờ làm
            </CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.overtimeHours.toFixed(1)}h tăng ca
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Bảng chấm công
          </CardTitle>
          <CardDescription>
            Theo dõi thời gian làm việc và chấm công của nhân viên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-40"
              />
              <Button variant="outline" size="sm" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm nhân viên..."
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
                <SelectItem value="present">Có mặt</SelectItem>
                <SelectItem value="absent">Vắng mặt</SelectItem>
                <SelectItem value="late">Muộn</SelectItem>
                <SelectItem value="earlyLeave">Về sớm</SelectItem>
                <SelectItem value="halfDay">Nửa ngày</SelectItem>
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
                <TableHead>Nhân viên</TableHead>
                <TableHead>Check-in</TableHead>
                <TableHead>Check-out</TableHead>
                <TableHead>Nghỉ giữa ca</TableHead>
                <TableHead>Tổng giờ</TableHead>
                <TableHead>Tăng ca</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Vị trí</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAttendance.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {record.staffName.split(' ').map(n => n.charAt(0)).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{record.staffName}</div>
                        <div className="text-sm text-muted-foreground">{record.staffPosition}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-green-600" />
                      <span className="font-medium">{formatTime(record.checkInTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-red-600" />
                      <span className="font-medium">{formatTime(record.checkOutTime)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {record.breakStartTime && record.breakEndTime ? (
                      <div className="flex items-center gap-1">
                        <Coffee className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm">
                          {record.breakStartTime} - {record.breakEndTime}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Timer className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{parseHours(record.totalHours).toFixed(1)}h</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {parseHours(record.overtimeHours) > 0 ? (
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-orange-600" />
                        <span className="font-medium text-orange-600">
                          +{parseHours(record.overtimeHours).toFixed(1)}h
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(record.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">
                        {record.locationCheckIn || '-'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-muted-foreground max-w-32 truncate">
                      {record.notes || '-'}
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
                        <DropdownMenuItem onClick={() => openEditDialog(record)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Chỉnh sửa
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Báo cáo giờ làm
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Smartphone className="mr-2 h-4 w-4" />
                          Gửi thông báo
                        </DropdownMenuItem>
                        {!record.checkInTime && (
                          <DropdownMenuItem 
                            onClick={() => handleQuickCheckIn(record.staffId)}
                            className="text-green-600"
                          >
                            <UserCheck className="mr-2 h-4 w-4" />
                            Check-in nhanh
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(record.id)}
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

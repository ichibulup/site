'use client';

import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Timer,
  UserCheck,
  AlertCircle,
  CheckCircle,
  Coffee,
  Moon,
  Sun,
  Sunset,
  Copy,
  RotateCcw,
  FileText,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { StaffSchedule, StaffScheduleStatus, StaffShiftType } from '@/lib/interfaces';

type ScheduleRecord = StaffSchedule & {
  staffName: string;
  staffPosition: string;
  breakMinutes: number;
};

const mockSchedules: ScheduleRecord[] = [
  {
    id: '1',
    staffId: 'EMP001',
    restaurantId: 'REST001',
    staffName: 'Nguyễn Văn An',
    staffPosition: 'Đầu bếp trưởng',
    shiftDate: new Date('2024-01-26'),
    shiftType: StaffShiftType.morning,
    startTime: new Date('2024-01-26T06:00:00'),
    endTime: new Date('2024-01-26T14:00:00'),
    breakMinutes: 60,
    status: StaffScheduleStatus.confirmed,
    notes: 'Ca sáng chính, phụ trách menu đặc biệt',
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-25T08:00:00Z')
  },
  {
    id: '2',
    staffId: 'EMP002',
    restaurantId: 'REST001',
    staffName: 'Trần Thị Mai',
    staffPosition: 'Quản lý ca',
    shiftDate: new Date('2024-01-26'),
    shiftType: StaffShiftType.afternoon,
    startTime: new Date('2024-01-26T14:00:00'),
    endTime: new Date('2024-01-26T22:00:00'),
    breakMinutes: 45,
    status: StaffScheduleStatus.scheduled,
    notes: 'Quản lý ca chiều, kiểm tra chất lượng phục vụ',
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z')
  },
  {
    id: '3',
    staffId: 'EMP003',
    restaurantId: 'REST001',
    staffName: 'Lê Hoàng Nam',
    staffPosition: 'Thu ngân',
    shiftDate: new Date('2024-01-26'),
    shiftType: StaffShiftType.fullDay,
    startTime: new Date('2024-01-26T08:00:00'),
    endTime: new Date('2024-01-26T20:00:00'),
    breakMinutes: 90,
    status: StaffScheduleStatus.scheduled,
    notes: 'Ca cả ngày, hỗ trợ giờ cao điểm',
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-24T15:00:00Z')
  },
  {
    id: '4',
    staffId: 'EMP004',
    restaurantId: 'REST001',
    staffName: 'Phạm Minh Tuấn',
    staffPosition: 'Bồi bàn',
    shiftDate: new Date('2024-01-26'),
    shiftType: StaffShiftType.evening,
    startTime: new Date('2024-01-26T18:00:00'),
    endTime: new Date('2024-01-27T02:00:00'),
    breakMinutes: 30,
    status: StaffScheduleStatus.confirmed,
    notes: 'Ca tối cuối tuần, đông khách',
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-26T08:00:00Z')
  },
  {
    id: '5',
    staffId: 'EMP005',
    restaurantId: 'REST001',
    staffName: 'Vũ Thành Long',
    staffPosition: 'Bảo vệ',
    shiftDate: new Date('2024-01-26'),
    shiftType: StaffShiftType.night,
    startTime: new Date('2024-01-26T22:00:00'),
    endTime: new Date('2024-01-27T06:00:00'),
    breakMinutes: 60,
    status: StaffScheduleStatus.confirmed,
    notes: 'Ca đêm bảo vệ',
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z')
  },
  {
    id: '6',
    staffId: 'EMP001',
    restaurantId: 'REST001',
    staffName: 'Nguyễn Văn An',
    staffPosition: 'Đầu bếp trưởng',
    shiftDate: new Date('2024-01-27'),
    shiftType: StaffShiftType.morning,
    startTime: new Date('2024-01-27T06:00:00'),
    endTime: new Date('2024-01-27T14:00:00'),
    breakMinutes: 60,
    status: StaffScheduleStatus.scheduled,
    notes: 'Ca sáng cuối tuần',
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z')
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

const shiftTypes = [
  { value: StaffShiftType.morning, label: 'Ca sáng', icon: Sun, color: 'text-yellow-600' },
  { value: StaffShiftType.afternoon, label: 'Ca chiều', icon: Sunset, color: 'text-orange-600' },
  { value: StaffShiftType.evening, label: 'Ca tối', icon: Moon, color: 'text-blue-600' },
  { value: StaffShiftType.night, label: 'Ca đêm', icon: Moon, color: 'text-purple-600' },
  { value: StaffShiftType.fullDay, label: 'Ca ngày', icon: Sun, color: 'text-green-600' },
  { value: StaffShiftType.splitShift, label: 'Ca gãy', icon: Coffee, color: 'text-rose-600' }
];

const statusOptions = [
  { value: StaffScheduleStatus.scheduled, label: 'Đã lên lịch' },
  { value: StaffScheduleStatus.confirmed, label: 'Đã xác nhận' },
  { value: StaffScheduleStatus.inProgress, label: 'Đang làm' },
  { value: StaffScheduleStatus.completed, label: 'Hoàn thành' },
  { value: StaffScheduleStatus.late, label: 'Đi muộn' },
  { value: StaffScheduleStatus.absent, label: 'Vắng mặt' },
  { value: StaffScheduleStatus.cancelled, label: 'Đã hủy' }
];

export default function SchedulesPage() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>(mockSchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedShift, setSelectedShift] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleRecord | null>(null);

  const [formData, setFormData] = useState<{
    staffId: string;
    shiftDate: string;
    shiftType: StaffShiftType;
    startTime: string;
    endTime: string;
    breakMinutes: number;
    status: StaffScheduleStatus;
    notes: string;
  }>({
    staffId: '',
    shiftDate: '',
    shiftType: StaffShiftType.morning,
    startTime: '06:00',
    endTime: '14:00',
    breakMinutes: 60,
    status: StaffScheduleStatus.scheduled,
    notes: ''
  });

  const formatTime = (time: Date) => {
    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatTimeInputValue = (time?: Date | null) => {
    if (!time) return '';
    return formatTime(time);
  };

  const buildDateTime = (date: string, time: string) => new Date(`${date}T${time}`);

  const calculateWorkHours = (startTime: Date, endTime: Date, breakMinutes: number) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end < start) end.setDate(end.getDate() + 1);
    const totalMinutes = (end.getTime() - start.getTime()) / (1000 * 60) - breakMinutes;
    return Math.max(totalMinutes, 0) / 60;
  };

  const getShiftInfo = (shiftType: StaffShiftType) => {
    const shift = shiftTypes.find((item) => item.value === shiftType);
    return shift || shiftTypes[0];
  };

  const getStatusBadge = (status: StaffScheduleStatus) => {
    switch (status) {
      case StaffScheduleStatus.scheduled:
        return <Badge variant="outline">Đã lên lịch</Badge>;
      case StaffScheduleStatus.confirmed:
        return <Badge className="bg-blue-100 text-blue-800">Đã xác nhận</Badge>;
      case StaffScheduleStatus.inProgress:
        return <Badge className="bg-amber-100 text-amber-800">Đang làm</Badge>;
      case StaffScheduleStatus.completed:
        return <Badge className="bg-green-100 text-green-800">Hoàn thành</Badge>;
      case StaffScheduleStatus.late:
        return <Badge className="bg-orange-100 text-orange-800">Đi muộn</Badge>;
      case StaffScheduleStatus.absent:
        return <Badge variant="destructive">Vắng mặt</Badge>;
      case StaffScheduleStatus.cancelled:
        return <Badge variant="secondary">Đã hủy</Badge>;
      default:
        return <Badge variant="outline">Không xác định</Badge>;
    }
  };

  const filteredSchedules = useMemo(() => {
    return schedules.filter((schedule) => {
      const matchesSearch =
        schedule.staffName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.staffPosition.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDate = schedule.shiftDate.toISOString().split('T')[0] === selectedDate;
      const matchesShift = selectedShift === 'all' || schedule.shiftType === selectedShift;
      const matchesStatus = selectedStatus === 'all' || schedule.status === selectedStatus;
      return matchesSearch && matchesDate && matchesShift && matchesStatus;
    });
  }, [schedules, searchTerm, selectedDate, selectedShift, selectedStatus]);

  const stats = useMemo(() => {
    const todaySchedules = schedules.filter(
      (s) => s.shiftDate.toISOString().split('T')[0] === selectedDate
    );
    const totalScheduled = todaySchedules.length;
    const confirmed = todaySchedules.filter((s) => s.status === StaffScheduleStatus.confirmed).length;
    const completed = todaySchedules.filter((s) => s.status === StaffScheduleStatus.completed).length;
    const absent = todaySchedules.filter((s) => s.status === StaffScheduleStatus.absent).length;
    const totalHours = todaySchedules.reduce(
      (sum, s) => sum + calculateWorkHours(s.startTime, s.endTime, s.breakMinutes),
      0
    );

    return { totalScheduled, confirmed, completed, absent, totalHours };
  }, [schedules, selectedDate]);

  const resetForm = () => {
    setFormData({
      staffId: '',
      shiftDate: '',
      shiftType: StaffShiftType.morning,
      startTime: '06:00',
      endTime: '14:00',
      breakMinutes: 60,
      status: StaffScheduleStatus.scheduled,
      notes: ''
    });
    setEditingSchedule(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setFormData((prev) => ({ ...prev, shiftDate: selectedDate }));
    setIsDialogOpen(true);
  };

  const openEditDialog = (schedule: ScheduleRecord) => {
    setEditingSchedule(schedule);
    setFormData({
      staffId: schedule.staffId,
      shiftDate: schedule.shiftDate.toISOString().split('T')[0],
      shiftType: schedule.shiftType,
      startTime: formatTimeInputValue(schedule.startTime),
      endTime: formatTimeInputValue(schedule.endTime),
      breakMinutes: schedule.breakMinutes,
      status: schedule.status,
      notes: schedule.notes || ''
    });
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    const staff = mockStaff.find((s) => s.id === formData.staffId);
    if (!staff) {
      toast.error('Vui lòng chọn nhân viên!');
      return;
    }

    const shiftDate = new Date(formData.shiftDate);
    const startTime = buildDateTime(formData.shiftDate, formData.startTime);
    let endTime = buildDateTime(formData.shiftDate, formData.endTime);
    if (endTime < startTime) {
      endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    }

    const newSchedule: ScheduleRecord = {
      id: Date.now().toString(),
      staffId: formData.staffId,
      restaurantId: 'REST001',
      staffName: staff.name,
      staffPosition: staff.position,
      shiftDate,
      shiftType: formData.shiftType,
      startTime,
      endTime,
      breakMinutes: formData.breakMinutes,
      status: formData.status,
      notes: formData.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSchedules((prev) => [...prev, newSchedule]);
    toast.success('Lịch làm việc đã được thêm!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleUpdate = () => {
    if (!editingSchedule) return;
    const staff = mockStaff.find((s) => s.id === formData.staffId);
    if (!staff) {
      toast.error('Vui lòng chọn nhân viên!');
      return;
    }

    const shiftDate = new Date(formData.shiftDate);
    const startTime = buildDateTime(formData.shiftDate, formData.startTime);
    let endTime = buildDateTime(formData.shiftDate, formData.endTime);
    if (endTime < startTime) {
      endTime = new Date(endTime.getTime() + 24 * 60 * 60 * 1000);
    }

    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === editingSchedule.id
          ? {
              ...schedule,
              staffId: formData.staffId,
              staffName: staff.name,
              staffPosition: staff.position,
              shiftDate,
              shiftType: formData.shiftType,
              startTime,
              endTime,
              breakMinutes: formData.breakMinutes,
              status: formData.status,
              notes: formData.notes,
              updatedAt: new Date()
            }
          : schedule
      )
    );

    toast.success('Lịch làm việc đã được cập nhật!');
    resetForm();
    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== id));
    toast.success('Lịch làm việc đã được xóa!');
  };

  const handleUpdateStatus = (id: string, status: StaffScheduleStatus) => {
    setSchedules((prev) =>
      prev.map((schedule) =>
        schedule.id === id ? { ...schedule, status, updatedAt: new Date() } : schedule
      )
    );
    toast.success('Trạng thái đã được cập nhật!');
  };

  const handleDuplicate = (schedule: ScheduleRecord) => {
    const newDate = new Date(schedule.shiftDate);
    newDate.setDate(newDate.getDate() + 1);

    const duplicatedSchedule: ScheduleRecord = {
      ...schedule,
      id: Date.now().toString(),
      shiftDate: newDate,
      status: StaffScheduleStatus.scheduled,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setSchedules((prev) => [...prev, duplicatedSchedule]);
    toast.success('Lịch làm việc đã được sao chép!');
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(currentDate.toISOString().split('T')[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lịch làm việc</h1>
          <p className="text-muted-foreground">
            Quản lý lịch trình làm việc và phân ca cho nhân viên
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm lịch làm việc
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[625px]">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? 'Chỉnh sửa lịch làm việc' : 'Thêm lịch làm việc mới'}
              </DialogTitle>
              <DialogDescription>
                {editingSchedule
                  ? 'Cập nhật thông tin ca làm việc'
                  : 'Tạo ca làm việc mới cho nhân viên'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="staffId" className="text-right">
                    Nhân viên
                  </Label>
                  <Select value={formData.staffId} onValueChange={(value) => setFormData({ ...formData, staffId: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Chọn nhân viên" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockStaff.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name} - {staff.position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="shiftDate" className="text-right">
                    Ngày làm việc
                  </Label>
                  <Input
                    id="shiftDate"
                    type="date"
                    value={formData.shiftDate}
                    onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="shiftType" className="text-right">
                  Loại ca
                </Label>
                <Select
                  value={formData.shiftType}
                  onValueChange={(value: StaffShiftType) => setFormData({ ...formData, shiftType: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {shiftTypes.map((shift) => (
                      <SelectItem key={shift.value} value={shift.value}>
                        <div className="flex items-center gap-2">
                          <shift.icon className={`w-4 h-4 ${shift.color}`} />
                          {shift.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startTime" className="text-right">
                    Giờ bắt đầu
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="endTime" className="text-right">
                    Giờ kết thúc
                  </Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="breakMinutes" className="text-right">
                    Nghỉ giữa ca (phút)
                  </Label>
                  <Input
                    id="breakMinutes"
                    type="number"
                    value={formData.breakMinutes}
                    onChange={(e) => setFormData({ ...formData, breakMinutes: parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">
                  Trạng thái
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: StaffScheduleStatus) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="notes" className="text-right">
                  Ghi chú
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="col-span-3"
                  rows={3}
                  placeholder="Ghi chú về ca làm việc..."
                />
              </div>

              {formData.startTime && formData.endTime && (
                <div className="border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    <strong>Thời gian làm việc:</strong>{' '}
                    {calculateWorkHours(
                      buildDateTime(formData.shiftDate, formData.startTime),
                      buildDateTime(formData.shiftDate, formData.endTime),
                      formData.breakMinutes
                    ).toFixed(1)}
                    h
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={editingSchedule ? handleUpdate : handleCreate}>
                {editingSchedule ? 'Cập nhật' : 'Thêm mới'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ca làm việc hôm nay</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalScheduled}</div>
            <p className="text-xs text-muted-foreground">{stats.confirmed} đã xác nhận</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalScheduled > 0 ? ((stats.completed / stats.totalScheduled) * 100).toFixed(1) : 0}% tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vắng mặt</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalScheduled > 0 ? ((stats.absent / stats.totalScheduled) * 100).toFixed(1) : 0}% tổng số
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giờ làm</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Tổng thời gian hôm nay</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Lịch làm việc
          </CardTitle>
          <CardDescription>Quản lý và theo dõi lịch trình làm việc của nhân viên</CardDescription>
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

            <Select value={selectedShift} onValueChange={setSelectedShift}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Lọc theo ca" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả ca</SelectItem>
                {shiftTypes.map((shift) => (
                  <SelectItem key={shift.value} value={shift.value}>
                    {shift.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
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
                <TableHead>Ca làm việc</TableHead>
                <TableHead>Thời gian</TableHead>
                <TableHead>Nghỉ giữa ca</TableHead>
                <TableHead>Tổng giờ làm</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Ghi chú</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => {
                const shiftInfo = getShiftInfo(schedule.shiftType);
                return (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>
                            {schedule.staffName.split(' ').map((n) => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold">{schedule.staffName}</div>
                          <div className="text-sm text-muted-foreground">{schedule.staffPosition}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <shiftInfo.icon className={`w-4 h-4 ${shiftInfo.color}`} />
                        <span className="font-medium">{shiftInfo.label}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Coffee className="w-4 h-4 text-muted-foreground" />
                        <span>{schedule.breakMinutes} phút</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Timer className="w-4 h-4 text-muted-foreground" />
                        <span>{calculateWorkHours(schedule.startTime, schedule.endTime, schedule.breakMinutes).toFixed(1)}h</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(schedule.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground max-w-32 truncate">
                        {schedule.notes || '-'}
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
                          <DropdownMenuItem onClick={() => openEditDialog(schedule)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Chỉnh sửa
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(schedule)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Sao chép
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="mr-2 h-4 w-4" />
                            Xem chi tiết
                          </DropdownMenuItem>
                          {schedule.status === StaffScheduleStatus.scheduled && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(schedule.id, StaffScheduleStatus.confirmed)}
                              className="text-green-600"
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Xác nhận
                            </DropdownMenuItem>
                          )}
                          {schedule.status === StaffScheduleStatus.confirmed && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(schedule.id, StaffScheduleStatus.inProgress)}
                              className="text-blue-600"
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Bắt đầu ca
                            </DropdownMenuItem>
                          )}
                          {schedule.status === StaffScheduleStatus.inProgress && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(schedule.id, StaffScheduleStatus.completed)}
                              className="text-green-600"
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Hoàn thành
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleUpdateStatus(schedule.id, StaffScheduleStatus.absent)}
                            className="text-orange-600"
                          >
                            <AlertCircle className="mr-2 h-4 w-4" />
                            Vắng mặt
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(schedule.id)}
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

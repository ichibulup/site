"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Minus, Clock, User, AlertCircle, Loader2, X } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import {
  useGetMenuItemsQuery,
  useGetAllTablesQuery,
  useCreateOrderMutation,
  useGetAllUsersQuery
} from "@/state/api"

// Types
interface OrderItem {
  menuItemId: string
  name: string
  price: number
  quantity: number
  notes?: string
}

// Helper function: Format currency
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

export default function NewOrderPage() {
  const router = useRouter()
  
  // API hooks
  const { data: menuItems = [], isLoading: isLoadingMenu, error: menuError } = useGetMenuItemsQuery()
  const { data: tables = [], isLoading: isLoadingTables, error: tablesError } = useGetAllTablesQuery()
  const { data: customers = [], isLoading: isLoadingCustomers } = useGetAllUsersQuery()
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation()
  
  // Form state
  const [customerName, setCustomerName] = useState("")
  const [customerPhone, setCustomerPhone] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  
  // Menu filtering state
  const [menuSearch, setMenuSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  // Priority state
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal")
  
  // Filter menu items
  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item: any) => {
      const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase())
      const matchesCategory = categoryFilter === "all" || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [menuItems, menuSearch, categoryFilter])
  
  // Calculate totals
  const subtotal = useMemo(() => {
    return orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }, [orderItems])
  
  const tax = useMemo(() => Math.round(subtotal * 0.1), [subtotal])
  const total = useMemo(() => subtotal + tax, [subtotal, tax])
  
  // Get item quantity
  const getItemQuantity = (menuItemId: string): number => {
    return orderItems.find(item => item.menuItemId === menuItemId)?.quantity || 0
  }
  
  // Add item
  const handleAddItem = (menuItem: any) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.menuItemId === menuItem.id)
      if (existing) {
        return prev.map(item =>
          item.menuItemId === menuItem.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        menuItemId: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: 1
      }]
    })
  }
  
  // Remove item
  const handleRemoveItem = (menuItemId: string) => {
    setOrderItems(prev => {
      const existing = prev.find(item => item.menuItemId === menuItemId)
      if (!existing) return prev
      
      if (existing.quantity === 1) {
        return prev.filter(item => item.menuItemId !== menuItemId)
      }
      
      return prev.map(item =>
        item.menuItemId === menuItemId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    })
  }
  
  // Clear item completely
  const handleClearItem = (menuItemId: string) => {
    setOrderItems(prev => prev.filter(item => item.menuItemId !== menuItemId))
  }
  
  // Select customer from dropdown
  const handleSelectCustomer = (customerId: string) => {
    const customer = customers.find((c: any) => c.id === customerId)
    if (customer) {
      setSelectedCustomerId(customerId)
      setCustomerName(customer.fullName || "")
      setCustomerPhone(customer.phoneNumber || "")
    }
  }
  
  // Create order
  const handleCreateOrder = async () => {
    // Validation
    if (!selectedTableId) {
      toast.error("Vui lòng chọn bàn")
      return
    }
    
    if (orderItems.length === 0) {
      toast.error("Vui lòng chọn ít nhất một món")
      return
    }
    
    if (!customerName.trim()) {
      toast.error("Vui lòng nhập tên khách hàng")
      return
    }
    
    try {
      const orderData = {
        tableId: selectedTableId,
        customerId: selectedCustomerId,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        items: orderItems.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          notes: item.notes
        })),
        notes: notes.trim() || undefined,
        priority,
        status: "pending"
      }
      
      await createOrder(orderData).unwrap()
      toast.success("Đã tạo đơn hàng thành công!")
      router.push("/staff/orders")
    } catch (error) {
      console.error("Failed to create order:", error)
      toast.error("Không thể tạo đơn hàng. Vui lòng thử lại.")
    }
  }
  
  // Loading state
  if (isLoadingMenu || isLoadingTables) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }
  
  // Error state
  if (menuError || tablesError) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Không thể tải dữ liệu. Vui lòng thử lại.
        </AlertDescription>
      </Alert>
    )
  }
  
  // Success state - render form
  const selectedTable = tables.find((t: any) => t.id === selectedTableId)
  const availableTables = tables.filter((t: any) => t.status === "available")
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Tạo đơn hàng mới</h2>
          <p className="text-muted-foreground">
            Nhận và tạo đơn hàng cho khách hàng
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/staff/orders">Quay lại</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer & Table Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin khách hàng & bàn</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Customer Selection */}
              {!isLoadingCustomers && customers.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="existing-customer">Khách hàng hiện có (tùy chọn)</Label>
                  <Select value={selectedCustomerId || ""} onValueChange={handleSelectCustomer}>
                    <SelectTrigger id="existing-customer">
                      <SelectValue placeholder="Chọn khách hàng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Khách hàng mới</SelectItem>
                      {customers.map((customer: any) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.fullName} - {customer.phoneNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="customer">Tên khách hàng *</Label>
                  <Input
                    id="customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập tên khách hàng"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <Input
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Số điện thoại (tùy chọn)"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Chọn bàn * ({availableTables.length} bàn trống)</Label>
                <div className="grid grid-cols-4 gap-2">
                  {tables.map((table: any) => (
                    <Button
                      key={table.id}
                      variant={selectedTableId === table.id ? 'default' : table.status === 'available' ? 'outline' : 'secondary'}
                      disabled={table.status !== 'available'}
                      onClick={() => setSelectedTableId(table.id)}
                      className="h-16 flex flex-col"
                    >
                      <span className="font-bold">Bàn {table.tableNumber}</span>
                      <span className="text-xs">
                        {table.status === 'available' ? 'Trống' :
                         table.status === 'occupied' ? 'Có khách' : 'Đã đặt'}
                      </span>
                      <span className="text-xs">{table.capacity} chỗ</span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority">Độ ưu tiên</Label>
                <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Thấp</SelectItem>
                    <SelectItem value="normal">Bình thường</SelectItem>
                    <SelectItem value="high">Cao</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="note">Ghi chú</Label>
                <Textarea
                  id="note"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ghi chú đặc biệt..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Menu Items */}
          <Card>
            <CardHeader>
              <CardTitle>Chọn món</CardTitle>
              <CardDescription>
                Chọn các món ăn và đồ uống cho đơn hàng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <Input
                    placeholder="Tìm kiếm món ăn..."
                    className="flex-1"
                    value={menuSearch}
                    onChange={(e) => setMenuSearch(e.target.value)}
                  />
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Phân loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="appetizer">Khai vị</SelectItem>
                      <SelectItem value="main_course">Món chính</SelectItem>
                      <SelectItem value="dessert">Tráng miệng</SelectItem>
                      <SelectItem value="beverage">Đồ uống</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3 max-h-[600px] overflow-y-auto">
                  {filteredMenuItems.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Không tìm thấy món ăn nào
                    </div>
                  ) : (
                    filteredMenuItems.map((item: any) => {
                      const quantity = getItemQuantity(item.id)
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            !item.isAvailable ? 'opacity-50 bg-muted' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{item.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {item.category}
                              </Badge>
                              {!item.isAvailable && (
                                <Badge variant="destructive" className="text-xs">
                                  Hết món
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency(item.price)}
                            </p>
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.description}
                              </p>
                            )}
                          </div>
                          
                          {item.isAvailable && (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={quantity === 0}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">{quantity}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleAddItem(item)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4" />
                  <span>{customerName || "Chưa nhập tên khách hàng"}</span>
                </div>
                {selectedTable && (
                  <div className="text-sm">
                    <strong>Bàn:</strong> {selectedTable.tableNumber} ({selectedTable.capacity} chỗ)
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  <span>{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Món đã chọn ({orderItems.length}):</p>
                {orderItems.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8 text-sm">
                    Chưa có món nào được chọn
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {orderItems.map((item) => (
                      <div key={item.menuItemId} className="flex justify-between items-start text-sm border-b pb-2">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-muted-foreground">
                            {item.quantity} x {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleClearItem(item.menuItemId)}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Tạm tính:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Thuế (10%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <Button
                  className="w-full"
                  disabled={isCreating || orderItems.length === 0 || !selectedTableId || !customerName.trim()}
                  onClick={handleCreateOrder}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang tạo...
                    </>
                  ) : (
                    "Tạo đơn hàng"
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setOrderItems([])
                    setCustomerName("")
                    setCustomerPhone("")
                    setSelectedCustomerId(null)
                    setSelectedTableId(null)
                    setNotes("")
                    setPriority("normal")
                    toast.info("Đã xóa đơn hàng")
                  }}
                >
                  Xóa & bắt đầu lại
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { Supplier, SupplierStatus } from "@/lib/interfaces"

interface SupplierFormProps {
  initialData?: Supplier
  organizationId?: string
  onSubmit: (data: Omit<Supplier, 'id' | 'restaurantId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  isLoading?: boolean
  title: string
  description: string
}

export function SupplierForm({
  initialData,
  organizationId,
  onSubmit,
  isLoading = false,
  title,
  description
}: SupplierFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    contactPerson: initialData?.contactPerson || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    address: initialData?.address || "",
    paymentTerms: initialData?.paymentTerms || "",
    taxCode: initialData?.taxCode || "",
    status: initialData?.status || SupplierStatus.active,
    rating: initialData?.rating || null,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit({
        organizationId: initialData?.organizationId ?? organizationId ?? "",
        name: formData.name,
        contactPerson: formData.contactPerson || null,
        email: formData.email || null,
        phone: formData.phone || null,
        address: formData.address || null,
        paymentTerms: formData.paymentTerms || null,
        taxCode: formData.taxCode || null,
        status: formData.status as SupplierStatus,
        rating: formData.rating,
      })
      router.push("/warehouse/supplier")
    } catch (error) {
      console.error("Error submitting form:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin nhà cung cấp</CardTitle>
          <CardDescription>
            Nhập hoặc chỉnh sửa thông tin nhà cung cấp
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Tên nhà cung cấp *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Fresh Meat Co."
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Người liên hệ</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder="Nguyễn Văn A"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="contact@supplier.com"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="0123456789"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Row 3 */}
            <div className="space-y-2">
              <Label htmlFor="address">Địa chỉ</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="123 Đường ABC, Quận 1"
                disabled={isLoading}
              />
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="taxCode">Mã số thuế</Label>
                <Input
                  id="taxCode"
                  value={formData.taxCode}
                  onChange={(e) => setFormData({...formData, taxCode: e.target.value})}
                  placeholder="0123456789"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Điều kiện thanh toán</Label>
                <Select 
                  value={formData.paymentTerms} 
                  onValueChange={(value) => setFormData({...formData, paymentTerms: value})}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn điều kiện thanh toán" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="COD">Thanh toán khi giao hàng (COD)</SelectItem>
                    <SelectItem value="Trả trước">Trả trước 100%</SelectItem>
                    <SelectItem value="15 ngày">Thanh toán trong 15 ngày</SelectItem>
                    <SelectItem value="30 ngày">Thanh toán trong 30 ngày</SelectItem>
                    <SelectItem value="45 ngày">Thanh toán trong 45 ngày</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 5 - Status */}
            <div className="space-y-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select 
                value={formData.status} 
                onValueChange={(value) => setFormData({...formData, status: value as SupplierStatus})}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SupplierStatus.active}>Hoạt động</SelectItem>
                  <SelectItem value={SupplierStatus.inactive}>Ngưng hoạt động</SelectItem>
                  <SelectItem value={SupplierStatus.suspended}>Tạm dừng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : (initialData ? "Cập nhật" : "Thêm nhà cung cấp")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

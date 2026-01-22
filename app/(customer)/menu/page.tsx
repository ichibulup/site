"use client"

import React, { useState, useEffect, useMemo } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
} from "@tanstack/react-table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// React Table imports
import { DataTablePagination } from "@/components/element/data-table"
import {
  Search,
  Utensils,
  Coffee,
  Cake,
  Soup,
  Star,
  Heart,
  Clock,
  Flame,
  ShoppingCart,
  RotateCw,
  Info
} from "lucide-react"
import { MenuItemDataColumn } from "@/lib/interfaces"
import { MenuItemCard } from "@/components/element/menu"
import { useGetAllMenuItemsQuery } from "@/state/api";
import { toast } from "sonner"
import { cn } from "@/lib/utils";
import { Badge } from "@/components/element/badge";
import { formatCurrency } from "@/lib/utils/formatters";

export default function MenuPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  const {
    data: menuItems = [],
    error,
    refetch: refetchMenuItems,
    isLoading
  } = useGetAllMenuItemsQuery();

  // Xử lý lỗi từ RTK Query
  useEffect(() => {
    if (error) toast.error("Không thể tải danh sách thực đơn");
  }, [error]);

  // Define columns for React Table (used for pagination only)
  const columns: ColumnDef<MenuItemDataColumn>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
  ]

  // Filter and sort items
  const filteredAndSortedItems = useMemo(() => {
    const filtered = menuItems.filter((item: MenuItemDataColumn) => {
      // Only show available items
      if (!item.isAvailable) return false;

      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesCategory = selectedCategory === "all" ||
                             (selectedCategory === "appetizer" && item.category?.name?.toLowerCase().includes('kha')) ||
                             (selectedCategory === "main" && item.category?.name?.toLowerCase().includes('chính')) ||
                             (selectedCategory === "soup" && (item.category?.name?.toLowerCase().includes('súp') || item.category?.name?.toLowerCase().includes('canh'))) ||
                             (selectedCategory === "dessert" && item.category?.name?.toLowerCase().includes('tráng')) ||
                             (selectedCategory === "beverage" && item.category?.name?.toLowerCase().includes('uống'))

      return matchesSearch && matchesCategory
    })

    // Sort items
    filtered.sort((a: MenuItemDataColumn, b: MenuItemDataColumn) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price)
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price)
        case "name":
          return a.name.localeCompare(b.name)
        case "popular":
        default:
          // Sort by featured first, then by display order
          if (a.isFeatured && !b.isFeatured) return -1
          if (!a.isFeatured && b.isFeatured) return 1
          return a.displayOrder - b.displayOrder
      }
    })

    return filtered
  }, [menuItems, searchTerm, selectedCategory, sortBy])

  // Create React Table instance for pagination
  const table = useReactTable({
    data: filteredAndSortedItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 12,
      },
    },
  })

  const category = [
    { id: "all", name: "Tất cả", icon: Utensils },
    { id: "appetizer", name: "Khai vị", icon: Utensils },
    { id: "main", name: "Món chính", icon: Utensils },
    { id: "soup", name: "Canh/Súp", icon: Soup },
    { id: "dessert", name: "Tráng miệng", icon: Cake },
    { id: "beverage", name: "Đồ uống", icon: Coffee }
  ]

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-professional-main to-professional-sub rounded-xl text-white py-18">
        <div className="flex flex-col gap-6 text-center">
          <h1 className="text-4xl font-bold">Thực Đơn</h1>
          <p className="text-xl opacity-90">
            Khám phá những món ăn ngon nhất từ ẩm thực Việt Nam
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* Filters */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col md:flex-row gap-2 px-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm món ăn..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={refetchMenuItems}
            >
              <RotateCw className="h-4 w-4"/>
            </Button>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => table.setPageSize(Number(value))}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[4, 8, 12, 24, 48, 100].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Phổ biến nhất</SelectItem>
                <SelectItem value="price-low">Giá thấp đến cao</SelectItem>
                <SelectItem value="price-high">Giá cao đến thấp</SelectItem>
                <SelectItem value="name">Tên A-Z</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          {/* Category Buttons */}
          {/*<div className="flex flex-wrap gap-2">*/}
          {/*  {category.map((category) => {*/}
          {/*    const Icon = category.icon*/}
          {/*    return (*/}
          {/*      <Button*/}
          {/*        key={category.id}*/}
          {/*        variant={selectedCategory === category.id ? "default" : "outline"}*/}
          {/*        // size=""*/}
          {/*        onClick={() => setSelectedCategory(category.id)}*/}
          {/*        className="text-xs"*/}
          {/*      >*/}
          {/*        <Icon className="h-4 w-4 mr-1" />*/}
          {/*        {category.name}*/}
          {/*      </Button>*/}
          {/*    )*/}
          {/*  })}*/}
          {/*</div>*/}
        </div>

        {/* Menu Grid */}
        {isLoading ? (
          <div className="grid md:grid-cols-4 gap-6">
            {[...Array(12)].map((_, i) => (
              <Card key={i} className={cn(
                "group overflow-hidden border-none shadow-sm transition-all duration-300 ease-in-out pt-0",
                "hover:ring-1 hover:ring-professional-main"
              )}>
                {/* Image Section */}
                <CardHeader className="relative aspect-[4/3] overflow-hidden bg-muted">
                  {/*<Image*/}
                  {/*  src={"/element/1.png"}*/}
                  {/*  alt={"X"}*/}
                  {/*  fill*/}
                  {/*  className="object-cover transition-transform duration-500 group-hover:scale-110"*/}
                  {/*/>*/}

                  <div className="flex h-full w-full items-center justify-center bg-secondary/30">
                    <Utensils className="h-12 w-12 text-muted-foreground/40" />
                  </div>
                  {/* Badges Overlay */}
                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                    <Badge className="">
                      <Info className="h-4 w-4 fill-current" /> Đang tải
                    </Badge>
                  </div>

                  <Button
                    size="icon"
                    variant="secondary"
                    disabled
                    className="absolute right-4 top-4 h-6 w-6 rounded-full opacity-0 shadow-sm transition-opacity group-hover:opacity-90 bg-foreground/90 backdrop-blur-sm cursor-pointer"
                  >
                    <Heart className="h-4 w-4 text-professional-main" />
                  </Button>
                </CardHeader>

                <CardContent className="px-6">
                  {/* Name & Description */}
                  <div className="mb-1 flex items-center justify-between">
                    <CardTitle className="line-clamp-1 text-lg text-transparent font-bold transition-colors">
                      {/*{item.name}*/}X
                    </CardTitle>
                    <span className="text-xs font-bold uppercase tracking-wider text-transparent">
                      {/*{item.category?.name || "Món chính"}*/}X
                    </span>
                  </div>

                  {/* Description: 1 line truncate */}
                  <p className="line-clamp-1 text-sm text-transparent mb-4 italic">
                    {/*{item.description || "Hương vị truyền thống thơm ngon khó cưỡng..."}*/}X
                  </p>

                  {/* Meta info */}
                  <div className="flex items-center justify-between text-xs font-medium text-transparent">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {/*<span>{item.preparationTime || 15} min</span>*/}X min
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="h-4 w-4" />
                        {/*<span>{item.calories || 0} kcal</span>*/}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-professional-warning">
                      <Star className="h-4 w-4 fill-current" />
                      <span>4.8</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="flex items-center justify-between border-t pt-4">
                  {/* Price & Action */}
                  <div className="flex flex-col">
                    {/*<span className="text-xs text-muted-foreground leading-none mb-1">Giá từ</span>*/}
                    <span className="text-transparent line-through leading-none mb-1">
                      {formatCurrency({ value: "100000", currency: "VND" })}X
                    </span>
                    <span className="text-xl font-extrabold text-transparent">
                      {/*{formatCurrency({ value: priceValue, currency: "VND" })}*/}X
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="icon"
                      className="cursor-pointer"
                      disabled
                      onClick={() => {}}
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {table.getRowModel().rows.map((row) => {
              const item = row.original
              return (
                <MenuItemCard
                  key={item.id}
                  item={item}
                />
              )
            })}
          </div>
        )}

        {/* Pagination */}
        <Card className="px-6">
          {table.getPageCount() > 1 && (
            <DataTablePagination table={table} />
          )}
        </Card>

        {/* Load More */}
        {filteredAndSortedItems.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <Utensils className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Không tìm thấy món ăn</h3>
            <p className="text-muted-foreground">Thử tìm kiếm với từ khóa khác</p>
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import React, { useMemo, useState } from "react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import {
  ArrowLeft,
  Clock,
  Heart,
  Share2,
  Star,
  Truck,
  Utensils,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/element/badge"
import { cn } from "@/lib/utils"
import { formatCurrency } from "@/lib/utils/formatters"
import { MenuItemCard } from "@/components/element/menu"
import { useGetAllMenuItemsQuery, useGetMenuItemByIdQuery } from "@/state/api"
import { toast } from "sonner"
import { useUser } from "@/hooks/use-user"
import { useCart } from "@/hooks/use-cart"

export default function MenuItemDetailPage() {
  const router = useRouter()
  const params = useParams();
  const id = params.id
  const { data: item, isLoading, error } = useGetMenuItemByIdQuery(id as string)
  const { data: menuItems = [] } = useGetAllMenuItemsQuery()
  const { user } = useUser()
  const { addItem, isLoading: isCartLoading } = useCart(user?.id)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAddLoading, setIsAddLoading] = useState(false)

  const priceValue = useMemo(() => {
    if (!item) return 0
    return typeof item.price === "string" ? Number(item.price) : Number(item.price)
  }, [item])

  const recommendedItems = useMemo(() => {
    if (!menuItems.length) return []
    const filtered = menuItems.filter((menuItem) => {
      if (!menuItem.isAvailable) return false
      if (item?.id && menuItem.id === item.id) return false
      return true
    })

    const featuredFirst = filtered.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1
      if (!a.isFeatured && b.isFeatured) return 1
      return a.displayOrder - b.displayOrder
    })

    return featuredFirst.slice(0, 4)
  }, [menuItems, item?.id])

  const handleAddToCart = async () => {
    if (!item) return
    if (!user?.id) {
      toast.error("Vui lòng đăng nhập để thêm món vào giỏ hàng.")
      return
    }

    setIsAddLoading(true)
    const added = await addItem(
      {
        menuItemId: item.id,
        itemName: item.name,
        unitPrice: priceValue,
        itemImage: item.imageUrl ?? null,
        notes: null,
        specialInstructions: null,
        giftMessage: null,
      },
      quantity
    )

    setIsAddLoading(false)
    if (added) {
      toast.success("Đã thêm món vào giỏ hàng.")
    } else {
      toast.error("Không thể thêm món vào giỏ hàng.")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="h-10 w-32 rounded-md bg-muted animate-pulse" />
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
          <div className="space-y-4">
            <div className="h-10 w-3/4 rounded-md bg-muted animate-pulse" />
            <div className="h-8 w-1/3 rounded-md bg-muted animate-pulse" />
            <div className="h-24 w-full rounded-md bg-muted animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="flex flex-col gap-6">
        <Button variant="ghost" onClick={() => router.back()} className="w-fit">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed p-10 text-center">
          <Utensils className="h-10 w-10 text-muted-foreground" />
          <div className="text-lg font-semibold">Không tìm thấy món ăn</div>
          <p className="text-sm text-muted-foreground">
            Món ăn này không tồn tại hoặc đã bị gỡ.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => {}}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsFavorite((prev) => !prev)}
          >
            <Heart
              className={cn("h-4 w-4", isFavorite ? "text-red-500" : "text-muted-foreground")}
            />
          </Button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="relative overflow-hidden rounded-2xl bg-muted">
          <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
            {item.isFeatured && (
              <Badge className="bg-professional-main">Nổi bật</Badge>
            )}
            {!item.isAvailable && <Badge variant="destructive">Hết món</Badge>}
          </div>
          <div className="aspect-[4/3] w-full">
            <Image
              src={item.imageUrl || "/element/1.png"}
              alt={item.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="flex flex-col gap-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <h1 className="text-3xl font-bold">{item.name}</h1>
              <span className="text-2xl font-bold text-primary">
                {formatCurrency({ value: priceValue, currency: "VND" })}
              </span>
            </div>
            <div className="text-sm uppercase tracking-widest text-muted-foreground">
              {item.category?.name || "Món ăn"}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 border-y py-4 text-sm">
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Truck className="h-4 w-4 text-primary" />
              Giao hàng miễn phí
            </div>
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Clock className="h-4 w-4 text-primary" />
              {item.preparationTime || 20} phút
            </div>
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              4.8
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Mô tả</h2>
            <p className="leading-6 text-muted-foreground">
              {item.description ||
                "Chưa có mô tả cho món ăn này. Nhưng chúng tôi đảm bảo hương vị sẽ khiến bạn hài lòng."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 rounded-md border px-3 py-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </Button>
              <span className="min-w-[24px] text-center font-semibold">{quantity}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                +
              </Button>
            </div>
            <Button
              className="flex-1"
              disabled={!item.isAvailable || isAddLoading || isCartLoading}
              onClick={handleAddToCart}
            >
              {isAddLoading ? "Đang thêm..." : "Thêm vào giỏ"}
              <span className="ml-2 text-sm opacity-80">
                {formatCurrency({ value: priceValue * quantity, currency: "VND" })}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Gợi ý cho bạn</h2>
          <Button variant="ghost" size="sm" onClick={() => router.push("/cart")}>
            Xem tất cả
          </Button>
        </div>
        {recommendedItems.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {recommendedItems.map((rec) => (
              <MenuItemCard key={rec.id} item={rec} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
            Chưa có gợi ý phù hợp.
          </div>
        )}
      </div>
    </div>
  )
}

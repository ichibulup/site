'use client'

import { useCallback, useEffect, useState } from 'react';
import type { CartItem, DecimalString } from '@/lib/interfaces';
import {
  useAddToCartMutation,
  useClearCartMutation,
  useCreateCartMutation,
  useDeleteCartItemMutation,
  useLazyGetCartByIdQuery,
  useLazyGetCartsQuery,
  useUpdateCartItemMutation,
} from '@/state/api';

type CartState = {
  cartId: string | null;
  items: CartItem[];
  isLoading: boolean;
};

type CartItemInput = Omit<
  CartItem,
  'id' | 'cartId' | 'quantity' | 'totalPrice' | 'isGift' | 'unitPrice'
> & {
  unitPrice: DecimalString | number;
};

const coerceNumber = (value: unknown) => {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
};

const toDecimalString = (value: unknown, fallback: DecimalString = '0'): DecimalString => {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return fallback;
};

const buildCartItemId = (cartId: string, itemKey: string) => `${cartId}:${itemKey}`;

const isValidImageUrl = (value: unknown) =>
  typeof value === 'string' && /^https?:\/\//i.test(value);

const normalizeCartItem = (item: any, fallbackCartId: string): CartItem | null => {
  if (!item || (!item.menuItemId && !item.retailProductId)) {
    return null;
  }

  const menuItemId = typeof item.menuItemId === 'string' ? item.menuItemId : null;
  const retailProductId = typeof item.retailProductId === 'string' ? item.retailProductId : null;
  const quantity = Math.max(1, Math.floor(coerceNumber(item.quantity)));
  const unitPrice = toDecimalString(item.unitPrice);
  const totalPrice = toDecimalString(
    item.totalPrice ?? coerceNumber(item.unitPrice) * quantity
  );
  const cartId = typeof item.cartId === 'string' ? item.cartId : fallbackCartId;
  const itemKey = menuItemId ?? retailProductId ?? String(quantity);

  const itemName =
    typeof item.itemName === 'string'
      ? item.itemName
      : typeof item.menuItem?.name === 'string'
        ? item.menuItem.name
        : typeof item.retailProduct?.name === 'string'
          ? item.retailProduct.name
          : null;

  const itemImage =
    typeof item.itemImage === 'string'
      ? item.itemImage
      : typeof item.menuItem?.imageUrl === 'string'
        ? item.menuItem.imageUrl
        : Array.isArray(item.retailProduct?.imageUrls)
          ? item.retailProduct.imageUrls[0] ?? null
          : null;

  return {
    id: typeof item.id === 'string' ? item.id : buildCartItemId(cartId, itemKey),
    cartId,
    menuItemId,
    retailProductId,
    quantity,
    unitPrice,
    totalPrice,
    notes: typeof item.notes === 'string' ? item.notes : null,
    itemName,
    itemImage,
    specialInstructions:
      typeof item.specialInstructions === 'string' ? item.specialInstructions : null,
    isGift: Boolean(item.isGift),
    giftMessage: typeof item.giftMessage === 'string' ? item.giftMessage : null,
  } satisfies CartItem;
};

const normalizeCartItems = (value: unknown, fallbackCartId: string): CartItem[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => normalizeCartItem(item, fallbackCartId))
    .filter((item): item is CartItem => Boolean(item));
};

export function useCart(userId?: string | null) {
  const [state, setState] = useState<CartState>({
    cartId: null,
    items: [],
    isLoading: true,
  });

  const [fetchCarts] = useLazyGetCartsQuery();
  const [fetchCartById] = useLazyGetCartByIdQuery();
  const [createCartMutation] = useCreateCartMutation();
  const [addToCartMutation] = useAddToCartMutation();
  const [updateCartItemMutation] = useUpdateCartItemMutation();
  const [deleteCartItemMutation] = useDeleteCartItemMutation();
  const [clearCartMutation] = useClearCartMutation();

  const loadCart = useCallback(async () => {
    if (!userId) {
      setState({ cartId: null, items: [], isLoading: false });
      return null;
    }

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      const carts = await fetchCarts({
        userId,
        limit: 1,
        sortBy: 'lastActivity',
        sortOrder: 'desc',
      }).unwrap();

      let cart = Array.isArray(carts) ? carts[0] : null;

      if (!cart) {
        cart = await createCartMutation({ userId }).unwrap();
      }

      const cartId = cart?.id ?? null;
      let items: CartItem[] = [];

      if (cartId) {
        try {
          const detailed = await fetchCartById(cartId).unwrap();
          items = normalizeCartItems(detailed?.items ?? cart?.items ?? [], cartId);
        } catch (error) {
          console.warn('Failed to fetch cart details, using cached items:', error);
          items = normalizeCartItems(cart?.items ?? [], cartId);
        }
      }

      setState({ cartId, items, isLoading: false });
      return cartId;
    } catch (error) {
      console.warn('Failed to load cart:', error);
      setState({ cartId: null, items: [], isLoading: false });
      return null;
    }
  }, [createCartMutation, fetchCartById, fetchCarts, userId]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  const addItem = useCallback(
    async (item: CartItemInput, quantity = 1) => {
      if (!userId) return false;

      const safeQuantity = Math.max(1, Math.floor(quantity));
      if (!item.menuItemId && !item.retailProductId) return false;

      const cartId = state.cartId ?? (await loadCart());
      if (!cartId) return false;

      const unitPrice = toDecimalString(item.unitPrice);
      const totalPrice = toDecimalString(coerceNumber(unitPrice) * safeQuantity);

      try {
        const cartItem = await addToCartMutation({
          cartId,
          menuItemId: item.menuItemId ?? undefined,
          retailProductId: item.retailProductId ?? undefined,
          quantity: safeQuantity,
          unitPrice: coerceNumber(unitPrice),
          totalPrice: coerceNumber(totalPrice),
          notes: item.notes ?? undefined,
          itemName: item.itemName ?? undefined,
          itemImage: isValidImageUrl(item.itemImage) ? item.itemImage ?? undefined : undefined,
          specialInstructions: item.specialInstructions ?? undefined,
          isGift: false,
          giftMessage: item.giftMessage ?? undefined,
          userId,
        }).unwrap();

        const normalized = normalizeCartItem(cartItem, cartId);
        if (!normalized) return false;

        setState((prev) => {
          const existingIndex = prev.items.findIndex((entry) => {
            if (normalized.menuItemId) return entry.menuItemId === normalized.menuItemId;
            if (normalized.retailProductId) {
              return entry.retailProductId === normalized.retailProductId;
            }
            return entry.id === normalized.id;
          });

          if (existingIndex >= 0) {
            const nextItems = [...prev.items];
            nextItems[existingIndex] = normalized;
            return { ...prev, items: nextItems };
          }

          return { ...prev, items: [...prev.items, normalized] };
        });

        return true;
      } catch (error) {
        console.warn('Failed to add item to cart:', error);
        return false;
      }
    },
    [addToCartMutation, loadCart, state.cartId, userId]
  );

  const removeItem = useCallback(
    async (menuItemId: string) => {
      const target = state.items.find((entry) => entry.menuItemId === menuItemId);
      if (!target) return;

      try {
        await deleteCartItemMutation(target.id).unwrap();
        setState((prev) => ({
          ...prev,
          items: prev.items.filter((entry) => entry.id !== target.id),
        }));
      } catch (error) {
        console.warn('Failed to remove cart item:', error);
      }
    },
    [deleteCartItemMutation, state.items]
  );

  const updateItemQuantity = useCallback(
    async (menuItemId: string, quantity: number) => {
      const target = state.items.find((entry) => entry.menuItemId === menuItemId);
      if (!target) return;

      const nextQuantity = Math.max(0, Math.floor(quantity));
      if (nextQuantity <= 0) {
        await removeItem(menuItemId);
        return;
      }

      const unitPriceValue = coerceNumber(target.unitPrice);
      const nextTotal = coerceNumber(unitPriceValue * nextQuantity);

      try {
        const updated = await updateCartItemMutation({
          id: target.id,
          quantity: nextQuantity,
          totalPrice: nextTotal,
        }).unwrap();

        const normalized = normalizeCartItem(updated, target.cartId);
        if (!normalized) return;

        setState((prev) => ({
          ...prev,
          items: prev.items.map((entry) => (entry.id === target.id ? normalized : entry)),
        }));
      } catch (error) {
        console.warn('Failed to update cart item quantity:', error);
      }
    },
    [removeItem, state.items, updateCartItemMutation]
  );

  const updateItemInstructions = useCallback(
    async (menuItemId: string, instructions: string) => {
      const target = state.items.find((entry) => entry.menuItemId === menuItemId);
      if (!target) return;

      try {
        const updated = await updateCartItemMutation({
          id: target.id,
          specialInstructions: instructions,
        }).unwrap();

        const normalized = normalizeCartItem(updated, target.cartId);
        if (!normalized) return;

        setState((prev) => ({
          ...prev,
          items: prev.items.map((entry) => (entry.id === target.id ? normalized : entry)),
        }));
      } catch (error) {
        console.warn('Failed to update cart item instructions:', error);
      }
    },
    [state.items, updateCartItemMutation]
  );

  const clearCart = useCallback(async () => {
    if (!state.cartId) return;

    try {
      await clearCartMutation(state.cartId).unwrap();
    } catch (error) {
      console.warn('Failed to clear cart:', error);
    } finally {
      setState((prev) => ({ ...prev, items: [], isLoading: false }));
    }
  }, [clearCartMutation, state.cartId]);

  return {
    cartId: state.cartId,
    items: state.items,
    isLoading: state.isLoading,
    addItem,
    updateItemQuantity,
    updateItemInstructions,
    removeItem,
    clearCart,
    reload: loadCart,
  };
}

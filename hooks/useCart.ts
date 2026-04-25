'use client';

import { useCallback, useState } from 'react';
import * as cartApi from '@/lib/api/cart';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { CartItemResponse } from '@/types/cart';

export function useCart() {
  const { items, addItem: addToStore, setItems, removeItem: removeFromStore, updateQuantity: updateStoreQty, clearCart: clearStore, total } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    try {
      const response = await cartApi.getCartByUser(user.userId);
      if (response.code === 0) {
        setItems(response.data);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, setItems]);

  const addToCart = async (productId: number, quantity: number, productDetails?: Partial<CartItemResponse>) => {
    if (isAuthenticated && user) {
      setIsLoading(true);
      try {
        const response = await cartApi.addToCart({ productId, userId: user.userId, quantity });
        if (response.code === 0) {
          // Sync with server response
          await fetchCart();
          return true;
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Local only for guest
      if (productDetails) {
        addToStore({
          productId,
          userId: 0,
          username: 'Guest',
          productName: productDetails.productName || '',
          productPrice: productDetails.productPrice || 0,
          productImageUrl: productDetails.productImageUrl || null,
          quantity
        });
        return true;
      }
    }
    return false;
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    if (isAuthenticated && user) {
      try {
        await cartApi.updateCartItemQuantity(user.userId, productId, quantity);
        updateStoreQty(productId, quantity);
      } catch (error) {
        console.error('Error updating cart quantity:', error);
      }
    } else {
      updateStoreQty(productId, quantity);
    }
  };

  const removeFromCart = async (productId: number) => {
    if (isAuthenticated && user) {
      try {
        await cartApi.removeCartItem(user.userId, productId);
        removeFromStore(productId);
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      removeFromStore(productId);
    }
  };

  return {
    items,
    isLoading,
    addToCart,
    fetchCart,
    updateQuantity,
    removeFromCart,
    clearCart: clearStore,
    total: total(),
    itemCount: items.reduce((sum, i) => sum + i.quantity, 0)
  };
}

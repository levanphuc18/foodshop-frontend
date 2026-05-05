import { CartItemRequest, CartItemResponse } from '@/schemas/cart';
import { ApiResponse } from '@/schemas/api';
import { fetcher } from '@/lib/fetcher';

export const addToCart = async (request: CartItemRequest): Promise<ApiResponse<CartItemResponse>> => {
  return await fetcher<ApiResponse<CartItemResponse>>('/cart', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getCartByUser = async (userId: number): Promise<ApiResponse<CartItemResponse[]>> => {
  return await fetcher<ApiResponse<CartItemResponse[]>>(`/cart/${userId}`, {
    method: 'GET',
  });
};

export const updateCartItemQuantity = async (userId: number, productId: number, quantity: number): Promise<ApiResponse<CartItemResponse>> => {
  const params = new URLSearchParams();
  params.append('quantity', quantity.toString());

  return await fetcher<ApiResponse<CartItemResponse>>(`/cart/${userId}/${productId}?${params.toString()}`, {
    method: 'PUT',
  });
};

export const removeCartItem = async (userId: number, productId: number): Promise<ApiResponse<void>> => {
  return await fetcher<ApiResponse<void>>(`/cart/${userId}/${productId}`, {
    method: 'DELETE',
  });
};

export const clearCart = async (userId: number): Promise<ApiResponse<void>> => {
  return await fetcher<ApiResponse<void>>(`/cart/clear/${userId}`, {
    method: 'DELETE',
  });
};

import type { OrderRequest, OrderResponse } from '@/schemas/order';
import type { ApiResponse, PageResponse } from '@/schemas/api';
import type { AdminOrderQuery } from '@/schemas/query';
import { fetcher } from '@/lib/fetcher';

export const createOrder = async (request: OrderRequest): Promise<ApiResponse<OrderResponse>> => {
  return await fetcher<ApiResponse<OrderResponse>>('/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
};

export const getMyOrders = async (): Promise<ApiResponse<OrderResponse[]>> => {
  return await fetcher<ApiResponse<OrderResponse[]>>('/orders/my', {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getOrderById = async (id: number): Promise<ApiResponse<OrderResponse>> => {
  return await fetcher<ApiResponse<OrderResponse>>(`/orders/${id}`, {
    method: 'GET',
  });
};

export const getAllOrders = async (): Promise<ApiResponse<OrderResponse[]>> => {
  return await fetcher<ApiResponse<OrderResponse[]>>('/admin/orders', {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getOrderPage = async (params: AdminOrderQuery = {}): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);

  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));
  query.set('sortBy', params.sortBy ?? 'createdAt');
  query.set('sortDir', params.sortDir ?? 'DESC');

  return await fetcher<ApiResponse<PageResponse<OrderResponse>>>(`/admin/orders?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const updateOrderStatus = async (id: number, status: string): Promise<ApiResponse<OrderResponse>> => {
  return await fetcher<ApiResponse<OrderResponse>>(`/admin/orders/${id}/status?status=${status}`, {
    method: 'PATCH',
  });
};

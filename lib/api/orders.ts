import type { OrderRequest, OrderResponse } from '@/types/order';
import type { ApiResponse, PageResponse } from '@/types/api';
import { fetcher } from '@/lib/fetcher';

interface AdminOrderPageParams {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

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

export const getOrderPage = async (params: AdminOrderPageParams = {}): Promise<ApiResponse<PageResponse<OrderResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.set('keyword', params.keyword);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);

  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));
  query.set('sortBy', params.sortBy ?? 'createdAt');
  query.set('asc', String(params.asc ?? false));

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

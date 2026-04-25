import { fetcher } from '../fetcher';
import type { ApiResponse, PageResponse } from '@/types/api';
import { CouponValidationResponse, DiscountResponse, DiscountRequest } from '@/types/discount';

interface AdminDiscountPageParams {
  keyword?: string;
  status?: string;
  type?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

export const getAllDiscountsAdmin = async (): Promise<ApiResponse<DiscountResponse[]>> => {
  return await fetcher<ApiResponse<DiscountResponse[]>>('/admin/discounts', {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getDiscountPage = async (params: AdminDiscountPageParams = {}): Promise<ApiResponse<PageResponse<DiscountResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.set('keyword', params.keyword);
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (params.type && params.type !== 'ALL') query.set('type', params.type);

  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));
  query.set('sortBy', params.sortBy ?? 'startDate');
  query.set('asc', String(params.asc ?? false));

  return await fetcher<ApiResponse<PageResponse<DiscountResponse>>>(`/admin/discounts?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getAllActiveDiscounts = async (): Promise<ApiResponse<DiscountResponse[]>> => {
  return await fetcher<ApiResponse<DiscountResponse[]>>('/discounts', {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getDiscountByIdAdmin = async (id: number): Promise<ApiResponse<DiscountResponse>> => {
  return await fetcher<ApiResponse<DiscountResponse>>(`/admin/discounts/${id}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const createDiscount = async (data: DiscountRequest): Promise<ApiResponse<DiscountResponse>> => {
  return await fetcher<ApiResponse<DiscountResponse>>('/admin/discounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateDiscount = async (id: number, data: DiscountRequest): Promise<ApiResponse<DiscountResponse>> => {
  return await fetcher<ApiResponse<DiscountResponse>>(`/admin/discounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const deleteDiscount = async (id: number): Promise<ApiResponse<void>> => {
  return await fetcher<ApiResponse<void>>(`/admin/discounts/${id}`, {
    method: 'DELETE',
  });
};

export const toggleDiscountStatus = async (id: number): Promise<ApiResponse<DiscountResponse>> => {
  return await fetcher<ApiResponse<DiscountResponse>>(`/admin/discounts/${id}/toggle-status`, {
    method: 'PATCH',
  });
};

/**
 * Validate coupon code trước khi submit order — preview số tiền được giảm.
 * @param code - Mã coupon
 * @param totalAmount - Tổng tiền hàng (chưa trừ coupon)
 */
export const validateCoupon = async (
  code: string,
  totalAmount: number
): Promise<ApiResponse<CouponValidationResponse>> => {
  const params = new URLSearchParams({ code, totalAmount: totalAmount.toString() });
  return await fetcher<ApiResponse<CouponValidationResponse>>(
    `/discounts/validate?${params.toString()}`,
    { method: 'POST' }
  );
};

import { fetcher } from '@/lib/fetcher';
import type { ApiResponse } from '@/types/api';

export const createVNPayUrl = async (orderId: number): Promise<ApiResponse<string>> => {
  return await fetcher<ApiResponse<string>>(`/payment/create-url?orderId=${orderId}`, {
    method: 'GET',
  });
};
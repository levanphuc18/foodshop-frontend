import { CategoryResponse } from '@/types/category';
import { ApiResponse } from '@/types/product';
import { fetcher } from '@/lib/fetcher';

export const getAllCategories = async (): Promise<ApiResponse<CategoryResponse[]>> => {
  return await fetcher<ApiResponse<CategoryResponse[]>>('/categories', {
    method: 'GET',
  });
};

export const getCategoryById = async (id: number): Promise<ApiResponse<CategoryResponse>> => {
  return await fetcher<ApiResponse<CategoryResponse>>(`/categories/${id}`, {
    method: 'GET',
  });
};

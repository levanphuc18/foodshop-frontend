import { fetcher } from '../fetcher';
import type { ApiResponse, PageResponse } from '@/types/api';
import { UserResponse } from '@/types/user';

interface AdminUserPageParams {
  keyword?: string;
  role?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

export const getAllUsers = async (): Promise<ApiResponse<UserResponse[]>> => {
  return await fetcher<ApiResponse<UserResponse[]>>('/admin/users', {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getUserPage = async (params: AdminUserPageParams = {}): Promise<ApiResponse<PageResponse<UserResponse>>> => {
  const query = new URLSearchParams();

  if (params.keyword) query.set('keyword', params.keyword);
  if (params.role && params.role !== 'ALL') query.set('role', params.role);
  if (typeof params.enabled === 'boolean') query.set('enabled', String(params.enabled));

  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));
  query.set('sortBy', params.sortBy ?? 'createdAt');
  query.set('asc', String(params.asc ?? false));

  return await fetcher<ApiResponse<PageResponse<UserResponse>>>(`/admin/users?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getUserById = async (id: number): Promise<ApiResponse<UserResponse>> => {
  return await fetcher<ApiResponse<UserResponse>>(`/admin/users/${id}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const toggleUserStatus = async (id: number): Promise<ApiResponse<UserResponse>> => {
  return await fetcher<ApiResponse<UserResponse>>(`/admin/users/${id}/toggle-status`, {
    method: 'PATCH',
  });
};

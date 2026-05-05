import { fetcher } from '@/lib/fetcher';
import type { ApiResponse } from '@/schemas/api';
import type { UserResponse } from '@/schemas/user';

export interface UpdateProfilePayload {
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
}

export function getMyProfile() {
  return fetcher<ApiResponse<UserResponse>>('/users/me', { method: 'GET' });
}

export function updateMyProfile(payload: UpdateProfilePayload) {
  return fetcher<ApiResponse<UserResponse>>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}


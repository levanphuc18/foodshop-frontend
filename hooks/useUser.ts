'use client';

import { useState, useCallback, useRef } from 'react';
import * as userApi from '@/lib/api/user';
import { getErrorMessage } from '@/lib/error';
import type { PageResponse } from '@/types/api';
import type { AdminUserQuery } from '@/types/query';
import { UserResponse } from '@/types/user';
import { toast } from 'react-hot-toast';

export function useUser() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [userPage, setUserPage] = useState<PageResponse<UserResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastPageOptionsRef = useRef<AdminUserQuery | null>(null);

  const applyPageData = (pageData: PageResponse<UserResponse>) => {
    setUsers(pageData.content);
    setUserPage(pageData);
  };

  const fetchUsers = useCallback(async () => {
    await fetchUserPage({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'DESC' });
  }, []);

  const fetchUserPage = useCallback(async (options: AdminUserQuery = {}) => {
    setIsLoading(true);
    setErrorMsg(null);
    lastPageOptionsRef.current = options;

    try {
      const response = await userApi.getUserPage(options);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tai danh sach nguoi dung');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi he thong khi tai nguoi dung'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggleStatus = async (userId: number) => {
    try {
      const response = await userApi.toggleUserStatus(userId);
      if (response.code === 0) {
        setUsers((current) =>
          current.map((u) => (u.userId === userId ? response.data : u))
        );
        setUserPage((current) =>
          current
            ? {
                ...current,
                content: current.content.map((u) => (u.userId === userId ? response.data : u)),
              }
            : current
        );
        toast.success(response.message || 'Cap nhat trang thai thanh cong');
        return true;
      }

      toast.error(response.message || 'Khong the cap nhat trang thai');
      return false;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Loi he thong khi cap nhat trang thai'));
      return false;
    }
  };

  return {
    users,
    userPage,
    isLoading,
    errorMsg,
    fetchUsers,
    fetchUserPage,
    toggleStatus,
  };
}

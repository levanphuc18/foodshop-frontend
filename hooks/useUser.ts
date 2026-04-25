'use client';

import { useState, useCallback, useRef } from 'react';
import * as userApi from '@/lib/api/user';
import type { PageResponse } from '@/types/api';
import { UserResponse } from '@/types/user';
import { toast } from 'react-hot-toast';

interface UserPageOptions {
  keyword?: string;
  role?: string;
  enabled?: boolean;
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

export function useUser() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [userPage, setUserPage] = useState<PageResponse<UserResponse> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const lastPageOptionsRef = useRef<UserPageOptions | null>(null);

  const applyPageData = (pageData: PageResponse<UserResponse>) => {
    setUsers(pageData.content);
    setUserPage(pageData);
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await userApi.getAllUsers();
      if (response.code === 0) {
        const dataArray = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setUsers(dataArray);
        setUserPage(null);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách người dùng');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi hệ thống khi tải người dùng');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUserPage = useCallback(async (options: UserPageOptions = {}) => {
    setIsLoading(true);
    setErrorMsg(null);
    lastPageOptionsRef.current = options;

    try {
      const response = await userApi.getUserPage(options);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách người dùng');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi hệ thống khi tải người dùng');
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
        toast.success(response.message || 'Cập nhật trạng thái thành công');
        return true;
      } else {
        toast.error(response.message || 'Không thể cập nhật trạng thái');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Lỗi hệ thống khi cập nhật trạng thái');
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

'use client';

import { useState, useCallback, useEffect } from 'react';
import * as categoryApi from '@/lib/api/category';
import { CategoryResponse } from '@/types/category';

export function useCategory() {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await categoryApi.getAllCategories();
      if (response.code === 0) {
        setCategories(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh mục');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi hệ thống');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    categories,
    isLoading,
    errorMsg,
    fetchCategories,
  };
}

'use client';

import { useState, useCallback } from 'react';
import * as categoryApi from '@/lib/api/category';
import { getErrorMessage } from '@/lib/error';
import { CategoryResponse } from '@/schemas/category';

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
        setErrorMsg(response.message || 'Loi khi tai danh muc');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi he thong'));
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

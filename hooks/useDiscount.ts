'use client';

import { useState, useCallback, useRef } from 'react';
import {
  getAllDiscountsAdmin,
  getDiscountByIdAdmin,
  getDiscountPage,
  createDiscount,
  updateDiscount,
  deleteDiscount,
  toggleDiscountStatus
} from '@/lib/api/discount';
import type { PageResponse } from '@/types/api';
import { DiscountResponse, DiscountRequest } from '@/types/discount';
import { toast } from 'react-hot-toast';

interface DiscountPageOptions {
  keyword?: string;
  status?: string;
  type?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

export function useDiscount() {
  const [discounts, setDiscounts] = useState<DiscountResponse[]>([]);
  const [discountPage, setDiscountPage] = useState<PageResponse<DiscountResponse> | null>(null);
  const [currentDiscount, setCurrentDiscount] = useState<DiscountResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const lastPageOptionsRef = useRef<DiscountPageOptions | null>(null);

  const applyPageData = (pageData: PageResponse<DiscountResponse>) => {
    setDiscounts(pageData.content);
    setDiscountPage(pageData);
  };

  const fetchDiscounts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllDiscountsAdmin();
      if (response.code === 0) {
        setDiscounts(response.data);
        setDiscountPage(null);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch discounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDiscountPage = useCallback(async (options: DiscountPageOptions = {}) => {
    setIsLoading(true);
    lastPageOptionsRef.current = options;

    try {
      const response = await getDiscountPage(options);
      if (response.code === 0) {
        applyPageData(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch discounts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchDiscountById = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      const response = await getDiscountByIdAdmin(id);
      if (response.code === 0) {
        setCurrentDiscount(response.data);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch discount details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreate = async (data: DiscountRequest) => {
    setIsLoading(true);
    try {
      const response = await createDiscount(data);
      if (response.code === 0) {
        toast.success('Discount created successfully');
        return response.data;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create discount');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (id: number, data: DiscountRequest) => {
    setIsLoading(true);
    try {
      const response = await updateDiscount(id, data);
      if (response.code === 0) {
        toast.success('Discount updated successfully');
        return response.data;
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update discount');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await deleteDiscount(id);
      if (response.code === 0) {
        if (lastPageOptionsRef.current) {
          await fetchDiscountPage(lastPageOptionsRef.current);
        } else {
          setDiscounts(prev => prev.filter(d => d.discountId !== id));
        }
        toast.success('Discount deleted successfully');
        return true;
      }
      return false;
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete discount');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = async (id: number) => {
    try {
      const response = await toggleDiscountStatus(id);
      if (response.code === 0) {
        if (lastPageOptionsRef.current) {
          await fetchDiscountPage(lastPageOptionsRef.current);
        } else {
          setDiscounts(prev =>
            prev.map(d => d.discountId === id ? response.data : d)
          );
        }
        toast.success(response.message || 'Status updated');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  return {
    discounts,
    discountPage,
    currentDiscount,
    isLoading,
    fetchDiscounts,
    fetchDiscountPage,
    fetchDiscountById,
    handleCreate,
    handleUpdate,
    handleDelete,
    toggleStatus
  };
}

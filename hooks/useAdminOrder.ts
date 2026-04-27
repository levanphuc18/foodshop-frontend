'use client';

import { useState, useCallback, useRef } from 'react';
import * as orderApi from '@/lib/api/orders';
import { getErrorMessage } from '@/lib/error';
import type { PageResponse } from '@/types/api';
import type { AdminOrderQuery } from '@/types/query';
import type { OrderResponse } from '@/types/order';
import { toast } from 'react-hot-toast';

export function useAdminOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [orderPage, setOrderPage] = useState<PageResponse<OrderResponse> | null>(null);
  const lastPageOptionsRef = useRef<AdminOrderQuery | null>(null);

  const applyPageData = (pageData: PageResponse<OrderResponse>) => {
    setOrders(Array.isArray(pageData?.content) ? pageData.content : []);
    setOrderPage(pageData);
  };

  const fetchAllOrders = useCallback(async () => {
    await fetchOrderPage({ page: 0, size: 100, sortBy: 'createdAt', sortDir: 'DESC' });
  }, []);

  const fetchOrderPage = useCallback(async (options: AdminOrderQuery = {}) => {
    setIsLoading(true);
    setErrorMsg('');
    lastPageOptionsRef.current = options;

    try {
      const response = await orderApi.getOrderPage(options);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tai danh sach don hang');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi ket noi den server'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setIsLoading(true);
    try {
      const response = await orderApi.updateOrderStatus(id, status);
      if (response.code === 0) {
        toast.success(`Cap nhat trang thai don hang #${id} thanh cong`);
        if (lastPageOptionsRef.current) {
          await fetchOrderPage(lastPageOptionsRef.current);
        } else {
          await fetchAllOrders();
        }
        return true;
      }

      toast.error(response.message || 'Loi khi cap nhat trang thai');
      return false;
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Co loi xay ra'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMsg,
    orders,
    orderPage,
    fetchAllOrders,
    fetchOrderPage,
    updateStatus,
  };
}

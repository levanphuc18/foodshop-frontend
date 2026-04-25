'use client';

import { useState, useCallback, useRef } from 'react';
import * as orderApi from '@/lib/api/orders';
import type { PageResponse } from '@/types/api';
import type { OrderResponse } from '@/types/order';
import { toast } from 'react-hot-toast';

interface AdminOrderPageOptions {
  keyword?: string;
  status?: string;
  page?: number;
  size?: number;
  sortBy?: string;
  asc?: boolean;
}

export function useAdminOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [orderPage, setOrderPage] = useState<PageResponse<OrderResponse> | null>(null);
  const lastPageOptionsRef = useRef<AdminOrderPageOptions | null>(null);

  const applyPageData = (pageData: PageResponse<OrderResponse>) => {
    setOrders(Array.isArray(pageData?.content) ? pageData.content : []);
    setOrderPage(pageData);
  };

  const fetchAllOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await orderApi.getAllOrders();
      if (response.code === 0) {
        const dataArray = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setOrders(dataArray);
        setOrderPage(null);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách đơn hàng');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchOrderPage = useCallback(async (options: AdminOrderPageOptions = {}) => {
    setIsLoading(true);
    setErrorMsg('');
    lastPageOptionsRef.current = options;

    try {
      const response = await orderApi.getOrderPage(options);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách đơn hàng');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = async (id: number, status: string) => {
    setIsLoading(true);
    try {
      const response = await orderApi.updateOrderStatus(id, status);
      if (response.code === 0) {
        toast.success(`Cập nhật trạng thái đơn hàng #${id} thành công`);
        if (lastPageOptionsRef.current) {
          await fetchOrderPage(lastPageOptionsRef.current);
        } else {
          await fetchAllOrders();
        }
        return true;
      } else {
        toast.error(response.message || 'Lỗi khi cập nhật trạng thái');
        return false;
      }
    } catch (error: any) {
      toast.error(error.message || 'Có lỗi xảy ra');
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
    updateStatus
  };
}

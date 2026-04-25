'use client';

import { useState, useCallback } from 'react';
import * as orderApi from '@/lib/api/orders';
import type { OrderResponse } from '@/types/order';

export function useOrder() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [currentOrder, setCurrentOrder] = useState<OrderResponse | null>(null);

  const fetchMyOrders = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await orderApi.getMyOrders();
      if (response.code === 0) {
        setOrders(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách đơn hàng');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getOrderById = useCallback(async (id: number) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await orderApi.getOrderById(id);
      if (response.code === 0) {
        setCurrentOrder(response.data);
        return response.data;
      } else {
        setErrorMsg(response.message || 'Không tìm thấy thông tin đơn hàng');
        return null;
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi khi lấy thông tin đơn hàng');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    errorMsg,
    orders,
    currentOrder,
    fetchMyOrders,
    getOrderById
  };
}
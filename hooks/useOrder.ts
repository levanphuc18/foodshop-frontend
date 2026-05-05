'use client';

import { useState, useCallback } from 'react';
import * as orderApi from '@/lib/api/orders';
import { getErrorMessage } from '@/lib/error';
import type { OrderResponse } from '@/schemas/order';

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
        setErrorMsg(response.message || 'Loi khi tai danh sach don hang');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi ket noi den server'));
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
      }

      setErrorMsg(response.message || 'Khong tim thay thong tin don hang');
      return null;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi khi lay thong tin don hang'));
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
    getOrderById,
  };
}

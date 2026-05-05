'use client';

import { useState, useCallback } from 'react';
import * as reviewApi from '@/lib/api/reviews';
import { getErrorMessage } from '@/lib/error';
import type { ReviewRequest, ReviewResponse, ReviewStatusResponse, StarBreakdown } from '@/schemas/review';
import type { PageResponse } from '@/schemas/api';

export function useReview() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Product reviews state
  const [reviews, setReviews] = useState<PageResponse<ReviewResponse> | null>(null);
  const [starBreakdown, setStarBreakdown] = useState<StarBreakdown | null>(null);

  // Order review status state
  const [reviewStatus, setReviewStatus] = useState<ReviewStatusResponse | null>(null);

  const createReview = useCallback(async (request: ReviewRequest): Promise<ReviewResponse | null> => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const response = await reviewApi.createReview(request);
      if (response.code === 0) {
        return response.data;
      }
      setErrorMsg(response.message || 'Lỗi khi tạo đánh giá');
      return null;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Có lỗi khi tạo đánh giá'));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const updateReview = useCallback(async (reviewId: number, request: ReviewRequest): Promise<ReviewResponse | null> => {
    setIsSubmitting(true);
    setErrorMsg('');
    try {
      const response = await reviewApi.updateReview(reviewId, request);
      if (response.code === 0) {
        return response.data;
      }
      setErrorMsg(response.message || 'Lỗi khi cập nhật đánh giá');
      return null;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Có lỗi khi cập nhật đánh giá'));
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const fetchProductReviews = useCallback(async (
    productId: number,
    params: {
      rating?: number;
      withImages?: boolean;
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
    } = {}
  ) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await reviewApi.getProductReviews(productId, params);
      if (response.code === 0) {
        setReviews(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách đánh giá');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Có lỗi khi tải danh sách đánh giá'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchStarBreakdown = useCallback(async (productId: number) => {
    try {
      const response = await reviewApi.getStarBreakdown(productId);
      if (response.code === 0) {
        setStarBreakdown(response.data);
      }
    } catch {
      // Silent fail for breakdown
    }
  }, []);

  const fetchOrderReviewStatus = useCallback(async (orderId: number) => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const response = await reviewApi.getOrderReviewStatus(orderId);
      if (response.code === 0) {
        setReviewStatus(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải trạng thái đánh giá');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Có lỗi khi tải trạng thái đánh giá'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    isSubmitting,
    errorMsg,
    reviews,
    starBreakdown,
    reviewStatus,
    createReview,
    updateReview,
    fetchProductReviews,
    fetchStarBreakdown,
    fetchOrderReviewStatus,
  };
}

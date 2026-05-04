'use client';

import { useState, useCallback } from 'react';
import * as reviewApi from '@/lib/api/reviews';
import { getErrorMessage } from '@/lib/error';
import type { ReviewRequest, ReviewResponse, ReviewStatusResponse, StarBreakdown } from '@/types/review';
import type { PageResponse } from '@/types/api';

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
      setErrorMsg(response.message || 'Loi khi tao danh gia');
      return null;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi khi tao danh gia'));
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
      setErrorMsg(response.message || 'Loi khi cap nhat danh gia');
      return null;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi khi cap nhat danh gia'));
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
        setErrorMsg(response.message || 'Loi khi tai danh sach danh gia');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi khi tai danh sach danh gia'));
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
        setErrorMsg(response.message || 'Loi khi tai trang thai danh gia');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi khi tai trang thai danh gia'));
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

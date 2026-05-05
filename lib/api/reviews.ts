import type { ReviewRequest, ReviewResponse, ReviewStatusResponse, StarBreakdown } from '@/schemas/review';
import type { ApiResponse, PageResponse } from '@/schemas/api';
import { fetcher } from '@/lib/fetcher';

const buildReviewFormData = (request: ReviewRequest): FormData => {
  const formData = new FormData();
  formData.append('productId', request.productId.toString());
  formData.append('orderId', request.orderId.toString());
  formData.append('orderItemId', request.orderItemId.toString());
  formData.append('rating', request.rating.toString());
  if (request.comment) formData.append('comment', request.comment);
  
  if (request.imageUrls) {
    request.imageUrls.forEach(url => formData.append('imageUrls', url));
  }
  if (request.imageFiles) {
    request.imageFiles.forEach(file => formData.append('imageFiles', file));
  }
  return formData;
};

export const createReview = async (request: ReviewRequest): Promise<ApiResponse<ReviewResponse>> => {
  return await fetcher<ApiResponse<ReviewResponse>>('/reviews', {
    method: 'POST',
    body: buildReviewFormData(request),
  });
};

export const updateReview = async (reviewId: number, request: ReviewRequest): Promise<ApiResponse<ReviewResponse>> => {
  return await fetcher<ApiResponse<ReviewResponse>>(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: buildReviewFormData(request),
  });
};

export const getProductReviews = async (
  productId: number,
  params: {
    rating?: number;
    withImages?: boolean;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  } = {}
): Promise<ApiResponse<PageResponse<ReviewResponse>>> => {
  const query = new URLSearchParams();
  if (params.rating) query.set('rating', String(params.rating));
  if (params.withImages) query.set('withImages', 'true');
  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? 10));
  query.set('sortBy', params.sortBy ?? 'createdAt');
  query.set('sortDir', params.sortDir ?? 'DESC');

  return await fetcher<ApiResponse<PageResponse<ReviewResponse>>>(
    `/products/${productId}/reviews?${query.toString()}`,
    { method: 'GET' }
  );
};

export const getStarBreakdown = async (productId: number): Promise<ApiResponse<StarBreakdown>> => {
  return await fetcher<ApiResponse<StarBreakdown>>(
    `/products/${productId}/reviews/breakdown`,
    { method: 'GET' }
  );
};

export const getOrderReviewStatus = async (orderId: number): Promise<ApiResponse<ReviewStatusResponse>> => {
  return await fetcher<ApiResponse<ReviewStatusResponse>>(
    `/orders/${orderId}/reviews-status`,
    { method: 'GET' }
  );
};

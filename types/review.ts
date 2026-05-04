export interface ReviewRequest {
  productId: number;
  orderId: number;
  orderItemId: number;
  rating: number;
  comment?: string;
  imageUrls?: string[];
  imageFiles?: File[];
}

export interface ReviewResponse {
  reviewId: number;
  userId: number;
  username: string;
  fullName: string;
  maskedName: string;
  productId: number;
  productName: string;
  orderId: number;
  orderItemId: number;
  rating: number;
  comment: string;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemReviewStatus {
  orderItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  reviewed: boolean;
  review: ReviewResponse | null;
}

export interface ReviewStatusResponse {
  orderId: number;
  items: OrderItemReviewStatus[];
}

export type StarBreakdown = Record<string, number>;

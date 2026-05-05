import { z } from 'zod';

export const reviewRequestSchema = z.object({
  productId: z.number(),
  orderId: z.number(),
  orderItemId: z.number(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  imageUrls: z.array(z.string()).optional(),
  imageFiles: z.any().array().optional(),
});
export type ReviewRequest = z.infer<typeof reviewRequestSchema>;

export const reviewResponseSchema = z.object({
  reviewId: z.number(),
  userId: z.number(),
  username: z.string(),
  fullName: z.string(),
  maskedName: z.string(),
  productId: z.number(),
  productName: z.string(),
  orderId: z.number(),
  orderItemId: z.number(),
  rating: z.number(),
  comment: z.string(),
  imageUrls: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type ReviewResponse = z.infer<typeof reviewResponseSchema>;

export const orderItemReviewStatusSchema = z.object({
  orderItemId: z.number(),
  productId: z.number(),
  productName: z.string(),
  productImageUrl: z.string().nullable(),
  reviewed: z.boolean(),
  review: reviewResponseSchema.nullable(),
});
export type OrderItemReviewStatus = z.infer<typeof orderItemReviewStatusSchema>;

export const reviewStatusResponseSchema = z.object({
  orderId: z.number(),
  items: z.array(orderItemReviewStatusSchema),
});
export type ReviewStatusResponse = z.infer<typeof reviewStatusResponseSchema>;

export type StarBreakdown = Record<string, number>;

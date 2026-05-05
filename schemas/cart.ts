import { z } from 'zod';

export const cartItemRequestSchema = z.object({
  productId: z.number(),
  userId: z.number(),
  quantity: z.number().min(1, 'Số lượng phải ít nhất là 1'),
});
export type CartItemRequest = z.infer<typeof cartItemRequestSchema>;

export const cartItemResponseSchema = z.object({
  userId: z.number(),
  username: z.string(),
  productId: z.number(),
  productName: z.string(),
  productPrice: z.number(),
  productImageUrl: z.string().nullable(),
  quantity: z.number(),
});
export type CartItemResponse = z.infer<typeof cartItemResponseSchema>;

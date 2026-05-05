import { z } from 'zod';

export const orderStatusSchema = z.enum([
  'PENDING',
  'PAID',
  'CONFIRMED',
  'SHIPPED',
  'COMPLETED',
  'CANCELLED',
]);
export type OrderStatus = z.infer<typeof orderStatusSchema>;

export const orderRequestSchema = z.object({
  shippingAddress: z.string().min(1, 'Địa chỉ giao hàng không được để trống'),
  shippingNote: z.string().optional(),
  discountCode: z.string().optional(),
  discountCodes: z.array(z.string()).optional(),
});
export type OrderRequest = z.infer<typeof orderRequestSchema>;

export const orderItemResponseSchema = z.object({
  orderItemId: z.number(),
  productId: z.number(),
  productName: z.string(),
  productImageUrl: z.string().nullable(),
  price: z.number(),
  originalPrice: z.number(),
  quantity: z.number(),
  subtotal: z.number(),
});
export type OrderItemResponse = z.infer<typeof orderItemResponseSchema>;

export const orderResponseSchema = z.object({
  orderId: z.number(),
  shippingAddress: z.string(),
  shippingNote: z.string(),
  status: orderStatusSchema,
  createdAt: z.string(),
  totalAmount: z.number(),
  discountAmount: z.number(),
  shippingFee: z.number(),
  shippingDiscount: z.number(),
  finalAmount: z.number(),
  discountCode: z.string().nullable(),
  discountCodes: z.array(z.string()).optional(),
  userId: z.number(),
  username: z.string().nullable().optional(),
  fullName: z.string().nullable().optional(),
  orderItems: z.array(orderItemResponseSchema),
});
export type OrderResponse = z.infer<typeof orderResponseSchema>;

// Reuse the checkoutSchema if needed, or keep it separate in checkout.schema.ts
// For now, I'll keep checkout.schema.ts as it is specifically for the form.

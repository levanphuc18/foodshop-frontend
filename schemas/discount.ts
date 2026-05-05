import { z } from 'zod';

export const discountTypeSchema = z.enum(['ORDER', 'PRODUCT', 'SHIPPING']);
export const discountUnitSchema = z.enum(['PERCENT', 'AMOUNT']);
export const discountStatusSchema = z.enum(['ACTIVE', 'EXPIRED', 'DISABLED']);

export const discountResponseSchema = z.object({
  discountId: z.number(),
  code: z.string(),
  type: discountTypeSchema,
  discountUnit: discountUnitSchema,
  value: z.number(),
  minOrderAmount: z.number().optional(),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().nullable().optional(),
  usedCount: z.number(),
  perUserLimit: z.number().nullable().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: discountStatusSchema,
});
export type DiscountResponse = z.infer<typeof discountResponseSchema>;

export const discountRequestSchema = z.object({
  code: z.string().min(1, 'Mã giảm giá không được để trống'),
  type: discountTypeSchema,
  discountUnit: discountUnitSchema,
  value: z.number().min(0, 'Giá trị giảm giá không hợp lệ'),
  minOrderAmount: z.number().optional(),
  maxDiscount: z.number().optional(),
  usageLimit: z.number().optional(),
  perUserLimit: z.number().optional(),
  startDate: z.string(),
  endDate: z.string(),
  status: discountStatusSchema,
});
export type DiscountRequest = z.infer<typeof discountRequestSchema>;

export const couponValidationResponseSchema = z.object({
  valid: z.boolean(),
  code: z.string(),
  type: z.enum(['ORDER', 'SHIPPING']).optional(),
  discountUnit: discountUnitSchema.optional(),
  value: z.number().optional(),
  discountAmount: z.number().optional(),
  minOrderAmount: z.number().optional(),
  maxDiscount: z.number().optional(),
  message: z.string(),
});
export type CouponValidationResponse = z.infer<typeof couponValidationResponseSchema>;

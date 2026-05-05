import { z } from 'zod';

export const productStatusSchema = z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK']);

export const productRequestSchema = z.object({
  name: z.string()
    .min(3, 'Tên sản phẩm phải có ít nhất 3 ký tự')
    .max(200, 'Tên sản phẩm không được quá 200 ký tự'),
  description: z.string().optional(),
  price: z.number()
    .min(1, 'Giá tiền phải lớn hơn 0')
    .max(1_000_000_000, 'Giá tiền không được vượt quá 1 tỷ VNĐ'),
  quantity: z.number().min(0, 'Số lượng tồn kho không được âm'),
  imageFiles: z.any().array().optional().nullable(),
  discountId: z.number().nullable().optional(),
  categoryId: z.number().min(1, 'Vui lòng chọn một danh mục sản phẩm'),
  isActive: z.boolean().optional(),
});
export type ProductRequest = z.infer<typeof productRequestSchema>;

export const bulkAssignDiscountRequestSchema = z.object({
  productIds: z.array(z.number()),
  discountId: z.number().nullable(),
  replaceExisting: z.boolean().optional(),
});
export type BulkAssignDiscountRequest = z.infer<typeof bulkAssignDiscountRequestSchema>;

export const productResponseSchema = z.object({
  productId: z.number(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  salePrice: z.number().optional(),
  discountPercentage: z.number().optional(),
  discountType: z.string().nullable().optional(),
  discountUnit: z.string().nullable().optional(),
  quantity: z.number(),
  imageUrls: z.array(z.string()).nullable(),
  discountId: z.number().nullable(),
  discountEndDate: z.string().nullable().optional(),
  categoryId: z.number(),
  maxDiscount: z.number().nullable().optional(),
  productStatus: productStatusSchema,
  isActive: z.boolean(),
  averageRating: z.number(),
  totalReviews: z.number(),
});
export type ProductResponse = z.infer<typeof productResponseSchema>;

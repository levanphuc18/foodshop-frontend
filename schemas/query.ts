import { z } from 'zod';

export const sortDirSchema = z.enum(['ASC', 'DESC']);
export type SortDir = z.infer<typeof sortDirSchema>;

export const pageQuerySchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  size: z.number().optional(),
  sortBy: z.string().optional(),
  sortDir: sortDirSchema.optional(),
});
export type PageQuery = z.infer<typeof pageQuerySchema>;

export const adminOrderQuerySchema = pageQuerySchema.extend({
  status: z.string().optional(),
});
export type AdminOrderQuery = z.infer<typeof adminOrderQuerySchema>;

export const adminUserQuerySchema = pageQuerySchema.extend({
  role: z.string().optional(),
  enabled: z.boolean().optional(),
});
export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>;

export const adminDiscountQuerySchema = pageQuerySchema.extend({
  status: z.string().optional(),
  type: z.string().optional(),
});
export type AdminDiscountQuery = z.infer<typeof adminDiscountQuerySchema>;

export const productQuerySchema = pageQuerySchema.extend({
  categoryId: z.number().optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
});
export type ProductQuery = z.infer<typeof productQuerySchema>;

export const adminProductQuerySchema = productQuerySchema.extend({
  status: z.string().optional(),
  isActive: z.boolean().optional(),
});
export type AdminProductQuery = z.infer<typeof adminProductQuerySchema>;

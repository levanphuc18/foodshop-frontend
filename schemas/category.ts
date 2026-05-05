import { z } from 'zod';

export const categoryRequestSchema = z.object({
  name: z.string().min(1, 'Tên danh mục không được để trống'),
  description: z.string().optional(),
  imageFile: z.any().optional().nullable(), // For File object in browser
});
export type CategoryRequest = z.infer<typeof categoryRequestSchema>;

export const categoryResponseSchema = z.object({
  categoryId: z.number(),
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().nullable(),
  createdAt: z.string(),
});
export type CategoryResponse = z.infer<typeof categoryResponseSchema>;

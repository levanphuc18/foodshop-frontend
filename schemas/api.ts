import { z } from 'zod';

// ── Generic API Schemas & Types ──────────────────────────────────────────────

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export const pageResponseSchema = z.object({
  totalElements: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number(),
  first: z.boolean(),
  last: z.boolean(),
});

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  limit: number;
}

// Helper function to create a concrete Zod schema for ApiResponse
export const createApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    code: z.number(),
    message: z.string(),
    data: dataSchema,
  });

// Helper function to create a concrete Zod schema for PageResponse
export const createPageResponseSchema = <T extends z.ZodTypeAny>(contentSchema: T) =>
  pageResponseSchema.extend({
    content: z.array(contentSchema),
  });

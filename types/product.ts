export interface ProductRequest {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  imageFiles?: File[] | null;
  discountId?: number | null;
  categoryId: number;
  isActive?: boolean;
}

export interface ProductResponse {
  productId: number;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  /** "PRODUCT" nếu đang có discount product active, null nếu không */
  discountType?: string | null;
  /** "PERCENT" hoặc "AMOUNT", null nếu không có discount active */
  discountUnit?: string | null;
  quantity: number;
  imageUrls: string[] | null;
  discountId: number | null;
  categoryId: number;
  maxDiscount?: number | null;
  productStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  isActive: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  first: boolean;
  last: boolean;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

import type { ProductRequest, ProductResponse, BulkAssignDiscountRequest } from '@/schemas/product';
import type { ApiResponse, PageResponse } from '@/schemas/api';
import type { AdminProductQuery, ProductQuery } from '@/schemas/query';
import { fetcher } from '@/lib/fetcher';

type ProductQueryInput = ProductQuery & Partial<Pick<AdminProductQuery, 'status' | 'isActive'>>;

const buildProductQuery = (params: ProductQueryInput = {}, fallbackSize: number) => {
  const query = new URLSearchParams();

  if (params.search) query.set('search', params.search);
  if (params.categoryId != null) query.set('categoryId', String(params.categoryId));
  if (params.status && params.status !== 'ALL') query.set('status', params.status);
  if (typeof params.isActive === 'boolean') query.set('isActive', String(params.isActive));
  if (typeof params.minPrice === 'number') query.set('minPrice', String(params.minPrice));
  if (typeof params.maxPrice === 'number' && Number.isFinite(params.maxPrice)) query.set('maxPrice', String(params.maxPrice));

  query.set('page', String(params.page ?? 0));
  query.set('size', String(params.size ?? fallbackSize));
  query.set('sortBy', params.sortBy ?? 'productId');
  query.set('sortDir', params.sortDir ?? 'DESC');

  return query.toString();
};

const buildProductFormData = (request: ProductRequest): FormData => {
  const formData = new FormData();
  formData.append('name', request.name);
  if (request.description) formData.append('description', request.description);
  formData.append('price', (request.price || 0).toString());
  formData.append('quantity', (request.quantity || 0).toString());
  formData.append('categoryId', (request.categoryId || 0).toString());
  if (request.isActive !== undefined) {
    formData.append('isActive', request.isActive.toString());
  }

  if (request.discountId) {
    formData.append('discountId', request.discountId.toString());
  }

  if (request.imageFiles) {
    request.imageFiles.forEach((file: File) => {
      formData.append('imageFiles', file);
    });
  }

  return formData;
};

export const searchProducts = async (
  options: ProductQuery = {}
): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
  return await fetcher<ApiResponse<PageResponse<ProductResponse>>>(`/products?${buildProductQuery(options, 12)}`, {
    method: 'GET',
  });
};

export const searchProductsAdmin = async (
  options: AdminProductQuery = {}
): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
  return await fetcher<ApiResponse<PageResponse<ProductResponse>>>(`/admin/products?${buildProductQuery(options, 10)}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getAllProducts = async (): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
  return await fetcher<ApiResponse<PageResponse<ProductResponse>>>('/products?page=0&size=200&sortBy=productId&sortDir=DESC', {
    method: 'GET',
  });
};

export const getAllProductsAdmin = async (
  options: AdminProductQuery = {}
): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
  return await fetcher<ApiResponse<PageResponse<ProductResponse>>>(`/admin/products?${buildProductQuery(options, 10)}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const getProductById = async (id: number): Promise<ApiResponse<ProductResponse>> => {
  return await fetcher<ApiResponse<ProductResponse>>(`/products/${id}`, {
    method: 'GET',
  });
};

export const getProductByIdAdmin = async (id: number): Promise<ApiResponse<ProductResponse>> => {
  return await fetcher<ApiResponse<ProductResponse>>(`/admin/products/get/${id}`, {
    method: 'GET',
    cache: 'no-store'
  });
};

export const createProduct = async (request: ProductRequest): Promise<ApiResponse<ProductResponse>> => {
  const formData = buildProductFormData(request);

  return await fetcher<ApiResponse<ProductResponse>>('/admin/products', {
    method: 'POST',
    body: formData,
  });
};

export const updateProduct = async (id: number, request: ProductRequest): Promise<ApiResponse<ProductResponse>> => {
  const formData = buildProductFormData(request);

  return await fetcher<ApiResponse<ProductResponse>>(`/admin/products/${id}`, {
    method: 'PUT',
    body: formData,
  });
};

export const deleteProduct = async (id: number): Promise<ApiResponse<void>> => {
  return await fetcher<ApiResponse<void>>(`/admin/products/${id}`, {
    method: 'DELETE',
  });
};

export const bulkAssignDiscount = async (request: BulkAssignDiscountRequest): Promise<ApiResponse<void>> => {
  return await fetcher<ApiResponse<void>>('/admin/products/assign-discount', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getProductsByCategory = async (categoryId: number): Promise<ApiResponse<ProductResponse[]>> => {
  return await fetcher<ApiResponse<ProductResponse[]>>(`/products/category/${categoryId}`, {
    method: 'GET',
  });
};

export const getProductsByCategoryAdmin = async (categoryId: number): Promise<ApiResponse<ProductResponse[]>> => {
  return await fetcher<ApiResponse<ProductResponse[]>>(`/admin/products/category/${categoryId}`, {
    method: 'GET',
  });
};

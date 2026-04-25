import type { ProductRequest, ProductResponse, ApiResponse, PageResponse } from '@/types/product';
import { fetcher } from '@/lib/fetcher';

interface ProductPageParams {
  page?: number;
  size?: number;
  asc?: boolean;
  categoryId?: number;
}

// Build FormData for ProductRequest since it contains MultipartFile
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
    request.imageFiles.forEach((file) => {
      formData.append('imageFiles', file);
    });
  }

  return formData;
};

export const searchProducts = async (
  keyword?: string,
  options?: ProductPageParams
): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (options?.categoryId != null) params.append('categoryId', String(options.categoryId));
  params.append('page', String(options?.page ?? 0));
  params.append('size', String(options?.size ?? 12));
  params.append('asc', String(options?.asc ?? true));

  return await fetcher<ApiResponse<PageResponse<ProductResponse>>>(`/products/search?${params.toString()}`, {
    method: 'GET',
  });
};

export const searchProductsAdmin = async (
  keyword?: string,
  options?: ProductPageParams
): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
  const params = new URLSearchParams();
  if (keyword) params.append('keyword', keyword);
  if (options?.categoryId != null) params.append('categoryId', String(options.categoryId));
  params.append('page', String(options?.page ?? 0));
  params.append('size', String(options?.size ?? 10));
  params.append('asc', String(options?.asc ?? true));

  return await fetcher<ApiResponse<PageResponse<ProductResponse>>>(`/admin/products/search?${params.toString()}`, {
    method: 'GET',
  });
};

export const getAllProducts = async (): Promise<ApiResponse<ProductResponse[]>> => {
  return await fetcher<ApiResponse<ProductResponse[]>>('/products', {
    method: 'GET',
  });
};

export const getAllProductsAdmin = async (
  options?: ProductPageParams
): Promise<ApiResponse<PageResponse<ProductResponse>>> => {
  const params = new URLSearchParams();
  if (options?.categoryId != null) params.append('categoryId', String(options.categoryId));
  params.append('page', String(options?.page ?? 0));
  params.append('size', String(options?.size ?? 10));
  params.append('asc', String(options?.asc ?? false));

  return await fetcher<ApiResponse<PageResponse<ProductResponse>>>(`/admin/products?${params.toString()}`, {
    method: 'GET',
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

  // fetcher automatically handles FormData and doesn't force Content-Type: application/json
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

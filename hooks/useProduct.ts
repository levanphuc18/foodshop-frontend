'use client';

import { useState, useCallback } from 'react';
import * as productApi from '@/lib/api/product';
import type { PageResponse, ProductRequest, ProductResponse } from '@/types/product';

interface ProductPageOptions {
  keyword?: string;
  page?: number;
  size?: number;
  asc?: boolean;
  categoryId?: number;
}

export function useProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State for holding product list/details
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [currentProduct, setCurrentProduct] = useState<ProductResponse | null>(null);
  const [productPage, setProductPage] = useState<PageResponse<ProductResponse> | null>(null);

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const applyPageData = (pageData: PageResponse<ProductResponse>) => {
    setProducts(Array.isArray(pageData?.content) ? pageData.content : []);
    setProductPage(pageData);
  };

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.getAllProducts();
      if (response.code === 0) {
        const dataArray = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setProducts(dataArray);
        setProductPage(null);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách sản phẩm');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi xảy ra kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProductsAdmin = useCallback(async () => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.getAllProductsAdmin();
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách sản phẩm (Admin)');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi khi tải danh sách sản phẩm (Admin)');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (keyword?: string) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.searchProducts(keyword);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tìm kiếm sản phẩm');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi khi tìm kiếm sản phẩm');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProductsAdmin = useCallback(async (keyword?: string) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.searchProductsAdmin(keyword);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tìm kiếm sản phẩm (Admin)');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi khi tìm kiếm sản phẩm (Admin)');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProductPage = useCallback(async (options: ProductPageOptions = {}) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.searchProducts(options.keyword, options);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách sản phẩm');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi xảy ra kết nối đến server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAdminProductPage = useCallback(async (options: ProductPageOptions = {}) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = options.keyword
        ? await productApi.searchProductsAdmin(options.keyword, options)
        : await productApi.getAllProductsAdmin(options);

      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách sản phẩm (Admin)');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi khi tải danh sách sản phẩm (Admin)');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductById = useCallback(async (id: number) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.getProductById(id);
      if (response.code === 0) {
        setCurrentProduct(response.data);
        return response.data;
      } else {
        setErrorMsg(response.message || 'Không tìm thấy sản phẩm');
        return null;
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi khi lấy thông tin sản phẩm');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductByIdAdmin = useCallback(async (id: number) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.getProductByIdAdmin(id);
      if (response && response.code === 0) {
        setCurrentProduct(response.data);
        return response.data;
      } else {
        setErrorMsg(response?.message || 'Không tìm thấy sản phẩm (Admin)');
        return null;
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi lấy thông tin sản phẩm (Admin)');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductsByCategory = useCallback(async (categoryId: number) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.getProductsByCategory(categoryId);
      if (response.code === 0) {
        const dataArray = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setProducts(dataArray);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách sản phẩm theo danh mục');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi hệ thống');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getProductsByCategoryAdmin = useCallback(async (categoryId: number) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.getProductsByCategoryAdmin(categoryId);
      if (response.code === 0) {
        const dataArray = Array.isArray(response.data) ? response.data : (response.data?.content || []);
        setProducts(dataArray);
      } else {
        setErrorMsg(response.message || 'Lỗi khi tải danh sách sản phẩm theo danh mục (Admin)');
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi hệ thống');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createProduct = async (data: ProductRequest) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.createProduct(data);
      if (response.code === 0) {
        setSuccessMsg('Thêm sản phẩm thành công!');
        return true;
      } else {
        setErrorMsg(response.message || 'Thêm sản phẩm thất bại');
        return false;
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Có lỗi kết nối máy chủ');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (id: number, data: ProductRequest) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.updateProduct(id, data);
      if (response.code === 0) {
        setSuccessMsg('Cập nhật sản phẩm thành công!');
        return true;
      } else {
        setErrorMsg(response.message || 'Cập nhật thất bại');
        return false;
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Lỗi cập nhật sản phẩm');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.deleteProduct(id);
      if (response.code === 0) {
        setSuccessMsg('Xóa sản phẩm thành công!');
        setProducts(prev => prev.filter(p => p.productId !== id));
        return { success: true };
      } else {
        const msg = response.message || 'Thất bại khi xóa sản phẩm';
        setErrorMsg(msg);
        return { success: false, message: msg };
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || error.message || 'Lỗi xóa sản phẩm';
      setErrorMsg(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    errorMsg,
    successMsg,
    setErrorMsg,
    setSuccessMsg,

    // States
    products,
    currentProduct,
    productPage,

    // Actions
    fetchProducts,
    fetchProductsAdmin,
    fetchProductPage,
    fetchAdminProductPage,
    searchProducts,
    searchProductsAdmin,
    getProductById,
    getProductByIdAdmin,
    getProductsByCategory,
    getProductsByCategoryAdmin,
    createProduct,
    updateProduct,
    deleteProduct
  };
}

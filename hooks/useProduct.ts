'use client';

import { useState, useCallback } from 'react';
import * as productApi from '@/lib/api/product';
import { getErrorMessage } from '@/lib/error';
import type { BulkAssignDiscountRequest, PageResponse, ProductRequest, ProductResponse } from '@/types/product';
import type { AdminProductQuery, ProductQuery } from '@/types/query';

export function useProduct() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

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
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tai danh sach san pham');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi xay ra ket noi den server'));
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
        setErrorMsg(response.message || 'Loi khi tai danh sach san pham (Admin)');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi khi tai danh sach san pham (Admin)'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProducts = useCallback(async (search?: string) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.searchProducts({ search });
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tim kiem san pham');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi khi tim kiem san pham'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchProductsAdmin = useCallback(async (search?: string) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.searchProductsAdmin({ search });
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tim kiem san pham (Admin)');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi khi tim kiem san pham (Admin)'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchProductPage = useCallback(async (options: ProductQuery = {}) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.searchProducts(options);
      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tai danh sach san pham');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi xay ra ket noi den server'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAdminProductPage = useCallback(async (options: AdminProductQuery = {}) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.getAllProductsAdmin(options);

      if (response.code === 0) {
        applyPageData(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tai danh sach san pham (Admin)');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi khi tai danh sach san pham (Admin)'));
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
      }

      setErrorMsg(response.message || 'Khong tim thay san pham');
      return null;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi khi lay thong tin san pham'));
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
      }

      setErrorMsg(response?.message || 'Khong tim thay san pham (Admin)');
      return null;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi lay thong tin san pham (Admin)'));
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
        setProducts(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tai danh sach san pham theo danh muc');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi he thong'));
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
        setProducts(response.data);
      } else {
        setErrorMsg(response.message || 'Loi khi tai danh sach san pham theo danh muc (Admin)');
      }
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi he thong'));
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
        setSuccessMsg('Them san pham thanh cong!');
        return true;
      }

      setErrorMsg(response.message || 'Them san pham that bai');
      return false;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Co loi ket noi may chu'));
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
        setSuccessMsg('Cap nhat san pham thanh cong!');
        return true;
      }

      setErrorMsg(response.message || 'Cap nhat that bai');
      return false;
    } catch (error: unknown) {
      setErrorMsg(getErrorMessage(error, 'Loi cap nhat san pham'));
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
        setSuccessMsg('Xoa san pham thanh cong!');
        setProducts((prev) => prev.filter((p) => p.productId !== id));
        return { success: true };
      }

      const msg = response.message || 'That bai khi xoa san pham';
      setErrorMsg(msg);
      return { success: false, message: msg };
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Loi xoa san pham');
      setErrorMsg(msg);
      return { success: false, message: msg };
    } finally {
      setIsLoading(false);
    }
  };

  const bulkAssignDiscount = async (request: BulkAssignDiscountRequest) => {
    setIsLoading(true);
    clearMessages();
    try {
      const response = await productApi.bulkAssignDiscount(request);
      if (response.code === 0) {
        setSuccessMsg(response.message || 'Gan ma giam gia thanh cong!');
        return { success: true, message: response.message };
      }

      const msg = response.message || 'Gan ma giam gia that bai';
      setErrorMsg(msg);
      return { success: false, message: msg };
    } catch (error: unknown) {
      const msg = getErrorMessage(error, 'Loi gan ma giam gia cho san pham');
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
    products,
    currentProduct,
    productPage,
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
    deleteProduct,
    bulkAssignDiscount,
  };
}

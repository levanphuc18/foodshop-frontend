'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import StatsCard from '@/components/admin/StatsCard';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';
import { toast } from 'react-hot-toast';
import ProductDetailModal from '@/components/admin/ProductDetailModal';
import ConfirmModal from '@/components/admin/ConfirmModal';
import AssignDiscountModal from '@/components/admin/AssignDiscountModal';
import { ProductResponse } from '@/schemas/product';
import { formatPrice } from '@/lib/utils';

const productStatusStyles: Record<string, string> = {
  IN_STOCK: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  LOW_STOCK: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  OUT_OF_STOCK: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

const productStatusLabels: Record<string, string> = {
  IN_STOCK: 'Còn hàng',
  LOW_STOCK: 'Sắp hết',
  OUT_OF_STOCK: 'Hết hàng',
};

const sortMap: Record<string, { sortBy: string; sortDir: 'ASC' | 'DESC' }> = {
  newest: { sortBy: 'productId', sortDir: 'DESC' },
  name: { sortBy: 'name', sortDir: 'ASC' },
  'price-high': { sortBy: 'price', sortDir: 'DESC' },
  'price-low': { sortBy: 'price', sortDir: 'ASC' },
  'stock-high': { sortBy: 'quantity', sortDir: 'DESC' },
  'stock-low': { sortBy: 'quantity', sortDir: 'ASC' },
};

export default function AdminProducts() {
  const { products, productPage, fetchAdminProductPage, deleteProduct, bulkAssignDiscount, isLoading } = useProduct();
  const { categories, fetchCategories } = useCategory();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [stockFilter, setStockFilter] = useState('ALL');
  const [visibilityFilter, setVisibilityFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  const [viewProduct, setViewProduct] = useState<ProductResponse | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedProductIds, setSelectedProductIds] = useState<number[]>([]);
  const [isAssignDiscountOpen, setIsAssignDiscountOpen] = useState(false);

  const selectedSort = sortMap[sortBy] ?? sortMap.newest;
  const selectedProducts = products.filter((product) => selectedProductIds.includes(product.productId));
  const allCurrentPageSelected = products.length > 0 && products.every((product) => selectedProductIds.includes(product.productId));

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const loadProducts = () =>
    fetchAdminProductPage({
      search: searchTerm.trim() || undefined,
      categoryId: selectedCategory ? Number(selectedCategory) : undefined,
      status: stockFilter === 'ALL' ? undefined : stockFilter,
      isActive:
        visibilityFilter === 'ALL'
          ? undefined
          : visibilityFilter === 'PUBLIC',
      page: currentPage,
      size: 10,
      sortBy: selectedSort.sortBy,
      sortDir: selectedSort.sortDir,
    });

  useEffect(() => {
    const timer = setTimeout(loadProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchAdminProductPage, searchTerm, selectedCategory, stockFilter, visibilityFilter, currentPage, sortBy]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCategory, stockFilter, visibilityFilter, sortBy]);

  useEffect(() => {
    setSelectedProductIds((prev) => prev.filter((id) => products.some((product) => product.productId === id)));
  }, [products]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteProduct(deleteId);
    if (result.success) {
      toast.success(`Đã xóa sản phẩm ${deleteName}`);
      setDeleteId(null);
      loadProducts();
    } else {
      toast.error(result.message || 'Không thể xóa sản phẩm này');
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSelectCurrentPage = () => {
    setSelectedProductIds((prev) => {
      if (allCurrentPageSelected) {
        return prev.filter((id) => !products.some((product) => product.productId === id));
      }

      const next = new Set(prev);
      products.forEach((product) => next.add(product.productId));
      return Array.from(next);
    });
  };

  const handleBulkAssignDiscount = async ({
    discountId,
    replaceExisting,
  }: {
    discountId: number | null;
    replaceExisting: boolean;
  }) => {
    if (selectedProductIds.length === 0) {
      toast.error('Hãy chọn ít nhất một sản phẩm');
      return;
    }

    const result = await bulkAssignDiscount({
      productIds: selectedProductIds,
      discountId,
      replaceExisting,
    });

    if (!result.success) {
      toast.error(result.message || 'Không thể áp dụng mã giảm giá');
      return;
    }

    toast.success(discountId == null ? 'Đã gỡ bỏ giảm giá cho sản phẩm đã chọn' : 'Đã áp dụng mã giảm giá cho sản phẩm đã chọn');
    setIsAssignDiscountOpen(false);
    setSelectedProductIds([]);
    loadProducts();
  };

  const getCategoryName = (id: number) => {
    const category = categories.find((c) => c.categoryId === id);
    return category ? category.name : 'Chưa phân loại';
  };

  const visibleCount = products.filter((p) => p.isActive).length;
  const hiddenCount = products.filter((p) => !p.isActive).length;

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="Danh mục"
        title="Kho hàng"
        description="Quản lý sản phẩm, tồn kho và vận hành."
        action={
          <Link href="/admin/products/create" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 active:scale-95 transition-all shadow-lg shadow-sky-600/20 shrink-0">
            <span className="material-symbols-outlined text-lg">add</span>
            Thêm sản phẩm
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon="inventory_2" label="Tổng sản phẩm" value={String(productPage?.totalElements ?? products.length)} sub="Kết quả từ hệ thống" toneClassName="text-sky-600 bg-sky-50 dark:bg-sky-900/20" />
        <StatsCard icon="check_circle" label="Đang hiển thị" value={String(visibleCount)} sub="Trang hiện tại" toneClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        <StatsCard icon="visibility_off" label="Đang ẩn" value={String(hiddenCount)} sub="Trang hiện tại" toneClassName="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
        <StatsCard icon="warning" label="Sắp hết / Hết hàng" value={String(products.filter((p) => p.productStatus !== 'IN_STOCK').length)} sub="Trang hiện tại" toneClassName="text-red-500 bg-red-50 dark:bg-red-900/20" />
      </div>

      <Panel className="overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Tất cả sản phẩm
            </h2>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <button
                type="button"
                onClick={() => setIsAssignDiscountOpen(true)}
                disabled={selectedProductIds.length === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-sky-700 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-sky-800/70 dark:bg-sky-900/20 dark:text-sky-300 dark:hover:bg-sky-900/30"
              >
                <span className="material-symbols-outlined text-[18px]">sell</span>
                Áp dụng giảm giá ({selectedProductIds.length})
              </button>
              <form className="relative flex-1 min-w-[200px] lg:w-64" onSubmit={(e) => e.preventDefault()}>
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-all z-10 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã sản phẩm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </form>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="IN_STOCK">Còn hàng</option>
                <option value="LOW_STOCK">Sắp hết</option>
                <option value="OUT_OF_STOCK">Hết hàng</option>
              </select>

              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả hiển thị</option>
                <option value="PUBLIC">Công khai</option>
                <option value="HIDDEN">Đang ẩn</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-xl text-[11px] font-black uppercase text-sky-700 dark:text-sky-300 focus:outline-none"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="name">Sắp xếp: Tên A-Z</option>
                <option value="price-high">Giá: Cao → Thấp</option>
                <option value="price-low">Giá: Thấp → Cao</option>
                <option value="stock-high">Tồn kho: Nhiều → Ít</option>
                <option value="stock-low">Tồn kho: Ít → Nhiều</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-4 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={allCurrentPageSelected}
                    onChange={toggleSelectCurrentPage}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    aria-label="Select current page products"
                  />
                </th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Sản phẩm</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Danh mục</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Giá</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Tồn kho</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Giảm giá</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center">Hiển thị</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Trạng thái</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Không tìm thấy sản phẩm phù hợp với tiêu chí tìm kiếm.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isDiscounted = p.salePrice != null && p.salePrice < p.price;
                  const isSelected = selectedProductIds.includes(p.productId);

                  return (
                    <tr key={p.productId} className={`transition-colors group ${isSelected ? 'bg-sky-50/70 dark:bg-sky-950/20' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/30'}`}>
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProductSelection(p.productId)}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          aria-label={`Select ${p.name}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0 relative">
                            <img src={p.imageUrls?.[0] || 'https://placehold.co/400'} alt={p.name} className="w-full h-full object-cover" />
                            {isDiscounted && p.discountPercentage && (
                              <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded-bl-lg">
                                -{p.discountPercentage}%
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</div>
                            <div className="text-[11px] text-slate-400 font-medium">ID: #{p.productId}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{getCategoryName(p.categoryId)}</td>
                      <td className="px-6 py-4">
                        {isDiscounted ? (
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatPrice(p.salePrice!)}</span>
                            <span className="text-[11px] font-medium text-slate-400 line-through">{formatPrice(p.price)}</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-slate-900 dark:text-white">{p.quantity}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{productStatusLabels[p.productStatus]}</div>
                      </td>
                      <td className="px-6 py-4">
                        {/* BUG FIX: Ẩn discount đã hết hạn – kiểm tra discountEndDate trước khi hiển thị */}
                        {(() => {
                          const isExpiredDiscount = p.discountEndDate
                            ? (() => {
                                const now = new Date();
                                now.setHours(0, 0, 0, 0);
                                const end = new Date(p.discountEndDate);
                                end.setHours(0, 0, 0, 0);
                                return end < now;
                              })()
                            : false;

                          if (p.discountId != null && !isExpiredDiscount) {
                            return (
                              <div className="space-y-1">
                                <div className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-sky-700 dark:bg-sky-900/30 dark:text-sky-300">
                                  Discount #{p.discountId}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {p.discountUnit === 'PERCENT' && p.discountPercentage != null
                                    ? `Giảm ${p.discountPercentage}%`
                                    : p.salePrice != null
                                      ? `Giảm ${formatPrice(p.price - p.salePrice)}`
                                      : 'Giảm giá sản phẩm'}
                                </div>
                              </div>
                            );
                          }
                          return <span className="text-sm text-slate-400 dark:text-slate-500">Không có</span>;
                        })()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {p.isActive ? (
                            <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                              Công khai
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-400">
                              Đang ẩn
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${productStatusStyles[p.productStatus]}`}>
                          {productStatusLabels[p.productStatus]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => setViewProduct(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                          >
                            <span className="material-symbols-outlined text-lg">visibility</span>
                          </button>
                          <Link
                            href={`/admin/products/${p.productId}`}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                          >
                            <span className="material-symbols-outlined text-lg">edit</span>
                          </Link>
                          <button
                            type="button"
                            onClick={() => {
                              setDeleteId(p.productId);
                              setDeleteName(p.name);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/30">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
            Hiển thị {products.length === 0 ? 0 : (productPage?.currentPage ?? 0) * (productPage?.pageSize ?? products.length) + 1}
            -
            {products.length === 0 ? 0 : (productPage?.currentPage ?? 0) * (productPage?.pageSize ?? products.length) + products.length}
            {' '}/ {productPage?.totalElements ?? products.length} sản phẩm
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={productPage?.first || isLoading}
              onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
              Trang {(productPage?.currentPage ?? 0) + 1} / {Math.max(productPage?.totalPages ?? 1, 1)}
            </span>
            <button
              type="button"
              disabled={productPage?.last || isLoading}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        </div>
      </Panel>

      <ProductDetailModal product={viewProduct} onClose={() => setViewProduct(null)} categories={categories} />
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa "${deleteName}" không?`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
      <AssignDiscountModal
        isOpen={isAssignDiscountOpen}
        onClose={() => setIsAssignDiscountOpen(false)}
        onConfirm={handleBulkAssignDiscount}
        isLoading={isLoading}
        selectedProducts={selectedProducts}
      />
    </div>
  );
}

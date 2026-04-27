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
import { ProductResponse } from '@/types/product';
import { formatPrice } from '@/lib/utils';

const productStatusStyles: Record<string, string> = {
  IN_STOCK: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  LOW_STOCK: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  OUT_OF_STOCK: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

const productStatusLabels: Record<string, string> = {
  IN_STOCK: 'In Stock',
  LOW_STOCK: 'Low Stock',
  OUT_OF_STOCK: 'Out of Stock',
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
  const { products, productPage, fetchAdminProductPage, deleteProduct, isLoading } = useProduct();
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

  const selectedSort = sortMap[sortBy] ?? sortMap.newest;

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

  const confirmDelete = async () => {
    if (!deleteId) return;
    const result = await deleteProduct(deleteId);
    if (result.success) {
      toast.success(`Da xoa san pham ${deleteName}`);
      setDeleteId(null);
      loadProducts();
    } else {
      toast.error(result.message || 'Khong the xoa san pham nay');
    }
  };

  const getCategoryName = (id: number) => {
    const category = categories.find((c) => c.categoryId === id);
    return category ? category.name : 'Uncategorized';
  };

  const visibleCount = products.filter((p) => p.isActive).length;
  const hiddenCount = products.filter((p) => !p.isActive).length;

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="Catalog"
        title="Inventory Stock"
        description="Manage your artisanal preservation stock and logistics."
        action={
          <Link href="/admin/products/create" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 active:scale-95 transition-all shadow-lg shadow-sky-600/20 shrink-0">
            <span className="material-symbols-outlined text-lg">add</span>
            Add Product
          </Link>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard icon="inventory_2" label="Total Products" value={String(productPage?.totalElements ?? products.length)} sub="Matched backend results" toneClassName="text-sky-600 bg-sky-50 dark:bg-sky-900/20" />
        <StatsCard icon="check_circle" label="Visible On Page" value={String(visibleCount)} sub="Current page snapshot" toneClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        <StatsCard icon="visibility_off" label="Hidden On Page" value={String(hiddenCount)} sub="Current page snapshot" toneClassName="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
        <StatsCard icon="warning" label="Low Or Empty" value={String(products.filter((p) => p.productStatus !== 'IN_STOCK').length)} sub="Current page snapshot" toneClassName="text-red-500 bg-red-50 dark:bg-red-900/20" />
      </div>

      <Panel className="overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              All Products
            </h2>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <form className="relative flex-1 min-w-[200px] lg:w-64" onSubmit={(e) => e.preventDefault()}>
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-all z-10 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
                <input
                  type="text"
                  placeholder="Search name or product ID..."
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
                <option value="">All Categories</option>
                {categories.map((c) => <option key={c.categoryId} value={c.categoryId}>{c.name}</option>)}
              </select>

              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                <option value="IN_STOCK">In Stock</option>
                <option value="LOW_STOCK">Low Stock</option>
                <option value="OUT_OF_STOCK">Out of Stock</option>
              </select>

              <select
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Visibility</option>
                <option value="PUBLIC">Public</option>
                <option value="HIDDEN">Hidden</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-xl text-[11px] font-black uppercase text-sky-700 dark:text-sky-300 focus:outline-none"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="name">Sort: Name A-Z</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
                <option value="stock-high">Stock: High to Low</option>
                <option value="stock-low">Stock: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Product</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Category</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Price</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Stock</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center">Visibility</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-sm font-medium text-slate-400">Loading products...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    No products found matching your criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isDiscounted = p.salePrice != null && p.salePrice < p.price;

                  return (
                    <tr key={p.productId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group">
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
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center">
                          {p.isActive ? (
                            <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                              Public
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-400">
                              Hidden
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
            Showing {products.length === 0 ? 0 : (productPage?.currentPage ?? 0) * (productPage?.pageSize ?? products.length) + 1}
            -
            {products.length === 0 ? 0 : (productPage?.currentPage ?? 0) * (productPage?.pageSize ?? products.length) + products.length}
            {' '}of {productPage?.totalElements ?? products.length} products
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={productPage?.first || isLoading}
              onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
              Page {(productPage?.currentPage ?? 0) + 1} / {Math.max(productPage?.totalPages ?? 1, 1)}
            </span>
            <button
              type="button"
              disabled={productPage?.last || isLoading}
              onClick={() => setCurrentPage((page) => page + 1)}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </Panel>

      <ProductDetailModal product={viewProduct} onClose={() => setViewProduct(null)} categories={categories} />
      <ConfirmModal
        isOpen={deleteId !== null}
        title="Delete Product"
        message={`Are you sure you want to remove "${deleteName}"?`}
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
    </div>
  );
}

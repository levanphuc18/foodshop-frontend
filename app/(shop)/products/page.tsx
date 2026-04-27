'use client';

import { useEffect, useMemo, useState } from 'react';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';
import { useCart } from '@/hooks/useCart';
import { formatPrice } from '@/lib/utils';
import type { ProductResponse } from '@/types/product';
import type { CategoryResponse } from '@/types/category';
import ProductGridCard from './_components/ProductGridCard';
import ProductListCard from './_components/ProductListCard';
import type { ProductListItem } from './_components/types';

const PRICE_RANGES = [
  { label: `Under ${formatPrice(50000)}`, min: 0, max: 50000 },
  { label: `${formatPrice(50000)} - ${formatPrice(100000)}`, min: 50000, max: 100000 },
  { label: `${formatPrice(100000)} - ${formatPrice(300000)}`, min: 100000, max: 300000 },
  { label: `Over ${formatPrice(300000)}`, min: 300000, max: Infinity },
];

const sortMap: Record<string, { sortBy: string; sortDir: 'ASC' | 'DESC' }> = {
  featured: { sortBy: 'productId', sortDir: 'DESC' },
  'price-asc': { sortBy: 'price', sortDir: 'ASC' },
  'price-desc': { sortBy: 'price', sortDir: 'DESC' },
  name: { sortBy: 'name', sortDir: 'ASC' },
};

export default function ProductsPage() {
  const { products, productPage, fetchProductPage, isLoading: productsLoading } = useProduct();
  const { categories, fetchCategories, isLoading: categoriesLoading } = useCategory();
  const { addToCart } = useCart();

  const [search, setSearch] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const selectedSort = sortMap[sortBy] ?? sortMap.featured;
  const selectedPriceRange = priceRange !== null ? PRICE_RANGES[priceRange] : null;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProductPage({
        search: search.trim() || undefined,
        categoryId: activeCategoryId ?? undefined,
        minPrice: selectedPriceRange?.min,
        maxPrice: selectedPriceRange && Number.isFinite(selectedPriceRange.max) ? selectedPriceRange.max : undefined,
        page: currentPage,
        size: 12,
        sortBy: selectedSort.sortBy,
        sortDir: selectedSort.sortDir,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [fetchProductPage, search, activeCategoryId, selectedPriceRange, currentPage, sortBy]);

  useEffect(() => {
    setCurrentPage(0);
  }, [search, activeCategoryId, priceRange, sortBy]);

  const isLoading = productsLoading || categoriesLoading;
  const categoryMap = buildCategoryMap(categories);
  const mappedProducts = useMemo(() => mapProducts(products, categoryMap), [products, categoryMap]);

  const activeCategoryName = activeCategoryId ? categoryMap[activeCategoryId] : 'All Products';
  const activeFiltersCount = (activeCategoryId ? 1 : 0) + (priceRange !== null ? 1 : 0) + (search ? 1 : 0);

  const clearAll = () => {
    setActiveCategoryId(null);
    setPriceRange(null);
    setSearch('');
  };

  const toggleWishlist = (id: string) => {
    setWishlist((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950">
      <section className="border-b border-slate-200/70 dark:border-slate-800 bg-white dark:bg-slate-950">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 lg:py-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-600 mb-3">DrySea Collection</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
                Curated seafood for daily cooking and premium gifting
              </h1>
              <p className="mt-4 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-7">
                Browse by category, compare pricing quickly, and add to cart without leaving the list.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 w-full lg:w-auto lg:min-w-[420px]">
              <StatTile label="Matched" value={String(productPage?.totalElements ?? mappedProducts.length)} />
              <StatTile label="In Stock" value={String(mappedProducts.filter((product) => product.inStock).length)} />
              <StatTile label="Categories" value={String(categories.length)} />
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="flex-1 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name..."
                className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-sm"
              />
              {search ? (
                <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => setShowMobileFilters((open) => !open)}
              className="lg:hidden h-12 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">tune</span>
              Filters
              {activeFiltersCount > 0 ? <span className="text-sky-600">({activeFiltersCount})</span> : null}
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-sm">
              <button type="button" onClick={() => setViewMode('grid')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}>
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
              </button>
              <button type="button" onClick={() => setViewMode('list')} className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-slate-700'}`}>
                <span className="material-symbols-outlined text-[20px]">view_list</span>
              </button>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500/20 shadow-sm cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A-Z</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-[18px]">expand_more</span>
            </div>
          </div>
        </div>

        <div className="flex gap-8 items-start">
          <aside className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-72 shrink-0`}>
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 lg:sticky lg:top-28">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white">Refine Results</p>
                  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">{activeCategoryName}</p>
                </div>
                {activeFiltersCount > 0 ? (
                  <button type="button" onClick={clearAll} className="text-[11px] font-black uppercase tracking-widest text-red-500 hover:text-red-600">
                    Clear
                  </button>
                ) : null}
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Category</h2>
                  <div className="space-y-1">
                    <FilterButton active={activeCategoryId === null} onClick={() => setActiveCategoryId(null)} label="All Products" />
                    {categories.map((category) => (
                      <FilterButton
                        key={category.categoryId}
                        active={activeCategoryId === category.categoryId}
                        onClick={() => setActiveCategoryId(category.categoryId)}
                        label={category.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Price Range</h2>
                  <div className="space-y-1">
                    {PRICE_RANGES.map((range, index) => (
                      <FilterButton
                        key={range.label}
                        active={priceRange === index}
                        onClick={() => setPriceRange(priceRange === index ? null : index)}
                        label={range.label}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400 mb-3">Quick View</h2>
                  <div className="grid grid-cols-2 gap-2">
                    <MiniStat label="On Page" value={String(mappedProducts.length)} />
                    <MiniStat label="Ready" value={String(mappedProducts.filter((product) => product.inStock).length)} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-5">
              {activeCategoryId !== null ? (
                <ActiveChip label={activeCategoryName} onRemove={() => setActiveCategoryId(null)} />
              ) : null}
              {selectedPriceRange ? (
                <ActiveChip label={selectedPriceRange.label} onRemove={() => setPriceRange(null)} />
              ) : null}
              {search ? <ActiveChip label={`"${search}"`} onRemove={() => setSearch('')} /> : null}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-black text-slate-900 dark:text-white">{productPage?.totalElements ?? mappedProducts.length}</span> products matched
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Showing <span className="font-black text-slate-900 dark:text-white">{mappedProducts.length}</span> items on this page
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-24">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent" />
              </div>
            ) : mappedProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-5xl text-slate-200 dark:text-slate-700 mb-4">search_off</span>
                <p className="text-base font-black text-slate-900 dark:text-white mb-1">No products found</p>
                <p className="text-sm text-slate-400 mb-6">Try a different category, price range, or search keyword.</p>
                <button type="button" onClick={clearAll} className="px-6 py-2.5 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all">
                  Clear Filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {mappedProducts.map((product) => (
                  <ProductGridCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlist.includes(product.id)}
                    onWishlist={() => toggleWishlist(product.id)}
                    onAddToCart={() =>
                      addToCart(Number(product.id), 1, {
                        productName: product.title,
                        productPrice: product.price,
                        productImageUrl: product.img,
                      })
                    }
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {mappedProducts.map((product) => (
                  <ProductListCard
                    key={product.id}
                    product={product}
                    isWishlisted={wishlist.includes(product.id)}
                    onWishlist={() => toggleWishlist(product.id)}
                    onAddToCart={() =>
                      addToCart(Number(product.id), 1, {
                        productName: product.title,
                        productPrice: product.price,
                        productImageUrl: product.img,
                      })
                    }
                  />
                ))}
              </div>
            )}

            {mappedProducts.length > 0 && productPage ? (
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-400 font-medium">
                  Showing {(productPage.currentPage * productPage.pageSize) + 1}
                  -
                  {Math.min((productPage.currentPage * productPage.pageSize) + mappedProducts.length, productPage.totalElements)}
                  {' '}of {productPage.totalElements}
                </p>
                {productPage.totalPages > 1 ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={productPage.first || isLoading}
                      onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <span className="px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-500">
                      {productPage.currentPage + 1}/{productPage.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={productPage.last || isLoading}
                      onClick={() => setCurrentPage((page) => page + 1)}
                      className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:border-sky-300 hover:text-sky-600 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}

function buildCategoryMap(categories: CategoryResponse[]): Record<number, string> {
  return categories.reduce<Record<number, string>>((map, category) => {
    map[category.categoryId] = category.name;
    return map;
  }, {});
}

function mapProducts(products: ProductResponse[], categoryMap: Record<number, string>): ProductListItem[] {
  return products.map((product) => ({
    id: product.productId.toString(),
    title: product.name,
    price: (product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price) ? product.salePrice : product.price,
    originalPrice: (product.salePrice !== undefined && product.salePrice !== null && product.salePrice < product.price) ? product.price : null,
    discountPercentage: product.discountPercentage && product.discountPercentage > 0 ? product.discountPercentage : null,
    discountUnit: product.discountUnit || null,
    discountType: product.discountType || null,
    maxDiscount: product.maxDiscount || null,
    tag: product.quantity > 10 ? 'Ready Stock' : product.quantity > 0 ? 'Limited' : 'Sold Out',
    category: categoryMap[product.categoryId] || 'All Products',
    origin: 'DrySea Select',
    badge: product.quantity > 10 ? 'bg-sky-500' : product.quantity > 0 ? 'bg-amber-500' : 'bg-slate-700',
    img:
      product.imageUrls && product.imageUrls.length > 0
        ? product.imageUrls[0]
        : 'https://placehold.co/800x600/e2e8f0/0f172a?text=DrySea',
    rating: 4.5,
    reviews: 0,
    inStock: product.quantity > 0,
    quantity: product.quantity,
  }));
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 px-3 py-3 bg-slate-50 dark:bg-slate-950">
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function FilterButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
        active ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      <span>{label}</span>
      {active ? <span className="material-symbols-outlined text-[14px]">check</span> : null}
    </button>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
    >
      {label}
      <span className="material-symbols-outlined text-[14px]">close</span>
    </button>
  );
}

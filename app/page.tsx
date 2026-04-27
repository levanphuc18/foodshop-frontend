'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useProduct } from '@/hooks/useProduct';
import { useCategory } from '@/hooks/useCategory';
import { formatPrice } from '@/lib/utils';

export default function Home() {
  const { products, fetchProductPage, isLoading } = useProduct();
  const { categories, fetchCategories } = useCategory();

  useEffect(() => {
    fetchCategories();
    fetchProductPage({ page: 0, size: 4, sortBy: 'productId', sortDir: 'DESC' });
  }, [fetchCategories, fetchProductPage]);

  const featuredProducts = products.slice(0, 4);

  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
        <section className="bg-white dark:bg-slate-950 border-b border-slate-200/70 dark:border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-600 mb-4">DrySea Premium Seafood</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl">
                Premium dried seafood for everyday meals, gifting, and pantry restock
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-8 text-slate-600 dark:text-slate-400">
                Discover customer favorites, browse by category, and order quickly from a storefront built for repeat buying.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/products" className="px-6 py-3 rounded-xl bg-sky-600 text-white text-sm font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20">
                  Shop All
                </Link>
                <Link href="/products" className="px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-sm font-black uppercase tracking-widest hover:border-sky-300 hover:text-sky-600 transition-all">
                  View Collection
                </Link>
              </div>
              <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl">
                <HeroMetric label="Best Sellers" value="Daily picks" />
                <HeroMetric label="Nationwide" value="Fast delivery" />
                <HeroMetric label="Easy reorder" value="Built for repeat buyers" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ShowcaseTile
                title="Ready-to-cook selection"
                body="Fast-moving pantry items for everyday cooking."
                className="col-span-2 min-h-[220px] bg-slate-900 text-white"
              />
              <ShowcaseTile
                title="Giftable packs"
                body="Premium presentation for seasonal gifting."
                className="min-h-[220px] bg-sky-50 text-slate-900 border border-sky-100"
              />
              <ShowcaseTile
                title="Bulk restock"
                body="For frequent customers and family orders."
                className="min-h-[220px] bg-amber-50 text-slate-900 border border-amber-100"
              />
            </div>
          </div>
        </section>

        <section className="py-10 lg:py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Browse Faster</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Shop by category</h2>
              </div>
              <Link href="/products" className="text-sm font-bold text-sky-600 hover:text-sky-700">
                See all products
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.categoryId}
                  href={`/products`}
                  className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-5 hover:border-sky-300 hover:shadow-sm transition-all"
                >
                  <p className="text-sm font-black text-slate-900 dark:text-white">{category.name}</p>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">Explore</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="py-8 lg:py-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Featured</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Top picks this week</h2>
              </div>
            </div>

            {isLoading ? (
              <div className="py-16 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-sky-500 border-t-transparent" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.productId}
                    href={`/products/${product.productId}`}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden hover:border-sky-300 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img
                        src={product.imageUrls?.[0] || 'https://placehold.co/800x600/e2e8f0/0f172a?text=DrySea'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                        {categories.find((category) => category.categoryId === product.categoryId)?.name || 'DrySea'}
                      </p>
                      <h3 className="mt-2 text-base font-black text-slate-900 dark:text-white line-clamp-2">{product.name}</h3>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <div>
                          <p className="text-lg font-black text-sky-600">
                            {formatPrice((product.salePrice != null && product.salePrice < product.price) ? product.salePrice : product.price)}
                          </p>
                          {product.salePrice != null && product.salePrice < product.price ? (
                            <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
                          ) : null}
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                          {product.quantity > 0 ? 'Ready' : 'Sold out'}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-white dark:bg-slate-950 border-y border-slate-200/70 dark:border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid md:grid-cols-3 gap-4">
            <ValueBand
              title="Fast browsing"
              body="Search, category filtering, and quick cart actions are available directly from the listing pages."
            />
            <ValueBand
              title="Clear pricing"
              body="Sale price, original price, and stock state are visible before opening product details."
            />
            <ValueBand
              title="Built for repeat orders"
              body="The storefront is optimized for customers who return often and need to reorder quickly."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 py-4">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-black text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function ShowcaseTile({ title, body, className }: { title: string; body: string; className: string }) {
  return (
    <div className={`rounded-3xl p-6 lg:p-7 ${className}`}>
      <p className="text-xl font-black tracking-tight">{title}</p>
      <p className="mt-3 text-sm leading-7 opacity-80 max-w-sm">{body}</p>
    </div>
  );
}

function ValueBand({ title, body }: { title: string; body: string }) {
  return (
    <div className="py-2">
      <h3 className="text-lg font-black text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{body}</p>
    </div>
  );
}

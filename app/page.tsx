import Link from 'next/link';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { formatPrice } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/constants';
import type { ProductResponse } from '@/schemas/product';
import type { ApiResponse, PageResponse } from '@/schemas/api';
import type { CategoryResponse } from '@/schemas/category';

// ── Server-side data fetching (runs at build / ISR revalidation) ─────────────

async function getCategories(): Promise<CategoryResponse[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`, {
      next: { revalidate: 300 },
    });
    const data: ApiResponse<CategoryResponse[]> = await res.json();
    return data.code === 0 ? data.data : [];
  } catch {
    return [];
  }
}

async function getFeaturedProducts(): Promise<ProductResponse[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/products?page=0&size=4&sortBy=productId&sortDir=DESC`,
      { next: { revalidate: 120 } },
    );
    const data: ApiResponse<PageResponse<ProductResponse>> = await res.json();
    return data.code === 0 ? data.data.content : [];
  } catch {
    return [];
  }
}

// ── Page (Server Component — NO 'use client') ───────────────────────────────

export default async function Home() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
        {/* ── Hero ──────────────────────────────────────────────────────── */}
        <section className="bg-white dark:bg-slate-950 border-b border-slate-200/70 dark:border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-14 lg:py-20 grid lg:grid-cols-[1.15fr_0.85fr] gap-10 items-center">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.24em] text-sky-600 mb-4">Hải Sản Khô Cao Cấp DrySea</p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl">
                Hải sản khô cao cấp cho bữa ăn hàng ngày, biếu tặng và tích trữ
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg leading-8 text-slate-600 dark:text-slate-400">
                Khám phá các sản phẩm được yêu thích, duyệt theo danh mục và đặt hàng nhanh chóng từ cửa hàng tối ưu cho việc mua lại.
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
                title="Mua sỉ"
                body="Dành cho khách quen và đơn hàng gia đình."
                className="min-h-[220px] bg-amber-50 text-slate-900 border border-amber-100"
              />
            </div>
          </div>
        </section>

        {/* ── Categories ────────────────────────────────────────────────── */}
        <section className="py-10 lg:py-12">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Mua sắm nhanh</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Danh mục sản phẩm</h2>
              </div>
              <Link href="/products" className="text-sm font-bold text-sky-600 hover:text-sky-700">
                Xem tất cả
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

        {/* ── Featured Products (server-rendered, no loading spinner) ─── */}
        <section className="py-8 lg:py-10">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.22em] text-slate-400">Featured</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900 dark:text-white">Top picks this week</h2>
              </div>
            </div>

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
                      {categories.find((c) => c.categoryId === product.categoryId)?.name || 'DrySea'}
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
                        {product.quantity > 0 ? 'Sẵn hàng' : 'Hết hàng'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Value Bands ───────────────────────────────────────────────── */}
        <section className="py-12 lg:py-16 bg-white dark:bg-slate-950 border-y border-slate-200/70 dark:border-slate-800">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 grid md:grid-cols-3 gap-4">
            <ValueBand
              title="Tìm kiếm nhanh chóng"
              body="Tìm kiếm, lọc danh mục và thêm vào giỏ hàng có thể thao tác ngay từ trang danh sách."
            />
            <ValueBand
              title="Giá cả minh bạch"
              body="Giá khuyến mãi, giá gốc và trạng thái tồn kho được hiển thị trước khi mở chi tiết."
            />
            <ValueBand
              title="Mua lại dễ dàng"
              body="Cửa hàng được tối ưu hóa cho khách hàng quay lại thường xuyên và cần đặt hàng lại nhanh chóng."
            />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// ── Presentational sub-components (still Server Components) ──────────────────

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

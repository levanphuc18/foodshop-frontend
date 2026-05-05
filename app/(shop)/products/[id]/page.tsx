import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { API_BASE_URL } from '@/lib/constants';
import type { ProductResponse } from '@/schemas/product';
import type { ApiResponse, PageResponse } from '@/schemas/api';

// ── Client Components (interactive parts) ────────────────────────────────────
import ProductGallery from './_components/ProductGallery';
import AddToCartSection from './_components/AddToCartSection';
import ProductTabs from './_components/ProductTabs';

// ── Server-side data fetching ────────────────────────────────────────────────

async function getProduct(id: number): Promise<ProductResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, {
      next: { revalidate: 60 },
    });
    const data: ApiResponse<ProductResponse> = await res.json();
    return data.code === 0 ? data.data : null;
  } catch {
    return null;
  }
}

// ── Page (Server Component — NO 'use client') ───────────────────────────────

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  const productId = parseInt(id, 10);

  if (isNaN(productId)) notFound();

  const product = await getProduct(productId);

  if (!product) notFound();

  // Derived values
  const imageUrls = product.imageUrls?.length
    ? product.imageUrls
    : ['https://via.placeholder.com/600'];
  const hasDiscount =
    product.salePrice != null && product.salePrice < product.price;
  const currentPrice = hasDiscount ? product.salePrice! : product.price;
  const originalPrice = product.price;
  const avgRating = product.averageRating ?? 0;
  const totalReviews = product.totalReviews ?? 0;

  const discountLabel =
    product.discountUnit === 'PERCENT'
      ? `Giảm ${product.discountPercentage}%`
      : `Giảm ${formatPrice(originalPrice - currentPrice)}`;

  return (
    <div className="min-h-screen pt-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* ── Breadcrumb ──────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/products" className="hover:text-sky-600 transition-colors">Shop</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-300">{product.name}</span>
        </nav>

        {/* ── Main Grid ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-20">
          {/* Left: Gallery (Client) + Wishlist (Client) */}
          <div className="relative">
            <ProductGallery
              imageUrls={imageUrls}
              productName={product.name}
              hasDiscount={hasDiscount}
              discountLabel={discountLabel}
            />
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-600">
                Category ID: {product.categoryId} · Local Harvest
              </span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">
                SKU: DS-PROD-{product.productId}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Hero Rating Row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`material-symbols-outlined text-[16px] ${i <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                    style={{ fontVariationSettings: i <= Math.round(avgRating) ? "'FILL' 1" : "'FILL' 0" }}
                  >
                    star
                  </span>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {avgRating.toFixed(1)}
              </span>
              <span className="text-sm text-sky-600 font-bold">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                {product.productStatus === 'OUT_OF_STOCK'
                  ? 'Out of Stock'
                  : `In Stock · ${product.quantity} left`}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <span className="text-4xl font-black text-sky-600">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <div className="flex items-center gap-3">
                  <span className="text-xl text-slate-400 line-through font-medium">
                    {formatPrice(originalPrice)}
                  </span>
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-lg shadow-sm">
                    Save {formatPrice(originalPrice - currentPrice)}
                  </span>
                </div>
              )}
            </div>

            {/* Add to Cart Section (Client Component) */}
            <AddToCartSection
              productId={product.productId}
              productName={product.name}
              currentPrice={currentPrice}
              imageUrl={imageUrls[0]}
              stock={product.quantity}
            />

            {/* Trust badges (static — stays in Server Component) */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { icon: 'eco', label: 'Hand-selected', sub: 'Grade A quality' },
                { icon: 'wb_sunny', label: 'Sun-dried', sub: '72-hour process' },
                { icon: 'local_shipping', label: 'Fast delivery', sub: '2–4 business days' },
                { icon: 'verified', label: 'Certified', sub: 'Food safety standard' },
              ].map((h) => (
                <div key={h.label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[18px] text-sky-600">{h.icon}</span>
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-900 dark:text-white">{h.label}</p>
                    <p className="text-[10px] text-slate-400 font-bold">{h.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Tabs (Client Component — reviews need interactivity) ───── */}
        <ProductTabs product={product} imageUrls={imageUrls} />
      </div>
    </div>
  );
}

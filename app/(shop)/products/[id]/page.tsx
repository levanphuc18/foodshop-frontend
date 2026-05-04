'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useProduct } from '@/hooks/useProduct';
import { useCart } from '@/hooks/useCart';
import { useReview } from '@/hooks/useReview';
import { formatPrice } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import dayjs from 'dayjs';

const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'];

import type { ReviewResponse } from '@/types/review';

function ReviewItem({ review }: { review: ReviewResponse }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = review.comment && review.comment.length > 300;
  const displayText = isExpanded ? review.comment : review.comment?.slice(0, 300) + (isLongText ? '...' : '');

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">
            {(review.maskedName || review.username || '?')[0].toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-black text-slate-900 dark:text-white">{review.maskedName}</p>
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">Verified</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">{dayjs(review.createdAt).format('MMM DD, YYYY')}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`material-symbols-outlined text-[14px] ${i <= review.rating ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} style={{ fontVariationSettings: i <= review.rating ? "'FILL' 1" : "'FILL' 0" }}>star</span>
          ))}
        </div>
      </div>
      
      {review.comment && (
        <div className="mb-3">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words whitespace-pre-wrap">
            {displayText}
          </p>
          {isLongText && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sky-600 text-xs font-bold hover:underline mt-1">
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </div>
      )}
      
      {review.imageUrls?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.imageUrls.map((url, i) => (
            <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img src={url} alt={`Review image ${i+1}`} className="w-full h-full object-cover transition-transform hover:scale-110" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const productId = parseInt(id);
  const { currentProduct: product, getProductById, isLoading } = useProduct();
  const { addToCart } = useCart();
  const { reviews, starBreakdown, fetchProductReviews, fetchStarBreakdown, isLoading: reviewsLoading } = useReview();

  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('100g');
  const [wishlisted, setWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState('Description');
  const [addedToCart, setAddedToCart] = useState(false);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterImages, setFilterImages] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (id) getProductById(productId); }, [id, getProductById, productId]);
  useEffect(() => { if (productId) { fetchProductReviews(productId, { page: 0, size: 10 }); fetchStarBreakdown(productId); } }, [productId, fetchProductReviews, fetchStarBreakdown]);

  useEffect(() => {
    if (productId) fetchProductReviews(productId, { rating: filterRating ?? undefined, withImages: filterImages, page: reviewPage, size: 10 });
  }, [productId, filterRating, filterImages, reviewPage, fetchProductReviews]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div></div>;
  if (!product) return <div className="min-h-screen flex flex-col items-center justify-center gap-4"><h2 className="text-2xl font-black text-slate-900 dark:text-white">Product Not Found</h2><Link href="/products" className="text-sky-600 font-bold hover:underline">Back to Shop</Link></div>;

  const imageUrls = product.imageUrls?.length ? product.imageUrls : ['https://via.placeholder.com/600'];
  const hasDiscount = product.salePrice != null && product.salePrice < product.price;
  const currentPrice = hasDiscount ? product.salePrice : product.price;
  const originalPrice = product.price;
  const avgRating = product.averageRating ?? 0;
  const totalReviews = product.totalReviews ?? 0;
  const totalBreakdown = starBreakdown ? Object.values(starBreakdown).reduce((a, b) => a + b, 0) : 0;

  const handleAddToCart = async () => {
    if (qty > product.quantity) { toast.error(`Chi con ${product.quantity} san pham trong kho`); return; }
    const success = await addToCart(product.productId, qty, { productName: product.name, productPrice: currentPrice, productImageUrl: imageUrls[0] });
    if (success) { setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); }
  };

  const scrollToReviews = () => { setActiveTab('Reviews'); reviewSectionRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="min-h-screen pt-20 bg-white dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8">
          <Link href="/" className="hover:text-sky-600 transition-colors">Home</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href="/products" className="hover:text-sky-600 transition-colors">Shop</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-slate-700 dark:text-slate-300">{product.name}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 mb-20">
          {/* Left: Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <img src={imageUrls[activeImage]} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
              {hasDiscount && (
                <div className="absolute top-4 left-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="bg-red-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                      Giảm {product.discountUnit === 'PERCENT' ? `${product.discountPercentage}%` : formatPrice(originalPrice - currentPrice!)}
                    </span>
                  </div>
                </div>
              )}
              <button onClick={() => setWishlisted(!wishlisted)} className={`absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-500'}`}>
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: wishlisted ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {imageUrls.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${activeImage === i ? 'border-sky-500 ring-2 ring-sky-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-sky-600">Category ID: {product.categoryId} · Local Harvest</span>
              <span className="text-[10px] font-bold text-slate-400 font-mono">SKU: DS-PROD-{product.productId}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4 leading-tight">{product.name}</h1>

            {/* Hero Rating Row — clickable to scroll to reviews */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className={`material-symbols-outlined text-[16px] ${i <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} style={{ fontVariationSettings: i <= Math.round(avgRating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{avgRating.toFixed(1)}</span>
              <button onClick={scrollToReviews} className="text-sm text-sky-600 hover:text-sky-700 font-bold hover:underline transition-colors">
                ({totalReviews} {totalReviews === 1 ? 'review' : 'reviews'})
              </button>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-lg">
                {product.productStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : `In Stock · ${product.quantity} left`}
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <span className="text-4xl font-black text-sky-600">{formatPrice(currentPrice!)}</span>
              {hasDiscount && (
                <div className="flex items-center gap-3">
                  <span className="text-xl text-slate-400 line-through font-medium">{formatPrice(originalPrice)}</span>
                  <span className="px-2.5 py-1 bg-red-500 text-white text-xs font-black rounded-lg shadow-sm">Save {formatPrice(originalPrice - currentPrice!)}</span>
                </div>
              )}
            </div>

            {/* Weight */}
            <div className="mb-6">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">Weight: <span className="text-slate-900 dark:text-white">{selectedWeight}</span></p>
              <div className="flex gap-2 flex-wrap">
                {WEIGHT_OPTIONS.map((w) => (
                  <button key={w} onClick={() => setSelectedWeight(w)} className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${selectedWeight === w ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-300'}`}>{w}</button>
                ))}
              </div>
            </div>

            {/* Qty + Add to Cart */}
            <div className="flex gap-3 mb-6">
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={product.quantity === 0} className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">remove</span></button>
                <span className="w-12 text-center text-base font-black text-slate-900 dark:text-white">{product.quantity === 0 ? 0 : qty}</span>
                <button onClick={() => setQty(Math.min(product.quantity, qty + 1))} disabled={product.quantity === 0 || qty >= product.quantity} className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"><span className="material-symbols-outlined text-[20px]">add</span></button>
              </div>
              <button onClick={handleAddToCart} disabled={product.quantity === 0} className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${addedToCart ? 'bg-emerald-500 text-white' : product.quantity === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98]'}`}>
                <span className="material-symbols-outlined text-[18px]">{addedToCart ? 'check_circle' : 'shopping_cart'}</span>
                {product.quantity === 0 ? 'Out of Stock' : addedToCart ? 'Added!' : 'Add to Cart'}
              </button>
              <Link href={product.quantity === 0 ? '#' : '/checkout'} className="flex-1">
                <button disabled={product.quantity === 0} className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed">Buy Now</button>
              </Link>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[{ icon: 'eco', label: 'Hand-selected', sub: 'Grade A quality' }, { icon: 'wb_sunny', label: 'Sun-dried', sub: '72-hour process' }, { icon: 'local_shipping', label: 'Fast delivery', sub: '2–4 business days' }, { icon: 'verified', label: 'Certified', sub: 'Food safety standard' }].map((h) => (
                <div key={h.label} className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-900/20 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[18px] text-sky-600">{h.icon}</span></div>
                  <div><p className="text-xs font-black text-slate-900 dark:text-white">{h.label}</p><p className="text-[10px] text-slate-400 font-bold">{h.sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-20" ref={reviewSectionRef}>
          <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-1">
            {['Description', 'Specifications', 'Reviews'].map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${activeTab === tab ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}>
                {tab}{tab === 'Reviews' && <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-black">{totalReviews}</span>}
              </button>
            ))}
          </div>

          {activeTab === 'Description' && (
            <div className="grid md:grid-cols-2 gap-12 items-start">
              <div className="space-y-5">
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{product.description}</p>
                <ul className="space-y-2">
                  {['100% natural, no preservatives', 'Traditional sun-drying process', 'Individually hand-inspected', 'Vacuum-sealed for freshness'].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                      <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[12px] text-sky-600">check</span></span>{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"><img src={imageUrls[0]} alt="process" className="w-full h-full object-cover" /></div>
            </div>
          )}

          {activeTab === 'Specifications' && (
            <div className="max-w-xl">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
                {[{ label: 'Product Name', value: product.name }, { label: 'Category ID', value: product.categoryId }, { label: 'Origin', value: 'Local Vietnamese Coast' }, { label: 'SKU', value: `DS-PROD-${product.productId}` }, { label: 'Available Weights', value: WEIGHT_OPTIONS.join(', ') }, { label: 'Storage', value: 'Cool, dry place · Refrigerate after opening' }, { label: 'Shelf Life', value: '12 months (unopened)' }, { label: 'Certification', value: 'ISO 22000 · HACCP' }].map(({ label, value }) => (
                  <div key={label} className="flex px-5 py-3.5 text-sm"><span className="w-44 font-bold text-slate-500 dark:text-slate-400 shrink-0">{label}</span><span className="text-slate-900 dark:text-white font-medium">{value}</span></div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'Reviews' && (
            <div className="space-y-8 max-w-4xl">
              {/* Review Summary + Star Breakdown */}
              <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center gap-8">
                <div className="text-center shrink-0 min-w-[100px]">
                  <p className="text-5xl font-black text-slate-900 dark:text-white">{avgRating.toFixed(1)}</p>
                  <div className="flex justify-center gap-0.5 my-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <span key={i} className={`material-symbols-outlined text-[16px] ${i <= Math.round(avgRating) ? 'text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} style={{ fontVariationSettings: i <= Math.round(avgRating) ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-slate-400 font-bold">{totalReviews} reviews</p>
                </div>
                <div className="flex-1 w-full space-y-1.5">
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = starBreakdown ? (starBreakdown[String(star)] || 0) : 0;
                    const pct = totalBreakdown > 0 ? Math.round((count / totalBreakdown) * 100) : 0;
                    return (
                      <button key={star} onClick={() => { setFilterRating(filterRating === star ? null : star); setReviewPage(0); }} className={`w-full flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 transition-all ${filterRating === star ? 'bg-sky-50 dark:bg-sky-900/20 ring-1 ring-sky-300' : ''}`}>
                        <span className="w-3">{star}</span>
                        <span className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} /></div>
                        <span className="w-12 text-right">{count} ({pct}%)</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setFilterRating(null); setFilterImages(false); setReviewPage(0); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${!filterRating && !filterImages ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-300'}`}>All</button>
                {[5, 4, 3, 2, 1].map((s) => (
                  <button key={s} onClick={() => { setFilterRating(filterRating === s ? null : s); setReviewPage(0); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterRating === s ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-300'}`}>{s} Star</button>
                ))}
                <button onClick={() => { setFilterImages(!filterImages); setReviewPage(0); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterImages ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-300'}`}>
                  <span className="material-symbols-outlined text-[14px] align-middle mr-1">image</span>With Images
                </button>
              </div>

              {/* Review List */}
              {reviewsLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div></div>
              ) : reviews && reviews.content.length > 0 ? (
                <div className="space-y-4">
                  {reviews.content.map((review) => (
                    <ReviewItem key={review.reviewId} review={review} />
                  ))}

                  {/* Pagination */}
                  {reviews.totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button disabled={reviews.first} onClick={() => setReviewPage(p => p - 1)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Previous</button>
                      <span className="text-xs font-bold text-slate-500">Page {reviews.currentPage + 1} of {reviews.totalPages}</span>
                      <button disabled={reviews.last} onClick={() => setReviewPage(p => p + 1)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Next</button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-3 block">rate_review</span>
                  <p className="text-sm font-bold text-slate-400">No reviews yet</p>
                  <p className="text-xs text-slate-400 mt-1">Be the first to review this product after purchasing!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

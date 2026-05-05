'use client';

import { useState, useEffect, useRef } from 'react';
import { useReview } from '@/hooks/useReview';
import { formatDate } from '@/lib/utils';
import type { ReviewResponse } from '@/schemas/review';
import type { ProductResponse } from '@/schemas/product';

// ── ReviewItem (local to this file) ──────────────────────────────────────────

function ReviewItem({ review }: { review: ReviewResponse }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongText = review.comment && review.comment.length > 300;
  const displayText = isExpanded
    ? review.comment
    : review.comment?.slice(0, 300) + (isLongText ? '...' : '');

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
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">Đã mua</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold">{formatDate(review.createdAt, 'DD/MM/YYYY')}</p>
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
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed break-words whitespace-pre-wrap">{displayText}</p>
          {isLongText && (
            <button onClick={() => setIsExpanded(!isExpanded)} className="text-sky-600 text-xs font-bold hover:underline mt-1">
              {isExpanded ? 'Thu gọn' : 'Xem thêm'}
            </button>
          )}
        </div>
      )}

      {review.imageUrls?.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {review.imageUrls.map((url, i) => (
            <div key={i} className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
              <img src={url} alt={`Ảnh đánh giá ${i + 1}`} className="w-full h-full object-cover transition-transform hover:scale-110" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ProductTabs (exported Client Component) ──────────────────────────────────

interface ProductTabsProps {
  product: ProductResponse;
  imageUrls: string[];
}

export default function ProductTabs({ product, imageUrls }: ProductTabsProps) {
  const {
    reviews,
    starBreakdown,
    fetchProductReviews,
    fetchStarBreakdown,
    isLoading: reviewsLoading,
  } = useReview();

  const [activeTab, setActiveTab] = useState('Mô tả');
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterImages, setFilterImages] = useState(false);
  const [reviewPage, setReviewPage] = useState(0);
  const reviewSectionRef = useRef<HTMLDivElement>(null);

  const avgRating = product.averageRating ?? 0;
  const totalReviews = product.totalReviews ?? 0;
  const totalBreakdown = starBreakdown ? Object.values(starBreakdown).reduce((a, b) => a + b, 0) : 0;

  // Initial fetch
  useEffect(() => {
    fetchProductReviews(product.productId, { page: 0, size: 10 });
    fetchStarBreakdown(product.productId);
  }, [product.productId, fetchProductReviews, fetchStarBreakdown]);

  // Filter / pagination fetch
  useEffect(() => {
    fetchProductReviews(product.productId, {
      rating: filterRating ?? undefined,
      withImages: filterImages,
      page: reviewPage,
      size: 10,
    });
  }, [product.productId, filterRating, filterImages, reviewPage, fetchProductReviews]);

  const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'];

  return (
    <div className="mb-20" ref={reviewSectionRef}>
      {/* Tab Headers */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 mb-8 gap-1">
        {['Mô tả', 'Thông số', 'Đánh giá'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-bold transition-all border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            {tab}
            {tab === 'Đánh giá' && (
              <span className="ml-2 text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-black">
                {totalReviews}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Description Tab */}
      {activeTab === 'Mô tả' && (
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div className="space-y-5">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{product.description}</p>
            <ul className="space-y-2">
              {['100% tự nhiên, không chất bảo quản', 'Quy trình phơi khô truyền thống', 'Kiểm tra thủ công từng sản phẩm', 'Đóng gói chân không giữ tươi'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                  <span className="w-5 h-5 rounded-full bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[12px] text-sky-600">check</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <img src={imageUrls[0]} alt="process" className="w-full h-full object-cover" />
          </div>
        </div>
      )}

      {/* Specifications Tab */}
      {activeTab === 'Thông số' && (
        <div className="max-w-xl">
          <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
            {[
              { label: 'Tên sản phẩm', value: product.name },
              { label: 'Mã danh mục', value: product.categoryId },
              { label: 'Xuất xứ', value: 'Bờ biển Việt Nam' },
              { label: 'Mã SP', value: `DS-PROD-${product.productId}` },
              { label: 'Khối lượng', value: WEIGHT_OPTIONS.join(', ') },
              { label: 'Bảo quản', value: 'Nơi khô mát · Bảo quản lạnh sau khi mở' },
              { label: 'Hạn sử dụng', value: '12 tháng (chưa mở)' },
              { label: 'Chứng nhận', value: 'ISO 22000 · HACCP' },
            ].map(({ label, value }) => (
              <div key={label} className="flex px-5 py-3.5 text-sm">
                <span className="w-44 font-bold text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
                <span className="text-slate-900 dark:text-white font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews Tab */}
      {activeTab === 'Đánh giá' && (
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
              <p className="text-[11px] text-slate-400 font-bold">{totalReviews} đánh giá</p>
            </div>
            <div className="flex-1 w-full space-y-1.5">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starBreakdown ? (starBreakdown[String(star)] || 0) : 0;
                const pct = totalBreakdown > 0 ? Math.round((count / totalBreakdown) * 100) : 0;
                return (
                  <button
                    key={star}
                    onClick={() => { setFilterRating(filterRating === star ? null : star); setReviewPage(0); }}
                    className={`w-full flex items-center gap-2 text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg px-2 py-1 transition-all ${filterRating === star ? 'bg-sky-50 dark:bg-sky-900/20 ring-1 ring-sky-300' : ''}`}
                  >
                    <span className="w-3">{star}</span>
                    <span className="material-symbols-outlined text-[12px] text-amber-400" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="w-12 text-right">{count} ({pct}%)</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setFilterRating(null); setFilterImages(false); setReviewPage(0); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${!filterRating && !filterImages ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-300'}`}>Tất cả</button>
            {[5, 4, 3, 2, 1].map((s) => (
              <button key={s} onClick={() => { setFilterRating(filterRating === s ? null : s); setReviewPage(0); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterRating === s ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-300'}`}>{s} sao</button>
            ))}
            <button onClick={() => { setFilterImages(!filterImages); setReviewPage(0); }} className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border-2 transition-all ${filterImages ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-sky-300'}`}>
              <span className="material-symbols-outlined text-[14px] align-middle mr-1">image</span>Có ảnh
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
              {reviews.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <button disabled={reviews.first} onClick={() => setReviewPage((p) => p - 1)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Trước</button>
                  <span className="text-xs font-bold text-slate-500">Trang {reviews.currentPage + 1} / {reviews.totalPages}</span>
                  <button disabled={reviews.last} onClick={() => setReviewPage((p) => p + 1)} className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Tiếp</button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
              <span className="material-symbols-outlined text-[48px] text-slate-300 dark:text-slate-600 mb-3 block">rate_review</span>
              <p className="text-sm font-bold text-slate-400">Chưa có đánh giá</p>
              <p className="text-xs text-slate-400 mt-1">Hãy là người đầu tiên đánh giá sản phẩm này sau khi mua!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

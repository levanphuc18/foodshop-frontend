'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import StarRating from './StarRating';
import type { ProductListItem } from './types';

interface ProductGridCardProps {
  product: ProductListItem;
  isWishlisted: boolean;
  onWishlist: () => void;
  onAddToCart: () => void;
}

export default function ProductGridCard({ product, isWishlisted, onWishlist, onAddToCart }: ProductGridCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { id, title, price, originalPrice, tag, badge, img, rating, reviews, inStock } = product;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl hover:shadow-slate-900/10 hover:border-sky-200 dark:hover:border-sky-800/50 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={`/products/${id}`}>
          <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </Link>

        <span className={`absolute top-3 left-3 ${badge} text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow`}>
          {tag}
        </span>

        <button
          type="button"
          onClick={onWishlist}
          className={`absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow ${isWishlisted ? 'bg-red-500 text-white' : 'bg-white/90 dark:bg-slate-900/90 text-slate-400 hover:text-red-500'}`}
        >
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: isWishlisted ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
        </button>

        {!inStock ? (
          <div className="absolute inset-0 bg-white/60 dark:bg-slate-900/60 flex items-center justify-center">
            <span className="px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
              Out of Stock
            </span>
          </div>
        ) : null}

        {inStock ? (
          <div className="absolute bottom-0 inset-x-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart();
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2000);
              }}
              className={`w-full py-3 text-[10px] font-black uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 ${
                isAdded ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-sky-600 text-white hover:bg-sky-600 dark:hover:bg-sky-500'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{isAdded ? 'check_circle' : 'shopping_cart'}</span>
              {isAdded ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        ) : null}
      </div>

      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1 hover:text-sky-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={rating} />
          <span className="text-[10px] text-slate-400 font-bold">({reviews})</span>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-black text-sky-600">{formatPrice(price)}</span>
            {originalPrice ? <span className="text-xs text-slate-400 line-through">{formatPrice(originalPrice)}</span> : null}
          </div>
          {originalPrice && (
            (() => {
              const isPercent = product.discountUnit === 'PERCENT';
              const actualDiscount = originalPrice - price;
              const expectedDiscount = originalPrice * ((product.discountPercentage || 0) / 100);
              const isCapped = isPercent && (expectedDiscount - actualDiscount > 0.1);
              return (
                  <div className="flex flex-col items-end gap-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-black text-red-500">Giảm {isPercent ? `${product.discountPercentage}%` : formatPrice(actualDiscount)}</span>
                      <span className="px-1.5 py-0.5 rounded-md bg-emerald-500 text-white text-[8px] font-black uppercase tracking-wider shadow-sm">
                        Voucher
                      </span>
                    </div>
                    {isPercent && product.maxDiscount && (
                      <span className="text-[10px] text-slate-500 font-bold italic mt-0.5">
                        (Tối đa {formatPrice(product.maxDiscount)})
                      </span>
                    )}
                  </div>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
}

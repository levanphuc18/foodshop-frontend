'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import StarRating from './StarRating';
import type { ProductListItem } from './types';

interface ProductListCardProps {
  product: ProductListItem;
  onAddToCart: () => void;
}

export default function ProductListCard({ product, onAddToCart }: ProductListCardProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { id, title, price, originalPrice, tag, badge, img, rating, reviews, inStock, origin } = product;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg hover:border-sky-200 dark:hover:border-sky-800/50 transition-all flex">
      <div className="relative w-36 sm:w-48 shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={`/products/${id}`}>
          <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </Link>
        <span className={`absolute top-2 left-2 ${badge} text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md`}>
          {tag}
        </span>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <Link href={`/products/${id}`}>
            <h3 className="text-base font-black text-slate-900 dark:text-white hover:text-sky-600 transition-colors mb-1">{title}</h3>
          </Link>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">{origin}</p>
          <div className="flex items-center gap-2">
            <StarRating rating={rating} />
            <span className="text-[10px] text-slate-400 font-bold">({reviews})</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-black text-sky-600">{formatPrice(price)}</span>
              {originalPrice ? <span className="text-sm text-slate-400 line-through">{formatPrice(originalPrice)}</span> : null}
            </div>
            {originalPrice && (
              (() => {
                const isPercent = product.discountUnit === 'PERCENT';
                const actualDiscount = originalPrice - price;
                const expectedDiscount = originalPrice * ((product.discountPercentage || 0) / 100);
                const isCapped = isPercent && (expectedDiscount - actualDiscount > 0.1);
                return (
                  <div className="flex flex-col gap-0">
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
          <div className="flex items-center gap-2">
            {inStock ? (
              <button
                type="button"
                onClick={() => {
                  onAddToCart();
                  setIsAdded(true);
                  setTimeout(() => setIsAdded(false), 2000);
                }}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-md flex items-center gap-2 ${
                  isAdded ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-sky-600 text-white hover:bg-sky-700 shadow-sky-600/20'
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">{isAdded ? 'check_circle' : 'shopping_cart'}</span>
                {isAdded ? 'Added!' : 'Add to Cart'}
              </button>
            ) : (
              <span className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

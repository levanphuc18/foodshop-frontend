'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number | null;
    img: string;
    tag?: string;
    inStock: boolean;
  };
  onAddToCart: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  const [isAdded, setIsAdded] = useState(false);
  const { id, title, price, originalPrice, tag, img, inStock } = product;

  return (
    <div className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Link href={`/products/${id}`}>
          <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </Link>

        {tag && (
          <span className="absolute top-3 left-3 bg-sky-600 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg shadow">
            {tag}
          </span>
        )}

        {inStock && (
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
                isAdded ? 'bg-emerald-500 text-white' : 'bg-slate-900 dark:bg-sky-600 text-white hover:bg-sky-600'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{isAdded ? 'check_circle' : 'shopping_cart'}</span>
              {isAdded ? 'Added!' : 'Add to Cart'}
            </button>
          </div>
        )}
      </div>

      <div className="p-4">
        <Link href={`/products/${id}`}>
          <h3 className="text-sm font-black text-slate-900 dark:text-white leading-tight mb-1 hover:text-sky-600 transition-colors line-clamp-2">
            {title}
          </h3>
        </Link>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-base font-black text-sky-600">{formatPrice(price)}</span>
          {originalPrice && <span className="text-xs text-slate-400 line-through">{formatPrice(originalPrice)}</span>}
        </div>
      </div>
    </div>
  );
};

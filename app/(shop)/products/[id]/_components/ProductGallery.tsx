'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';

interface ProductGalleryProps {
  imageUrls: string[];
  productName: string;
  hasDiscount: boolean;
  discountLabel: string;
}

export default function ProductGallery({
  imageUrls,
  productName,
  hasDiscount,
  discountLabel,
}: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <img
          src={imageUrls[activeImage]}
          alt={productName}
          className="w-full h-full object-cover transition-all duration-500"
        />
        {hasDiscount && (
          <div className="absolute top-4 left-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="bg-red-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl shadow-lg">
                {discountLabel}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-4 gap-3">
        {imageUrls.map((img, i) => (
          <button
            key={i}
            onClick={() => setActiveImage(i)}
            className={`aspect-square rounded-xl overflow-hidden border-2 transition-all ${
              activeImage === i
                ? 'border-sky-500 ring-2 ring-sky-500/20'
                : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
            }`}
          >
            <img src={img} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

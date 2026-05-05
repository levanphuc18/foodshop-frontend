'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ProductResponse } from '@/schemas/product';

interface CartItemProps {
  item: {
    productId: number;
    productName: string;
    productPrice: number;
    productImageUrl: string | null;
    quantity: number;
  };
  products: ProductResponse[];
  onUpdateQuantity: (id: number, qty: number) => void;
  onRemove: (id: number) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, products, onUpdateQuantity, onRemove }) => {
  const p = products.find(prod => prod.productId === item.productId);
  const hasDiscount = p && p.salePrice !== undefined && p.salePrice !== null && p.salePrice < p.price;
  const currentPrice = hasDiscount ? p.salePrice! : item.productPrice;
  const originalPrice = p ? p.price : item.productPrice;

  return (
    <div className="flex gap-4 p-5 group hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
      {/* Image */}
      <Link href={`/products/${item.productId}`} className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-100 dark:border-slate-700 block transition-transform hover:scale-[1.02]">
        <img
          src={item.productImageUrl || 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop'}
          alt={item.productName}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <Link href={`/products/${item.productId}`} className="group/title">
              <h3 className="text-sm font-black text-slate-900 dark:text-white leading-snug truncate group-hover/title:text-sky-600 transition-colors">
                {item.productName}
              </h3>
            </Link>
            {p && p.salePrice !== undefined && p.salePrice !== null && p.salePrice < p.price && (
              <div className="mt-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="px-1.5 py-0.5 rounded-md bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400 text-[9px] font-black uppercase tracking-wider border border-red-100 dark:border-red-900/30">
                    Sale
                  </span>
                  <span className="text-[10px] font-black text-red-500">Giảm {formatPrice(p.price - p.salePrice)}</span>
                </div>
              </div>
            )}
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">
              SKU: DS-PROD-{item.productId}
            </p>
            {p && item.quantity > p.quantity && (
              <p className="text-[10px] text-red-500 font-bold mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                Chỉ còn {p.quantity} sản phẩm trong kho
              </p>
            )}
          </div>
          <button
            onClick={() => onRemove(item.productId)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all shrink-0"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          {/* Qty stepper */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => onUpdateQuantity(item.productId, Math.max(0, item.quantity - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">remove</span>
            </button>
            <span className="w-9 text-center text-sm font-black text-slate-900 dark:text-white">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-md text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
            </button>
          </div>

          {/* Price */}
          <div className="text-right flex flex-col items-end">
            <p className="text-base font-black text-slate-900 dark:text-white">
              {formatPrice(currentPrice * item.quantity)}
            </p>
            {hasDiscount && (
              <p className="text-xs text-slate-400 line-through">
                {formatPrice(originalPrice * item.quantity)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { toast } from 'react-hot-toast';

interface AddToCartSectionProps {
  productId: number;
  productName: string;
  currentPrice: number;
  imageUrl: string;
  stock: number;
}

const WEIGHT_OPTIONS = ['100g', '250g', '500g', '1kg'];

export default function AddToCartSection({
  productId,
  productName,
  currentPrice,
  imageUrl,
  stock,
}: AddToCartSectionProps) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState('100g');
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = async () => {
    if (qty > stock) {
      toast.error(`Chỉ còn ${stock} sản phẩm trong kho`);
      return;
    }
    const success = await addToCart(productId, qty, {
      productName,
      productPrice: currentPrice,
      productImageUrl: imageUrl,
    });
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  return (
    <>
      {/* Weight Selection */}
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-3">
          Trọng lượng: <span className="text-slate-900 dark:text-white">{selectedWeight}</span>
        </p>
        <div className="flex gap-2 flex-wrap">
          {WEIGHT_OPTIONS.map((w) => (
            <button
              key={w}
              onClick={() => setSelectedWeight(w)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                selectedWeight === w
                  ? 'border-sky-500 bg-sky-50 dark:bg-sky-900/20 text-sky-600'
                  : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-sky-300'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Qty + Add to Cart */}
      <div className="flex gap-3 mb-6">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setQty(Math.max(1, qty - 1))}
            disabled={stock === 0}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">remove</span>
          </button>
          <span className="w-12 text-center text-base font-black text-slate-900 dark:text-white">
            {stock === 0 ? 0 : qty}
          </span>
          <button
            onClick={() => setQty(Math.min(stock, qty + 1))}
            disabled={stock === 0 || qty >= stock}
            className="w-10 h-10 flex items-center justify-center rounded-lg text-slate-500 hover:text-sky-600 hover:bg-white dark:hover:bg-slate-700 transition-all disabled:opacity-30"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
          </button>
        </div>

        <button
          onClick={handleAddToCart}
          disabled={stock === 0}
          className={`flex-1 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${
            addedToCart
              ? 'bg-emerald-500 text-white'
              : stock === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-sky-600 hover:bg-sky-700 text-white shadow-sky-600/20 hover:scale-[1.02] active:scale-[0.98]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {addedToCart ? 'check_circle' : 'shopping_cart'}
          </span>
          {stock === 0 ? 'Hết hàng' : addedToCart ? 'Đã thêm!' : 'Thêm vào giỏ'}
        </button>

        <Link href={stock === 0 ? '#' : '/checkout'} className="flex-1">
          <button
            disabled={stock === 0}
            className="w-full py-3 rounded-xl text-sm font-black uppercase tracking-widest border-2 border-slate-900 dark:border-white text-slate-900 dark:text-white hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Mua ngay
          </button>
        </Link>
      </div>
    </>
  );
}

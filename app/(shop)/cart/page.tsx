'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import { formatPrice } from '@/lib/utils';
import { validateCoupon } from '@/lib/api/discount';
import { CouponValidationResponse } from '@/types/discount';
import { toast } from 'react-hot-toast';
import { CartItem } from '@/components/shop/CartItem';

export default function CartPage() {
  const { items, isLoading: cartLoading, updateQuantity, removeFromCart, fetchCart, itemCount } = useCart();
  const { products, fetchProducts } = useProduct();
  const [promoCode, setPromoCode] = useState('');
  const [couponResult, setCouponResult] = useState<CouponValidationResponse | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Tính lại subtotal từ products (để lấy được salePrice)
  const subtotal = items.reduce((sum, item) => {
    const p = products.find(prod => prod.productId === item.productId);
    const priceToUse = (p && p.salePrice !== undefined && p.salePrice !== null && p.salePrice < p.price) ? p.salePrice : item.productPrice;
    return sum + (priceToUse * item.quantity);
  }, 0);

  useEffect(() => {
    fetchCart();
    fetchProducts();
  }, [fetchCart, fetchProducts]);

  const isLoading = cartLoading;

  // Xử lý áp dụng mã giảm giá
  const handleApplyCoupon = async (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) return;

    setIsValidating(true);
    setCouponError('');
    try {
      const response = await validateCoupon(code, subtotal);
      if (response.code === 0) {
        setCouponResult(response.data);
        setPromoCode(code);
        if (!response.data.valid) {
          setCouponError(response.data.message);
        } else {
          toast.success(`Đã áp dụng mã ${code}`);
        }
      }
    } catch (err) {
      setCouponError('Lỗi kiểm tra mã giảm giá');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoveCoupon = () => {
    setPromoCode('');
    setCouponResult(null);
    setCouponError('');
  };

  const orderDiscount = (couponResult?.valid && couponResult.type === 'ORDER') ? (couponResult.discountAmount ?? 0) : 0;
  const totalAmount = Math.max(subtotal - orderDiscount, 0);

  // Kiểm tra tồn kho cho tất cả sản phẩm
  const hasInsufficientStock = items.some(item => {
    const p = products.find(prod => prod.productId === item.productId);
    return p ? item.quantity > p.quantity : false;
  });

  if (isLoading && items.length === 0) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-sky-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-12 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-sky-600 transition-all mb-2 group"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:-translate-x-1 transition-transform">
                arrow_back
              </span>
              Continue Shopping
            </Link>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Your Cart
              {itemCount > 0 && (
                <span className="ml-3 text-base font-bold text-slate-400">({itemCount} items)</span>
              )}
            </h1>
          </div>
        </div>

        {items.length === 0 ? (
          /* ── Empty State ── */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-20 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-4xl text-slate-300">shopping_cart</span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white mb-2">Your cart is empty</h2>
            <p className="text-sm text-slate-500 mb-8 max-w-xs">
              Explore our curated collection of artisanal dried seafood.
            </p>
            <Link href="/products">
              <button className="px-8 py-3 bg-sky-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20">
                Browse Collection
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

            {/* ── Left: Cart Items ── */}
            <div className="lg:col-span-2 space-y-4">

              {/* Items list */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <CartItem 
                    key={item.productId}
                    item={item}
                    products={products}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>

              {/* Promo code */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-white mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-sky-600">local_offer</span>
                    Promo Code
                  </p>
                </div>

                {couponResult?.valid ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600">confirmation_number</span>
                      <div>
                        <p className="text-[11px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{couponResult.code}</p>
                        <p className="text-[10px] text-emerald-600 mt-0.5">Đã áp dụng giảm giá</p>
                      </div>
                    </div>
                    <button onClick={handleRemoveCoupon} className="text-emerald-500 hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => {
                          setPromoCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon(promoCode)}
                        placeholder="Nhập mã giảm giá..."
                        className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all"
                      />
                      <button
                        onClick={() => handleApplyCoupon(promoCode)}
                        disabled={isValidating || !promoCode.trim()}
                        className="px-5 py-2.5 rounded-xl bg-slate-900 dark:bg-sky-600 text-white text-xs font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                      >
                        {isValidating ? '...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-[10px] font-bold text-red-500 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">error</span>
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* ── Right: Order Summary ── */}
            <div className="space-y-4 lg:sticky lg:top-28">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-sm font-black text-slate-900 dark:text-white">Order Summary</h2>
                </div>
                <div className="p-6 space-y-3.5">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 font-medium">Subtotal ({itemCount} items)</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatPrice(subtotal)}</span>
                  </div>
                  {couponResult?.valid && couponResult.type === 'ORDER' && orderDiscount > 0 && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-600 font-bold">Giảm giá đơn hàng ({couponResult.code})</span>
                      <span className="font-bold text-emerald-600">-{formatPrice(orderDiscount)}</span>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Total</span>
                    <span className="text-2xl font-black text-sky-600">{formatPrice(totalAmount)}</span>
                  </div>
                </div>

                <div className="px-6 pb-6">
                  <Link href={hasInsufficientStock ? '#' : "/checkout"}>
                    <button 
                      disabled={hasInsufficientStock}
                      className="w-full py-3.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-600/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                    >
                      {hasInsufficientStock ? 'Kho không đủ hàng' : 'Proceed to Checkout'}
                    </button>
                  </Link>
                  <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest mt-4 flex items-center justify-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px]">verified_user</span>
                    Secure AES-256 Encryption
                  </p>
                </div>
              </div>

              {/* Accepted payments */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">We Accept</p>
                <div className="flex gap-2">
                  {['VISA', 'MC', 'AMEX', 'JCB'].map((brand) => (
                    <div
                      key={brand}
                      className="flex-1 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center"
                    >
                      <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 tracking-wider">{brand}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DrySea Promise */}
              <div className="bg-sky-50 dark:bg-sky-900/10 rounded-2xl p-5 border border-sky-100 dark:border-sky-900/20">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-sky-600 text-xl mt-0.5">local_shipping</span>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-sky-600 mb-1">Free returns</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                      Not satisfied? Return within 14 days for a full refund, no questions asked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

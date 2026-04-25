'use client';

import React, { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import { formatPrice } from '@/lib/utils';
import PaymentOption from './_components/PaymentOption';
import SummaryItem from './_components/SummaryItem';
import { createOrder } from '@/lib/api/orders';
import { validateCoupon } from '@/lib/api/discount';
import { createVNPayUrl } from '@/lib/api/payment';
import type { CouponValidationResponse } from '@/types/discount';
import VoucherModal from './_components/VoucherModal';
import { toast } from 'react-hot-toast';
import AddressSelector from '@/components/ui/AddressSelector';

const BASE_SHIPPING = 30000;

export default function Pagecheckout() {
  const router = useRouter();
  const { items, itemCount, clearCart } = useCart();
  const { products, fetchProducts } = useProduct();
  
  // Địa chỉ chi tiết (Số nhà, tên đường)
  const [specificAddress, setSpecificAddress] = useState('');
  // Địa chỉ vùng (Phường, Quận, Tỉnh)
  const [regionAddress, setRegionAddress] = useState('');
  
  const [shippingNote, setShippingNote] = useState('');

  // Hợp nhất địa chỉ để gửi lên API
  const shippingAddress = specificAddress && regionAddress 
    ? `${specificAddress}, ${regionAddress}` 
    : '';

  // Tính lại subtotal từ products (để lấy được salePrice)
  const subtotal = items.reduce((sum, item) => {
    const p = products.find(prod => prod.productId === item.productId);
    const priceToUse = (p && p.salePrice !== undefined && p.salePrice !== null && p.salePrice < p.price) ? p.salePrice : item.productPrice;
    return sum + (priceToUse * item.quantity);
  }, 0);
  const [discountCode, setDiscountCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Coupon validation state
  const [couponResult, setCouponResult] = useState<CouponValidationResponse | null>(null);
  const [couponError, setCouponError] = useState('');

  // Tính toán giá trị hiển thị
  const orderDiscount = couponResult?.valid && couponResult.type === 'ORDER'
    ? (couponResult.discountAmount ?? 0)
    : 0;
  const shippingDiscount = couponResult?.valid && couponResult.type === 'SHIPPING'
    ? Math.min(couponResult.discountAmount ?? 0, BASE_SHIPPING)
    : 0;
  
  const finalShippingFee = Math.max(BASE_SHIPPING - shippingDiscount, 0);
  const finalAmount = Math.max(subtotal - orderDiscount, 0) + finalShippingFee;

  // Load products to compare prices
  React.useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Áp dụng coupon — gọi API validate để preview
  const handleApplyCoupon = useCallback(async (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setCouponError('Vui lòng nhập mã giảm giá.');
      setCouponResult(null);
      return;
    }

    setIsValidating(true);
    setCouponError('');
    setCouponResult(null);

    try {
      const response = await validateCoupon(code, subtotal);
      if (response.code === 0) {
        setCouponResult(response.data);
        setDiscountCode(code);
        if (!response.data.valid) {
          setCouponError(response.data.message);
        }
      } else {
        setCouponError(response.message || 'Không thể kiểm tra mã giảm giá.');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setIsValidating(false);
    }
  }, [subtotal]);

  // Xóa coupon đã áp dụng
  const handleRemoveCoupon = () => {
    setDiscountCode('');
    setCouponResult(null);
    setCouponError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress) {
      setErrorMsg('Địa chỉ giao hàng là bắt buộc.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // Chỉ gửi discountCode nếu coupon đã validate thành công
      const appliedCode = couponResult?.valid ? couponResult.code : undefined;

      const response = await createOrder({
        shippingAddress,
        shippingNote,
        discountCode: appliedCode,
      });

      if (response.code === 0) {
        clearCart();

        if (paymentMethod === 'VNPAY') {
          const vnpayResponse = await createVNPayUrl(response.data.orderId);
          if (vnpayResponse.code === 0 && vnpayResponse.data) {
            window.location.href = vnpayResponse.data;
            return;
          } else {
            setErrorMsg('Tạo đơn hàng thành công nhưng không thể khởi tạo cổng thanh toán. Vui lòng liên hệ Admin.');
            return;
          }
        }

        // COD → chuyển sang trang đơn hàng
        router.push('/orders');
      } else {
        setErrorMsg(response.message || 'Tạo đơn hàng thất bại.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Có lỗi xảy ra khi tạo đơn hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="min-h-[70vh] pt-32 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-slate-700 mb-6">shopping_cart</span>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Giỏ hàng trống</h2>
        <p className="text-slate-500 mb-8">Thêm sản phẩm vào giỏ hàng để tiến hành thanh toán.</p>
        <Link href="/products" className="px-8 py-4 bg-sky-600 text-white rounded-xl font-bold hover:bg-sky-700 transition-all">
          Xem Sản Phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-slate-50 dark:bg-slate-950 font-['Inter']">
      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12">
        <header className="mb-10">
          <Link href="/cart" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-sky-600 transition-all mb-4 group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Quay lại Giỏ hàng
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Xác nhận Đơn hàng</h1>
          <p className="text-sm text-slate-500 mt-1">Nhập thông tin giao hàng để hoàn tất đặt hàng.</p>
        </header>

        {errorMsg && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            {/* Section 1: Địa chỉ giao hàng */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black shadow-lg shadow-sky-600/20 text-sm">1</div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Thông Tin Giao Hàng</h2>
              </div>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-4">
                  <AddressSelector 
                    onAddressChange={(data) => setRegionAddress(data.fullAddress)}
                  />
                  
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">Số nhà, tên đường *</label>
                    <input
                      required
                      value={specificAddress}
                      onChange={(e) => setSpecificAddress(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                      placeholder="VD: Số 123, Đường Lê Lợi"
                    />
                  </div>
                  
                  {shippingAddress && (
                    <div className="p-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-xl">
                      <p className="text-[10px] font-black uppercase text-sky-600 mb-1">Địa chỉ giao hàng đầy đủ:</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{shippingAddress}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 ml-1">Ghi chú đơn hàng (tùy chọn)</label>
                  <textarea
                    value={shippingNote}
                    onChange={(e) => setShippingNote(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all resize-none"
                    placeholder="Hướng dẫn giao hàng đặc biệt..."
                  />
                </div>
              </div>
            </section>

            {/* Section 2: Coupon */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-sky-600 text-white flex items-center justify-center font-black shadow-lg shadow-sky-600/20 text-sm">2</div>
                <h2 className="text-xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Mã Giảm Giá</h2>
              </div>

              {/* Hiển thị coupon đã áp dụng thành công */}
              {couponResult?.valid ? (
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                      <div>
                        <p className="text-sm font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                          {couponResult.code}
                        </p>
                        <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-0.5">
                          {couponResult.type === 'SHIPPING'
                            ? `Miễn phí vận chuyển ${formatPrice(couponResult.discountAmount ?? 0)}`
                            : `Giảm ${formatPrice(couponResult.discountAmount ?? 0)} cho đơn hàng`
                          }
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="p-1.5 rounded-lg text-emerald-500 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <span className="material-symbols-outlined text-lg">close</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 ml-1">Áp dụng mã giảm giá để nhận thêm ưu đãi cho đơn hàng của bạn.</p>
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-lg">confirmation_number</span>
                      <input
                        value={discountCode}
                        onChange={(e) => {
                          setDiscountCode(e.target.value.toUpperCase());
                          setCouponError('');
                        }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon(discountCode))}
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 text-sm font-bold focus:ring-2 focus:ring-sky-500/20 outline-none transition-all uppercase tracking-wider"
                        placeholder="Nhập mã hoặc chọn từ kho..."
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(discountCode)}
                      disabled={isValidating || !discountCode.trim()}
                      className="px-6 py-3 bg-sky-600 text-white rounded-xl font-bold text-sm hover:bg-sky-700 transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-sky-600/20"
                    >
                      {isValidating
                        ? <><span className="material-symbols-outlined animate-spin text-sm">refresh</span></>
                        : 'Áp dụng'
                      }
                    </button>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-dashed border-sky-500/30 bg-sky-50/50 dark:bg-sky-900/10 text-sky-600 dark:text-sky-400 text-xs font-black uppercase tracking-widest hover:bg-sky-100 dark:hover:bg-sky-900/20 transition-all group"
                  >
                    <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">loyalty</span>
                    Mở Kho Voucher
                  </button>

                  {couponError && (
                    <p className="text-xs text-red-500 font-medium mt-2 ml-1 flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {couponError}
                    </p>
                  )}
                </div>
              )}
            </section>

            {/* Section 3: Phương thức thanh toán */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-sky-600 text-white flex items-center justify-center font-black text-xs">3</div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight italic">Phương Thức Thanh Toán</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <PaymentOption
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(val) => setPaymentMethod(val as 'COD')}
                  icon="payments"
                  title="Thanh toán khi nhận hàng"
                  sub="Cash on Delivery (COD)"
                />
                <PaymentOption
                  name="paymentMethod"
                  value="VNPAY"
                  checked={paymentMethod === 'VNPAY'}
                  onChange={(val) => setPaymentMethod(val as 'VNPAY')}
                  icon="account_balance"
                  title="Thanh toán trực tuyến"
                  sub="VNPay / Chuyển khoản"
                />
              </div>
            </section>
          </div>

          {/* Sidebar: Order Summary */}
          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-600/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-8 text-slate-400 italic flex justify-between items-center">
                <span>Tóm tắt đơn hàng ({itemCount} sản phẩm)</span>
                <span className="text-white text-xs">{formatPrice(subtotal)}</span>
              </h2>

              <div className="space-y-4 mb-10 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {items.map((item) => {
                  const p = products.find(prod => prod.productId === item.productId);
                  const hasDiscount = p && p.salePrice !== undefined && p.salePrice !== null && p.salePrice < p.price;
                  const currentPrice = hasDiscount ? p.salePrice! : item.productPrice;
                  const originalPrice = p ? p.price : item.productPrice;
                  
                  return (
                    <SummaryItem
                      key={item.productId}
                      title={item.productName}
                      qty={item.quantity}
                      price={formatPrice(currentPrice * item.quantity)}
                      originalPrice={hasDiscount ? formatPrice(originalPrice * item.quantity) : undefined}
                    />
                  );
                })}
              </div>

              <div className="border-t border-white/10 pt-6 space-y-3 mb-8">
                <div className="flex justify-between items-center text-xs font-bold text-slate-400 tracking-widest">
                  <span>Tạm tính</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center text-xs font-bold text-slate-400 tracking-widest">
                  <span>Phí vận chuyển</span>
                  <span>{formatPrice(BASE_SHIPPING)}</span>
                </div>

                {/* Hiển thị discount ORDER */}
                {couponResult?.valid && couponResult.type === 'ORDER' && (
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400 tracking-widest">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">confirmation_number</span>
                      Mã giảm giá ({couponResult.code})
                    </span>
                    <span>-{formatPrice(orderDiscount)}</span>
                  </div>
                )}

                {/* Hiển thị discount SHIPPING */}
                {couponResult?.valid && couponResult.type === 'SHIPPING' && (
                  <div className="flex justify-between items-center text-xs font-bold text-emerald-400 tracking-widest">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">local_shipping</span>
                      Giảm phí ship ({couponResult.code})
                    </span>
                    <span>-{formatPrice(shippingDiscount)}</span>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-white/10 flex flex-col mb-10">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Thành tiền</span>
                <span className="text-3xl font-black tracking-tighter text-sky-400 italic">{formatPrice(finalAmount)}</span>
                {couponResult?.valid && (
                  (() => {
                    const saved = couponResult.type === 'SHIPPING' ? shippingDiscount : orderDiscount;
                    if (saved <= 0) return null;
                    return (
                      <span className="text-[10px] text-emerald-400 font-bold mt-1">
                        Bạn tiết kiệm được {formatPrice(saved)}!
                      </span>
                    );
                  })()
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-[0.2em] shadow-lg hover:bg-sky-500 hover:text-white hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex justify-center items-center gap-2"
              >
                {isSubmitting ? (
                  <><span className="material-symbols-outlined animate-spin text-sm">refresh</span> Đang xử lý...</>
                ) : (
                  'Xác Nhận Đặt Hàng'
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
      {/* Render Voucher Modal */}
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onApply={(code) => {
          handleApplyCoupon(code);
        }}
        currentSubtotal={subtotal}
      />
    </div>
  );
}

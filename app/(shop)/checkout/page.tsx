'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useCart } from '@/hooks/useCart';
import { useProduct } from '@/hooks/useProduct';
import { formatPrice } from '@/lib/utils';
import { createOrder } from '@/lib/api/orders';
import { validateCoupon } from '@/lib/api/discount';
import { createVNPayUrl } from '@/lib/api/payment';
import { checkoutSchema } from '@/schemas/checkout';
import type { CouponValidationResponse } from '@/schemas/discount';
import PaymentOption from './_components/PaymentOption';
import SummaryItem from './_components/SummaryItem';
import VoucherModal from './_components/VoucherModal';
import AddressSelector from '@/components/ui/AddressSelector';

const BASE_SHIPPING = 30000;

export default function Pagecheckout() {
  const router = useRouter();
  const { items, itemCount, clearCart } = useCart();
  const { products, fetchProducts } = useProduct();

  const [specificAddress, setSpecificAddress] = useState('');
  const [regionAddress, setRegionAddress] = useState('');
  const [shippingNote, setShippingNote] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'VNPAY'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [couponError, setCouponError] = useState('');
  const [appliedCoupons, setAppliedCoupons] = useState<CouponValidationResponse[]>([]);

  const shippingAddress = specificAddress && regionAddress ? `${specificAddress}, ${regionAddress}` : '';

  const subtotal = items.reduce((sum, item) => {
    const product = products.find((candidate) => candidate.productId === item.productId);
    const priceToUse = product && product.salePrice != null && product.salePrice < product.price
      ? product.salePrice
      : item.productPrice;
    return sum + priceToUse * item.quantity;
  }, 0);

  const orderCoupon = appliedCoupons.find((coupon) => coupon.type === 'ORDER');
  const shippingCoupon = appliedCoupons.find((coupon) => coupon.type === 'SHIPPING');
  const orderDiscount = orderCoupon?.discountAmount ?? 0;
  const shippingDiscount = Math.min(shippingCoupon?.discountAmount ?? 0, BASE_SHIPPING);
  const finalShippingFee = Math.max(BASE_SHIPPING - shippingDiscount, 0);
  const finalAmount = Math.max(subtotal - orderDiscount, 0) + finalShippingFee;

  const appliedCodes = useMemo(() => appliedCoupons.map((coupon) => coupon.code), [appliedCoupons]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const mergeCoupon = (coupon: CouponValidationResponse) => {
    setAppliedCoupons((current) => {
      const next = current.filter((item) => item.type !== coupon.type);
      next.push(coupon);
      return next;
    });
  };

  const handleApplyCoupon = useCallback(async (codeToApply: string) => {
    const code = codeToApply.trim().toUpperCase();
    if (!code) {
      setCouponError('Vui lòng nhập mã giảm giá.');
      return;
    }

    setIsValidating(true);
    setCouponError('');

    try {
      const response = await validateCoupon(code, subtotal);
      if (response.code !== 0) {
        setCouponError(response.message || 'Không thể xác thực mã giảm giá.');
        return;
      }

      const coupon = response.data;
      if (!coupon.valid || !coupon.type) {
        setCouponError(coupon.message);
        return;
      }

      mergeCoupon(coupon);
      setManualCode('');
      toast.success(coupon.type === 'SHIPPING'
        ? `Đã áp dụng mã giảm phí ship ${coupon.code}.`
        : `Đã áp dụng mã giảm giá đơn hàng ${coupon.code}.`);
    } catch (error: unknown) {
      setCouponError(error instanceof Error ? error.message : 'Không thể xác thực mã giảm giá.');
    } finally {
      setIsValidating(false);
    }
  }, [subtotal]);

  const removeCoupon = (type: 'ORDER' | 'SHIPPING') => {
    setAppliedCoupons((current) => current.filter((coupon) => coupon.type !== type));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFieldErrors({});

    const result = checkoutSchema.safeParse({
      regionAddress,
      specificAddress,
      shippingNote,
      paymentMethod,
    });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (typeof path === 'string') {
          formattedErrors[path] = issue.message;
        }
      });
      setFieldErrors(formattedErrors);
      setErrorMsg('Vui lòng kiểm tra lại thông tin giao hàng.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const response = await createOrder({
        shippingAddress,
        shippingNote,
        discountCodes: appliedCodes,
      });

      if (response.code !== 0) {
        setErrorMsg(response.message || 'Không thể đặt hàng.');
        return;
      }

      clearCart();

      if (paymentMethod === 'VNPAY') {
        const vnpayResponse = await createVNPayUrl(response.data.orderId);
        if (vnpayResponse.code === 0 && vnpayResponse.data) {
          window.location.href = vnpayResponse.data;
          return;
        }

        setErrorMsg('Đơn hàng đã tạo nhưng cổng thanh toán không thể khởi tạo.');
        return;
      }

      router.push('/orders');
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi đặt hàng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 pt-32 dark:bg-slate-950">
        <span className="material-symbols-outlined mb-6 text-6xl text-slate-300 dark:text-slate-700">shopping_cart</span>
        <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">Giỏ hàng trống</h2>
        <p className="mb-8 text-slate-500">Thêm sản phẩm trước khi thanh toán.</p>
        <Link href="/products" className="rounded-xl bg-sky-600 px-8 py-4 font-bold text-white transition-all hover:bg-sky-700">
          Xem sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 font-['Inter'] dark:bg-slate-950">
      <main className="mx-auto max-w-6xl px-6 py-12 md:px-12">
        <header className="mb-10">
          <Link href="/cart" className="group mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 transition-all hover:text-sky-600">
            <span className="material-symbols-outlined text-[18px] transition-transform group-hover:-translate-x-1">arrow_back</span>
            Quay lại giỏ hàng
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Thanh toán</h1>
          <p className="mt-1 text-sm text-slate-500">Xác nhận thông tin giao hàng và mã giảm giá trước khi đặt hàng.</p>
        </header>

        {errorMsg ? (
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-600">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-sm font-black text-white">1</div>
                <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Thông tin giao hàng</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-1.5">
                  <AddressSelector onAddressChange={(data) => setRegionAddress(data.fullAddress)} />
                  {fieldErrors.regionAddress && (
                    <p className="ml-1 text-[10px] font-bold text-red-500">{fieldErrors.regionAddress}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Địa chỉ cụ thể *</label>
                  <input
                    required
                    value={specificAddress}
                    onChange={(event) => setSpecificAddress(event.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Số nhà, tên đường"
                  />
                  {fieldErrors.specificAddress && (
                    <p className="ml-1 text-[10px] font-bold text-red-500">{fieldErrors.specificAddress}</p>
                  )}
                </div>

                {shippingAddress ? (
                  <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-900/20">
                    <p className="mb-1 text-[10px] font-black uppercase text-sky-600">Địa chỉ giao hàng</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{shippingAddress}</p>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Ghi chú giao hàng</label>
                  <textarea
                    value={shippingNote}
                    onChange={(event) => setShippingNote(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Hướng dẫn giao hàng (tùy chọn)..."
                  />
                  {fieldErrors.shippingNote && (
                    <p className="ml-1 text-[10px] font-bold text-red-500">{fieldErrors.shippingNote}</p>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-sm font-black text-white">2</div>
                <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Mã giảm giá</h2>
              </div>

              <div className="space-y-4">
                {orderCoupon ? (
                  <AppliedCouponCard
                    title="Mã giảm giá đơn hàng"
                    coupon={orderCoupon}
                    onRemove={() => removeCoupon('ORDER')}
                  />
                ) : null}

                {shippingCoupon ? (
                  <AppliedCouponCard
                    title="Mã giảm phí ship"
                    coupon={shippingCoupon}
                    onRemove={() => removeCoupon('SHIPPING')}
                  />
                ) : null}

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <input
                      value={manualCode}
                      onChange={(event) => {
                        setManualCode(event.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          void handleApplyCoupon(manualCode);
                        }
                      }}
                      className="flex-1 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold uppercase tracking-wider text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      placeholder="Nhập mã giảm giá đơn hàng hoặc vận chuyển"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon(manualCode)}
                      disabled={isValidating || !manualCode.trim()}
                      className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isValidating ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-500/30 bg-sky-50/50 py-3.5 text-xs font-black uppercase tracking-widest text-sky-600 transition-all hover:bg-sky-100 dark:bg-sky-900/10 dark:text-sky-400 dark:hover:bg-sky-900/20"
                  >
                    <span className="material-symbols-outlined text-lg">loyalty</span>
                    Mở kho voucher
                  </button>

                  {couponError ? (
                    <p className="ml-1 flex items-center gap-1 text-xs font-medium text-red-500">
                      <span className="material-symbols-outlined text-sm">error</span>
                      {couponError}
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-black text-white dark:bg-sky-600">3</div>
                <h2 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white">Phương thức thanh toán</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PaymentOption
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(value) => setPaymentMethod(value as 'COD')}
                  icon="payments"
                  title="Thanh toán khi nhận hàng"
                  sub="Thanh toán khi đơn hàng được giao"
                />
                <PaymentOption
                  name="paymentMethod"
                  value="VNPAY"
                  checked={paymentMethod === 'VNPAY'}
                  onChange={(value) => setPaymentMethod(value as 'VNPAY')}
                  icon="account_balance"
                  title="VNPay"
                  sub="Thanh toán trực tuyến trước khi giao"
                />
              </div>
              {fieldErrors.paymentMethod && (
                <p className="mt-3 ml-1 text-[10px] font-bold text-red-500">{fieldErrors.paymentMethod}</p>
              )}
            </section>
          </div>

          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
              <h2 className="mb-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Tóm tắt đơn hàng ({itemCount} sản phẩm)</span>
                <span className="text-xs text-white">{formatPrice(subtotal)}</span>
              </h2>

              <div className="custom-scrollbar mb-10 max-h-60 space-y-4 overflow-y-auto pr-2">
                {items.map((item) => {
                  const product = products.find((candidate) => candidate.productId === item.productId);
                  const hasDiscount = product && product.salePrice != null && product.salePrice < product.price;
                  const currentPrice = hasDiscount ? product.salePrice! : item.productPrice;
                  const originalPrice = product ? product.price : item.productPrice;

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

              <div className="mb-8 space-y-3 border-t border-white/10 pt-6">
                <PriceRow label="Tạm tính" value={formatPrice(subtotal)} />
                <PriceRow label="Phí vận chuyển" value={formatPrice(BASE_SHIPPING)} />

                {orderCoupon ? (
                  <PriceRow
                    label={`Giảm giá đơn (${orderCoupon.code})`}
                    value={`-${formatPrice(orderDiscount)}`}
                    accent
                  />
                ) : null}

                {shippingCoupon ? (
                  <PriceRow
                    label={`Giảm phí ship (${shippingCoupon.code})`}
                    value={`-${formatPrice(shippingDiscount)}`}
                    accent
                  />
                ) : null}
              </div>

              <div className="mb-10 border-t border-white/10 pt-6">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">Tổng cộng</span>
                <span className="text-3xl font-black italic tracking-tighter text-sky-400">{formatPrice(finalAmount)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-all hover:scale-[1.02] hover:bg-sky-500 hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onApply={(code) => {
          void handleApplyCoupon(code);
        }}
        appliedCodes={appliedCodes}
        currentSubtotal={subtotal}
      />
    </div>
  );
}

function AppliedCouponCard({
  title,
  coupon,
  onRemove,
}: {
  title: string;
  coupon: CouponValidationResponse;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{title}</p>
          <p className="mt-1 text-sm font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">{coupon.code}</p>
          <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-500">
            {coupon.type === 'SHIPPING'
              ? `Giảm phí ship ${formatPrice(coupon.discountAmount ?? 0)}`
              : `Giảm giá đơn hàng ${formatPrice(coupon.discountAmount ?? 0)}`}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="rounded-lg p-1.5 text-emerald-500 transition-all hover:bg-red-50 hover:text-red-500"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>
      </div>
    </div>
  );
}

function PriceRow({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex items-center justify-between text-xs font-bold tracking-widest ${accent ? 'text-emerald-400' : 'text-slate-400'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

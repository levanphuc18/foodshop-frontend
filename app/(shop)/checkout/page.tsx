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
import type { CouponValidationResponse } from '@/types/discount';
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
      setCouponError('Please enter a coupon code.');
      return;
    }

    setIsValidating(true);
    setCouponError('');

    try {
      const response = await validateCoupon(code, subtotal);
      if (response.code !== 0) {
        setCouponError(response.message || 'Unable to validate coupon.');
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
        ? `Applied shipping coupon ${coupon.code}.`
        : `Applied order coupon ${coupon.code}.`);
    } catch (error: unknown) {
      setCouponError(error instanceof Error ? error.message : 'Unable to validate coupon.');
    } finally {
      setIsValidating(false);
    }
  }, [subtotal]);

  const removeCoupon = (type: 'ORDER' | 'SHIPPING') => {
    setAppliedCoupons((current) => current.filter((coupon) => coupon.type !== type));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!shippingAddress) {
      setErrorMsg('Shipping address is required.');
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
        setErrorMsg(response.message || 'Unable to place order.');
        return;
      }

      clearCart();

      if (paymentMethod === 'VNPAY') {
        const vnpayResponse = await createVNPayUrl(response.data.orderId);
        if (vnpayResponse.code === 0 && vnpayResponse.data) {
          window.location.href = vnpayResponse.data;
          return;
        }

        setErrorMsg('Order created but payment gateway could not be initialized.');
        return;
      }

      router.push('/orders');
    } catch (error: unknown) {
      setErrorMsg(error instanceof Error ? error.message : 'An error occurred while placing the order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-slate-50 pt-32 dark:bg-slate-950">
        <span className="material-symbols-outlined mb-6 text-6xl text-slate-300 dark:text-slate-700">shopping_cart</span>
        <h2 className="mb-2 text-2xl font-black text-slate-900 dark:text-white">Your cart is empty</h2>
        <p className="mb-8 text-slate-500">Add products before checking out.</p>
        <Link href="/products" className="rounded-xl bg-sky-600 px-8 py-4 font-bold text-white transition-all hover:bg-sky-700">
          View products
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
            Back to cart
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Checkout</h1>
          <p className="mt-1 text-sm text-slate-500">Confirm your shipping information and discounts before placing the order.</p>
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
                <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Shipping information</h2>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <AddressSelector onAddressChange={(data) => setRegionAddress(data.fullAddress)} />

                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Street address *</label>
                  <input
                    required
                    value={specificAddress}
                    onChange={(event) => setSpecificAddress(event.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="House number, street"
                  />
                </div>

                {shippingAddress ? (
                  <div className="rounded-xl border border-sky-100 bg-sky-50 p-3 dark:border-sky-800 dark:bg-sky-900/20">
                    <p className="mb-1 text-[10px] font-black uppercase text-sky-600">Delivery address</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{shippingAddress}</p>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Delivery note</label>
                  <textarea
                    value={shippingNote}
                    onChange={(event) => setShippingNote(event.target.value)}
                    rows={3}
                    className="w-full resize-none rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    placeholder="Optional delivery instructions..."
                  />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-slate-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-6 flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-sm font-black text-white">2</div>
                <h2 className="text-xl font-black uppercase italic tracking-tight text-slate-900 dark:text-white">Discounts</h2>
              </div>

              <div className="space-y-4">
                {orderCoupon ? (
                  <AppliedCouponCard
                    title="Order coupon"
                    coupon={orderCoupon}
                    onRemove={() => removeCoupon('ORDER')}
                  />
                ) : null}

                {shippingCoupon ? (
                  <AppliedCouponCard
                    title="Shipping coupon"
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
                      placeholder="Enter ORDER or SHIPPING coupon code"
                    />
                    <button
                      type="button"
                      onClick={() => void handleApplyCoupon(manualCode)}
                      disabled={isValidating || !manualCode.trim()}
                      className="rounded-xl bg-sky-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isValidating ? 'Checking...' : 'Apply'}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsVoucherModalOpen(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-500/30 bg-sky-50/50 py-3.5 text-xs font-black uppercase tracking-widest text-sky-600 transition-all hover:bg-sky-100 dark:bg-sky-900/10 dark:text-sky-400 dark:hover:bg-sky-900/20"
                  >
                    <span className="material-symbols-outlined text-lg">loyalty</span>
                    Open voucher library
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
                <h2 className="text-lg font-black italic tracking-tight text-slate-900 dark:text-white">Payment method</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <PaymentOption
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={(value) => setPaymentMethod(value as 'COD')}
                  icon="payments"
                  title="Cash on delivery"
                  sub="Pay when your order arrives"
                />
                <PaymentOption
                  name="paymentMethod"
                  value="VNPAY"
                  checked={paymentMethod === 'VNPAY'}
                  onChange={(value) => setPaymentMethod(value as 'VNPAY')}
                  icon="account_balance"
                  title="VNPay"
                  sub="Pay online before shipment"
                />
              </div>
            </section>
          </div>

          <div className="space-y-6 lg:sticky lg:top-28">
            <div className="relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl">
              <h2 className="mb-8 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span>Order summary ({itemCount} items)</span>
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
                <PriceRow label="Subtotal" value={formatPrice(subtotal)} />
                <PriceRow label="Shipping fee" value={formatPrice(BASE_SHIPPING)} />

                {orderCoupon ? (
                  <PriceRow
                    label={`Order discount (${orderCoupon.code})`}
                    value={`-${formatPrice(orderDiscount)}`}
                    accent
                  />
                ) : null}

                {shippingCoupon ? (
                  <PriceRow
                    label={`Shipping discount (${shippingCoupon.code})`}
                    value={`-${formatPrice(shippingDiscount)}`}
                    accent
                  />
                ) : null}
              </div>

              <div className="mb-10 border-t border-white/10 pt-6">
                <span className="mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-400">Total</span>
                <span className="text-3xl font-black italic tracking-tighter text-sky-400">{formatPrice(finalAmount)}</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-xs font-black uppercase tracking-[0.2em] text-slate-900 transition-all hover:scale-[1.02] hover:bg-sky-500 hover:text-white disabled:pointer-events-none disabled:opacity-50"
              >
                {isSubmitting ? 'Processing...' : 'Place order'}
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
              ? `Shipping discount ${formatPrice(coupon.discountAmount ?? 0)}`
              : `Order discount ${formatPrice(coupon.discountAmount ?? 0)}`}
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

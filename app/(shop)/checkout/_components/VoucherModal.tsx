'use client';

import React, { useEffect, useState } from 'react';
import { getAllActiveDiscounts } from '@/lib/api/discount';
import type { DiscountResponse } from '@/types/discount';
import { formatPrice } from '@/lib/utils';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  currentSubtotal: number;
  appliedCodes?: string[];
}

export default function VoucherModal({
  isOpen,
  onClose,
  onApply,
  currentSubtotal,
  appliedCodes = [],
}: VoucherModalProps) {
  const [vouchers, setVouchers] = useState<DiscountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ORDER' | 'SHIPPING'>('ORDER');

  useEffect(() => {
    if (!isOpen) return;
    void fetchVouchers();
  }, [isOpen]);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const response = await getAllActiveDiscounts();
      if (response.code === 0 && response.data) {
        setVouchers(response.data.filter((discount) => discount.type === 'ORDER' || discount.type === 'SHIPPING'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayVouchers = vouchers.filter((voucher) => voucher.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-900/50">
          <div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white">Voucher Library</h2>
            <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Pick ORDER or SHIPPING discounts</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="flex border-b border-slate-100 px-6 dark:border-slate-800">
          {(['ORDER', 'SHIPPING'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`mr-6 border-b-2 py-4 text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? 'border-sky-600 text-sky-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              {tab === 'ORDER' ? 'Order vouchers' : 'Shipping vouchers'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-6 dark:bg-slate-950/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <span className="material-symbols-outlined animate-spin text-3xl text-sky-500">refresh</span>
              <p className="text-xs font-black text-slate-500 dark:text-slate-400">Loading vouchers...</p>
            </div>
          ) : displayVouchers.length === 0 ? (
            <div className="py-12 text-center text-sm font-bold text-slate-500">No vouchers available in this section.</div>
          ) : (
            <div className="space-y-4">
              {displayVouchers.map((voucher) => {
                const isEligible = !voucher.minOrderAmount || currentSubtotal >= voucher.minOrderAmount;
                const isApplied = appliedCodes.includes(voucher.code);

                return (
                  <div
                    key={voucher.discountId}
                    className={`rounded-2xl border bg-white p-4 shadow-sm transition-all dark:bg-slate-900 ${
                      isEligible
                        ? 'border-slate-200 hover:border-sky-300 dark:border-slate-800 dark:hover:border-sky-700'
                        : 'border-slate-200 opacity-60 grayscale dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded border border-sky-200 bg-sky-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-sky-600 dark:border-sky-900/30 dark:bg-sky-900/20 dark:text-sky-400">
                            {voucher.code}
                          </span>
                          {isApplied && (
                            <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400">
                              Applied
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                          {voucher.discountUnit === 'PERCENT'
                            ? `${voucher.value}% ${voucher.type === 'SHIPPING' ? 'shipping off' : 'off your order'}`
                            : `${formatPrice(voucher.value)} ${voucher.type === 'SHIPPING' ? 'shipping off' : 'off your order'}`}
                        </h3>
                        <div className="space-y-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                          {voucher.minOrderAmount ? <p>Minimum order: {formatPrice(voucher.minOrderAmount)}</p> : null}
                          {voucher.maxDiscount && voucher.discountUnit === 'PERCENT' ? <p>Cap: {formatPrice(voucher.maxDiscount)}</p> : null}
                          {voucher.usageLimit ? <p>Usage: {voucher.usedCount}/{voucher.usageLimit}</p> : null}
                          {voucher.perUserLimit ? <p>Per-user limit: {voucher.perUserLimit}</p> : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={!isEligible}
                        onClick={() => {
                          onApply(voucher.code);
                          onClose();
                        }}
                        className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {isApplied ? 'Replace' : 'Use'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

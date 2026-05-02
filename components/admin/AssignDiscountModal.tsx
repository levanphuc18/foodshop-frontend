'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useDiscount } from '@/hooks/useDiscount';
import type { DiscountResponse } from '@/types/discount';
import type { ProductResponse } from '@/types/product';
import { formatPrice } from '@/lib/utils';

interface AssignDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (payload: { discountId: number | null; replaceExisting: boolean }) => void;
  isLoading: boolean;
  selectedProducts: ProductResponse[];
}

const formatDateRange = (discount: DiscountResponse) =>
  `${new Date(discount.startDate).toLocaleDateString('vi-VN')} - ${new Date(discount.endDate).toLocaleDateString('vi-VN')}`;

const computeSalePrice = (product: ProductResponse, discount: DiscountResponse) => {
  if (discount.discountUnit === 'AMOUNT') {
    return Math.max(product.price - discount.value, 0);
  }

  const rawDiscount = (product.price * discount.value) / 100;
  const cappedDiscount = discount.maxDiscount != null ? Math.min(rawDiscount, discount.maxDiscount) : rawDiscount;
  return Math.max(product.price - cappedDiscount, 0);
};

export default function AssignDiscountModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  selectedProducts,
}: AssignDiscountModalProps) {
  const { discounts, fetchDiscounts, isLoading: isDiscountsLoading } = useDiscount();
  const [selectedDiscountId, setSelectedDiscountId] = useState<string>('');
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchDiscounts();
    }
  }, [isOpen, fetchDiscounts]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedDiscountId('');
      setReplaceExisting(false);
      setSearchTerm('');
    }
  }, [isOpen]);

  const selectedDiscount = useMemo(() => {
    if (!selectedDiscountId || selectedDiscountId === 'clear') {
      return null;
    }
    return discounts.find((discount) => discount.discountId === Number(selectedDiscountId)) ?? null;
  }, [discounts, selectedDiscountId]);

  const discountCodeById = useMemo(
    () =>
      discounts.reduce<Record<number, string>>((acc, discount) => {
        acc[discount.discountId] = discount.code;
        return acc;
      }, {}),
    [discounts]
  );

  const productDiscounts = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return discounts
      .filter((discount) => {
        if (discount.type !== 'PRODUCT' || discount.status !== 'ACTIVE') return false;
        // BUG FIX: Loại bỏ các discount đã hết hạn ngay cả khi backend vẫn trả về status=ACTIVE
        const end = new Date(discount.endDate);
        end.setHours(0, 0, 0, 0);
        return end >= today;
      })
      .filter((discount) => {
        if (!keyword) {
          return true;
        }
        return (
          discount.code.toLowerCase().includes(keyword) ||
          discount.type.toLowerCase().includes(keyword)
        );
      });
  }, [discounts, searchTerm]);

  const summary = useMemo(() => {
    const selectedCount = selectedProducts.length;
    if (selectedDiscountId === 'clear') {
      return {
        selectedCount,
        readyCount: selectedCount,
        replaceCount: 0,
        skippedCount: 0,
      };
    }

    if (!selectedDiscount) {
      return {
        selectedCount,
        readyCount: 0,
        replaceCount: 0,
        skippedCount: selectedCount,
      };
    }

    let replaceCount = 0;
    let readyCount = 0;
    let skippedCount = 0;

    selectedProducts.forEach((product) => {
      const hasDifferentDiscount = product.discountId != null && product.discountId !== selectedDiscount.discountId;
      if (hasDifferentDiscount) {
        if (replaceExisting) {
          replaceCount += 1;
          readyCount += 1;
        } else {
          skippedCount += 1;
        }
        return;
      }
      readyCount += 1;
    });

    return { selectedCount, readyCount, replaceCount, skippedCount };
  }, [replaceExisting, selectedDiscount, selectedDiscountId, selectedProducts]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="flex items-start justify-between gap-6 border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Apply Product Discount</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Assign one <span className="font-semibold text-sky-600 dark:text-sky-400">PRODUCT</span> discount to the selected products.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <div className="grid gap-0 lg:grid-cols-[1.25fr_0.95fr]">
          <div className="border-b border-slate-100 p-6 dark:border-slate-800 lg:border-b-0 lg:border-r">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Discount Picker</div>
                <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {selectedProducts.length} product(s) currently selected.
                </div>
              </div>
              <div className="relative w-full sm:w-72">
                <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-400">search</span>
                <input
                  type="text"
                  placeholder="Search code..."
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:ring-2 focus:ring-sky-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedDiscountId('clear')}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  selectedDiscountId === 'clear'
                    ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                    : 'border-slate-200 hover:border-red-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-red-800/80 dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`mt-1 h-5 w-5 rounded-full border-2 ${selectedDiscountId === 'clear' ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {selectedDiscountId === 'clear' && <div className="m-[3px] h-2.5 w-2.5 rounded-full bg-red-500" />}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-red-600 dark:text-red-400">Remove Current Discount</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Clear product-level discounts from all selected products.
                    </div>
                  </div>
                </div>
              </button>

              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {isDiscountsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
                  </div>
                ) : productDiscounts.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-12 text-center dark:border-slate-800 dark:bg-slate-900/60">
                    <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">No active PRODUCT discounts found.</div>
                  </div>
                ) : (
                  productDiscounts.map((discount) => {
                    const isPercent = discount.discountUnit === 'PERCENT';
                    const isSelected = selectedDiscountId === String(discount.discountId);

                    return (
                      <button
                        type="button"
                        key={discount.discountId}
                        onClick={() => setSelectedDiscountId(String(discount.discountId))}
                        className={`w-full rounded-2xl border p-4 text-left transition ${
                          isSelected
                            ? 'border-sky-300 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30'
                            : 'border-slate-200 hover:border-sky-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-sky-900 dark:hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`mt-1 h-5 w-5 rounded-full border-2 ${isSelected ? 'border-sky-500' : 'border-slate-300 dark:border-slate-600'}`}>
                            {isSelected && <div className="m-[3px] h-2.5 w-2.5 rounded-full bg-sky-500" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div>
                                <div className="text-sm font-bold uppercase text-slate-900 dark:text-white">{discount.code}</div>
                                <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{formatDateRange(discount)}</div>
                              </div>
                              <div className="rounded-full bg-sky-100 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
                                {isPercent ? `${discount.value}% off` : formatPrice(discount.value)}
                              </div>
                            </div>
                            <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                              <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{discount.type}</span>
                              <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">{discount.discountUnit}</span>
                              {discount.maxDiscount != null && isPercent && (
                                <span className="rounded-full bg-slate-100 px-2 py-1 dark:bg-slate-800">
                                  Cap {formatPrice(discount.maxDiscount)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Assignment Preview</div>
                <div className="mt-2 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Selected</div>
                    <div className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{summary.selectedCount}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Ready To Apply</div>
                    <div className="mt-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{summary.readyCount}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Will Replace</div>
                    <div className="mt-2 text-2xl font-bold text-amber-600 dark:text-amber-400">{summary.replaceCount}</div>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                    <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Skipped</div>
                    <div className="mt-2 text-2xl font-bold text-slate-500 dark:text-slate-300">{summary.skippedCount}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={replaceExisting}
                    onChange={(event) => setReplaceExisting(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    disabled={selectedDiscountId === 'clear'}
                  />
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">Replace existing product discounts</div>
                    <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Enable this if selected products already have another product-level discount and you want to override it.
                    </div>
                  </div>
                </label>
              </div>

              <div className="rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="border-b border-slate-100 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  Product Snapshot
                </div>
                <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {selectedProducts.map((product) => {
                    const hasConflict = selectedDiscount != null && product.discountId != null && product.discountId !== selectedDiscount.discountId;
                    const nextPrice = selectedDiscount ? computeSalePrice(product, selectedDiscount) : null;

                    return (
                      <div key={product.productId} className="flex items-start justify-between gap-4 px-4 py-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-semibold text-slate-900 dark:text-white">{product.name}</div>
                          <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                            <span>#{product.productId}</span>
                            {product.discountId != null && (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 dark:bg-slate-800">
                                Current discount {discountCodeById[product.discountId] ?? `#${product.discountId}`}
                              </span>
                            )}
                            {hasConflict && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                {replaceExisting ? 'Will replace' : 'Needs replace'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-slate-900 dark:text-white">{formatPrice(product.price)}</div>
                          {selectedDiscount && (
                            <div className="mt-1 text-xs text-sky-600 dark:text-sky-400">
                              {formatPrice(nextPrice ?? product.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50 px-6 py-5 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-slate-500 dark:text-slate-400">
            {selectedDiscountId === 'clear'
              ? 'The current product discount will be removed from all selected products.'
              : summary.skippedCount > 0
                ? `${summary.skippedCount} product(s) currently have another product discount and will be skipped unless replacement is enabled.`
                : 'Review the preview before applying the discount.'}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                onConfirm({
                  discountId: selectedDiscountId === 'clear' ? null : selectedDiscount ? selectedDiscount.discountId : null,
                  replaceExisting,
                })
              }
              disabled={isLoading || !selectedDiscountId || summary.readyCount === 0}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />}
              {selectedDiscountId === 'clear'
                ? `Clear ${summary.readyCount} Product${summary.readyCount === 1 ? '' : 's'}`
                : `Apply to ${summary.readyCount} Product${summary.readyCount === 1 ? '' : 's'}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useDiscount } from '@/hooks/useDiscount';
import { formatPrice } from '@/lib/utils';

interface AssignDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (discountId: number | null) => void;
  isLoading: boolean;
  selectedCount: number;
}

export default function AssignDiscountModal({ isOpen, onClose, onConfirm, isLoading, selectedCount }: AssignDiscountModalProps) {
  const { discounts, fetchDiscounts, isLoading: isDiscountsLoading } = useDiscount();
  const [selectedDiscount, setSelectedDiscount] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      fetchDiscounts();
    }
  }, [isOpen, fetchDiscounts]);

  if (!isOpen) return null;

  // Filter for ACTIVE PRODUCT discounts
  const productDiscounts = discounts.filter(
    (d) => d.type === 'PRODUCT' && d.status === 'ACTIVE'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Assign Discount to Products
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Applying discount to <span className="font-bold text-sky-600">{selectedCount}</span> selected product(s).
          </p>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
          {isDiscountsLoading ? (
            <div className="flex justify-center p-8">
              <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : productDiscounts.length === 0 ? (
            <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">loyalty</span>
              <p className="text-sm font-medium text-slate-500">No active Product discounts available.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Option to clear discount */}
              <div
                onClick={() => setSelectedDiscount('clear')}
                className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedDiscount === 'clear'
                    ? 'border-red-500 bg-red-50/50 dark:bg-red-900/10'
                    : 'border-slate-200 dark:border-slate-700 hover:border-red-300'
                  }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedDiscount === 'clear' ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                  {selectedDiscount === 'clear' && <div className="w-2.5 h-2.5 rounded-full bg-red-500" />}
                </div>
                <div>
                  <div className="font-bold text-red-600 dark:text-red-400 text-sm">Remove Discount</div>
                  <div className="text-[11px] text-slate-500">Clear existing discounts from these products</div>
                </div>
              </div>

              {/* Options to select a discount */}
              {productDiscounts.map(discount => {
                const isPercent = discount.discountUnit === 'PERCENT' ||
                  (!discount.discountUnit && discount.maxDiscount && discount.maxDiscount > 0) ||
                  (!discount.discountUnit && discount.value <= 100);

                return (
                  <div
                    key={discount.discountId}
                    onClick={() => setSelectedDiscount(discount.discountId.toString())}
                    className={`flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all ${selectedDiscount === discount.discountId.toString()
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-900/10'
                        : 'border-slate-200 dark:border-slate-700 hover:border-sky-300'
                      }`}
                  >
                    <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedDiscount === discount.discountId.toString() ? 'border-sky-500' : 'border-slate-300 dark:border-slate-600'
                      }`}>
                      {selectedDiscount === discount.discountId.toString() && <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div className="font-bold text-slate-900 dark:text-white text-sm uppercase">{discount.code}</div>
                        <div className="font-bold text-sky-600 dark:text-sky-400 text-sm">
                          -{isPercent ? `${discount.value}%` : formatPrice(discount.value)}
                        </div>
                      </div>
                      {isPercent && discount.maxDiscount && discount.maxDiscount > 0 && (
                        <div className="text-[10px] text-slate-500 mt-1">Max Cap: {formatPrice(discount.maxDiscount)}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(selectedDiscount === 'clear' ? null : selectedDiscount ? parseInt(selectedDiscount, 10) : null)}
            disabled={isLoading || !selectedDiscount}
            className="px-8 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
            {isLoading ? 'Applying...' : 'Apply Discount'}
          </button>
        </div>
      </div>
    </div>
  );
}

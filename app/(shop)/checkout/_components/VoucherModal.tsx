'use client';

import React, { useEffect, useState } from 'react';
import { getAllActiveDiscounts } from '@/lib/api/discount';
import { DiscountResponse } from '@/types/discount';
import { formatPrice } from '@/lib/utils';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (code: string) => void;
  currentSubtotal: number;
}

export default function VoucherModal({ isOpen, onClose, onApply, currentSubtotal }: VoucherModalProps) {
  const [vouchers, setVouchers] = useState<DiscountResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'ORDER' | 'SHIPPING'>('ORDER');

  useEffect(() => {
    if (isOpen) {
      fetchVouchers();
    }
  }, [isOpen]);

  const fetchVouchers = async () => {
    setIsLoading(true);
    try {
      const res = await getAllActiveDiscounts();
      if (res.code === 0 && res.data) {
        // Chỉ lấy các mã ORDER và SHIPPING đang ACTIVE
        const validVouchers = res.data.filter(
          (d) => (d.type === 'ORDER' || d.type === 'SHIPPING') && d.status === 'ACTIVE'
        );
        setVouchers(validVouchers);
      }
    } catch (err) {
      console.error('Lỗi khi tải kho voucher', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const displayVouchers = vouchers.filter((v) => v.type === activeTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">loyalty</span>
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Kho Voucher</h2>
              <p className="text-[11px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Chọn mã giảm giá</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6">
          <button
            onClick={() => setActiveTab('ORDER')}
            className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 mr-6 ${
              activeTab === 'ORDER'
                ? 'border-sky-600 text-sky-600'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Giảm Đơn Hàng
          </button>
          <button
            onClick={() => setActiveTab('SHIPPING')}
            className={`py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 ${
              activeTab === 'SHIPPING'
                ? 'border-emerald-500 text-emerald-500'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            Miễn Phí Vận Chuyển
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/50 custom-scrollbar">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <span className="material-symbols-outlined animate-spin text-3xl text-sky-500">refresh</span>
              <p className="text-xs font-black text-slate-500 dark:text-slate-400">Đang tải voucher...</p>
            </div>
          ) : displayVouchers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-3xl text-slate-300">receipt_long</span>
              </div>
              <p className="text-sm font-bold text-slate-500">Không có mã nào trong mục này</p>
            </div>
          ) : (
            <div className="space-y-4">
              {displayVouchers.map((v) => {
                const isEligible = !v.minOrderAmount || currentSubtotal >= v.minOrderAmount;
                const isShipping = v.type === 'SHIPPING';
                const mainColor = isShipping ? 'emerald' : 'sky';

                return (
                  <div
                    key={v.discountId}
                    className={`relative overflow-hidden rounded-2xl border transition-all ${
                      isEligible
                        ? `bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-${mainColor}-300 dark:hover:border-${mainColor}-700 shadow-sm hover:shadow-md`
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60 grayscale-[0.5]'
                    } flex`}
                  >
                    {/* Left edge decoration */}
                    <div className={`w-2 shrink-0 bg-${mainColor}-500`} />
                    
                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border border-${mainColor}-200 dark:border-${mainColor}-900/30 bg-${mainColor}-50 dark:bg-${mainColor}-900/20 text-${mainColor}-600 dark:text-${mainColor}-400 mb-2`}>
                            <span className="material-symbols-outlined text-[12px]">{isShipping ? 'local_shipping' : 'sell'}</span>
                            <span className="text-[9px] font-black uppercase tracking-wider">{v.code}</span>
                          </div>
                          <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                            {isShipping ? 'Miễn phí vận chuyển' : 'Giảm giá đơn hàng'}
                            {v.discountUnit === 'PERCENT' ? ` ${v.value}%` : ` ${formatPrice(v.value)}`}
                          </h3>
                        </div>
                      </div>
                      
                      <div className="mt-2 space-y-1">
                        {v.minOrderAmount && (
                          <p className={`text-[10px] font-black ${isEligible ? 'text-slate-600 dark:text-slate-400' : 'text-red-500'}`}>
                            Đơn tối thiểu {formatPrice(v.minOrderAmount)}
                          </p>
                        )}
                        {v.maxDiscount && v.discountUnit === 'PERCENT' && (
                          <p className="text-[10px] font-black text-slate-600 dark:text-slate-400">
                            Giảm tối đa {formatPrice(v.maxDiscount)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 flex items-center justify-center p-4 border-l border-slate-100 dark:border-slate-800 border-dashed relative">
                      {/* Ticket cutout top */}
                      <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-slate-50/50 dark:bg-slate-950/50" />
                      {/* Ticket cutout bottom */}
                      <div className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-slate-50/50 dark:bg-slate-950/50" />
                      
                      <button
                        disabled={!isEligible}
                        onClick={() => {
                          onApply(v.code);
                          onClose();
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                          isEligible
                            ? `bg-${mainColor}-600 text-white hover:bg-${mainColor}-700 shadow-lg shadow-${mainColor}-500/20 active:scale-95`
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-400 cursor-not-allowed'
                        }`}
                      >
                        Dùng Ngay
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

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiscountRequest } from '@/types/discount';
import { useDiscount } from '@/hooks/useDiscount';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import { formatPrice } from '@/lib/utils';

interface DiscountEditorProps {
  mode: 'create' | 'edit';
  id?: string;
}

export default function DiscountEditor({ mode, id }: DiscountEditorProps) {
  const router = useRouter();
  const { currentDiscount, fetchDiscountById, handleCreate, handleUpdate, isLoading } = useDiscount();
  
  const [formData, setFormData] = useState<DiscountRequest>({
    code: '',
    type: 'ORDER',
    discountUnit: 'AMOUNT',
    value: 0,
    minOrderAmount: 0,
    maxDiscount: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE',
  });

  // Helper to format numbers with dots
  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Helper to parse dots back to numbers
  const parseNumber = (str: string) => {
    return parseFloat(str.replace(/\./g, '')) || 0;
  };

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchDiscountById(parseInt(id));
    }
  }, [mode, id, fetchDiscountById]);

  useEffect(() => {
    if (mode === 'edit' && currentDiscount) {
      // Determine unit for legacy data if missing: if it has maxDiscount > 0, it was likely PERCENT
      const inferredUnit = currentDiscount.discountUnit || (currentDiscount.maxDiscount && currentDiscount.maxDiscount > 0 ? 'PERCENT' : 'AMOUNT');
      
      setFormData({
        code: currentDiscount.code,
        type: currentDiscount.type,
        discountUnit: inferredUnit,
        value: currentDiscount.value,
        minOrderAmount: currentDiscount.minOrderAmount || 0,
        maxDiscount: currentDiscount.maxDiscount || 0,
        startDate: currentDiscount.startDate,
        endDate: currentDiscount.endDate,
        status: currentDiscount.status,
      });
    }
  }, [mode, currentDiscount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      const newType = value as 'ORDER' | 'PRODUCT' | 'SHIPPING';
      setFormData(prev => ({
        ...prev,
        type: newType,
        // Reset fields based on backend rules
        minOrderAmount: newType === 'PRODUCT' ? undefined : 0,
      }));
      return;
    }

    if (name === 'discountUnit') {
      const newUnit = value as 'PERCENT' | 'AMOUNT';
      setFormData(prev => ({
        ...prev,
        discountUnit: newUnit,
        // If unit is AMOUNT, maxDiscount must be null for backend
        maxDiscount: newUnit === 'AMOUNT' ? undefined : 0,
      }));
      return;
    }

    if (['value', 'minOrderAmount', 'maxDiscount'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: parseNumber(value)
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clean data strictly for backend validation
    const submissionData: any = { ...formData };
    
    if (submissionData.type === 'PRODUCT') {
      delete submissionData.minOrderAmount;
      // Note: maxDiscount IS allowed for PRODUCT if unit is PERCENT.
    } else {
      // ORDER or SHIPPING
      if (!submissionData.minOrderAmount) submissionData.minOrderAmount = 0;
    }

    // maxDiscount is ONLY allowed if unit is PERCENT (applies to all types)
    if (submissionData.discountUnit === 'AMOUNT') {
      delete submissionData.maxDiscount;
    }

    let result;
    if (mode === 'create') {
      result = await handleCreate(submissionData);
    } else if (id) {
      result = await handleUpdate(parseInt(id), submissionData);
    }

    if (result) {
      router.push('/admin/discounts');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          eyebrow={mode === 'create' ? 'PROMOTIONS' : 'EDIT PROMOTION'}
          title={mode === 'create' ? 'Create New Discount' : (currentDiscount ? `Refining ${currentDiscount.code}` : 'Loading...')}
          description={mode === 'create' 
            ? "Launch a new promotional campaign to engage your coastal customers."
            : "Adjust the parameters of your existing promotional offer."
          }
        />

      <div className="mt-8">
        {!currentDiscount && mode === 'edit' && isLoading ? (
          <div className="flex justify-center p-20">
            <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <Panel>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Code */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Discount Code</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 text-sm">tag</span>
                    <input
                      required
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      placeholder="e.g. SUMMER2024"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all uppercase"
                    />
                  </div>
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                    Discount Type {mode === 'edit' && <span className="ml-1 normal-case font-medium text-slate-500 dark:text-slate-400">(Locked)</span>}
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    disabled={mode === 'edit'}
                    className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white outline-none transition-all ${mode === 'edit' ? 'opacity-60 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : 'focus:ring-2 focus:ring-sky-500/20'}`}
                  >
                    <option value="ORDER">Order Voucher (General)</option>
                    <option value="PRODUCT">Product Discount (Direct)</option>
                    <option value="SHIPPING">Shipping Voucher (Delivery)</option>
                  </select>
                </div>

                {/* Unit Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Value Type</label>
                  <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => handleChange({ target: { name: 'discountUnit', value: 'AMOUNT' } } as any)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.discountUnit === 'AMOUNT' ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      Cash (VNĐ)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange({ target: { name: 'discountUnit', value: 'PERCENT' } } as any)}
                      className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${formData.discountUnit === 'PERCENT' ? 'bg-white dark:bg-slate-700 text-sky-600 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="DISABLED">Disabled</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>
              </div>

              {/* Dynamic Value Input */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                  {formData.discountUnit === 'PERCENT' ? 'Discount Rate (%)' : 'Discount Amount (VNĐ)'}
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="value"
                    value={formatNumber(formData.value)}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-left pr-12"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
                    {formData.discountUnit === 'PERCENT' ? '%' : 'VNĐ'}
                  </span>
                </div>
              </div>

              {/* Requirement & Caps Panel */}
              {(formData.type !== 'PRODUCT' || formData.discountUnit === 'PERCENT') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-sky-50/50 dark:bg-sky-900/10 rounded-2xl border border-sky-100 dark:border-sky-900/20">
                  {/* Min Order Amount - applies to ORDER and SHIPPING only */}
                  {formData.type !== 'PRODUCT' ? (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-sky-600">Min Order Requirement (VNĐ)</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="minOrderAmount"
                          value={formatNumber(formData.minOrderAmount)}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-left pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-sky-400">VNĐ</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 flex flex-col justify-center opacity-50">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Min Order Requirement</label>
                      <p className="text-xs font-medium text-slate-400 mt-2 italic">Not applicable for Product discounts.</p>
                    </div>
                  )}

                  {/* Max Discount Cap - applies to PERCENT only */}
                  {formData.discountUnit === 'PERCENT' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-sky-600">Maximum Discount Cap (VNĐ)</label>
                      <div className="relative">
                        <input
                          type="text"
                          name="maxDiscount"
                          value={formatNumber(formData.maxDiscount)}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-sky-200 dark:border-sky-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all text-left pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-sky-400">VNĐ</span>
                      </div>
                    </div>
                  )}
                </div>
              )}


              {formData.type === 'PRODUCT' && (
                <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/20 flex gap-3">
                  <span className="material-symbols-outlined text-amber-600">info</span>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                    Product discounts are applied directly to individual items. Minimum order amount does not apply.
                    {formData.discountUnit === 'PERCENT' && ' Max discount cap can be set.'}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Start Date</label>
                  <input
                    required
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">End Date</label>
                  <input
                    required
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-sky-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 active:scale-95 transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : mode === 'create' ? 'Create Discount' : 'Update Discount'}
                </button>
              </div>
            </form>
          </Panel>
        )}
      </div>
      </div>
    </div>
  );
}


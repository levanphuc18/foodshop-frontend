'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { DiscountRequest } from '@/types/discount';
import { useDiscount } from '@/hooks/useDiscount';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';

interface DiscountEditorProps {
  mode: 'create' | 'edit';
  id?: string;
}

const today = new Date().toISOString().split('T')[0];

const createDefaultForm = (): DiscountRequest => ({
  code: '',
  type: 'ORDER',
  discountUnit: 'AMOUNT',
  value: 0,
  minOrderAmount: 0,
  startDate: today,
  endDate: today,
  status: 'ACTIVE',
});

export default function DiscountEditor({ mode, id }: DiscountEditorProps) {
  const router = useRouter();
  const { currentDiscount, fetchDiscountById, handleCreate, handleUpdate, isLoading } = useDiscount();
  const [formData, setFormData] = useState<DiscountRequest>(createDefaultForm());

  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchDiscountById(parseInt(id, 10));
    }
  }, [mode, id, fetchDiscountById]);

  useEffect(() => {
    if (mode === 'edit' && currentDiscount) {
      setFormData({
        code: currentDiscount.code,
        type: currentDiscount.type,
        discountUnit: currentDiscount.discountUnit,
        value: currentDiscount.value,
        minOrderAmount: currentDiscount.minOrderAmount ?? undefined,
        maxDiscount: currentDiscount.maxDiscount ?? undefined,
        usageLimit: currentDiscount.usageLimit ?? undefined,
        perUserLimit: currentDiscount.perUserLimit ?? undefined,
        startDate: currentDiscount.startDate,
        endDate: currentDiscount.endDate,
        status: currentDiscount.status,
      });
    }
  }, [mode, currentDiscount]);

  const updateFormData = <K extends keyof DiscountRequest>(key: K, value: DiscountRequest[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const setDiscountUnit = (nextUnit: DiscountRequest['discountUnit']) => {
    setFormData((prev) => ({
      ...prev,
      discountUnit: nextUnit,
      maxDiscount: nextUnit === 'AMOUNT' ? undefined : (prev.maxDiscount ?? 0),
    }));
  };

  const formatNumber = (value: number | undefined) => {
    if (value === undefined || value === null) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  };

  const parseNumber = (value: string) => {
    const normalized = value.replace(/\./g, '').replace(/,/g, '.');
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = event.target;

    if (type === 'checkbox') {
      updateFormData(name as keyof DiscountRequest, (event.target as HTMLInputElement).checked as never);
      return;
    }

    if (['value', 'minOrderAmount', 'maxDiscount', 'usageLimit', 'perUserLimit'].includes(name)) {
      updateFormData(name as keyof DiscountRequest, value === '' ? undefined as never : parseNumber(value) as never);
      return;
    }

    if (name === 'type') {
      const nextType = value as DiscountRequest['type'];
      setFormData((prev) => ({
        ...prev,
        type: nextType,
        minOrderAmount: nextType === 'PRODUCT' ? undefined : (prev.minOrderAmount ?? 0),
      }));
      return;
    }

    if (name === 'discountUnit') {
      const nextUnit = value as DiscountRequest['discountUnit'];
      setDiscountUnit(nextUnit);
      return;
    }

    updateFormData(name as keyof DiscountRequest, value as never);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload: DiscountRequest = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      minOrderAmount: formData.type === 'PRODUCT' ? undefined : (formData.minOrderAmount ?? 0),
      maxDiscount: formData.discountUnit === 'PERCENT' ? formData.maxDiscount : undefined,
      usageLimit: formData.usageLimit || undefined,
      perUserLimit: formData.perUserLimit || undefined,
    };

    const result = mode === 'create'
      ? await handleCreate(payload)
      : id
        ? await handleUpdate(parseInt(id, 10), payload)
        : null;

    if (result) {
      router.push('/admin/discounts');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          eyebrow={mode === 'create' ? 'PROMOTIONS' : 'EDIT PROMOTION'}
          title={mode === 'create' ? 'Create New Discount' : currentDiscount ? `Refining ${currentDiscount.code}` : 'Loading...'}
          description={mode === 'create'
            ? 'Launch a new discount campaign with quota and stacking rules.'
            : 'Adjust quota, stacking, and schedule for the selected discount.'}
        />

        <div className="mt-8">
          {!currentDiscount && mode === 'edit' && isLoading ? (
            <div className="flex justify-center p-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
            </div>
          ) : (
            <Panel>
              <form onSubmit={handleSubmit} className="space-y-8 p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Discount Code</label>
                    <input
                      required
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold uppercase text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      disabled={mode === 'edit'}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="ORDER">Order Voucher</option>
                      <option value="PRODUCT">Product Discount</option>
                      <option value="SHIPPING">Shipping Voucher</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Value Type</label>
                    <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                      <button
                        type="button"
                        onClick={() => setDiscountUnit('AMOUNT')}
                        className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.discountUnit === 'AMOUNT'
                            ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        Cash (VNĐ)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountUnit('PERCENT')}
                        className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                          formData.discountUnit === 'PERCENT'
                            ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                        }`}
                      >
                        Percentage (%)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Status</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="DISABLED">Disabled</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                  </div>

                  <NumericField
                    label={formData.discountUnit === 'PERCENT' ? 'Discount Rate (%)' : 'Discount Amount'}
                    name="value"
                    value={formData.value}
                    onChange={handleChange}
                    min={0}
                    step="0.01"
                    formatThousands={formData.discountUnit === 'AMOUNT'}
                    suffix={formData.discountUnit === 'PERCENT' ? '%' : 'VNĐ'}
                  />

                  {formData.type !== 'PRODUCT' ? (
                    <NumericField
                      label="Minimum Order Amount"
                      name="minOrderAmount"
                      value={formData.minOrderAmount}
                      onChange={handleChange}
                      min={0}
                      step="0.01"
                      formatThousands
                      suffix="VNĐ"
                    />
                  ) : (
                    <DisabledField label="Minimum Order Amount" text="Not used for PRODUCT discounts." />
                  )}

                  {formData.discountUnit === 'PERCENT' ? (
                    <NumericField
                      label="Maximum Discount Cap"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      min={0}
                      step="0.01"
                      formatThousands
                      suffix="VNĐ"
                    />
                  ) : (
                    <DisabledField label="Maximum Discount Cap" text="Only used for PERCENT discounts." />
                  )}

                  {/* BUG FIX: type=PRODUCT không dùng Usage Limit và Per-user Limit */}
                  {formData.type === 'PRODUCT' ? (
                    <DisabledField label="Usage Limit" text="Not applicable for PRODUCT discounts." />
                  ) : (
                    <NumericField
                      label="Usage Limit"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleChange}
                      min={0}
                      step="1"
                      placeholder="Leave empty for unlimited"
                    />
                  )}

                  {formData.type === 'PRODUCT' ? (
                    <DisabledField label="Per-user Limit" text="Not applicable for PRODUCT discounts." />
                  ) : (
                    <NumericField
                      label="Per-user Limit"
                      name="perUserLimit"
                      value={formData.perUserLimit}
                      onChange={handleChange}
                      min={0}
                      step="1"
                      placeholder="Leave empty for unlimited"
                    />
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Start Date</label>
                    <input
                      required
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
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
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-sky-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
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

function NumericField({
  label,
  name,
  value,
  onChange,
  min,
  step,
  placeholder,
  formatThousands = false,
  suffix,
}: {
  label: string;
  name: string;
  value: number | undefined;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  step: string;
  placeholder?: string;
  formatThousands?: boolean;
  suffix?: string;
}) {
  const displayValue = value === undefined || value === null
    ? ''
    : formatThousands
      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
      : value;

  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{label}</label>
      <div className="relative">
        <input
          type="text"
          inputMode="decimal"
          name={name}
          value={displayValue}
          onChange={onChange}
          min={min}
          step={step}
          placeholder={placeholder}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 pr-14 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        {suffix ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

function DisabledField({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{label}</label>
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800/50">
        {text}
      </div>
    </div>
  );
}

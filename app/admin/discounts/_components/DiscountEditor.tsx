'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { discountRequestSchema, type DiscountRequest } from '@/schemas/discount';
import { useDiscount } from '@/hooks/useDiscount';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';

interface DiscountEditorProps {
  mode: 'create' | 'edit';
  id?: string;
}

const today = new Date().toISOString().split('T')[0];

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatNumber = (value: number | undefined): string => {
  if (value === undefined || value === null) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseNumber = (value: string): number => {
  const normalized = value.replace(/\./g, '').replace(/,/g, '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function DiscountEditor({ mode, id }: DiscountEditorProps) {
  const router = useRouter();
  const { currentDiscount, fetchDiscountById, handleCreate, handleUpdate, isLoading } = useDiscount();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<DiscountRequest>({
    resolver: zodResolver(discountRequestSchema),
    defaultValues: {
      code: '',
      type: 'ORDER',
      discountUnit: 'AMOUNT',
      value: 0,
      minOrderAmount: 0,
      startDate: today,
      endDate: today,
      status: 'ACTIVE',
    },
  });

  // Watch reactive fields for conditional UI
  const discountType = watch('type');
  const discountUnit = watch('discountUnit');

  // ── Load existing data in edit mode ─────────────────────────────────────────
  useEffect(() => {
    if (mode === 'edit' && id) {
      fetchDiscountById(parseInt(id, 10));
    }
  }, [mode, id, fetchDiscountById]);

  useEffect(() => {
    if (mode === 'edit' && currentDiscount) {
      reset({
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
  }, [mode, currentDiscount, reset]);

  // ── Business logic: clear irrelevant fields when type/unit changes ───────────
  const handleTypeChange = (nextType: DiscountRequest['type']) => {
    setValue('type', nextType);
    if (nextType === 'PRODUCT') {
      setValue('minOrderAmount', undefined);
      setValue('usageLimit', undefined);
      setValue('perUserLimit', undefined);
    }
  };

  const handleUnitChange = (nextUnit: DiscountRequest['discountUnit']) => {
    setValue('discountUnit', nextUnit);
    if (nextUnit === 'AMOUNT') {
      setValue('maxDiscount', undefined);
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────────
  const onSubmit = async (data: DiscountRequest) => {
    const payload: DiscountRequest = {
      ...data,
      code: data.code.trim().toUpperCase(),
      minOrderAmount: data.type === 'PRODUCT' ? undefined : (data.minOrderAmount ?? 0),
      maxDiscount: data.discountUnit === 'PERCENT' ? data.maxDiscount : undefined,
      usageLimit: data.usageLimit || undefined,
      perUserLimit: data.perUserLimit || undefined,
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

  // ── Shared input class ───────────────────────────────────────────────────────
  const inputCls = (hasError?: boolean) =>
    `w-full rounded-xl border px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 dark:text-white
    ${hasError
      ? 'border-red-400 bg-red-50 focus:ring-red-300 dark:border-red-500 dark:bg-red-900/20'
      : 'border-slate-200 bg-slate-50 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800'
    }`;

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 p-8 dark:bg-slate-950">
      <div className="mx-auto max-w-4xl">
        <PageHeader
          eyebrow={mode === 'create' ? 'KHUYẾN MÃI' : 'SỬA KHUYẾN MÃI'}
          title={mode === 'create' ? 'Tạo mã giảm giá mới' : currentDiscount ? `Chỉnh sửa ${currentDiscount.code}` : 'Đang tải...'}
          description={mode === 'create'
            ? 'Tạo chương trình giảm giá mới với hạn mức và quy tắc cộng dồn.'
            : 'Chỉnh sửa hạn mức, quy tắc và lịch cho mã giảm giá đã chọn.'}
        />

        <div className="mt-8">
          {!currentDiscount && mode === 'edit' && isLoading ? (
            <div className="flex justify-center p-20">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-600 border-t-transparent" />
            </div>
          ) : (
            <Panel>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-8">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                  {/* ── Discount Code ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Mã giảm giá
                    </label>
                    <input
                      {...register('code')}
                      className={inputCls(!!errors.code)}
                    />
                    {errors.code && (
                      <p className="text-xs font-semibold text-red-500">{errors.code.message}</p>
                    )}
                  </div>

                  {/* ── Type ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Loại
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          disabled={mode === 'edit'}
                          onChange={(e) => handleTypeChange(e.target.value as DiscountRequest['type'])}
                          className={inputCls(!!errors.type) + ' disabled:cursor-not-allowed disabled:opacity-60'}
                        >
                          <option value="ORDER">Mã đơn hàng</option>
                          <option value="PRODUCT">Giảm giá sản phẩm</option>
                          <option value="SHIPPING">Mã vận chuyển</option>
                        </select>
                      )}
                    />
                    {errors.type && (
                      <p className="text-xs font-semibold text-red-500">{errors.type.message}</p>
                    )}
                  </div>

                  {/* ── Value Type Toggle ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Loại giá trị
                    </label>
                    <div className="flex rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
                      {(['AMOUNT', 'PERCENT'] as const).map((unit) => (
                        <button
                          key={unit}
                          type="button"
                          onClick={() => handleUnitChange(unit)}
                          className={`flex-1 rounded-lg py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                            discountUnit === unit
                              ? 'bg-white text-sky-600 shadow-sm dark:bg-slate-700'
                              : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                          }`}
                        >
                          {unit === 'AMOUNT' ? 'Tiền mặt (VNĐ)' : 'Phần trăm (%)'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ── Status ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Trạng thái
                    </label>
                    <select {...register('status')} className={inputCls(!!errors.status)}>
                      <option value="ACTIVE">Hoạt động</option>
                      <option value="DISABLED">Đã tắt</option>
                      <option value="EXPIRED">Hết hạn</option>
                    </select>
                    {errors.status && (
                      <p className="text-xs font-semibold text-red-500">{errors.status.message}</p>
                    )}
                  </div>

                  {/* ── Discount Value ── */}
                  <Controller
                    name="value"
                    control={control}
                    render={({ field }) => (
                      <NumericField
                        label={discountUnit === 'PERCENT' ? 'Tỷ lệ giảm (%)' : 'Số tiền giảm'}
                        name="value"
                        value={field.value}
                        onChange={(e) => field.onChange(parseNumber(e.target.value))}
                        min={0}
                        step="0.01"
                        formatThousands={discountUnit === 'AMOUNT'}
                        suffix={discountUnit === 'PERCENT' ? '%' : 'VNĐ'}
                        error={errors.value?.message}
                      />
                    )}
                  />

                  {/* ── Min Order Amount (hidden for PRODUCT) ── */}
                  {discountType !== 'PRODUCT' ? (
                    <Controller
                      name="minOrderAmount"
                      control={control}
                      render={({ field }) => (
                        <NumericField
                          label="Giá trị đơn tối thiểu"
                          name="minOrderAmount"
                          value={field.value}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                          min={0}
                          step="0.01"
                          formatThousands
                          suffix="VNĐ"
                          error={errors.minOrderAmount?.message}
                        />
                      )}
                    />
                  ) : (
                    <DisabledField label="Giá trị đơn tối thiểu" text="Không áp dụng cho loại giảm giá sản phẩm." />
                  )}

                  {/* ── Max Discount Cap (only for PERCENT) ── */}
                  {discountUnit === 'PERCENT' ? (
                    <Controller
                      name="maxDiscount"
                      control={control}
                      render={({ field }) => (
                        <NumericField
                          label="Giảm tối đa"
                          name="maxDiscount"
                          value={field.value}
                          onChange={(e) => field.onChange(parseNumber(e.target.value))}
                          min={0}
                          step="0.01"
                          formatThousands
                          suffix="VNĐ"
                          error={errors.maxDiscount?.message}
                        />
                      )}
                    />
                  ) : (
                    <DisabledField label="Giảm tối đa" text="Chỉ áp dụng cho loại phần trăm." />
                  )}

                  {/* ── Usage Limit (hidden for PRODUCT) ── */}
                  {discountType === 'PRODUCT' ? (
                    <DisabledField label="Giới hạn sử dụng" text="Không áp dụng cho loại giảm giá sản phẩm." />
                  ) : (
                    <Controller
                      name="usageLimit"
                      control={control}
                      render={({ field }) => (
                        <NumericField
                          label="Giới hạn sử dụng"
                          name="usageLimit"
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? undefined : parseNumber(val));
                          }}
                          min={0}
                          step="1"
                          placeholder="Để trống = không giới hạn"
                          error={errors.usageLimit?.message}
                        />
                      )}
                    />
                  )}

                  {/* ── Per-user Limit (hidden for PRODUCT) ── */}
                  {discountType === 'PRODUCT' ? (
                    <DisabledField label="Giới hạn/người dùng" text="Không áp dụng cho loại giảm giá sản phẩm." />
                  ) : (
                    <Controller
                      name="perUserLimit"
                      control={control}
                      render={({ field }) => (
                        <NumericField
                          label="Giới hạn/người dùng"
                          name="perUserLimit"
                          value={field.value}
                          onChange={(e) => {
                            const val = e.target.value;
                            field.onChange(val === '' ? undefined : parseNumber(val));
                          }}
                          min={0}
                          step="1"
                          placeholder="Để trống = không giới hạn"
                          error={errors.perUserLimit?.message}
                        />
                      )}
                    />
                  )}

                  {/* ── Start Date ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      {...register('startDate')}
                      className={inputCls(!!errors.startDate)}
                    />
                    {errors.startDate && (
                      <p className="text-xs font-semibold text-red-500">{errors.startDate.message}</p>
                    )}
                  </div>

                  {/* ── End Date ── */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      {...register('endDate')}
                      className={inputCls(!!errors.endDate)}
                    />
                    {errors.endDate && (
                      <p className="text-xs font-semibold text-red-500">{errors.endDate.message}</p>
                    )}
                  </div>

                </div>

                {/* ── Actions ── */}
                <div className="flex justify-end gap-3 border-t border-slate-100 pt-6 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-xl bg-sky-600 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? 'Đang lưu...' : mode === 'create' ? 'Tạo mã giảm giá' : 'Cập nhật mã giảm giá'}
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

// ── Sub-components ────────────────────────────────────────────────────────────

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
  error,
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
  error?: string;
}) {
  const displayValue =
    value === undefined || value === null
      ? ''
      : formatThousands
        ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
        : value;

  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
        {label}
      </label>
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
          className={`w-full rounded-xl border px-4 py-3 pr-14 text-sm font-bold text-slate-900 outline-none transition-all focus:ring-2 dark:text-white ${
            error
              ? 'border-red-400 bg-red-50 focus:ring-red-300 dark:border-red-500 dark:bg-red-900/20'
              : 'border-slate-200 bg-slate-50 focus:ring-sky-500/20 dark:border-slate-700 dark:bg-slate-800'
          }`}
        />
        {suffix ? (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-400">
            {suffix}
          </span>
        ) : null}
      </div>
      {error && <p className="text-xs font-semibold text-red-500">{error}</p>}
    </div>
  );
}

function DisabledField({ label, text }: { label: string; text: string }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">
        {label}
      </label>
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-400 dark:border-slate-700 dark:bg-slate-800/50">
        {text}
      </div>
    </div>
  );
}

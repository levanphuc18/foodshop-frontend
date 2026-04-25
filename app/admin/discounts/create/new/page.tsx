'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from '@/components/admin/PageHeader';
import DiscountForm from '@/components/admin/DiscountForm';
import { useDiscount } from '@/hooks/useDiscount';

export default function NewDiscountPage() {
  const { handleCreate, isLoading } = useDiscount();
  const router = useRouter();

  const onSubmit = async (data: any) => {
    const result = await handleCreate(data);
    if (result) {
      router.push('/admin/discounts');
    }
  };

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="PROMOTIONS"
        title="Create New Discount"
        description="Launch a new promotional campaign to engage your coastal customers."
      />

      <div className="mt-8">
        <DiscountForm onSubmit={onSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
}

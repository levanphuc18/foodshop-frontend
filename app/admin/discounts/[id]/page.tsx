'use client';

import React, { use } from 'react';
import DiscountEditor from '../_components/DiscountEditor';

export default function AdminDiscountEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  
  return <DiscountEditor mode="edit" id={id} />;
}

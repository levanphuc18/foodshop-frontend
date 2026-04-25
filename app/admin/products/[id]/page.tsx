'use client';

import { useParams } from 'next/navigation';
import ProductEditor from '../_components/ProductEditor';

export default function AdminProductEditPage() {
  const params = useParams();
  const id = params.id ? Number(params.id) : undefined;

  return <ProductEditor mode="edit" id={id} />;
}

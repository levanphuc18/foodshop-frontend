'use client';

import React from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { ProductResponse } from '@/schemas/product';
import { CategoryResponse } from '@/schemas/category';

interface ProductTableProps {
  products: ProductResponse[];
  categories: CategoryResponse[];
  onView: (product: ProductResponse) => void;
  onDelete: (id: number, name: string) => void;
}

const statusStyles: Record<string, string> = {
  'In Stock': 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  'Low Stock': 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  'Out of Stock': 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

export const ProductTable: React.FC<ProductTableProps> = ({ 
  products, 
  categories, 
  onView,
  onDelete
}) => {
  const getCategoryName = (id: number) => {
    const category = categories.find((c) => c.categoryId === id);
    return category ? category.name : 'Uncategorized';
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= 10) return 'Low Stock';
    return 'In Stock';
  };

  return (
    <div className="overflow-x-auto min-h-[300px]">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Product</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Category</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Price (VNĐ)</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Stock Level</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center">Visibility</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Status</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {products.map((p) => {
            const status = getStockStatus(p.quantity);
            const isDiscounted = p.salePrice != null && p.salePrice < p.price;
            const maxStock = 100;

            return (
              <tr key={p.productId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0 relative">
                      <img src={p.imageUrls && p.imageUrls[0] ? p.imageUrls[0] : 'https://placehold.co/400'} alt={p.name} className="w-full h-full object-cover" />
                      {isDiscounted && p.discountPercentage && (
                        <div className="absolute top-0 right-0 bg-red-500 text-white text-[9px] font-bold px-1 rounded-bl-lg">
                          -{p.discountPercentage}%
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1">{p.name}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {p.productId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{getCategoryName(p.categoryId)}</td>
                <td className="px-6 py-4">
                  {isDiscounted ? (
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-red-600 dark:text-red-400">{formatPrice(p.salePrice!)}</span>
                      <span className="text-[11px] font-medium text-slate-400 line-through">{formatPrice(p.price)}</span>
                    </div>
                  ) : (
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{formatPrice(p.price)}</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${p.quantity === 0 ? 'bg-red-500' : p.quantity <= 10 ? 'bg-orange-500' : 'bg-emerald-500'}`} style={{ width: `${Math.min((p.quantity / maxStock) * 100, 100)}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{p.quantity}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    {p.isActive ? (
                      <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/10 transition-all hover:bg-emerald-500/20">
                        Public
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800/50 dark:border-slate-700/50 dark:text-slate-400 transition-all">
                        Hidden
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${statusStyles[status]}`}>{status}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    type="button"
                    onClick={() => onView(p)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all inline-block"
                  >
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </button>
                  <Link href={`/admin/products/${p.productId}`} className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all inline-block ml-1">
                    <span className="material-symbols-outlined text-lg">edit</span>
                  </Link>
                  <button 
                    type="button" 
                    onClick={() => onDelete(p.productId, p.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all ml-1"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

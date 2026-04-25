'use client';

import React from 'react';
import { formatPrice } from '@/lib/utils';
import { OrderResponse } from '@/types/order';
import { format } from 'date-fns';

interface OrderTableProps {
  orders: OrderResponse[];
  isLoading: boolean;
  onView: (order: OrderResponse) => void;
  onUpdateStatus: (id: number, status: string) => void;
}

const statusStyles: Record<string, string> = {
  PENDING: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  PAID: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  CONFIRMED: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
  SHIPPED: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  COMPLETED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  CANCELLED: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

export const OrderTable: React.FC<OrderTableProps> = ({ orders, isLoading, onView, onUpdateStatus }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Order ID</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Customer</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Amount</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Status</th>
            <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {orders.map((o) => (
            <tr key={o.orderId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-sky-600 dark:text-sky-400">#{o.orderId}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{format(new Date(o.createdAt), 'MMM dd, yyyy HH:mm')}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-semibold text-slate-900 dark:text-white">{o.fullName || o.username || `User #${o.userId}`}</div>
                <div className="text-xs text-slate-500 truncate max-w-[200px]">{o.shippingAddress}</div>
              </td>
              <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{formatPrice(o.finalAmount)}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusStyles[o.status]}`}>
                  {o.status}
                </span>
              </td>
              <td className="px-6 py-4 flex justify-center gap-2">
                <button onClick={() => onView(o)} className="p-1.5 text-slate-400 hover:text-sky-600 transition-all">
                  <span className="material-symbols-outlined text-lg">visibility</span>
                </button>
                <select
                  disabled={isLoading}
                  value={o.status}
                  onChange={(e) => onUpdateStatus(o.orderId, e.target.value)}
                  className="text-[10px] font-bold border border-slate-200 dark:border-slate-700 rounded px-2 py-1 outline-none"
                >
                  {Object.keys(statusStyles).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

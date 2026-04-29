'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import AccountPageShell from '@/components/shop/account/AccountPageShell';
import AccountSectionHeader from '@/components/shop/account/AccountSectionHeader';
import { useOrder } from '@/hooks/useOrder';
import dayjs from 'dayjs';

export default function Pageorders() {
  const { orders, fetchMyOrders, isLoading, errorMsg } = useOrder();

  useEffect(() => {
    fetchMyOrders();
  }, [fetchMyOrders]);

  return (
    <AccountPageShell active="orders">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <AccountSectionHeader
          eyebrow="Activity"
          title="Order History"
          description="Review and track your curated selections."
        />

        {errorMsg && (
          <div className="mb-8 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {errorMsg}
          </div>
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-700 mb-4">inventory_2</span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">No orders yet</h3>
              <p className="text-xs text-slate-500 mb-6">Looks like you haven&apos;t made your first curated selection.</p>
              <Link href="/products" className="px-6 py-2 bg-slate-900 dark:bg-sky-600 text-white rounded-lg text-xs font-bold transition-all shadow-md">
                Start Shopping
              </Link>
            </div>
          ) : (
            orders.map((order) => {
              const date = dayjs(order.createdAt).format('MMM DD, YYYY');
              const firstItemImg = order.orderItems[0]?.productImageUrl || 'https://via.placeholder.com/150';
              const titleSummary = order.orderItems.length > 0
                ? `${order.orderItems[0].productName} ${order.orderItems.length > 1 ? `& ${order.orderItems.length - 1} other item(s)` : ''}`
                : 'Empty Order';
              const originalTotal = order.totalAmount + order.shippingFee;
              const totalSavings = order.discountAmount + order.shippingDiscount;

              return (
                <OrderCard
                  key={order.orderId}
                  id={order.orderId.toString()}
                  date={date}
                  status={order.status}
                  price={formatPrice(order.finalAmount)}
                  originalPrice={totalSavings > 0 ? formatPrice(originalTotal) : undefined}
                  savings={totalSavings > 0 ? formatPrice(totalSavings) : undefined}
                  title={titleSummary}
                  img={firstItemImg}
                  active={['PENDING', 'CONFIRMED', 'SHIPPED'].includes(order.status)}
                  images={order.orderItems.slice(1, 4).map(item => item.productImageUrl || 'https://via.placeholder.com/50')}
                />
              )
            })
          )}
        </div>
      </div>
    </AccountPageShell>
  );
}

function OrderCard({
  id,
  date,
  status,
  price,
  originalPrice,
  savings,
  title,
  img,
  active = false,
  images = [],
}: {
  id: string;
  date: string;
  status: string;
  price: string;
  originalPrice?: string;
  savings?: string;
  title: string;
  img: string;
  active?: boolean;
  images?: string[];
}) {
  const isPending = status !== 'COMPLETED' && status !== 'CANCELLED';

  const statusColors: Record<string, string> = {
    'PENDING': 'text-amber-600 bg-amber-500',
    'CONFIRMED': 'text-sky-600 bg-sky-500',
    'SHIPPED': 'text-indigo-600 bg-indigo-500',
    'COMPLETED': 'text-emerald-600 bg-emerald-500',
    'CANCELLED': 'text-red-600 bg-red-500',
  };

  const statusColor = statusColors[status] || 'text-slate-600 bg-slate-500';
  const dotColor = statusColor.split(' ')[1];
  const textColor = statusColor.split(' ')[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden group hover:border-sky-500/30 transition-all shadow-sm">
      <div className="flex flex-col md:flex-row">
        <div className="w-full md:w-48 h-32 md:h-auto overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
          <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" src={img} alt={title} />
        </div>
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">#ORD-{id}</span>
                {active ? <span className="px-2 py-0.5 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 text-[9px] font-black uppercase tracking-widest rounded">Active</span> : null}
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight line-clamp-1">{title}</h3>
              <p className="text-xs text-slate-500 font-medium">Placed on {date}</p>
            </div>
            <div className="text-right shrink-0 ml-4">
              <p className="text-lg font-black text-slate-900 dark:text-white">{price}</p>
              {originalPrice ? (
                <p className="mt-1 text-xs font-bold text-slate-400 line-through">{originalPrice}</p>
              ) : null}
              {savings ? (
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-500">Saved {savings}</p>
              ) : null}
              <div className="flex items-center justify-end gap-1.5 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${dotColor} ${isPending ? 'animate-pulse' : ''}`} />
                <span className={`text-[10px] font-bold uppercase tracking-widest ${textColor}`}>{status}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800 mt-auto">
            <div className="flex -space-x-2">
              {images.map((imgSrc, i) => (
                <div key={i} className="w-7 h-7 rounded-lg border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden shadow-sm">
                  <img className="w-full h-full object-cover opacity-80" src={imgSrc} alt="" />
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href={`/orders/${id}`} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Details</Link>
              <Link href={`/orders/${id}`} className="px-5 py-2 bg-slate-900 dark:bg-sky-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md inline-block">
                {status === 'COMPLETED' ? 'Buy Again' : 'Track Order'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

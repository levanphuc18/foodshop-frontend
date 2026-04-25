'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import AccountPageShell from '@/components/shop/account/AccountPageShell';
import { useOrder } from '@/hooks/useOrder';
import dayjs from 'dayjs';

export default function Pageordersdetail() {
  const { id } = useParams();
  const orderId = Number(id);
  const { currentOrder, getOrderById, isLoading, errorMsg } = useOrder();

  useEffect(() => {
    if (orderId) {
      getOrderById(orderId);
    }
  }, [orderId, getOrderById]);

  if (isLoading) {
    return (
      <AccountPageShell active="orders">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-10 flex justify-center items-center h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-sky-500 border-t-transparent"></div>
        </div>
      </AccountPageShell>
    );
  }

  if (errorMsg || !currentOrder) {
    return (
      <AccountPageShell active="orders">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
          <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-sky-600 transition-all mb-6 group">
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
            Back to Orders
          </Link>
          <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100 flex items-center gap-3">
            <span className="material-symbols-outlined">error</span>
            {errorMsg || 'Order not found'}
          </div>
        </div>
      </AccountPageShell>
    );
  }

  const { status, createdAt, orderItems, shippingAddress, shippingNote, totalAmount, discountAmount, finalAmount, discountCode } = currentOrder;

  const STATUS_STEPS = ['PENDING', 'CONFIRMED', 'SHIPPED', 'COMPLETED'];
  const currentIndex = STATUS_STEPS.indexOf(status);

  // Status visual mappings
  const statusLabels: Record<string, string> = {
    'PENDING': 'Pending Validation',
    'CONFIRMED': 'Processing at Warehouse',
    'SHIPPED': 'In Transit / Shipped',
    'COMPLETED': 'Delivered Successfully',
    'CANCELLED': 'Order Cancelled'
  };

  const statusColors: Record<string, string> = {
    'PENDING': 'text-amber-600 bg-amber-100 dark:bg-amber-900/30',
    'CONFIRMED': 'text-sky-600 bg-sky-100 dark:bg-sky-900/30',
    'SHIPPED': 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30',
    'COMPLETED': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30',
    'CANCELLED': 'text-red-600 bg-red-100 dark:bg-red-900/30',
  };

  return (
    <AccountPageShell active="orders">
      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-sky-600 transition-all mb-6 group">
          <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-1 transition-transform">arrow_back</span>
          Back to Orders
        </Link>

        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Order #ORD-{orderId}</h1>
              <span className={`px-2.5 py-1 ${statusColors[status] || 'bg-slate-100 text-slate-600'} text-[10px] font-black uppercase tracking-widest rounded-lg`}>
                {statusLabels[status] || status}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium">Placed on {dayjs(createdAt).format('MMM DD, YYYY hh:mm A')}</p>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white mb-8">Order Timeline</h2>

              {status === 'CANCELLED' ? (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-900/30">
                  <h3 className="text-sm font-bold text-red-600">This order was cancelled</h3>
                  <p className="text-xs text-red-500 mt-1">If you have any questions, please contact our support team.</p>
                </div>
              ) : (
                <div className="relative pl-8 space-y-8">
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800 rounded-full" />

                  {/* PENDING */}
                  <TimelineItem
                    status="Pending Validation"
                    desc="Order received and waiting for confirmation."
                    date={dayjs(createdAt).format('MMM DD, hh:mm A')}
                    current={status === 'PENDING'}
                    completed={currentIndex > 0}
                  />

                  {/* CONFIRMED */}
                  <TimelineItem
                    status="Processing at Hub"
                    desc="Order is being prepared for shipment."
                    date={currentIndex >= 1 ? dayjs(createdAt).add(1, 'hour').format('MMM DD, hh:mm A') : '--'}
                    current={status === 'CONFIRMED'}
                    completed={currentIndex > 1}
                  />

                  {/* SHIPPED */}
                  <TimelineItem
                    status="In Transit"
                    desc="Handed over to the logistics partner."
                    date={currentIndex >= 2 ? dayjs(createdAt).add(3, 'hour').format('MMM DD, hh:mm A') : '--'}
                    current={status === 'SHIPPED'}
                    completed={currentIndex > 2}
                  />

                  {/* COMPLETED */}
                  <TimelineItem
                    status="Delivered"
                    desc="Successfully delivered to your address."
                    date={currentIndex >= 3 ? dayjs(createdAt).add(1, 'day').format('MMM DD, hh:mm A') : '--'}
                    current={status === 'COMPLETED'}
                    completed={status === 'COMPLETED'}
                  />
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
              <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800">
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-950 dark:text-white">Harvest Items ({orderItems.length})</h2>
              </div>
              <div className="divide-y divide-slate-50 dark:divide-slate-800">
                {orderItems.map((item) => (
                  <OrderDetailItem
                    key={item.orderItemId}
                    title={item.productName}
                    price={formatPrice(item.price)}
                    subtotal={formatPrice(item.subtotal)}
                    qty={item.quantity.toString()}
                    img={item.productImageUrl || 'https://via.placeholder.com/150'}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-900 dark:bg-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-600/20 rounded-full -mr-16 -mt-16 blur-3xl opacity-50" />
              <h2 className="text-[10px] font-black uppercase tracking-widest mb-8 text-slate-500 italic">Bill of Lading</h2>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Subtotal</span>
                  <span className="text-sm font-bold">{formatPrice(totalAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] uppercase font-bold text-sky-400 tracking-widest">Discount ({discountCode || 'VOUCHER'})</span>
                    <span className="text-sm font-bold text-sky-400">-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Logistics</span>
                  <span className="text-sm font-bold text-slate-500 italic">Included</span>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex flex-col">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Settled</span>
                <span className="text-3xl font-black tracking-tighter text-sky-400 italic">{formatPrice(finalAmount)}</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-sky-600 text-[18px]">location_on</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Port of Delivery</h3>
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                {shippingAddress}
              </p>
              {shippingNote && (
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Note</span>
                  <p className="text-xs text-slate-600 dark:text-slate-400 italic">"{shippingNote}"</p>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-sky-600 text-[18px]">payments</span>
                <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Settlement</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-6 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black italic text-[8px] text-slate-900 dark:text-white">COD</div>
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest">Cash on Delivery</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AccountPageShell>
  );
}

function OrderDetailItem({ title, price, subtotal, qty, img }: { title: string; price: string; subtotal: string; qty: string; img: string }) {
  return (
    <div className="p-6 flex items-center gap-6 group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0 shadow-sm">
        <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-black text-slate-900 dark:text-white truncate">{title}</h3>
        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Price: {price}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Qty: <span className="text-slate-900 dark:text-white">{qty}</span></span>
          <span className="text-sm font-black text-sky-600 italic">{subtotal}</span>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ status, desc, date, current = false, completed = false }: { status: string; desc: string; date: string; current?: boolean; completed?: boolean }) {
  const isPast = completed && !current;

  return (
    <div className="relative">
      <div className={`absolute -left-8 top-1.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 z-10 ${current ? 'bg-sky-600 ring-4 ring-sky-100 dark:ring-sky-900/30' : isPast ? 'bg-emerald-500 border-transparent' : 'bg-slate-200 dark:bg-slate-700'}`}>
        {isPast && <span className="material-symbols-outlined text-white text-[8px] absolute inset-0 flex items-center justify-center font-bold">check</span>}
      </div>
      <div className={current || isPast ? 'opacity-100' : 'opacity-40'}>
        <h4 className={`text-xs font-black uppercase tracking-widest ${current ? 'text-sky-600' : isPast ? 'text-emerald-600' : 'text-slate-400'}`}>{status}</h4>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">{date}</p>
      </div>
    </div>
  );
}

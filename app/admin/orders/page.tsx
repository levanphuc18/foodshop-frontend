'use client';

import { useEffect, useMemo, useState } from 'react';
import { formatPrice } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import StatsCard from '@/components/admin/StatsCard';
import { useAdminOrder } from '@/hooks/useAdminOrder';
import { OrderResponse } from '@/types/order';
import { format } from 'date-fns';
import OrderDetailModal from '@/components/admin/OrderDetailModal';

export default function AdminOrders() {
  const { orders, orderPage, isLoading, fetchOrderPage, updateStatus } = useAdminOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const sortMap: Record<string, { sortBy: string; asc: boolean }> = {
        newest: { sortBy: 'createdAt', asc: false },
        oldest: { sortBy: 'createdAt', asc: true },
        'amount-high': { sortBy: 'finalAmount', asc: false },
        'amount-low': { sortBy: 'finalAmount', asc: true },
        items: { sortBy: 'createdAt', asc: false },
      };

      const selectedSort = sortMap[sortBy] ?? sortMap.newest;

      fetchOrderPage({
        keyword: searchTerm.trim() || undefined,
        status: statusFilter,
        page: currentPage,
        size: 10,
        sortBy: selectedSort.sortBy,
        asc: selectedSort.asc,
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sortBy, currentPage, fetchOrderPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, sortBy]);

  const statusStyles: Record<string, string> = {
    PENDING: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    PAID: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    CONFIRMED: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
    SHIPPED: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    COMPLETED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
    CANCELLED: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
  };

  const displayedOrders = useMemo(() => {
    if (sortBy !== 'items') {
      return orders;
    }

    return [...orders].sort((a, b) => b.orderItems.length - a.orderItems.length);
  }, [orders, sortBy]);

  const totalRevenue = displayedOrders
    .filter(o => o.status === 'COMPLETED' || o.status === 'PAID' || o.status === 'SHIPPED')
    .reduce((sum, o) => sum + o.finalAmount, 0);

  const pendingOrders = displayedOrders.filter(o => o.status === 'PENDING').length;

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="Management"
        title="Order Management"
        description="Monitor and process your global artisanal seafood distribution."
        action={
          <button
            onClick={() =>
              fetchOrderPage({
                keyword: searchTerm.trim() || undefined,
                status: statusFilter,
                page: currentPage,
                size: 10,
                sortBy: sortBy === 'amount-high' || sortBy === 'amount-low' ? 'finalAmount' : 'createdAt',
                asc: sortBy === 'oldest' || sortBy === 'amount-low',
              })
            }
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm shrink-0"
          >
            <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Refresh Data
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatsCard icon="payments" label="Visible Revenue" value={formatPrice(totalRevenue)} sub="Current page snapshot" trendUp />
        <StatsCard icon="local_shipping" label="Pending On Page" value={`${pendingOrders} Orders`} sub="Awaiting processing" />
        <StatsCard icon="public" label="Total Orders" value={`${orderPage?.totalElements ?? displayedOrders.length}`} sub="Matched backend results" toneClassName="text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" />
      </div>

      <Panel className="overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Order History
            </h2>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <form
                className="relative flex-1 min-w-[200px] lg:w-64"
                onSubmit={(e) => e.preventDefault()}
              >
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-all z-10 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
                <input
                  type="text"
                  placeholder="Order ID, customer, address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </form>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">All Status</option>
                {Object.keys(statusStyles).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-xl text-[11px] font-black uppercase text-sky-700 dark:text-sky-300 focus:outline-none"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="oldest">Sort: Oldest First</option>
                <option value="amount-high">Amount: High to Low</option>
                <option value="amount-low">Amount: Low to High</option>
                <option value="items">Sort: Items Count</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Order ID</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Items</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Shipping To</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Amount</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Status</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center text-xs">View</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {displayedOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500 text-sm">
                    No orders found matching your criteria.
                  </td>
                </tr>
              ) : (
                displayedOrders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-sky-600 dark:text-sky-400">#{o.orderId}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{format(new Date(o.createdAt), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {o.orderItems[0]?.productName}
                        {o.orderItems.length > 1 && <span className="text-xs text-slate-500 font-normal ml-1">+{o.orderItems.length - 1} more</span>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Qty: {o.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-[200px]" title={o.shippingAddress}>
                        {o.shippingAddress}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">{formatPrice(o.finalAmount)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wider ${statusStyles[o.status]}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(o)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-900/20 transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">visibility</span>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <select
                        disabled={isLoading}
                        value={o.status}
                        onChange={(e) => updateStatus(o.orderId, e.target.value)}
                        className="text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all cursor-pointer"
                      >
                        {Object.keys(statusStyles).map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/30">
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            Showing {displayedOrders.length === 0 ? 0 : (orderPage?.currentPage ?? 0) * (orderPage?.pageSize ?? displayedOrders.length) + 1}
            -
            {displayedOrders.length === 0 ? 0 : (orderPage?.currentPage ?? 0) * (orderPage?.pageSize ?? displayedOrders.length) + displayedOrders.length}
            {' '}of {orderPage?.totalElements ?? displayedOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
              disabled={orderPage?.first ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
              Page {(orderPage?.currentPage ?? 0) + 1} / {Math.max(orderPage?.totalPages ?? 1, 1)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={orderPage?.last ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </Panel>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
}

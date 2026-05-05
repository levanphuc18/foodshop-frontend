'use client';

import { useEffect, useState } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import StatsCard from '@/components/admin/StatsCard';
import { useAdminOrder } from '@/hooks/useAdminOrder';
import { OrderResponse } from '@/schemas/order';
import OrderDetailModal from '@/components/admin/OrderDetailModal';
import ConfirmModal from '@/components/admin/ConfirmModal';

const statusStyles: Record<string, string> = {
  PENDING: 'bg-orange-50 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
  PAID: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
  CONFIRMED: 'bg-sky-50 text-sky-600 dark:bg-sky-900/20 dark:text-sky-400',
  SHIPPED: 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
  COMPLETED: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
  CANCELLED: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
};

const sortMap: Record<string, { sortBy: string; sortDir: 'ASC' | 'DESC' }> = {
  newest: { sortBy: 'createdAt', sortDir: 'DESC' },
  oldest: { sortBy: 'createdAt', sortDir: 'ASC' },
  'amount-high': { sortBy: 'finalAmount', sortDir: 'DESC' },
  'amount-low': { sortBy: 'finalAmount', sortDir: 'ASC' },
};

export default function AdminOrders() {
  const { orders, orderPage, isLoading, fetchOrderPage, updateStatus } = useAdminOrder();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pendingStatusChange, setPendingStatusChange] = useState<{ orderId: number; status: string } | null>(null);

  const selectedSort = sortMap[sortBy] ?? sortMap.newest;

  const loadOrders = () =>
    fetchOrderPage({
      search: searchTerm.trim() || undefined,
      status: statusFilter,
      page: currentPage,
      size: 10,
      sortBy: selectedSort.sortBy,
      sortDir: selectedSort.sortDir,
    });

  useEffect(() => {
    const timeoutId = window.setTimeout(loadOrders, 300);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, sortBy, currentPage, fetchOrderPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, sortBy]);

  const totalRevenue = orders
    .filter((o) => o.status === 'COMPLETED' || o.status === 'PAID' || o.status === 'SHIPPED')
    .reduce((sum, o) => sum + o.finalAmount, 0);

  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;

  const requestStatusChange = (orderId: number, status: string) => {
    if (status === 'CANCELLED' || status === 'COMPLETED') {
      setPendingStatusChange({ orderId, status });
      return;
    }

    void updateStatus(orderId, status);
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const success = await updateStatus(pendingStatusChange.orderId, pendingStatusChange.status);
    if (success) {
      setPendingStatusChange(null);
    }
  };

  const getCustomerPrimaryLabel = (order: OrderResponse) => order.fullName || order.username || `User #${order.userId}`;

  const getCustomerSecondaryLabel = (order: OrderResponse) =>
    order.fullName && order.username ? `@${order.username}` : `User #${order.userId}`;

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="Quản lý"
        title="Quản lý đơn hàng"
        description="Theo dõi và xử lý đơn hàng của hệ thống."
        action={
          <button
            onClick={loadOrders}
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm shrink-0"
          >
            <span className={`material-symbols-outlined text-lg ${isLoading ? 'animate-spin' : ''}`}>refresh</span>
            Làm mới
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatsCard icon="payments" label="Doanh thu" value={formatPrice(totalRevenue)} sub="Trang hiện tại" trendUp />
        <StatsCard icon="local_shipping" label="Chờ xử lý" value={`${pendingOrders} đơn`} sub="Đang chờ xác nhận" />
        <StatsCard icon="public" label="Tổng đơn hàng" value={`${orderPage?.totalElements ?? orders.length}`} sub="Kết quả từ hệ thống" toneClassName="text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400" />
      </div>

      <Panel className="overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Lịch sử đơn hàng
            </h2>
            <div className="flex flex-wrap gap-2 w-full lg:w-auto">
              <form className="relative flex-1 min-w-[200px] lg:w-64" onSubmit={(e) => e.preventDefault()}>
                <button
                  type="submit"
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-600 transition-all z-10 p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined text-[18px]">search</span>
                </button>
                <input
                  type="text"
                  placeholder="Mã đơn, khách hàng, địa chỉ..."
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
                <option value="ALL">Tất cả trạng thái</option>
                {Object.keys(statusStyles).map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-xl text-[11px] font-black uppercase text-sky-700 dark:text-sky-300 focus:outline-none"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="oldest">Sắp xếp: Cũ nhất</option>
                <option value="amount-high">Giá trị: Cao → Thấp</option>
                <option value="amount-low">Giá trị: Thấp → Cao</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Mã đơn</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Khách hàng</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Sản phẩm</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Giao đến</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Giá trị</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Trạng thái</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center text-xs">Xem</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-right">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-slate-500 text-sm">
                    Không tìm thấy đơn hàng phù hợp.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.orderId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-sky-600 dark:text-sky-400">#{o.orderId}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 uppercase">{formatDate(o.createdAt, 'DD/MM/YYYY')}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {getCustomerPrimaryLabel(o)}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {getCustomerSecondaryLabel(o)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-900 dark:text-white">
                        {o.orderItems[0]?.productName}
                        {o.orderItems.length > 1 && <span className="text-xs text-slate-500 font-normal ml-1">+{o.orderItems.length - 1} khác</span>}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">SL: {o.orderItems.reduce((sum, item) => sum + item.quantity, 0)}</div>
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
                        onChange={(e) => requestStatusChange(o.orderId, e.target.value)}
                        className="text-[10px] font-black uppercase tracking-wider bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all cursor-pointer"
                      >
                        {Object.keys(statusStyles).map((status) => (
                          <option key={status} value={status}>{status}</option>
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
            Hiển thị {orders.length === 0 ? 0 : (orderPage?.currentPage ?? 0) * (orderPage?.pageSize ?? orders.length) + 1}
            -
            {orders.length === 0 ? 0 : (orderPage?.currentPage ?? 0) * (orderPage?.pageSize ?? orders.length) + orders.length}
            {' '}/ {orderPage?.totalElements ?? orders.length} đơn hàng
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
              disabled={orderPage?.first ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
              Trang {(orderPage?.currentPage ?? 0) + 1} / {Math.max(orderPage?.totalPages ?? 1, 1)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={orderPage?.last ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        </div>
      </Panel>

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
      <ConfirmModal
        isOpen={pendingStatusChange !== null}
        title="Xác nhận thay đổi trạng thái"
        message={
          pendingStatusChange
            ? `Bạn có chắc chắn muốn chuyển đơn hàng #${pendingStatusChange.orderId} sang ${pendingStatusChange.status}?`
            : ''
        }
        confirmLabel="Xác nhận"
        onConfirm={confirmStatusChange}
        onCancel={() => setPendingStatusChange(null)}
        isLoading={isLoading}
      />
    </div>
  );
}

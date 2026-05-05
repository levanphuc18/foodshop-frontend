'use client';

import { useEffect, useState } from 'react';
import { formatPrice, formatDate } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import StatsCard from '@/components/admin/StatsCard';
import ConfirmModal from '@/components/admin/ConfirmModal';
import { useDiscount } from '@/hooks/useDiscount';
import Link from 'next/link';

export default function AdminDiscountsPage() {
  const { discounts, discountPage, isLoading, fetchDiscountPage, toggleStatus, handleDelete } = useDiscount();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(0);

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteCode, setDeleteCode] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const sortMap: Record<string, { sortBy: string; asc: boolean }> = {
        newest: { sortBy: 'startDate', asc: false },
        expiry: { sortBy: 'endDate', asc: true },
        value: { sortBy: 'value', asc: false },
        code: { sortBy: 'code', asc: true },
      };

      const selectedSort = sortMap[sortBy] ?? sortMap.newest;

      fetchDiscountPage({
        search: searchTerm.trim() || undefined,
        status: statusFilter,
        type: typeFilter,
        page: currentPage,
        size: 10,
        sortBy: selectedSort.sortBy,
        sortDir: selectedSort.asc ? 'ASC' : 'DESC',
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, statusFilter, typeFilter, sortBy, currentPage, fetchDiscountPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, statusFilter, typeFilter, sortBy]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    const success = await handleDelete(deleteId);
    if (success) {
      setDeleteId(null);
    }
  };

  // BUG FIX: Discount đã qua endDate không được có status=ACTIVE.
  // resolveStatus: nếu endDate đã qua thì luôn hiển thị EXPIRED, bỏ qua status từ server.
  const resolveStatus = (discount: { status: string; endDate: string }) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const end = new Date(discount.endDate);
    end.setHours(0, 0, 0, 0);
    if (end < now) return 'EXPIRED';
    return discount.status;
  };

  const activeCount = discounts.filter(d => resolveStatus(d) === 'ACTIVE').length;
  const expiredCount = discounts.filter(d => resolveStatus(d) === 'EXPIRED').length;
  const disabledCount = discounts.filter(d => resolveStatus(d) === 'DISABLED').length;

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="KHUYẾN MÃI"
        title="Quản lý giảm giá"
        description="Quản lý mã giảm giá và chương trình khuyến mãi."
        action={
          <Link href="/admin/discounts/create" className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 text-white text-sm font-bold hover:bg-sky-700 active:scale-95 transition-all shadow-lg shadow-sky-600/20 shrink-0">
            <span className="material-symbols-outlined text-lg">add_card</span>
            Thêm mã giảm giá
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
        <StatsCard icon="confirmation_number" label="Tổng mã" value={(discountPage?.totalElements ?? discounts.length).toString()} sub="Kết quả từ hệ thống" trendUp toneClassName="text-sky-600 bg-sky-50 dark:bg-sky-900/20" />
        <StatsCard icon="check_circle" label="Đang hoạt động" value={activeCount.toString()} sub="Trang hiện tại" toneClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        <StatsCard icon="history" label="Hết hạn" value={expiredCount.toString()} sub="Trang hiện tại" toneClassName="text-amber-600 bg-amber-50 dark:bg-amber-900/20" />
        <StatsCard icon="block" label="Đã tắt" value={disabledCount.toString()} sub="Trang hiện tại" toneClassName="text-rose-600 bg-rose-50 dark:bg-rose-900/20" />
      </div>

      <Panel className="overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Tất cả mã giảm giá
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
                  placeholder="Tìm theo mã..."
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
                <option value="ACTIVE">Hoạt động</option>
                <option value="EXPIRED">Hết hạn</option>
                <option value="DISABLED">Đã tắt</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả loại</option>
                <option value="ORDER">Mã đơn hàng</option>
                <option value="PRODUCT">Giảm giá sản phẩm</option>
                <option value="SHIPPING">Vận chuyển</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-xl text-[11px] font-black uppercase text-sky-700 dark:text-sky-300 focus:outline-none"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="expiry">Sắp xếp: Sắp hết hạn</option>
                <option value="value">Sắp xếp: Giá trị cao</option>
                <option value="code">Sắp xếp: Mã A-Z</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Mã giảm giá</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Giá trị</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Loại</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Hiệu lực</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center">Trạng thái</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {discounts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Không tìm thấy mã giảm giá.
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr key={discount.discountId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
                          <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{discount.code}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">ID: #{discount.discountId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {discount.discountUnit === 'PERCENT' ? `${discount.value}%` : formatPrice(discount.value)}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium italic mt-1 space-y-0.5">
                        {discount.type !== 'PRODUCT' && (
                          <div>Đơn tối thiểu: {formatPrice(discount.minOrderAmount || 0)}</div>
                        )}
                        {discount.maxDiscount && discount.maxDiscount > 0 ? (
                          <div>Giảm tối đa: {formatPrice(discount.maxDiscount)}</div>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                        discount.type === 'ORDER' ? 'bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-900/30 dark:text-sky-400 dark:border-sky-800' :
                        discount.type === 'PRODUCT' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800' :
                        'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800'
                      }`}>
                        {discount.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                        {formatDate(discount.startDate, 'DD/MM')} - {formatDate(discount.endDate, 'DD/MM/YYYY')}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {/* BUG FIX: Tính toán status hiển thị tại client để tránh hiển thị ACTIVE cho discount hết hạn */}
                        <StatusBadge status={resolveStatus(discount)} />
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* BUG FIX: Không cho phép toggle discount đã expired */}
                        <button
                          onClick={() => toggleStatus(discount.discountId)}
                          title={
                            resolveStatus(discount) === 'EXPIRED'
                              ? 'Hết hạn – không thể thay đổi'
                              : resolveStatus(discount) === 'DISABLED' ? 'Bật' : 'Tắt'
                          }
                          disabled={resolveStatus(discount) === 'EXPIRED'}
                          className={`p-2 rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                            resolveStatus(discount) === 'DISABLED'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-rose-600 hover:bg-rose-50'
                          }`}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {resolveStatus(discount) === 'DISABLED' ? 'check_circle' : 'block'}
                          </span>
                        </button>
                        <Link
                          href={`/admin/discounts/${discount.discountId}`}
                          className="p-2 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </Link>
                        <button
                          onClick={() => {
                            setDeleteId(discount.discountId);
                            setDeleteCode(discount.code);
                          }}
                          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-all"
                        >
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-slate-50/30">
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest">
            Hiển thị {discounts.length === 0 ? 0 : (discountPage?.currentPage ?? 0) * (discountPage?.pageSize ?? discounts.length) + 1}
            -
            {discounts.length === 0 ? 0 : (discountPage?.currentPage ?? 0) * (discountPage?.pageSize ?? discounts.length) + discounts.length}
            {' '}/ {discountPage?.totalElements ?? discounts.length} mã giảm giá
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
              disabled={discountPage?.first ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
              Trang {(discountPage?.currentPage ?? 0) + 1} / {Math.max(discountPage?.totalPages ?? 1, 1)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={discountPage?.last ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        </div>
      </Panel>

      <ConfirmModal
        isOpen={deleteId !== null}
        title="Xóa mã giảm giá"
        message={`Bạn có chắc chắn muốn xóa vĩnh viễn mã giảm giá "${deleteCode}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        isLoading={isLoading}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    EXPIRED: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    DISABLED: 'bg-slate-500/10 text-slate-600 border-slate-500/20'
  };

  const style = styles[status] || styles.DISABLED;

  return (
    <span className={`inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight border shadow-sm ${style}`}>
      {status === 'ACTIVE' && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </span>
      )}
      {status === 'EXPIRED' && <span className="material-symbols-outlined text-[14px]">history</span>}
      {status === 'DISABLED' && <span className="material-symbols-outlined text-[14px]">block</span>}
      {status}
    </span>
  );
}

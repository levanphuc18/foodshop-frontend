'use client';

import { useEffect, useState } from 'react';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import StatsCard from '@/components/admin/StatsCard';
import { useUser } from '@/hooks/useUser';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminCustomers() {
  const { users, userPage, isLoading, fetchUserPage, toggleStatus } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const role = roleFilter === 'ALL' ? undefined : roleFilter;
      const enabled = statusFilter === 'ALL' ? undefined : statusFilter === 'ACTIVE';
      const sortMap: Record<string, { sortBy: string; asc: boolean }> = {
        newest: { sortBy: 'createdAt', asc: false },
        name: { sortBy: 'fullName', asc: true },
        username: { sortBy: 'username', asc: true },
      };

      const selectedSort = sortMap[sortBy] ?? sortMap.newest;

      fetchUserPage({
        search: searchTerm.trim() || undefined,
        role,
        enabled,
        page: currentPage,
        size: 10,
        sortBy: selectedSort.sortBy,
        sortDir: selectedSort.asc ? 'ASC' : 'DESC',
      });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchTerm, roleFilter, statusFilter, sortBy, currentPage, fetchUserPage]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, roleFilter, statusFilter, sortBy]);

  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getAvatarColor = (id: number) => {
    const colors = ['bg-sky-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-500', 'bg-rose-500', 'bg-amber-500'];
    return colors[id % colors.length];
  };

  const activeCount = users.filter(u => u.enabled).length;
  const disabledCount = users.filter(u => !u.enabled).length;

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="Quản lý"
        title="Khách hàng"
        description="Quản lý và phân tích khách hàng của bạn."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <StatsCard icon="group" label="Tổng khách hàng" value={(userPage?.totalElements ?? users.length).toString()} sub="Kết quả từ hệ thống" trendUp toneClassName="text-sky-600 bg-sky-50 dark:bg-sky-900/20" />
        <StatsCard icon="loyalty" label="Đang hoạt động" value={activeCount.toString()} sub="Trang hiện tại" toneClassName="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400" />
        <StatsCard icon="block" label="Đã khóa" value={disabledCount.toString()} sub="Trang hiện tại" toneClassName="text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400" />
      </div>

      <Panel className="overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              Tất cả khách hàng
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
                  placeholder="Tìm tên, email, tài khoản..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </form>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="CUSTOMER">Khách hàng</option>
                <option value="ADMIN">Quản trị viên</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[11px] font-black uppercase text-slate-600 dark:text-slate-200 focus:outline-none"
              >
                <option value="ALL">Tất cả trạng thái</option>
                <option value="ACTIVE">Hoạt động</option>
                <option value="BLOCKED">Đã khóa</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800/50 rounded-xl text-[11px] font-black uppercase text-sky-700 dark:text-sky-300 focus:outline-none"
              >
                <option value="newest">Sắp xếp: Mới nhất</option>
                <option value="name">Sắp xếp: Tên A-Z</option>
                <option value="username">Sắp xếp: Tài khoản</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50">
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Khách hàng</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Ngày tham gia</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">SĐT</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Vai trò</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-center">Trạng thái</th>
                <th className="px-6 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-sm">
                    Không tìm thấy khách hàng phù hợp.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl ${getAvatarColor(u.userId)} flex items-center justify-center text-white font-black text-xs shrink-0 shadow-sm`}>
                          {getInitials(u.fullName || u.username)}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white">{u.fullName || 'Chưa có tên'}</div>
                          <div className="text-[11px] text-slate-400 font-medium">@{u.username} • {u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400">
                      {u.createdAt ? formatDate(u.createdAt, 'DD/MM/YYYY') : 'Lâu rồi'}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">{u.phoneNumber || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {u.enabled ? (
                          <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1.5 w-[85px] py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm shadow-amber-500/10">
                            <span className="material-symbols-outlined text-[14px]">block</span>
                            Đã khóa
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {u.role !== 'ADMIN' ? (
                          <button
                            onClick={() => toggleStatus(u.userId)}
                            title={u.enabled ? 'Block User' : 'Enable User'}
                            className={`p-2 rounded-xl transition-all ${u.enabled ? 'text-amber-500 hover:bg-amber-50' : 'text-emerald-500 hover:bg-emerald-50'}`}
                          >
                            <span className="material-symbols-outlined text-lg">{u.enabled ? 'block' : 'check_circle'}</span>
                          </button>
                        ) : (
                          <div className="p-2 text-[10px] font-black uppercase tracking-widest text-slate-300 italic">Bảo vệ</div>
                        )}
                        <button className="p-2 rounded-xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all">
                          <span className="material-symbols-outlined text-lg">analytics</span>
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
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">
            Hiển thị {users.length === 0 ? 0 : (userPage?.currentPage ?? 0) * (userPage?.pageSize ?? users.length) + 1}
            -
            {users.length === 0 ? 0 : (userPage?.currentPage ?? 0) * (userPage?.pageSize ?? users.length) + users.length}
            {' '}/ {userPage?.totalElements ?? users.length} khách hàng
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((page) => Math.max(page - 1, 0))}
              disabled={userPage?.first ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Trước
            </button>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 min-w-[90px] text-center">
              Trang {(userPage?.currentPage ?? 0) + 1} / {Math.max(userPage?.totalPages ?? 1, 1)}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((page) => page + 1)}
              disabled={userPage?.last ?? true}
              className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 disabled:opacity-50"
            >
              Tiếp
            </button>
          </div>
        </div>
      </Panel>
    </div>
  );
}

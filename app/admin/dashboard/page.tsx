'use client';

import { useEffect, useMemo } from 'react';
import { formatPrice } from '@/lib/utils';
import PageHeader from '@/components/admin/PageHeader';
import Panel from '@/components/admin/Panel';
import StatsCard from '@/components/admin/StatsCard';
import { useAdminOrder } from '@/hooks/useAdminOrder';
import { useProduct } from '@/hooks/useProduct';
import { useUser } from '@/hooks/useUser';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function AdminDashboard() {
  const { orders, fetchAllOrders } = useAdminOrder();
  const { products, fetchProductsAdmin } = useProduct();
  const { users, fetchUsers } = useUser();

  useEffect(() => {
    fetchAllOrders();
    fetchProductsAdmin();
    fetchUsers();
  }, [fetchAllOrders, fetchProductsAdmin, fetchUsers]);

  // Calculations
  const totalRevenue = useMemo(() => 
    orders
      .filter(o => ['COMPLETED', 'PAID', 'SHIPPED'].includes(o.status))
      .reduce((sum, o) => sum + o.finalAmount, 0)
  , [orders]);

  const activeOrders = useMemo(() => 
    orders.filter(o => !['COMPLETED', 'CANCELLED'].includes(o.status)).length
  , [orders]);

  const stockAlerts = useMemo(() => 
    products.filter(p => p.quantity < 10).length
  , [products]);

  const recentOrders = useMemo(() => 
    [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  , [orders]);

  const topProducts = useMemo(() => {
    const revenueMap: Record<number, { name: string, revenue: number }> = {};
    
    orders
      .filter(o => o.status !== 'CANCELLED')
      .forEach(o => {
        o.orderItems.forEach(item => {
          if (!revenueMap[item.productId]) {
            revenueMap[item.productId] = { name: item.productName, revenue: 0 };
          }
          revenueMap[item.productId].revenue += item.price * item.quantity;
        });
      });

    const sorted = Object.values(revenueMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 3);
      
    const maxRevenue = sorted.length > 0 ? sorted[0].revenue : 1;
    return sorted.map(p => ({
      ...p,
      pct: (p.revenue / maxRevenue) * 100
    }));
  }, [orders]);

  return (
    <div className="p-8 min-h-screen bg-slate-50 dark:bg-slate-950">
      <PageHeader
        eyebrow="Overview"
        title="Operations Dashboard"
        description="Real-time overview of your coastal preservation business."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
        <StatsCard icon="payments" label="Total Revenue" value={formatPrice(totalRevenue)} sub="Gross confirmed earnings" trendUp />
        <StatsCard icon="shopping_bag" label="Active Orders" value={activeOrders.toString()} sub={`${orders.filter(o => o.status === 'PENDING').length} pending dispatch`} />
        <StatsCard 
          icon="warning" 
          label="Stock Alerts" 
          value={`${stockAlerts} Items`} 
          sub="Low inventory warning" 
          toneClassName={stockAlerts > 0 ? "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400" : "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20"} 
        />
        <StatsCard icon="group_add" label="Total Customers" value={(users ?? []).length.toString()} sub="Registered curators" trendUp />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Panel className="lg:col-span-2 p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue Snapshot</h3>
              <p className="text-xs text-slate-400 mt-0.5">Performance of the last {orders.length} distributions</p>
            </div>
            <span className="text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 px-3 py-1.5 rounded-lg">+100% Data Sync</span>
          </div>
          <div className="flex items-end gap-2 h-40">
            {/* Simple mock chart using actual distribution of last 12 orders if available */}
            {Array.from({ length: 12 }).map((_, i) => {
              const val = orders[i] ? (orders[i].finalAmount / (totalRevenue / orders.length || 1)) * 50 : 20;
              const h = Math.min(Math.max(val, 10), 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className={`w-full rounded-t-lg transition-all ${i === 11 ? 'bg-sky-600' : 'bg-sky-200 dark:bg-sky-900'}`} 
                    style={{ height: `${h}%` }} 
                  />
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8', 'P9', 'P10', 'P11', 'Latest'].map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </Panel>

        <Panel className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Recent Activity</h3>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recent activity recorded.</p>
            ) : (
              recentOrders.map((o) => (
                <ActivityItem 
                  key={o.orderId}
                  icon={o.status === 'CANCELLED' ? 'cancel' : 'package_2'} 
                  color={o.status === 'CANCELLED' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-sky-100 text-sky-600 dark:bg-sky-900/30 dark:text-sky-400'} 
                  title={`Order #${o.orderId}`} 
                  desc={`${o.orderItems[0]?.productName || 'Order'} · ${formatPrice(o.finalAmount)}`} 
                  time={formatDistanceToNow(new Date(o.createdAt), { addSuffix: true })} 
                />
              ))
            )}
            {(users ?? []).slice(0, 1).map(u => (
              <ActivityItem 
                key={u.userId}
                icon="person_add" 
                color="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" 
                title="Customer Sync" 
                desc={`Latest curator: ${u.fullName || u.username}`} 
                time="Active" 
              />
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Panel className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Top Performing Products</h3>
          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No sales data available yet.</p>
            ) : (
              topProducts.map((p) => (
                <div key={p.name} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white ml-4 shrink-0">{formatPrice(p.revenue)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <div className="h-full bg-sky-500 rounded-full" style={{ width: `${p.pct}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>

        <Panel className="p-6">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5">Quick Commands</h3>
          <div className="grid grid-cols-2 gap-3">
            <QuickActionLink icon="add_box" label="Add Product" href="/admin/products" color="bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-400 hover:bg-sky-100" />
            <QuickActionLink icon="receipt_long" label="Orders" href="/admin/orders" color="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 hover:bg-emerald-100" />
            <QuickActionLink icon="analytics" label="Customers" href="/admin/customers" color="bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 hover:bg-purple-100" />
            <QuickActionLink icon="confirmation_number" label="Discounts" href="/admin/discounts" color="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 hover:bg-amber-100" />
          </div>
        </Panel>
      </div>
    </div>
  );
}

function ActivityItem({ icon, color, title, desc, time }: { icon: string; color: string; title: string; desc: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
        <span className="material-symbols-outlined text-[16px]">{icon}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{title}</p>
        <p className="text-xs text-slate-400 font-medium truncate">{desc}</p>
      </div>
      <span className="text-[10px] text-slate-400 font-medium shrink-0">{time}</span>
    </div>
  );
}

function QuickActionLink({ icon, label, href, color }: { icon: string; label: string; href: string; color: string }) {
  return (
    <Link href={href} className={`${color} p-5 rounded-xl flex flex-col items-start gap-3 transition-all hover:scale-[1.02] active:scale-95`}>
      <span className="material-symbols-outlined text-xl">{icon}</span>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </Link>
  );
}

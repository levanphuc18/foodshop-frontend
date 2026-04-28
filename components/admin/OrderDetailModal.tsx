'use client';

import { formatPrice } from '@/lib/utils';
import { OrderResponse } from '@/types/order';
import { format } from 'date-fns';

interface OrderDetailModalProps {
  order: OrderResponse | null;
  onClose: () => void;
}

export default function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  if (!order) return null;

  const customerPrimaryLabel = order.fullName || order.username || `User #${order.userId}`;
  const customerSecondaryLabel =
    order.fullName && order.username ? `@${order.username}` : `User #${order.userId}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Order Details #{order.orderId}</h3>
            <p className="text-xs text-slate-400">{format(new Date(order.createdAt), 'MMMM dd, yyyy HH:mm')}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition-all"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Customer / Shipping / Payment Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Customer Information</h4>
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{customerPrimaryLabel}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{customerSecondaryLabel}</p>
              </div>
            </div>
            <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Shipping Information</h4>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{order.shippingAddress}</p>
              {order.shippingNote && (
                <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-500">
                  <strong>Note:</strong> {order.shippingNote}
                </div>
              )}
            </div>
            <div className="sm:col-span-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Payment Summary</h4>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(order.totalAmount)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Order Discount ({order.discountCode}):</span>
                    <span className="font-semibold text-rose-500">-{formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Shipping Fee:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{formatPrice(order.shippingFee)}</span>
                </div>
                {order.shippingDiscount > 0 && (
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Shipping Discount:</span>
                    <span className="font-semibold text-rose-500">-{formatPrice(order.shippingDiscount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-slate-900 dark:text-white">Total:</span>
                  <span className="font-bold text-sky-600 dark:text-sky-400">{formatPrice(order.finalAmount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Item List */}
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4">Harvest Items</h4>
          <div className="space-y-3">
            {order.orderItems.map((item) => (
              <div key={item.orderItemId} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 overflow-hidden shrink-0">
                  <img 
                    src={item.productImageUrl || 'https://via.placeholder.com/150'} 
                    alt={item.productName} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">{item.productName}</h5>
                  <p className="text-[11px] text-slate-400">{formatPrice(item.price)} x {item.quantity}</p>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {formatPrice(item.subtotal)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

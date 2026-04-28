'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/api/notification';
import { useNotificationStore } from '@/store/notificationStore';

function formatRelative(createdAt: string) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(date);
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { items, unreadCount, connected, markOneAsReadLocal, markAllAsReadLocal } = useNotificationStore();

  const notifications = useMemo(() => items.slice(0, 10), [items]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  const handleMarkOne = async (notificationId: number) => {
    setBusyId(notificationId);
    try {
      await markNotificationAsRead(notificationId);
      markOneAsReadLocal(notificationId);
    } finally {
      setBusyId(null);
    }
  };

  const handleMarkAll = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      markAllAsReadLocal();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 transition-all active:scale-90"
        aria-label="Notifications"
      >
        <span className="material-symbols-outlined text-[22px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl shadow-slate-900/10 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <p className="text-sm font-black text-slate-900 dark:text-white">Notifications</p>
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                {connected ? 'Realtime connected' : 'Reconnecting...'}
              </p>
            </div>
            <button
              type="button"
              disabled={markingAll || unreadCount === 0}
              onClick={handleMarkAll}
              className="text-[11px] font-black uppercase tracking-wide text-sky-600 disabled:text-slate-400"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notificationId}
                  className={`px-4 py-3 border-b border-slate-100 dark:border-slate-900 ${item.read ? 'bg-transparent' : 'bg-sky-50/60 dark:bg-sky-950/20'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.content}</p>
                      <div className="mt-2 flex items-center gap-3 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>{formatRelative(item.createdAt)}</span>
                        {item.orderId && (
                          <Link href={`/orders/${item.orderId}`} className="text-sky-600">
                            View order
                          </Link>
                        )}
                      </div>
                    </div>

                    {!item.read && (
                      <button
                        type="button"
                        disabled={busyId === item.notificationId}
                        onClick={() => handleMarkOne(item.notificationId)}
                        className="text-[11px] font-black uppercase tracking-wide text-slate-600 dark:text-slate-300"
                      >
                        Read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

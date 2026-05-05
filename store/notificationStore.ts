import { create } from 'zustand';
import type { NotificationItem } from '@/schemas/notification';

interface NotificationState {
  items: NotificationItem[];
  unreadCount: number;
  connected: boolean;
  setItems: (items: NotificationItem[]) => void;
  setUnreadCount: (count: number) => void;
  setConnected: (connected: boolean) => void;
  addIncomingNotification: (item: NotificationItem) => void;
  markOneAsReadLocal: (notificationId: number) => void;
  markAllAsReadLocal: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  unreadCount: 0,
  connected: false,
  setItems: (items) =>
    set({
      items,
      unreadCount: items.filter((item) => !item.read).length,
    }),
  setUnreadCount: (unreadCount) => set({ unreadCount }),
  setConnected: (connected) => set({ connected }),
  addIncomingNotification: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      unreadCount: state.unreadCount + (item.read ? 0 : 1),
    })),
  markOneAsReadLocal: (notificationId) =>
    set((state) => {
      let changed = false;
      const items = state.items.map((item) => {
        if (item.notificationId === notificationId && !item.read) {
          changed = true;
          return { ...item, read: true };
        }
        return item;
      });
      return {
        items,
        unreadCount: changed ? Math.max(0, state.unreadCount - 1) : state.unreadCount,
      };
    }),
  markAllAsReadLocal: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
      unreadCount: 0,
    })),
  clear: () => set({ items: [], unreadCount: 0, connected: false }),
}));

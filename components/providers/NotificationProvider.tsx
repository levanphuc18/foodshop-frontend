'use client';

import { Client } from '@stomp/stompjs';
import { useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getAuthHeaders } from '@/lib/api/auth';
import { getNotifications, getUnreadNotificationCount } from '@/lib/api/notification';
import { WS_BASE_URL } from '@/lib/constants';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import type { NotificationItem } from '@/types/notification';

export default function NotificationProvider() {
  const clientRef = useRef<Client | null>(null);
  const { isAuthenticated, user } = useAuthStore();
  const { setItems, setUnreadCount, setConnected, addIncomingNotification, clear } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      clientRef.current?.deactivate();
      clientRef.current = null;
      clear();
      return;
    }

    let active = true;

    const bootstrapNotifications = async () => {
      try {
        const [notificationsResponse, unreadResponse] = await Promise.all([
          getNotifications(),
          getUnreadNotificationCount(),
        ]);
        if (!active) {
          return;
        }
        setItems(notificationsResponse.data ?? []);
        setUnreadCount(unreadResponse.data ?? 0);
      } catch {
        if (active) {
          setConnected(false);
        }
      }
    };

    const headers = getAuthHeaders() as Record<string, string>;
    const client = new Client({
      brokerURL: WS_BASE_URL,
      connectHeaders: headers.Authorization ? { Authorization: headers.Authorization } : {},
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => {},
      onConnect: () => {
        setConnected(true);
        client.subscribe('/user/queue/notifications', (frame) => {
          const payload = JSON.parse(frame.body) as NotificationItem;
          addIncomingNotification(payload);
          toast(payload.title, {
            icon: '🔔',
          });
        });
      },
      onWebSocketClose: () => {
        setConnected(false);
      },
      onStompError: () => {
        setConnected(false);
      },
    });

    bootstrapNotifications();
    client.activate();
    clientRef.current = client;

    return () => {
      active = false;
      setConnected(false);
      client.deactivate();
      clientRef.current = null;
    };
  }, [addIncomingNotification, clear, isAuthenticated, setConnected, setItems, setUnreadCount, user?.role]);

  return null;
}

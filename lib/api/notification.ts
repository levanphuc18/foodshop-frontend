import { fetcher } from '@/lib/fetcher';
import type { ApiResponse } from '@/schemas/api';
import type { NotificationItem } from '@/schemas/notification';

export function getNotifications() {
  return fetcher<ApiResponse<NotificationItem[]>>('/notifications');
}

export function getUnreadNotificationCount() {
  return fetcher<ApiResponse<number>>('/notifications/unread-count');
}

export function markNotificationAsRead(notificationId: number) {
  return fetcher<ApiResponse<NotificationItem>>(`/notifications/${notificationId}/read`, {
    method: 'PATCH',
  });
}

export function markAllNotificationsAsRead() {
  return fetcher<ApiResponse<null>>('/notifications/read-all', {
    method: 'PATCH',
  });
}

import { fetcher } from '@/lib/fetcher';
import type { ApiResponse } from '@/types/api';
import type { NotificationItem } from '@/types/notification';

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

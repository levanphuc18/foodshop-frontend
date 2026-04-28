export interface NotificationItem {
  notificationId: number;
  orderId: number | null;
  type: string;
  title: string;
  content: string;
  read: boolean;
  createdAt: string;
}

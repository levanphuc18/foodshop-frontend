import { z } from 'zod';

export const notificationItemSchema = z.object({
  notificationId: z.number(),
  orderId: z.number().nullable(),
  type: z.string(),
  title: z.string(),
  content: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
});
export type NotificationItem = z.infer<typeof notificationItemSchema>;

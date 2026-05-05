import { z } from 'zod';

export const userResponseSchema = z.object({
  userId: z.number(),
  username: z.string(),
  email: z.string(),
  fullName: z.string(),
  phoneNumber: z.string(),
  address: z.string(),
  role: z.enum(['ADMIN', 'CUSTOMER']),
  enabled: z.boolean(),
  createdAt: z.string(),
});
export type UserResponse = z.infer<typeof userResponseSchema>;

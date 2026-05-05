import { z } from 'zod';

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Họ tên phải có ít nhất 2 ký tự')
    .max(100, 'Họ tên không được quá 100 ký tự'),
  email: z.string().email('Email không hợp lệ'),
  phoneNumber: z
    .string()
    .regex(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ')
    .optional()
    .or(z.literal('')),
  address: z
    .string()
    .max(200, 'Địa chỉ không được quá 200 ký tự')
    .optional()
    .or(z.literal('')),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

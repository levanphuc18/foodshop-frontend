import { z } from 'zod';

export const checkoutSchema = z.object({
  regionAddress: z.string().min(1, 'Vui lòng chọn Tỉnh/Thành phố, Quận/Huyện'),
  specificAddress: z.string().min(5, 'Địa chỉ chi tiết phải có ít nhất 5 ký tự'),
  shippingNote: z
    .string()
    .max(500, 'Ghi chú không được quá 500 ký tự')
    .optional()
    .or(z.literal('')),
  paymentMethod: z.enum(['COD', 'VNPAY']),
});

export type CheckoutFormData = z.infer<typeof checkoutSchema>;

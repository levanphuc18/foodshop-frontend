import { z } from 'zod';

// ── Authentication Schemas ──────────────────────────────────────────────────

export const authRequestSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
});
export type AuthRequest = z.infer<typeof authRequestSchema>;

export const registerSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
      .max(20, 'Tên đăng nhập không được quá 20 ký tự')
      .regex(/^[a-zA-Z0-9_]+$/, 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới'),
    fullName: z
      .string()
      .min(2, 'Họ tên phải có ít nhất 2 ký tự')
      .max(50, 'Họ tên không được quá 50 ký tự'),
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
    password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
    role: z.enum(['ADMIN', 'CUSTOMER']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Request type for API (without confirmPassword)
export const registerRequestSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
  email: z.string().optional(),
  fullName: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['ADMIN', 'CUSTOMER']).optional(),
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const authResponseSchema = z.object({
  username: z.string(),
  accessToken: z.string(),
  refreshToken: z.string(),
  userId: z.number(),
  role: z.enum(['ADMIN', 'CUSTOMER']),
});
export type AuthResponse = z.infer<typeof authResponseSchema>;

export const jwtResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
});
export type JwtResponse = z.infer<typeof jwtResponseSchema>;

export const loginSchema = z.object({
  username: z.string().min(1, 'Vui lòng nhập tên đăng nhập'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
export type LoginFormData = z.infer<typeof loginSchema>;

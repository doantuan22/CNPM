import { z } from 'zod';

export const registerSchema = z.object({
  TenDangNhap: z
    .string()
    .min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự')
    .max(100)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm hoặc gạch dưới'),
  Email: z.string().email('Email không đúng định dạng'),
  MatKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  HoTen: z.string().min(2, 'Họ tên ít nhất 2 ký tự').max(150),
  SoDienThoai: z.string().min(8, 'Số điện thoại không hợp lệ').max(20),
  // DDI-01 (resolved): optional at registration — nullable in the baseline.
  NgaySinh: z.coerce.date().optional(),
  GioiTinh: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  MatKhau: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  Email: z.string().email('Email không đúng định dạng'),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Thiếu token đặt lại mật khẩu'),
  MatKhauMoi: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

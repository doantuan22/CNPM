import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Vui lòng nhập email hoặc tên đăng nhập'),
  MatKhau: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

// An untouched <input type="date">/<select> submits '' — kept as a plain
// literal union (no preprocess/transform) so type inference stays simple
// and consistent between `tsc --noEmit` and the stricter `tsc -b` build.
// Components convert '' to undefined when building the API payload.
export const GENDER_OPTIONS = ['Nam', 'Nữ', 'Khác'] as const;

export const registerSchema = z
  .object({
    TenDangNhap: z
      .string()
      .min(3, 'Tên đăng nhập ít nhất 3 ký tự')
      .regex(/^[a-zA-Z0-9_.]+$/, 'Chỉ gồm chữ, số, dấu chấm hoặc gạch dưới'),
    Email: z.string().email('Email không đúng định dạng'),
    HoTen: z.string().min(2, 'Họ và tên ít nhất 2 ký tự'),
    SoDienThoai: z.string().min(8, 'Số điện thoại không hợp lệ'),
    // DDI-01 (resolved): optional — nullable in the baseline, not required at registration.
    NgaySinh: z.string().optional(),
    GioiTinh: z.enum([...GENDER_OPTIONS, '']).optional(),
    MatKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmMatKhau: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.MatKhau === data.confirmMatKhau, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmMatKhau'],
  });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  Email: z.string().email('Email không đúng định dạng'),
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Thiếu token đặt lại mật khẩu'),
    MatKhauMoi: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmMatKhauMoi: z.string().min(1, 'Vui lòng xác nhận mật khẩu'),
  })
  .refine((data) => data.MatKhauMoi === data.confirmMatKhauMoi, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmMatKhauMoi'],
  });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const updateProfileSchema = z.object({
  HoTen: z.string().min(2, 'Họ và tên ít nhất 2 ký tự'),
  SoDienThoai: z.string().min(8, 'Số điện thoại không hợp lệ'),
  NgaySinh: z.string().optional(),
  GioiTinh: z.enum([...GENDER_OPTIONS, '']).optional(),
});
export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

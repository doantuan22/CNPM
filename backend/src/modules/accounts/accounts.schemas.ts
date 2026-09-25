import { z } from 'zod';

export const listAccountsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  TrangThai: z.string().max(30).optional(),
  MaVaiTro: z.coerce.number().int().optional(),
});
export type ListAccountsQuery = z.infer<typeof listAccountsQuerySchema>;

export const createAccountSchema = z.object({
  TenDangNhap: z
    .string()
    .min(3)
    .max(100)
    .regex(/^[a-zA-Z0-9_.]+$/, 'Tên đăng nhập chỉ gồm chữ, số, dấu chấm hoặc gạch dưới'),
  Email: z.string().email(),
  MatKhau: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  HoTen: z.string().min(2).max(150),
  SoDienThoai: z.string().min(8).max(20),
  // DDI-01 (resolved): nullable in the baseline, optional here too.
  NgaySinh: z.coerce.date().optional(),
  GioiTinh: z.enum(['Nam', 'Nữ', 'Khác']).optional(),
  MaVaiTro: z.coerce.number().int(),
});
export type CreateAccountInput = z.infer<typeof createAccountSchema>;

// Deliberately excludes TrangThai (see lock/unlock endpoints) and MatKhau
// (password reset is a separate, explicit concern, not a silent side-effect
// of a general "update account" call).
export const updateAccountSchema = z
  .object({
    TenDangNhap: z
      .string()
      .min(3)
      .max(100)
      .regex(/^[a-zA-Z0-9_.]+$/),
    Email: z.string().email(),
    HoTen: z.string().min(2).max(150),
    SoDienThoai: z.string().min(8).max(20),
    NgaySinh: z.coerce.date(),
    GioiTinh: z.enum(['Nam', 'Nữ', 'Khác']),
    AnhDaiDien: z.string().max(500),
    MaVaiTro: z.coerce.number().int(),
  })
  .partial();
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

export const accountIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

import { z } from 'zod';

// Whitelist only — MaVaiTro, TrangThai, NgayTao, TenDangNhap, Email, MatKhau
// are intentionally excluded so a client can never self-elevate via /profile.
export const updateProfileSchema = z
  .object({
    HoTen: z.string().min(2, 'Họ tên ít nhất 2 ký tự').max(150),
    SoDienThoai: z.string().min(8, 'Số điện thoại không hợp lệ').max(20),
    NgaySinh: z.coerce.date(),
    GioiTinh: z.enum(['Nam', 'Nữ', 'Khác']),
    AnhDaiDien: z.string().max(500).optional(),
  })
  .partial();
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

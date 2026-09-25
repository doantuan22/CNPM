import type { TAI_KHOAN } from '../../generated/prisma/client';

export interface SafeAccount {
  MaTaiKhoan: number;
  MaVaiTro: number;
  TenDangNhap: string;
  Email: string;
  HoTen: string;
  SoDienThoai: string;
  NgaySinh: Date | null;
  GioiTinh: string | null;
  AnhDaiDien: string | null;
  TrangThai: string;
  NgayTao: Date;
  NgayCapNhat: Date;
}

/** Strips MatKhau (password hash) before an account row ever reaches an API response. */
export const toSafeAccount = (account: TAI_KHOAN): SafeAccount => {
  const safe: Partial<TAI_KHOAN> = { ...account };
  delete safe.MatKhau;
  return safe as SafeAccount;
};

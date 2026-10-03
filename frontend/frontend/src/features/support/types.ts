export interface SupportRequest {
  MaYeuCauHoTro: number;
  MaTaiKhoanKhachHang: number;
  MaTaiKhoanXuLy: number | null;
  MaDatPhong: number | null;
  LoaiYeuCau: string;
  TieuDe: string;
  NoiDung: string;
  KetQuaXuLy: string | null;
  TrangThai: string;
  NgayTao: string;
  NgayXuLy: string | null;
  DAT_PHONG?: { MaDatPhong: number; MaXacNhanDatPhong: string } | null;
}

export interface AdminSupportListItem extends SupportRequest {
  TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanKhachHangToTAI_KHOAN: { MaTaiKhoan: number; HoTen: string; Email: string };
}

export interface AdminSupportDetail extends AdminSupportListItem {
  TAI_KHOAN_YEU_CAU_HO_TRO_MaTaiKhoanXuLyToTAI_KHOAN: { MaTaiKhoan: number; HoTen: string } | null;
}

export interface CreateSupportRequest {
  loaiYeuCau: string;
  tieuDe: string;
  noiDung: string;
  maDatPhong?: number;
}

export interface AdminUpdateSupportRequest {
  trangThai: string;
  ketQuaXuLy?: string;
}

export interface AdminSupportListQuery {
  page?: number;
  limit?: number;
  search?: string;
  trangThai?: string;
  loaiYeuCau?: string;
}

export interface BookingRoomLine {
  MaLoaiPhong: number;
  TenLoaiPhong: string;
  SoLuong: number;
  GiaTheoDem: number | null;
  ThanhTien: number | null;
}

export interface BookingPromotion {
  MaKhuyenMai: number;
  MaCode: string;
  LoaiGiamGia: string;
  GiaTriGiam: number;
}

export interface BookingCancellationPolicy {
  MaChinhSachHuy: number;
  TenChinhSach: string;
  MoTa: string;
  ChiTiet: Array<{ SoGioTruocNhanPhong: number; TyLeHoanTien: number }>;
}

export interface Booking {
  MaDatPhong: number;
  MaXacNhanDatPhong: string;
  MaKhachSan: number;
  NgayNhanPhong: string;
  NgayTraPhong: string;
  SoDem: number;
  ChiTietPhong: BookingRoomLine[];
  TongTienPhong: number;
  KhuyenMai: BookingPromotion | null;
  SoTienGiam: number;
  TongTienThanhToan: number;
  TrangThai: string;
  GhiChu: string | null;
  ChinhSachHuy: BookingCancellationPolicy;
  NgayTao: string;
}

export interface CreateBookingRequest {
  checkIn: string;
  checkOut: string;
  rooms: Array<{ maLoaiPhong: number; soLuong: number }>;
  promoCode?: string;
  ghiChu?: string;
}

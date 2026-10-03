export interface DateRangeQuery {
  from?: string;
  to?: string;
}

export interface CountByLabel {
  Label: string;
  SoLuong: number;
}

export interface BookingsByStatus {
  TrangThai: string;
  SoLuong: number;
}

export interface TopRoomType {
  MaLoaiPhong: number;
  TenLoaiPhong: string;
  SoLuongDaDat: number;
}

export interface OwnerAnalytics {
  MaKhachSan: number;
  From: string | null;
  To: string | null;
  TongSoBooking: number;
  BookingTheoTrangThai: BookingsByStatus[];
  DoanhThuGop: number;
  TongHoanTien: number;
  DoanhThuThucNhan: number;
  LoaiPhongPhoBien: TopRoomType[];
  TyLeLapDay: number | null;
  TongPhongDem: number;
  TongPhongCoTheBan: number;
}

export interface AdminAnalytics {
  From: string | null;
  To: string | null;
  TongTaiKhoan: number;
  TaiKhoanTheoVaiTro: CountByLabel[];
  TongKhachSan: number;
  KhachSanTheoTrangThai: CountByLabel[];
  TongSoBooking: number;
  BookingTheoTrangThai: BookingsByStatus[];
  LoaiPhongPhoBien: TopRoomType[];
  TongGiaoDich: number;
  ThanhToanTheoTrangThai: CountByLabel[];
  DoanhThuHeThong: number;
  TongHoanTien: number;
  DoanhThuThucNhan: number;
  HoanTienTheoTrangThai: CountByLabel[];
  DanhGiaTheoTrangThai: CountByLabel[];
  YeuCauHoTroTheoTrangThai: CountByLabel[];
}

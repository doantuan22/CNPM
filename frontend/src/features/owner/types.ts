import type { Amenity, DiaPhuong } from '../hotels/types';

export interface OwnerHotelImage {
  MaHinhAnh: number;
  MaKhachSan: number;
  URL: string;
  AnhDaiDien: boolean;
}

export interface OwnerHotelAmenityLink {
  MaKhachSan: number;
  MaTienNghi: number;
  TIEN_NGHI: Amenity;
}

export interface OwnerHotel {
  MaKhachSan: number;
  MaTaiKhoanSoHuu: number;
  MaDiaPhuong: number;
  MaTaiKhoanDuyet: number | null;
  TenKhachSan: string;
  DiaChiChiTiet: string;
  HangSao: number;
  MoTa: string | null;
  GioNhanPhong: string;
  GioTraPhong: string;
  TrangThai: string;
  NgayDangKy: string;
  NgayDuyet: string | null;
  NgayCapNhat: string;
  DIA_PHUONG: DiaPhuong;
  HINH_ANH_KHACH_SAN: OwnerHotelImage[];
  KHACH_SAN_TIEN_NGHI?: OwnerHotelAmenityLink[];
}

export interface OwnerRoomTypeImage {
  MaHinhAnhLoaiPhong: number;
  MaLoaiPhong: number;
  URL: string;
  LaAnhDaiDien: boolean;
}

export interface OwnerRoomTypeAmenityLink {
  MaLoaiPhong: number;
  MaTienNghi: number;
  TIEN_NGHI: Amenity;
}

export interface OwnerRoomType {
  MaLoaiPhong: number;
  MaKhachSan: number;
  TenLoaiPhong: string;
  SoGiuong: number;
  SucChua: number;
  DienTich: number;
  LoaiGiuong: string;
  MoTa: string | null;
  TrangThai: string;
  HINH_ANH_LOAI_PHONG: OwnerRoomTypeImage[];
  LOAI_PHONG_TIEN_NGHI: OwnerRoomTypeAmenityLink[];
  KHACH_SAN?: OwnerHotel;
}

export interface RateRow {
  MaQuyPhong: number;
  MaLoaiPhong: number;
  NgayApDung: string;
  GiaPhong: number;
  SoLuongPhong: number;
  TrangThai: string;
}

export interface HotelFormValues {
  TenKhachSan: string;
  DiaChiChiTiet: string;
  HangSao: number;
  MoTa?: string;
  GioNhanPhong: string;
  GioTraPhong: string;
  MaDiaPhuong: number;
}

export interface RoomTypeFormValues {
  TenLoaiPhong: string;
  SoGiuong: number;
  SucChua: number;
  DienTich: number;
  LoaiGiuong: string;
  MoTa?: string;
  TrangThai?: string;
}

export interface RateItemInput {
  NgayApDung: string;
  GiaPhong: number;
  SoLuongPhong: number;
  TrangThai?: string;
}

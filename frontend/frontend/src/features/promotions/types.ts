export interface Promotion {
  MaKhuyenMai: number;
  MaCode: string;
  LoaiGiamGia: string;
  GiaTriGiam: number;
  GiaTriDonToiThieu: number;
  MucGiamToiDa: number;
  SoLuongGioiHan: number;
  NgayBatDau: string;
  NgayKetThuc: string;
  PhamViApDung: string;
  TrangThai: string;
}

export interface PromotionDetail extends Promotion {
  SoLuongDaSuDung: number;
}

export interface PromotionListQuery {
  page?: number;
  limit?: number;
  search?: string;
  TrangThai?: string;
  LoaiGiamGia?: string;
}

export interface PromotionFormValues {
  MaCode: string;
  LoaiGiamGia: string;
  GiaTriGiam: number;
  GiaTriDonToiThieu: number;
  MucGiamToiDa: number;
  SoLuongGioiHan: number;
  NgayBatDau: string;
  NgayKetThuc: string;
}

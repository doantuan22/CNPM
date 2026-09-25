# Constraint Checklist — DB-0 Baseline

Source column legend: `Ch6` = Chương 6, `Ch7` = Chương 7 (RB code), `Gate0` = Gate 0 decision, `ERD` = ERD chuẩn (implied by Chương 6 relationship notes).
Implemented = created in `database/migrations/`. Tested = exercised in `database/scripts/test-constraints.sql` (constraint-level tests only; 7.6 cross-table rules are out of DB-0 scope, see below).

## Primary Keys

| Table | Constraint | Type | Source | Implemented | Tested |
|---|---|---|---|---|---|
| VAI_TRO | PK_VAI_TRO | PK | Ch7 RB1 (7.1) | Yes | Yes (verify-schema) |
| TAI_KHOAN | PK_TAI_KHOAN | PK | Ch7 RB2 (7.1) | Yes | Yes |
| HO_SO_DOI_TAC | PK_HO_SO_DOI_TAC | PK | Ch7 RB3 (7.1) | Yes | Yes |
| DIA_PHUONG | PK_DIA_PHUONG | PK | Ch7 RB4 (7.1) | Yes | Yes |
| KHACH_SAN | PK_KHACH_SAN | PK | Ch7 RB5 (7.1) | Yes | Yes |
| HINH_ANH_KHACH_SAN | PK_HINH_ANH_KHACH_SAN | PK | Ch7 RB6 (7.1) | Yes | Yes |
| TIEN_NGHI | PK_TIEN_NGHI | PK | Ch7 RB7 (7.1) | Yes | Yes |
| KHACH_SAN_TIEN_NGHI | PK_KHACH_SAN_TIEN_NGHI | PK (composite) | Ch7 RB8 (7.1) | Yes | Yes |
| LOAI_PHONG | PK_LOAI_PHONG | PK | Ch7 RB9 (7.1) | Yes | Yes |
| HINH_ANH_LOAI_PHONG | PK_HINH_ANH_LOAI_PHONG | PK | Ch7 RB10 (7.1) | Yes | Yes |
| LOAI_PHONG_TIEN_NGHI | PK_LOAI_PHONG_TIEN_NGHI | PK (composite) | Ch7 RB11 (7.1) | Yes | Yes |
| QUY_PHONG_GIA | PK_QUY_PHONG_GIA | PK | Ch7 RB12 (7.1) | Yes | Yes |
| CHINH_SACH_HUY | PK_CHINH_SACH_HUY | PK | Ch7 RB13 (7.1) | Yes | Yes |
| CHI_TIET_CHINH_SACH_HUY | PK_CHI_TIET_CHINH_SACH_HUY | PK | Ch7 RB14 (7.1) | Yes | Yes |
| KHUYEN_MAI | PK_KHUYEN_MAI | PK | Ch7 RB15 (7.1) | Yes | Yes |
| DAT_PHONG | PK_DAT_PHONG | PK | Ch7 RB17 (7.1) | Yes | Yes |
| CHI_TIET_DAT_PHONG | PK_CHI_TIET_DAT_PHONG | PK | Ch7 RB18 (7.1) | Yes | Yes |
| THANH_TOAN | PK_THANH_TOAN | PK | Ch7 RB20 (7.1) | Yes | Yes |
| HOAN_TIEN | PK_HOAN_TIEN | PK | Ch7 RB21 (7.1) | Yes | Yes |
| DANH_GIA | PK_DANH_GIA | PK | Ch7 RB22 (7.1) | Yes | Yes |
| HINH_ANH_DANH_GIA | PK_HINH_ANH_DANH_GIA | PK | Ch7 RB23 (7.1) | Yes | Yes |
| YEU_CAU_HO_TRO | PK_YEU_CAU_HO_TRO | PK | Ch7 RB24 (7.1) | Yes | Yes |

> RB16 (7.1, KHUYEN_MAI_KHACH_SAN PK) và RB19 (7.1, CHI_TIET_GIA_DAT_PHONG PK) là **OBSOLETE** theo G0-01/G0-02 — không triển khai.

## Foreign Keys

| Table | Constraint | References | Source | Implemented | Tested |
|---|---|---|---|---|---|
| TAI_KHOAN | FK_TAI_KHOAN_VAI_TRO | VAI_TRO | Ch7 RB1 (7.2) | Yes | Yes |
| HO_SO_DOI_TAC | FK_HO_SO_DOI_TAC_TAI_KHOAN | TAI_KHOAN | Ch7 RB2 (7.2) | Yes | Yes |
| HO_SO_DOI_TAC | FK_HO_SO_DOI_TAC_TAI_KHOAN_Duyet | TAI_KHOAN | Ch7 RB3 (7.2) + Gate0 G0-04 | Yes | Yes |
| KHACH_SAN | FK_KHACH_SAN_TAI_KHOAN_SoHuu | TAI_KHOAN | Ch7 RB4 (7.2, tên cột theo Ch6: MaTaiKhoanSoHuu) | Yes | Yes |
| KHACH_SAN | FK_KHACH_SAN_DIA_PHUONG | DIA_PHUONG | Ch7 RB5 (7.2) | Yes | Yes |
| KHACH_SAN | FK_KHACH_SAN_TAI_KHOAN_Duyet | TAI_KHOAN | Ch7 RB6 (7.2) | Yes | Yes |
| HINH_ANH_KHACH_SAN | FK_HINH_ANH_KHACH_SAN_KHACH_SAN | KHACH_SAN | Ch7 RB7 (7.2) | Yes | Yes |
| KHACH_SAN_TIEN_NGHI | FK_KHACH_SAN_TIEN_NGHI_KHACH_SAN | KHACH_SAN | Ch7 RB8 (7.2) | Yes | Yes |
| KHACH_SAN_TIEN_NGHI | FK_KHACH_SAN_TIEN_NGHI_TIEN_NGHI | TIEN_NGHI | Ch7 RB9 (7.2) | Yes | Yes |
| LOAI_PHONG | FK_LOAI_PHONG_KHACH_SAN | KHACH_SAN | Ch7 RB10 (7.2) | Yes | Yes |
| HINH_ANH_LOAI_PHONG | FK_HINH_ANH_LOAI_PHONG_LOAI_PHONG | LOAI_PHONG | Ch7 RB11 (7.2) | Yes | Yes |
| LOAI_PHONG_TIEN_NGHI | FK_LOAI_PHONG_TIEN_NGHI_LOAI_PHONG | LOAI_PHONG | Ch7 RB12 (7.2) | Yes | Yes |
| LOAI_PHONG_TIEN_NGHI | FK_LOAI_PHONG_TIEN_NGHI_TIEN_NGHI | TIEN_NGHI | Ch7 RB13 (7.2) | Yes | Yes |
| QUY_PHONG_GIA | FK_QUY_PHONG_GIA_LOAI_PHONG | LOAI_PHONG | Ch7 RB14 (7.2) | Yes | Yes |
| CHI_TIET_CHINH_SACH_HUY | FK_CHI_TIET_CHINH_SACH_HUY_CHINH_SACH_HUY | CHINH_SACH_HUY | Ch7 RB16 (7.2) | Yes | Yes |
| DAT_PHONG | FK_DAT_PHONG_TAI_KHOAN | TAI_KHOAN | Ch7 RB17 (7.2) | Yes | Yes |
| DAT_PHONG | FK_DAT_PHONG_KHACH_SAN | KHACH_SAN | Ch7 RB18 (7.2) | Yes | Yes |
| DAT_PHONG | FK_DAT_PHONG_KHUYEN_MAI | KHUYEN_MAI | Ch7 RB19 (7.2) | Yes | Yes |
| DAT_PHONG | FK_DAT_PHONG_CHINH_SACH_HUY | CHINH_SACH_HUY | Ch7 RB20 (7.2) + Gate0 G0-03 | Yes | Yes |
| CHI_TIET_DAT_PHONG | FK_CHI_TIET_DAT_PHONG_DAT_PHONG | DAT_PHONG | Ch7 RB21 (7.2) | Yes | Yes |
| CHI_TIET_DAT_PHONG | FK_CHI_TIET_DAT_PHONG_LOAI_PHONG | LOAI_PHONG | Ch7 RB22 (7.2) | Yes | Yes |
| THANH_TOAN | FK_THANH_TOAN_DAT_PHONG | DAT_PHONG | Ch7 RB24 (7.2) | Yes | Yes |
| HOAN_TIEN | FK_HOAN_TIEN_THANH_TOAN | THANH_TOAN | Ch7 RB25 (7.2) | Yes | Yes |
| DANH_GIA | FK_DANH_GIA_DAT_PHONG | DAT_PHONG | Ch7 RB26 (7.2) | Yes | Yes |
| DANH_GIA | FK_DANH_GIA_TAI_KHOAN | TAI_KHOAN | Ch6 6.20 (MaKhachHang) | Yes | Yes |
| DANH_GIA | FK_DANH_GIA_KHACH_SAN | KHACH_SAN | Ch6 6.20 (MaKhachSan) | Yes | Yes |
| HINH_ANH_DANH_GIA | FK_HINH_ANH_DANH_GIA_DANH_GIA | DANH_GIA | Ch7 RB27 (7.2) | Yes | Yes |
| YEU_CAU_HO_TRO | FK_YEU_CAU_HO_TRO_TAI_KHOAN_KhachHang | TAI_KHOAN | Ch7 RB28 (7.2) | Yes | Yes |
| YEU_CAU_HO_TRO | FK_YEU_CAU_HO_TRO_TAI_KHOAN_XuLy | TAI_KHOAN | Ch7 RB29 (7.2) + Gate0 G0-09 | Yes | Yes |
| YEU_CAU_HO_TRO | FK_YEU_CAU_HO_TRO_DAT_PHONG | DAT_PHONG | Ch7 RB30 (7.2) | Yes | Yes |

> RB15 (7.2, CHINH_SACH_HUY.MaKhachSan → KHACH_SAN), RB23 (7.2, CHI_TIET_GIA_DAT_PHONG FK), RB31 (7.2, YEU_CAU_HO_TRO.MaKhachSan → KHACH_SAN) là **OBSOLETE** — cột nguồn không tồn tại theo override 0.2 / G0-01 / G0-02 của tài liệu nguồn.
> Toàn bộ FK dùng `ON DELETE NO ACTION` theo mục 7 của yêu cầu DB-0 (không cascade phá lịch sử booking/payment/refund/review/support).

## Unique Constraints

| Table | Constraint | Column(s) | Source | Implemented | Tested |
|---|---|---|---|---|---|
| VAI_TRO | UQ_VAI_TRO_TenVaiTro | TenVaiTro | Ch7 RB1 (7.5) | Yes | — |
| TAI_KHOAN | UQ_TAI_KHOAN_TenDangNhap | TenDangNhap | Ch7 RB2 (7.5) | Yes | Yes |
| TAI_KHOAN | UQ_TAI_KHOAN_Email | Email | Ch7 RB2 (7.5) | Yes | — |
| TIEN_NGHI | UQ_TIEN_NGHI_TenTienNghi | TenTienNghi | Ch7 RB3 (7.5) | Yes | — |
| KHUYEN_MAI | UQ_KHUYEN_MAI_MaCode | MaCode | Ch7 RB6 (7.5) | Yes | — |
| DAT_PHONG | UQ_DAT_PHONG_MaXacNhanDatPhong | MaXacNhanDatPhong | Ch7 RB8 (7.5) | Yes | — |
| DANH_GIA | UQ_DANH_GIA_MaDatPhong | MaDatPhong | Ch7 RB9 (7.5) / RB26 (7.2, "Đồng thời là khóa duy nhất") | Yes | — |
| KHACH_SAN_TIEN_NGHI | PK_KHACH_SAN_TIEN_NGHI (composite PK doubles as uniqueness) | MaKhachSan, MaTienNghi | Ch7 RB4 (7.5) | Yes | — |
| LOAI_PHONG_TIEN_NGHI | PK_LOAI_PHONG_TIEN_NGHI (composite PK doubles as uniqueness) | MaLoaiPhong, MaTienNghi | Ch7 RB5 (7.5) | Yes | — |
| QUY_PHONG_GIA | UQ_QUY_PHONG_GIA_MaLoaiPhong_NgayApDung | MaLoaiPhong, NgayApDung | **DDI-02 (RESOLVED) — user decision** | Yes | Yes |

> RB7 (7.5, KHUYEN_MAI_KHACH_SAN composite unique) là OBSOLETE theo G0-01.

## Check Constraints

| Table | Constraint | Rule | Source | Implemented | Tested |
|---|---|---|---|---|---|
| TAI_KHOAN | CK_TAI_KHOAN_Email | basic email pattern | Ch7 RB2 (7.3) | Yes | — |
| TAI_KHOAN | CK_TAI_KHOAN_MatKhau | LEN(MatKhau) > 0 | Ch7 RB1 (7.3) | Yes | — |
| TAI_KHOAN | CK_TAI_KHOAN_NgayCapNhat | NgayCapNhat >= NgayTao | Ch7 RB8 (7.4) | Yes | — |
| HO_SO_DOI_TAC | CK_HO_SO_DOI_TAC_TrangThaiDuyet | IN (Chờ duyệt, Đã duyệt, Từ chối) | Ch6 6.3 (miền đóng) | Yes | Yes |
| HO_SO_DOI_TAC | CK_HO_SO_DOI_TAC_NgayDuyet | NgayDuyet >= NgayNop (nullable) | Ch7 RB5 (7.4) | Yes | — |
| KHACH_SAN | CK_KHACH_SAN_HangSao | 1–5 | Ch7 RB3 (7.3) | Yes | Yes |
| KHACH_SAN | CK_KHACH_SAN_NgayDuyet | NgayDuyet >= NgayDangKy (nullable) | Ch7 RB6 (7.4) | Yes | — |
| KHACH_SAN | CK_KHACH_SAN_NgayCapNhat | NgayCapNhat >= NgayDangKy | Ch7 RB7 (7.4) | Yes | — |
| LOAI_PHONG | CK_LOAI_PHONG_SucChua | >= 1 | Ch6 6.9 (≥1; thay RB4/RB5 obsolete do đổi cột) | Yes | — |
| LOAI_PHONG | CK_LOAI_PHONG_DienTich | > 0 | Ch7 RB6 (7.3) | Yes | — |
| QUY_PHONG_GIA | CK_QUY_PHONG_GIA_GiaPhong | >= 0 | Ch7 RB7 (7.3, cột đổi tên) | Yes | — |
| QUY_PHONG_GIA | CK_QUY_PHONG_GIA_SoLuongPhong | >= 0 | Ch7 RB8 (7.3, cột đổi tên) | Yes | — |
| CHI_TIET_CHINH_SACH_HUY | CK_CHI_TIET_CHINH_SACH_HUY_SoGio | >= 0 | Ch7 RB9 (7.3) | Yes | Yes |
| CHI_TIET_CHINH_SACH_HUY | CK_CHI_TIET_CHINH_SACH_HUY_TyLe | 0–100 | Ch7 RB10 (7.3) | Yes | Yes |
| KHUYEN_MAI | CK_KHUYEN_MAI_LoaiGiamGia | IN (Phần trăm, Số tiền cố định) | Ch6 6.15 (miền đóng) | Yes | — |
| KHUYEN_MAI | CK_KHUYEN_MAI_GiaTriGiam | > 0 | Ch7 RB11 (7.3) | Yes | — |
| KHUYEN_MAI | CK_KHUYEN_MAI_GiaTriDonToiThieu | >= 0 | Ch7 RB12 (7.3) | Yes | — |
| KHUYEN_MAI | CK_KHUYEN_MAI_MucGiamToiDa | >= 0 | Ch7 RB13 (7.3) | Yes | — |
| KHUYEN_MAI | CK_KHUYEN_MAI_SoLuongGioiHan | >= 0 | Ch7 RB14 (7.3) | Yes | — |
| KHUYEN_MAI | CK_KHUYEN_MAI_NgayKetThuc | NgayKetThuc >= NgayBatDau | Ch7 RB4 (7.4) | Yes | — |
| KHUYEN_MAI | CK_KHUYEN_MAI_PhamViApDung | IN (Toàn hệ thống, Theo phạm vi) | Ch6 6.15 (miền đóng) | Yes | — |
| DAT_PHONG | CK_DAT_PHONG_NgayTraPhong | NgayTraPhong > NgayNhanPhong | Ch7 RB1 (7.4) | Yes | Yes |
| DAT_PHONG | CK_DAT_PHONG_TongTienPhong | >= 0 | Ch7 RB16 (7.3) | Yes | — |
| DAT_PHONG | CK_DAT_PHONG_SoTienGiam | >= 0 AND <= TongTienPhong | Ch7 RB16 (7.3) + RB2 (7.4) | Yes | — |
| DAT_PHONG | CK_DAT_PHONG_TongTienThanhToan | >= 0 AND = TongTienPhong - SoTienGiam | Ch7 RB16 (7.3) + RB3 (7.4) | Yes | — |
| DAT_PHONG | CK_DAT_PHONG_NgayCapNhat | NgayCapNhat >= NgayTao | Ch7 RB9 (7.4) | Yes | — |
| CHI_TIET_DAT_PHONG | CK_CHI_TIET_DAT_PHONG_SoLuongPhong | >= 1 | Ch7 RB17 (7.3) | Yes | Yes |
| THANH_TOAN | CK_THANH_TOAN_SoTien | > 0 | Ch7 RB19 (7.3) | Yes | Yes |
| HOAN_TIEN | CK_HOAN_TIEN_SoTienHoan | >= 0 | Ch7 RB20 (7.3) | Yes | — |
| HOAN_TIEN | CK_HOAN_TIEN_NgayHoanTien | NgayHoanTien >= NgayYeuCau (nullable) | Ch7 RB10 (7.4) | Yes | — |
| DANH_GIA | CK_DANH_GIA_DiemDanhGia | 1–5 | Ch7 RB21 (7.3) | Yes | — |
| YEU_CAU_HO_TRO | CK_YEU_CAU_HO_TRO_LoaiYeuCau | IN (Hỗ trợ, Khiếu nại) | Ch6 6.22 (miền đóng) | Yes | — |
| YEU_CAU_HO_TRO | CK_YEU_CAU_HO_TRO_NgayXuLy | NgayXuLy >= NgayTao (nullable) | Ch7 RB11 (7.4) | Yes | — |

> RB18 (7.3, CHI_TIET_GIA_DAT_PHONG.DonGia) là OBSOLETE theo G0-02. RB15 (7.3, DAT_PHONG.TongSoKhach) là OBSOLETE vì cột không có trong Ch6 6.16 (override 0.2). Các CHECK cho cột trạng thái với miền giá trị **mở** (có "...") — TAI_KHOAN.TrangThai, KHACH_SAN.TrangThai, LOAI_PHONG.TrangThai, QUY_PHONG_GIA.TrangThai, CHINH_SACH_HUY.TrangThai, KHUYEN_MAI.TrangThai, DAT_PHONG.TrangThai, THANH_TOAN.PhuongThucThanhToan/TrangThai, HOAN_TIEN.TrangThai, DANH_GIA.TrangThai, YEU_CAU_HO_TRO.TrangThai — **không** có CHECK IN(...) vì tài liệu không khóa tập giá trị (theo mục 9 của yêu cầu DB-0).

## Cross-table constraints (Chương 7.6) — NOT enforced at DB level in DB-0

| RB | Rule | Tables | Reason not implemented |
|---|---|---|---|
| RB1 | Tổng tiền phòng = tổng chi phí theo CHI_TIET_GIA_DAT_PHONG | DAT_PHONG, CHI_TIET_DAT_PHONG | Bảng nguồn bị cấm bởi G0-02 |
| RB2 | Ngày lưu trú nằm trong khoảng đơn | (như trên) | Bảng nguồn bị cấm bởi G0-02 |
| RB3 | Loại phòng trong chi tiết phải cùng khách sạn với đơn | DAT_PHONG, CHI_TIET_DAT_PHONG, LOAI_PHONG | Cross-row/cross-table — CHECK constraint không enforce được; ngoài phạm vi DB-0 (không viết trigger, mục 20) |
| RB4 | Số phòng đặt không vượt SoLuongPhong của quỹ phòng | QUY_PHONG_GIA, DAT_PHONG, CHI_TIET_DAT_PHONG | Cross-row/cross-table — như trên |
| RB5 | Chính sách hủy phải cùng khách sạn với đơn | DAT_PHONG, CHINH_SACH_HUY | CHINH_SACH_HUY không có MaKhachSan trong baseline (mô hình hệ thống — override 0.2) |
| RB6 | Khuyến mãi theo phạm vi phải gán đúng khách sạn | DAT_PHONG, KHUYEN_MAI | Bảng ánh xạ bị cấm bởi G0-01 |
| RB7 | Khuyến mãi còn hiệu lực + đủ điều kiện đơn tối thiểu | DAT_PHONG, KHUYEN_MAI | Cross-row — ngoài phạm vi DB-0 |
| RB8 | SoTienHoan <= SoTien đã thanh toán | THANH_TOAN, HOAN_TIEN | Cross-table — ngoài phạm vi DB-0 |
| RB9 | Đánh giá chỉ tạo khi đơn đã hoàn tất | DAT_PHONG, DANH_GIA | Cross-table — ngoài phạm vi DB-0 |
| RB10 | Yêu cầu hỗ trợ phải đúng khách hàng/khách sạn của đơn | TAI_KHOAN, DAT_PHONG, KHACH_SAN, YEU_CAU_HO_TRO | Cross-table — ngoài phạm vi DB-0 |

Tất cả 10 ràng buộc trên thuộc tầng nghiệp vụ (service layer), sẽ triển khai ở các phase DB-1/DB-2 hoặc trong backend service.

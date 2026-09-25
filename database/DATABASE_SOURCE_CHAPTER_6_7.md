# NGUỒN THIẾT KẾ DATABASE – CHƯƠNG 6 & CHƯƠNG 7

> **Nguồn:** `Nhom02_ThietKeDuLieu.docx`  
> **Mục đích:** Đưa vào repository làm tài liệu nguồn cho AI coding khi triển khai DB-0.  
> **Lưu ý:** Phần “Nội dung trích xuất” bên dưới giữ nguyên nội dung và tên gọi trong tài liệu gốc ở mức văn bản/bảng. Tài liệu gốc có một số điểm cũ hoặc mâu thuẫn với các quyết định Gate 0 mới, vì vậy **không được biến toàn bộ Chương 7 thành DDL một cách máy móc**.

## 0. Thứ tự ưu tiên khi triển khai

Khi AI coding triển khai database, áp dụng thứ tự sau:

1. **Các quyết định Gate 0 đã chốt rõ ràng**.
2. **ERD chuẩn mới** của dự án.
3. **Tên bảng/tên trường ở Chương 6** khi Chương 6 và Chương 7 lệch tên.
4. **Chương 7** dùng làm nguồn ràng buộc, nhưng các ràng buộc tham chiếu cấu trúc đã bị Gate 0 loại bỏ phải bỏ theo.

### 0.1. Các override bắt buộc trước khi dùng nội dung bên dưới

- **G0-01:** Bỏ hoàn toàn `KHUYEN_MAI_KHACH_SAN`. Mọi dòng/ràng buộc Chương 7 tham chiếu bảng này là **OBSOLETE – KHÔNG TRIỂN KHAI**.
- **G0-02:** Bỏ hoàn toàn `CHI_TIET_GIA_DAT_PHONG`. Mọi dòng/ràng buộc Chương 7 tham chiếu bảng này là **OBSOLETE – KHÔNG TRIỂN KHAI**.
- **G0-03:** `CHINH_SACH_HUY` **không có `MaDatPhong`**, mặc dù bảng 6.13 trong tài liệu gốc hiện còn dòng này. Quan hệ hiệu lực là `DAT_PHONG.MaChinhSachHuy -> CHINH_SACH_HUY.MaChinhSachHuy`.
- **G0-04:** `HO_SO_DOI_TAC` dùng trường **`MaTaiKhoanDuyet`**. Tài liệu Chương 7 đã có FK này; bảng 6.3 của bản tài liệu hiện tại chưa liệt kê trường, vì vậy khi triển khai phải theo Gate 0/ERD chuẩn.
- **G0-05:** Nếu Chương 6 và Chương 7 lệch tên trường, dùng **tên ở Chương 6/ERD chuẩn**.
- **G0-09:** Không có actor/role/module riêng cho nhân viên CSKH. `YEU_CAU_HO_TRO.MaTaiKhoanXuLy` được hiểu là tài khoản quản trị xử lý theo mô hình hiện tại.
- **G0-10:** Dữ liệu có lịch sử ưu tiên trạng thái/soft delete; không tự thêm cascade delete làm mất lịch sử.

### 0.2. Một số lệch tên/cấu trúc đã thấy giữa Chương 6 và Chương 7

Các mục sau là cảnh báo để AI coding không tự hợp nhất sai:

| Chương 7 / nội dung cũ | Tên/cấu trúc cần ưu tiên |
|---|---|
| `TAI_KHOAN.MatKhauMaHoa` | `TAI_KHOAN.MatKhau` |
| `KHACH_SAN.MaTaiKhoanChuSoHuu` | `KHACH_SAN.MaTaiKhoanSoHuu` |
| `HINH_ANH_KHACH_SAN.MaHinhAnhKhachSan` | `HINH_ANH_KHACH_SAN.MaHinhAnh` |
| `LOAI_PHONG.SucChuaNguoiLon`, `SucChuaTreEm` | Chương 6 chỉ có `SucChua` |
| `QUY_PHONG_GIA.GiaBan` | `QUY_PHONG_GIA.GiaPhong` |
| `QUY_PHONG_GIA.SoLuongMoBan` | `QUY_PHONG_GIA.SoLuongPhong` |
| `DAT_PHONG.TongSoKhach` | Không có trong bảng 6.16 hiện tại |
| `YEU_CAU_HO_TRO.MaKhachSan` | Không có trong bảng 6.22 hiện tại |
| `CHINH_SACH_HUY.MaKhachSan` ở Chương 7 | Không có trong bảng 6.13; chính sách hủy hiện được mô hình hóa ở mức hệ thống |
| `KHUYEN_MAI_KHACH_SAN` | Bị loại bỏ bởi G0-01 |
| `CHI_TIET_GIA_DAT_PHONG` | Bị loại bỏ bởi G0-02 |

> Khi gặp điểm không nằm trong danh sách trên nhưng vẫn mâu thuẫn giữa nguồn, **không tự đoán**. Ghi `DATABASE DESIGN ISSUE` và yêu cầu xác nhận.

---

# PHẦN A – NỘI DUNG TRÍCH XUẤT TỪ TÀI LIỆU GỐC



# CHƯƠNG 6: CHI TIẾT CÁC BẢNG DỮ LIỆU


## 6.1. Bảng VAI_TRO

Lưu danh mục các vai trò được sử dụng để phân quyền tài khoản trong hệ thống.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaVaiTro | Số nguyên | Khóa chính | Mã định danh vai trò | PK |
| 2 | TenVaiTro | Chuỗi | Duy nhất | Tên vai trò | UK |
| 3 | MoTa | Chuỗi |  | Mô tả quyền hạn, chức năng của vai trò |  |


*Bảng 6.1: Bảng VAI_TRO*


## 6.2. Bảng TAI_KHOAN

Lưu thông tin đăng nhập và thông tin cơ bản của người sử dụng nền tảng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaTaiKhoan | Số nguyên | Khóa chính | Mã tài khoản | PK |
| 2 | MaVaiTro | Số nguyên | Khóa ngoại | Vai trò hiện tại của tài khoản | FK → VAI_TRO |
| 3 | TenDangNhap | Chuỗi | Duy nhất | Dùng để đăng nhập | UK |
| 4 | Email | Chuỗi | Duy nhất | Email dùng để đăng nhập | UK |
| 5 | MatKhau | Chuỗi |  | Mật khẩu của tài khoản | Lưu dưới dạng mã hóa/băm |
| 6 | HoTen | Chuỗi |  | Họ tên người dùng |  |
| 7 | SoDienThoai | Chuỗi |  | Số điện thoại liên hệ |  |
| 8 | NgaySinh | Ngày |  | Ngày sinh người dùng |  |
| 9 | GioiTinh | Chuỗi |  | Giới tính |  |
| 10 | AnhDaiDien | Chuỗi |  | Đường dẫn ảnh đại diện |  |
| 11 | TrangThai | Chuỗi | Hoạt động, Khóa,... | Trạng thái hoạt động tài khoản |  |
| 12 | NgayTao | Ngày giờ |  | Thời điểm tạo tài khoản |  |
| 13 | NgayCapNhat | Ngày giờ |  | Thời điểm cập nhật tài khoản gần nhất |  |


*Bảng 6.2: Bảng TAI_KHOAN*


## 6.3. Bảng HO_SO_DOI_TAC

Lưu hồ sơ người dùng đăng ký trở thành Chủ khách sạn.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaHoSoDoiTac | Số nguyên | Khóa chính | Mã hồ sơ đối tác | PK |
| 2 | MaTaiKhoan | Số nguyên | Khóa ngoại | Tài khoản gửi hồ sơ đăng ký | FK → TAI_KHOAN |
| 3 | SoCCCD | Chuỗi |  | Số căn cước công dân của người đăng ký |  |
| 4 | SoGiayPhepKinhDoanh | Chuỗi |  | Số giấy phép kinh doanh |  |
| 5 | MaSoThue | Chuỗi |  | Mã số thuế |  |
| 6 | TepGiayTo | Chuỗi |  | Đường dẫn tệp giấy tờ được tải lên |  |
| 7 | TrangThaiDuyet | Chuỗi | Chờ duyệt, Đã duyệt, Từ chối | Trạng thái xét duyệt hồ sơ |  |
| 8 | LyDoTuChoi | Chuỗi |  | Lý do hồ sơ bị từ chối | Có thể rỗng |
| 9 | NgayNop | Ngày giờ |  | Thời điểm gửi hồ sơ |  |
| 10 | NgayDuyet | Ngày giờ |  | Thời điểm hồ sơ được xử lý | Có thể rỗng khi đang chờ |


*Bảng 6.3: Bảng HO_SO_DOI_TAC*


## 6.4. Bảng DIA_PHUONG

Lưu thông tin địa lý dùng cho việc tìm kiếm và phân loại khách sạn.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaDiaPhuong | Số nguyên | Khóa chính | Mã địa phương | PK |
| 2 | TenThanhPho | Chuỗi |  | Tên thành phố |  |
| 3 | TenTinh | Chuỗi |  | Tên tỉnh/thành trực thuộc |  |
| 4 | QuocGia | Chuỗi |  | Quốc gia |  |


*Bảng 6.4: Bảng DIA_PHUONG*


## 6.5. Bảng KHACH_SAN

Lưu thông tin các khách sạn được đăng ký và cung cấp dịch vụ trên nền tảng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaKhachSan | Số nguyên | Khóa chính | Mã khách sạn | PK |
| 2 | MaTaiKhoanSoHuu | Số nguyên | Khóa ngoại | Tài khoản Chủ khách sạn sở hữu khách sạn | FK → TAI_KHOAN |
| 3 | MaDiaPhuong | Số nguyên | Khóa ngoại | Địa phương nơi khách sạn hoạt động | FK → DIA_PHUONG |
| 4 | MaTaiKhoanDuyet | Số nguyên | Khóa ngoại | Tài khoản quản trị duyệt khách sạn | FK → TAI_KHOAN |
| 5 | TenKhachSan | Chuỗi |  | Tên khách sạn |  |
| 6 | DiaChiChiTiet | Chuỗi |  | Địa chỉ cụ thể của khách sạn |  |
| 7 | HangSao | Số nguyên | 1–5 | Hạng sao của khách sạn |  |
| 8 | MoTa | Văn bản |  | Nội dung giới thiệu khách sạn |  |
| 9 | GioNhanPhong | Giờ |  | Giờ nhận phòng quy định |  |
| 10 | GioTraPhong | Giờ |  | Giờ trả phòng quy định |  |
| 11 | TrangThai | Chuỗi | Chờ duyệt, Hoạt động, Đình chỉ,... | Trạng thái khách sạn trên nền tảng |  |
| 12 | NgayDangKy | Ngày giờ |  | Thời điểm khách sạn được đăng ký |  |
| 13 | NgayDuyet | Ngày giờ |  | Thời điểm khách sạn được duyệt | Có thể rỗng |
| 14 | NgayCapNhat | Ngày giờ |  | Thời điểm cập nhật thông tin gần nhất |  |


*Bảng 6.5: Bảng KHACH_SAN*


## 6.6. Bảng HINH_ANH_KHACH_SAN

Lưu các hình ảnh dùng để giới thiệu khách sạn trên nền tảng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaHinhAnh | Số nguyên | Khóa chính | Mã hình ảnh khách sạn | PK |
| 2 | MaKhachSan | Số nguyên | Khóa ngoại | Khách sạn sở hữu hình ảnh | FK → KHACH_SAN |
| 3 | URL | Chuỗi |  | Đường dẫn đến hình ảnh |  |
| 4 | AnhDaiDien | Logic | Đúng/Sai | Xác định ảnh có phải ảnh đại diện hay không |  |


*Bảng 6.6: Bảng HINH_ANH_KHACH_SAN*


## 6.7. Bảng TIEN_NGHI

Lưu danh mục tiện nghi dùng chung cho khách sạn và loại phòng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaTienNghi | Số nguyên | Khóa chính | Mã tiện nghi | PK |
| 2 | TenTienNghi | Chuỗi | Duy nhất | Tên tiện nghi | UK |
| 3 | BieuTuong | Chuỗi |  | Biểu tượng dùng để hiển thị tiện nghi |  |


*Bảng 6.7: Bảng TIEN_NGHI*


## 6.8. Bảng KHACH_SAN_TIEN_NGHI

Bảng trung gian biểu diễn quan hệ giữa khách sạn và tiện nghi.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaKhachSan | Số nguyên | Khóa chính, khóa ngoại | Khách sạn được gán tiện nghi | PK, FK → KHACH_SAN |
| 2 | MaTienNghi | Số nguyên | Khóa chính, khóa ngoại | Tiện nghi của khách sạn | PK, FK → TIEN_NGHI |


*Bảng 6.8: Bảng KHACH_SAN_TIEN_NGHI*

Khóa chính của bảng là khóa ghép (MaKhachSan, MaTienNghi).


## 6.9. Bảng LOAI_PHONG

Lưu các loại phòng mà một khách sạn cung cấp.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaLoaiPhong | Số nguyên | Khóa chính | Mã loại phòng | PK |
| 2 | MaKhachSan | Số nguyên | Khóa ngoại | Khách sạn sở hữu loại phòng | FK → KHACH_SAN |
| 3 | TenLoaiPhong | Chuỗi |  | Tên loại phòng | VD: Standard, Deluxe, Suite |
| 4 | SoGiuong | Số nguyên | ≥ 1 | Số giường trong loại phòng |  |
| 5 | SucChua | Số nguyên | ≥ 1 | Số người tối đa có thể lưu trú |  |
| 6 | DienTich | Số thực | > 0 | Diện tích phòng |  |
| 7 | LoaiGiuong | Chuỗi |  | Loại giường được bố trí |  |
| 8 | MoTa | Văn bản |  | Mô tả chi tiết loại phòng |  |
| 9 | TrangThai | Chuỗi | Hoạt động, Ngừng bán,... | Trạng thái kinh doanh loại phòng |  |


*Bảng 6.9: Bảng LOAI_PHONG*


## 6.10. Bảng HINH_ANH_LOAI_PHONG

Lưu các hình ảnh mô tả cho từng loại phòng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaHinhAnhLoaiPhong | Số nguyên | Khóa chính | Mã hình ảnh loại phòng | PK |
| 2 | MaLoaiPhong | Số nguyên | Khóa ngoại | Loại phòng của hình ảnh | FK → LOAI_PHONG |
| 3 | URL | Chuỗi |  | Đường dẫn hình ảnh |  |
| 4 | LaAnhDaiDien | Logic | Đúng/Sai | Xác định hình ảnh đại diện của loại phòng |  |


*Bảng 6.10: Bảng HINH_ANH_LOAI_PHONG*


## 6.11. Bảng LOAI_PHONG_TIEN_NGHI

Bảng trung gian giữa loại phòng và tiện nghi.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaLoaiPhong | Số nguyên | Khóa chính, khóa ngoại | Loại phòng được gán tiện nghi | PK, FK → LOAI_PHONG |
| 2 | MaTienNghi | Số nguyên | Khóa chính, khóa ngoại | Tiện nghi của loại phòng | PK, FK → TIEN_NGHI |


*Bảng 6.11: Bảng LOAI_PHONG_TIEN_NGHI*

Khóa chính của bảng là khóa ghép (MaLoaiPhong, MaTienNghi).


## 6.12. Bảng QUY_PHONG_GIA

Quản lý quỹ phòng mở bán và giá bán theo ngày của từng loại phòng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaQuyPhong | Số nguyên | Khóa chính | Mã bản ghi quỹ phòng | PK |
| 2 | MaLoaiPhong | Số nguyên | Khóa ngoại | Loại phòng được thiết lập quỹ | FK → LOAI_PHONG |
| 3 | NgayApDung | Ngày |  | Ngày áp dụng giá và quỹ phòng |  |
| 4 | GiaPhong | Số thực | ≥ 0 | Giá phòng của loại phòng trong ngày |  |
| 5 | SoLuongPhong | Số nguyên | ≥ 0 | Số lượng phòng được mở đặt trong ngày |  |
| 6 | TrangThai | Chuỗi | Mở bán, Đóng bán,... | Trạng thái kinh doanh trong ngày |  |


*Bảng 6.12: Bảng QUY_PHONG_GIA*


## 6.13. Bảng CHINH_SACH_HUY

Lưu chính sách hủy áp dụng cho đơn đặt phòng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaChinhSachHuy | Số nguyên | Khóa chính | Mã chính sách hủy | PK |
| 2 | MaDatPhong | Số nguyên | Khóa ngoại | Đơn đặt phòng liên quan đến chính sách | FK → DAT_PHONG |
| 3 | TenChinhSach | Chuỗi |  | Tên chính sách hủy |  |
| 4 | MoTa | Văn bản |  | Mô tả tổng quát chính sách |  |
| 5 | TrangThai | Chuỗi | Hoạt động, Ngừng áp dụng,... | Trạng thái chính sách |  |
| 6 | NgayTao | Ngày giờ |  | Thời điểm tạo chính sách |  |


*Bảng 6.13: Bảng CHINH_SACH_HUY*


## 6.14. Bảng CHI_TIET_CHINH_SACH_HUY

Lưu các mức hoàn tiền khác nhau của một chính sách hủy.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaChiTietChinhSach | Số nguyên | Khóa chính | Mã chi tiết chính sách | PK |
| 2 | MaChinhSachHuy | Số nguyên | Khóa ngoại | Chính sách hủy chứa quy định này | FK → CHINH_SACH_HUY |
| 3 | SoGioTruocNhanPhong | Số nguyên | ≥ 0 | Số giờ hủy trước thời điểm nhận phòng |  |
| 4 | TyLeHoanTien | Số thực | 0–100% | Tỷ lệ tiền khách được hoàn lại |  |


*Bảng 6.14: Bảng CHI_TIET_CHINH_SACH_HUY*

Ví dụ: hủy trước 48 giờ có thể được hoàn 100%, hủy trước 24 giờ được hoàn 50%.


## 6.15. Bảng KHUYEN_MAI

Quản lý các mã và chương trình giảm giá của nền tảng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaKhuyenMai | Số nguyên | Khóa chính | Mã định danh chương trình khuyến mãi | PK |
| 2 | MaCode | Chuỗi | Duy nhất | Mã khách hàng nhập khi đặt phòng | UK |
| 3 | LoaiGiamGia | Chuỗi | Phần trăm, Số tiền cố định | Phương thức tính giảm giá |  |
| 4 | GiaTriGiam | Số thực | > 0 | Giá trị giảm |  |
| 5 | GiaTriDonToiThieu | Số thực | ≥ 0 | Tổng tiền tối thiểu để sử dụng mã |  |
| 6 | MucGiamToiDa | Số thực | ≥ 0 | Số tiền giảm tối đa | Có ý nghĩa với giảm theo % |
| 7 | SoLuongGioiHan | Số nguyên | ≥ 0 | Tổng số lượt mã được phép sử dụng |  |
| 8 | NgayBatDau | Ngày |  | Ngày bắt đầu chương trình |  |
| 9 | NgayKetThuc | Ngày | ≥ NgayBatDau | Ngày kết thúc chương trình |  |
| 10 | PhamViApDung | Chuỗi | Toàn hệ thống, Theo phạm vi | Phạm vi áp dụng khuyến mãi |  |
| 11 | TrangThai | Chuỗi | Hoạt động, Hết hạn, Ngừng,... | Trạng thái chương trình |  |


*Bảng 6.15: Bảng KHUYEN_MAI*


## 6.16. Bảng DAT_PHONG

Bảng trung tâm của nghiệp vụ, lưu thông tin chung của một đơn đặt phòng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaDatPhong | Số nguyên | Khóa chính | Mã nội bộ của đơn đặt phòng | PK |
| 2 | MaXacNhanDatPhong | Chuỗi | Duy nhất | Mã xác nhận cung cấp cho khách hàng | UK |
| 3 | MaTaiKhoanKhachHang | Số nguyên | Khóa ngoại | Khách hàng thực hiện đặt phòng | FK → TAI_KHOAN |
| 4 | MaKhachSan | Số nguyên | Khóa ngoại | Khách sạn được đặt | FK → KHACH_SAN |
| 5 | MaKhuyenMai | Số nguyên | Khóa ngoại | Khuyến mãi được áp dụng | Có thể rỗng |
| 6 | MaChinhSachHuy | Số nguyên | Khóa ngoại | Chính sách hủy áp dụng cho đơn | FK → CHINH_SACH_HUY |
| 7 | NgayNhanPhong | Ngày |  | Ngày bắt đầu lưu trú |  |
| 8 | NgayTraPhong | Ngày | > NgayNhanPhong | Ngày kết thúc lưu trú |  |
| 9 | TongTienPhong | Số thực | ≥ 0 | Tổng tiền phòng trước giảm giá |  |
| 10 | SoTienGiam | Số thực | ≥ 0 | Số tiền được giảm nhờ khuyến mãi |  |
| 11 | TongTienThanhToan | Số thực | ≥ 0 | Tổng số tiền khách phải thanh toán |  |
| 12 | GhiChu | Văn bản |  | Yêu cầu hoặc ghi chú của khách hàng | Có thể rỗng |
| 13 | TrangThai | Chuỗi | Chờ thanh toán, Đã xác nhận, Đã hủy, Hoàn tất,... | Trạng thái đơn đặt phòng |  |
| 14 | NgayTao | Ngày giờ |  | Thời điểm tạo đơn |  |
| 15 | NgayCapNhat | Ngày giờ |  | Thời điểm cập nhật đơn gần nhất |  |


*Bảng 6.16: Bảng DAT_PHONG*

Công thức tổng quát: TongTienThanhToan = TongTienPhong - SoTienGiam.


## 6.17. Bảng CHI_TIET_DAT_PHONG

Lưu từng loại phòng và số lượng tương ứng trong một đơn đặt phòng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaChiTietDatPhong | Số nguyên | Khóa chính | Mã chi tiết đặt phòng | PK |
| 2 | MaDatPhong | Số nguyên | Khóa ngoại | Đơn đặt phòng chứa chi tiết này | FK → DAT_PHONG |
| 3 | MaLoaiPhong | Số nguyên | Khóa ngoại | Loại phòng được khách chọn | FK → LOAI_PHONG |
| 4 | SoLuongPhong | Số nguyên | ≥ 1 | Số lượng phòng của loại đó được đặt |  |


*Bảng 6.17: Bảng CHI_TIET_DAT_PHONG*

Một đơn đặt 2 phòng Deluxe và 1 phòng Suite sẽ có 2 dòng chi tiết đặt phòng với cùng MaDatPhong nhưng khác MaLoaiPhong.


## 6.18. Bảng THANH_TOAN

Lưu lịch sử các giao dịch thanh toán của đặt phòng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaThanhToan | Số nguyên | Khóa chính | Mã giao dịch thanh toán | PK |
| 2 | MaDatPhong | Số nguyên | Khóa ngoại | Đơn đặt phòng được thanh toán | FK → DAT_PHONG |
| 3 | SoTien | Số thực | > 0 | Số tiền của giao dịch |  |
| 4 | PhuongThucThanhToan | Chuỗi | Thẻ, Ví điện tử, Chuyển khoản,... | Phương thức thanh toán |  |
| 5 | MaGiaoDichDoiTac | Chuỗi |  | Mã giao dịch do cổng thanh toán trả về |  |
| 6 | TrangThai | Chuỗi | Chờ xử lý, Thành công, Thất bại,... | Trạng thái giao dịch |  |
| 7 | ThoiGianGiaoDich | Ngày giờ |  | Thời gian phát sinh giao dịch |  |


*Bảng 6.18: Bảng THANH_TOAN*


## 6.19. Bảng HOAN_TIEN

Lưu thông tin các giao dịch hoàn tiền phát sinh từ giao dịch thanh toán.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaHoanTien | Số nguyên | Khóa chính | Mã yêu cầu/giao dịch hoàn tiền | PK |
| 2 | MaThanhToan | Số nguyên | Khóa ngoại | Thanh toán gốc được hoàn | FK → THANH_TOAN |
| 3 | SoTienHoan | Số thực | ≥ 0 | Số tiền cần hoàn cho khách |  |
| 4 | LyDoHoanTien | Chuỗi |  | Lý do thực hiện hoàn tiền |  |
| 5 | MaGiaoDichDoiTac | Chuỗi |  | Mã giao dịch hoàn tiền tại cổng thanh toán |  |
| 6 | TrangThai | Chuỗi | Chờ xử lý, Thành công, Thất bại,... | Trạng thái hoàn tiền |  |
| 7 | NgayYeuCau | Ngày giờ |  | Thời điểm yêu cầu hoàn tiền |  |
| 8 | NgayHoanTien | Ngày giờ |  | Thời điểm hoàn tiền hoàn tất | Có thể rỗng |


*Bảng 6.19: Bảng HOAN_TIEN*

Từ MaThanhToan có thể suy ra DAT_PHONG và tra cứu chính sách hủy áp dụng cho đơn.


## 6.20. Bảng DANH_GIA

Lưu đánh giá mà khách hàng thực hiện sau khi hoàn tất thời gian lưu trú.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaDanhGia | Số nguyên | Khóa chính | Mã đánh giá | PK |
| 2 | MaDatPhong | Số nguyên | Khóa ngoại | Đơn đặt phòng làm cơ sở đánh giá | FK → DAT_PHONG |
| 3 | MaKhachHang | Số nguyên | Khóa ngoại | Khách hàng thực hiện đánh giá | FK → TAI_KHOAN |
| 4 | MaKhachSan | Số nguyên | Khóa ngoại | Khách sạn được đánh giá | FK → KHACH_SAN |
| 5 | DiemDanhGia | Số nguyên | 1–5 | Điểm đánh giá khách sạn |  |
| 6 | NoiDung | Văn bản |  | Nội dung nhận xét của khách hàng |  |
| 7 | TrangThai | Chuỗi | Hiển thị, Ẩn, Vi phạm,... | Trạng thái kiểm duyệt đánh giá |  |


*Bảng 6.20: Bảng DANH_GIA*


## 6.21. Bảng HINH_ANH_DANH_GIA

Lưu hình ảnh khách hàng đính kèm cùng đánh giá.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaHinhAnhDanhGia | Số nguyên | Khóa chính | Mã hình ảnh đánh giá | PK |
| 2 | MaDanhGia | Số nguyên | Khóa ngoại | Đánh giá chứa hình ảnh | FK → DANH_GIA |
| 3 | URL | Chuỗi |  | Đường dẫn đến hình ảnh |  |


*Bảng 6.21: Bảng HINH_ANH_DANH_GIA*


## 6.22. Bảng YEU_CAU_HO_TRO

Lưu các yêu cầu hỗ trợ và khiếu nại của khách hàng.


| Stt | Thuộc tính | Kiểu | Miền giá trị | Ý nghĩa | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| 1 | MaYeuCauHoTro | Số nguyên | Khóa chính | Mã yêu cầu hỗ trợ | PK |
| 2 | MaTaiKhoanKhachHang | Số nguyên | Khóa ngoại | Khách hàng gửi yêu cầu | FK → TAI_KHOAN |
| 3 | MaTaiKhoanXuLy | Số nguyên | Khóa ngoại | Nhân viên/Quản trị viên xử lý yêu cầu | Có thể rỗng khi chưa tiếp nhận |
| 4 | MaDatPhong | Số nguyên | Khóa ngoại | Đơn đặt phòng liên quan | Có thể rỗng nếu yêu cầu không liên quan đơn |
| 5 | LoaiYeuCau | Chuỗi | Hỗ trợ, Khiếu nại | Phân loại yêu cầu |  |
| 6 | TieuDe | Chuỗi |  | Tiêu đề yêu cầu |  |
| 7 | NoiDung | Văn bản |  | Nội dung chi tiết khách hàng gửi |  |
| 8 | KetQuaXuLy | Văn bản |  | Kết quả/phản hồi sau khi xử lý | Có thể rỗng |
| 9 | TrangThai | Chuỗi | Mới, Đang xử lý, Đã xử lý,... | Trạng thái yêu cầu |  |
| 10 | NgayTao | Ngày giờ |  | Thời điểm khách gửi yêu cầu |  |
| 11 | NgayXuLy | Ngày giờ |  | Thời điểm yêu cầu được xử lý | Có thể rỗng |


*Bảng 6.22: Bảng YEU_CAU_HO_TRO*


# CHƯƠNG 7: RÀNG BUỘC TOÀN VẸN


DANH SÁCH CÁC RÀNG BUỘC TOÀN VẸN TRÊN CSDL


## 7.1. Ràng buộc khóa chính


*Bảng 7.1: Các ràng buộc khóa chính*


| Mã số | Mô tả miền giá trị | Thành phần liên quan | Ghi chú |
| --- | --- | --- | --- |
| RB1 | MaVaiTro là mã duy nhất trong bảng Vai trò. | MaVaiTro, bảng VAI_TRO | Khóa chính |
| RB2 | MaTaiKhoan là mã duy nhất trong bảng Tài khoản. | MaTaiKhoan, bảng TAI_KHOAN | Khóa chính |
| RB3 | MaHoSoDoiTac là mã duy nhất trong bảng Hồ sơ đối tác. | MaHoSoDoiTac, bảng HO_SO_DOI_TAC | Khóa chính |
| RB4 | MaDiaPhuong là mã duy nhất trong bảng Địa phương. | MaDiaPhuong, bảng DIA_PHUONG | Khóa chính |
| RB5 | MaKhachSan là mã duy nhất trong bảng Khách sạn. | MaKhachSan, bảng KHACH_SAN | Khóa chính |
| RB6 | MaHinhAnhKhachSan là mã duy nhất trong bảng Hình ảnh khách sạn. | MaHinhAnhKhachSan, bảng HINH_ANH_KHACH_SAN | Khóa chính |
| RB7 | MaTienNghi là mã duy nhất trong bảng Tiện nghi. | MaTienNghi, bảng TIEN_NGHI | Khóa chính |
| RB8 | Cặp MaKhachSan và MaTienNghi là duy nhất trong bảng Khách sạn - Tiện nghi. | MaKhachSan, MaTienNghi, bảng KHACH_SAN_TIEN_NGHI | Khóa chính ghép |
| RB9 | MaLoaiPhong là mã duy nhất trong bảng Loại phòng. | MaLoaiPhong, bảng LOAI_PHONG | Khóa chính |
| RB10 | MaHinhAnhLoaiPhong là mã duy nhất trong bảng Hình ảnh loại phòng. | MaHinhAnhLoaiPhong, bảng HINH_ANH_LOAI_PHONG | Khóa chính |
| RB11 | Cặp MaLoaiPhong và MaTienNghi là duy nhất trong bảng Loại phòng - Tiện nghi. | MaLoaiPhong, MaTienNghi, bảng LOAI_PHONG_TIEN_NGHI | Khóa chính ghép |
| RB12 | MaQuyPhong là mã duy nhất trong bảng Quỹ phòng giá. | MaQuyPhong, bảng QUY_PHONG_GIA | Khóa chính |
| RB13 | MaChinhSachHuy là mã duy nhất trong bảng Chính sách hủy. | MaChinhSachHuy, bảng CHINH_SACH_HUY | Khóa chính |
| RB14 | MaChiTietChinhSach là mã duy nhất trong bảng Chi tiết chính sách hủy. | MaChiTietChinhSach, bảng CHI_TIET_CHINH_SACH_HUY | Khóa chính |
| RB15 | MaKhuyenMai là mã duy nhất trong bảng Khuyến mãi. | MaKhuyenMai, bảng KHUYEN_MAI | Khóa chính |
| RB16 | Cặp MaKhuyenMai và MaKhachSan là duy nhất trong bảng Khuyến mãi - Khách sạn. | MaKhuyenMai, MaKhachSan, bảng KHUYEN_MAI_KHACH_SAN | Khóa chính ghép |
| RB17 | MaDatPhong là mã duy nhất trong bảng Đặt phòng. | MaDatPhong, bảng DAT_PHONG | Khóa chính |
| RB18 | MaChiTietDatPhong là mã duy nhất trong bảng Chi tiết đặt phòng. | MaChiTietDatPhong, bảng CHI_TIET_DAT_PHONG | Khóa chính |
| RB19 | MaChiTietGia là mã duy nhất trong bảng Chi tiết giá đặt phòng. | MaChiTietGia, bảng CHI_TIET_GIA_DAT_PHONG | Khóa chính |
| RB20 | MaThanhToan là mã duy nhất trong bảng Thanh toán. | MaThanhToan, bảng THANH_TOAN | Khóa chính |
| RB21 | MaHoanTien là mã duy nhất trong bảng Hoàn tiền. | MaHoanTien, bảng HOAN_TIEN | Khóa chính |
| RB22 | MaDanhGia là mã duy nhất trong bảng Đánh giá. | MaDanhGia, bảng DANH_GIA | Khóa chính |
| RB23 | MaHinhAnhDanhGia là mã duy nhất trong bảng Hình ảnh đánh giá. | MaHinhAnhDanhGia, bảng HINH_ANH_DANH_GIA | Khóa chính |
| RB24 | MaYeuCauHoTro là mã duy nhất trong bảng Yêu cầu hỗ trợ. | MaYeuCauHoTro, bảng YEU_CAU_HO_TRO | Khóa chính |


## 7.2. Ràng buộc khóa ngoại


*Bảng  7.2: Các ràng buộc khóa ngoại*


| Mã số | Mô tả miền giá trị | Thành phần liên quan | Ghi chú |
| --- | --- | --- | --- |
| RB1 | MaVaiTro của mỗi tài khoản phải tồn tại trong bảng Vai trò. | TAI_KHOAN.MaVaiTro → VAI_TRO.MaVaiTro |  |
| RB2 | MaTaiKhoan của hồ sơ đối tác phải tồn tại trong bảng Tài khoản. | HO_SO_DOI_TAC.MaTaiKhoan → TAI_KHOAN.MaTaiKhoan |  |
| RB3 | MaTaiKhoanDuyet của hồ sơ đối tác, nếu có giá trị, phải tồn tại trong bảng Tài khoản. | HO_SO_DOI_TAC.MaTaiKhoanDuyet → TAI_KHOAN.MaTaiKhoan | Có thể rỗng khi chưa duyệt |
| RB4 | MaTaiKhoanChuSoHuu của khách sạn phải tồn tại trong bảng Tài khoản. | KHACH_SAN.MaTaiKhoanChuSoHuu → TAI_KHOAN.MaTaiKhoan |  |
| RB5 | MaDiaPhuong của khách sạn phải tồn tại trong bảng Địa phương. | KHACH_SAN.MaDiaPhuong → DIA_PHUONG.MaDiaPhuong |  |
| RB6 | MaTaiKhoanDuyet của khách sạn, nếu có giá trị, phải tồn tại trong bảng Tài khoản. | KHACH_SAN.MaTaiKhoanDuyet → TAI_KHOAN.MaTaiKhoan | Có thể rỗng khi chưa duyệt |
| RB7 | MaKhachSan của hình ảnh khách sạn phải tồn tại trong bảng Khách sạn. | HINH_ANH_KHACH_SAN.MaKhachSan → KHACH_SAN.MaKhachSan |  |
| RB8 | MaKhachSan trong bảng Khách sạn - Tiện nghi phải tồn tại trong bảng Khách sạn. | KHACH_SAN_TIEN_NGHI.MaKhachSan → KHACH_SAN.MaKhachSan |  |
| RB9 | MaTienNghi trong bảng Khách sạn - Tiện nghi phải tồn tại trong bảng Tiện nghi. | KHACH_SAN_TIEN_NGHI.MaTienNghi → TIEN_NGHI.MaTienNghi |  |
| RB10 | MaKhachSan của loại phòng phải tồn tại trong bảng Khách sạn. | LOAI_PHONG.MaKhachSan → KHACH_SAN.MaKhachSan |  |
| RB11 | MaLoaiPhong của hình ảnh loại phòng phải tồn tại trong bảng Loại phòng. | HINH_ANH_LOAI_PHONG.MaLoaiPhong → LOAI_PHONG.MaLoaiPhong |  |
| RB12 | MaLoaiPhong trong bảng Loại phòng - Tiện nghi phải tồn tại trong bảng Loại phòng. | LOAI_PHONG_TIEN_NGHI.MaLoaiPhong → LOAI_PHONG.MaLoaiPhong |  |
| RB13 | MaTienNghi trong bảng Loại phòng - Tiện nghi phải tồn tại trong bảng Tiện nghi. | LOAI_PHONG_TIEN_NGHI.MaTienNghi → TIEN_NGHI.MaTienNghi |  |
| RB14 | MaLoaiPhong của quỹ phòng giá phải tồn tại trong bảng Loại phòng. | QUY_PHONG_GIA.MaLoaiPhong → LOAI_PHONG.MaLoaiPhong |  |
| RB15 | MaKhachSan của chính sách hủy phải tồn tại trong bảng Khách sạn. | CHINH_SACH_HUY.MaKhachSan → KHACH_SAN.MaKhachSan |  |
| RB16 | MaChinhSachHuy của chi tiết chính sách hủy phải tồn tại trong bảng Chính sách hủy. | CHI_TIET_CHINH_SACH_HUY.MaChinhSachHuy → CHINH_SACH_HUY.MaChinhSachHuy |  |
| RB17 | MaTaiKhoanKhachHang của đơn đặt phòng phải tồn tại trong bảng Tài khoản. | DAT_PHONG.MaTaiKhoanKhachHang → TAI_KHOAN.MaTaiKhoan |  |
| RB18 | MaKhachSan của đơn đặt phòng phải tồn tại trong bảng Khách sạn. | DAT_PHONG.MaKhachSan → KHACH_SAN.MaKhachSan |  |
| RB19 | MaKhuyenMai của đơn đặt phòng, nếu có giá trị, phải tồn tại trong bảng Khuyến mãi. | DAT_PHONG.MaKhuyenMai → KHUYEN_MAI.MaKhuyenMai | Có thể rỗng khi không dùng khuyến mãi |
| RB20 | MaChinhSachHuy của đơn đặt phòng phải tồn tại trong bảng Chính sách hủy. | DAT_PHONG.MaChinhSachHuy → CHINH_SACH_HUY.MaChinhSachHuy |  |
| RB21 | MaDatPhong của chi tiết đặt phòng phải tồn tại trong bảng Đặt phòng. | CHI_TIET_DAT_PHONG.MaDatPhong → DAT_PHONG.MaDatPhong |  |
| RB22 | MaLoaiPhong của chi tiết đặt phòng phải tồn tại trong bảng Loại phòng. | CHI_TIET_DAT_PHONG.MaLoaiPhong → LOAI_PHONG.MaLoaiPhong |  |
| RB23 | MaChiTietDatPhong của chi tiết giá đặt phòng phải tồn tại trong bảng Chi tiết đặt phòng. | CHI_TIET_GIA_DAT_PHONG.MaChiTietDatPhong → CHI_TIET_DAT_PHONG.MaChiTietDatPhong |  |
| RB24 | MaDatPhong của thanh toán phải tồn tại trong bảng Đặt phòng. | THANH_TOAN.MaDatPhong → DAT_PHONG.MaDatPhong |  |
| RB25 | MaThanhToan của hoàn tiền phải tồn tại trong bảng Thanh toán. | HOAN_TIEN.MaThanhToan → THANH_TOAN.MaThanhToan |  |
| RB26 | MaDatPhong của đánh giá phải tồn tại trong bảng Đặt phòng. | DANH_GIA.MaDatPhong → DAT_PHONG.MaDatPhong | Đồng thời là khóa duy nhất |
| RB27 | MaDanhGia của hình ảnh đánh giá phải tồn tại trong bảng Đánh giá. | HINH_ANH_DANH_GIA.MaDanhGia → DANH_GIA.MaDanhGia |  |
| RB28 | MaTaiKhoanKhachHang của yêu cầu hỗ trợ phải tồn tại trong bảng Tài khoản. | YEU_CAU_HO_TRO.MaTaiKhoanKhachHang → TAI_KHOAN.MaTaiKhoan |  |
| RB29 | MaTaiKhoanXuLy của yêu cầu hỗ trợ, nếu có giá trị, phải tồn tại trong bảng Tài khoản. | YEU_CAU_HO_TRO.MaTaiKhoanXuLy → TAI_KHOAN.MaTaiKhoan | Có thể rỗng khi chưa tiếp nhận |
| RB30 | MaDatPhong của yêu cầu hỗ trợ, nếu có giá trị, phải tồn tại trong bảng Đặt phòng. | YEU_CAU_HO_TRO.MaDatPhong → DAT_PHONG.MaDatPhong | Có thể rỗng |
| RB31 | MaKhachSan của yêu cầu hỗ trợ, nếu có giá trị, phải tồn tại trong bảng Khách sạn. | YEU_CAU_HO_TRO.MaKhachSan → KHACH_SAN.MaKhachSan | Có thể rỗng |


## 7.3. Ràng buộc miền giá trị


*Bảng 7.3: Các ràng buộc miền giá trị*


| Mã số | Mô tả miền giá trị | Thành phần liên quan | Ghi chú |
| --- | --- | --- | --- |
| RB1 | Mật khẩu mã hóa trong bảng Tài khoản phải có giá trị và không được rỗng. | MatKhauMaHoa, bảng TAI_KHOAN | Dữ liệu nhạy cảm phải lưu dưới dạng mã hóa/băm |
| RB2 | Email trong bảng Tài khoản phải có đúng định dạng email. | Email, bảng TAI_KHOAN |  |
| RB3 | HangSao của khách sạn chỉ nhận giá trị từ 1 đến 5. | HangSao, bảng KHACH_SAN | 1 ≤ HangSao ≤ 5 |
| RB4 | SucChuaNguoiLon của loại phòng phải lớn hơn 0. | SucChuaNguoiLon, bảng LOAI_PHONG | > 0 |
| RB5 | SucChuaTreEm của loại phòng không được âm. | SucChuaTreEm, bảng LOAI_PHONG | ≥ 0 |
| RB6 | DienTich của loại phòng phải lớn hơn 0. | DienTich, bảng LOAI_PHONG | > 0 |
| RB7 | GiaBan của quỹ phòng giá không được âm. | GiaBan, bảng QUY_PHONG_GIA | ≥ 0 |
| RB8 | SoLuongMoBan của quỹ phòng giá không được âm. | SoLuongMoBan, bảng QUY_PHONG_GIA | ≥ 0 |
| RB9 | SoGioTruocNhanPhong trong chi tiết chính sách hủy không được âm. | SoGioTruocNhanPhong, bảng CHI_TIET_CHINH_SACH_HUY | ≥ 0 |
| RB10 | TyLeHoanTien phải nằm trong khoảng từ 0% đến 100%. | TyLeHoanTien, bảng CHI_TIET_CHINH_SACH_HUY | 0 ≤ TyLeHoanTien ≤ 100 |
| RB11 | GiaTriGiam của khuyến mãi phải lớn hơn 0. | GiaTriGiam, bảng KHUYEN_MAI | > 0 |
| RB12 | GiaTriDonToiThieu của khuyến mãi không được âm. | GiaTriDonToiThieu, bảng KHUYEN_MAI | ≥ 0 |
| RB13 | MucGiamToiDa của khuyến mãi không được âm. | MucGiamToiDa, bảng KHUYEN_MAI | ≥ 0 |
| RB14 | SoLuongGioiHan của khuyến mãi không được âm. | SoLuongGioiHan, bảng KHUYEN_MAI | ≥ 0 |
| RB15 | TongSoKhach của đơn đặt phòng phải lớn hơn 0. | TongSoKhach, bảng DAT_PHONG | > 0 |
| RB16 | Các giá trị TongTienPhong, SoTienGiam và TongTienThanhToan không được âm. | TongTienPhong, SoTienGiam, TongTienThanhToan, bảng DAT_PHONG | ≥ 0 |
| RB17 | SoLuongPhong trong chi tiết đặt phòng phải lớn hơn 0. | SoLuongPhong, bảng CHI_TIET_DAT_PHONG | > 0 |
| RB18 | DonGia trong chi tiết giá đặt phòng không được âm. | DonGia, bảng CHI_TIET_GIA_DAT_PHONG | ≥ 0 |
| RB19 | SoTien của giao dịch thanh toán phải lớn hơn 0. | SoTien, bảng THANH_TOAN | > 0 |
| RB20 | SoTienHoan không được âm. | SoTienHoan, bảng HOAN_TIEN | ≥ 0 |
| RB21 | DiemDanhGia chỉ nhận giá trị nguyên từ 1 đến 5. | DiemDanhGia, bảng DANH_GIA | 1 ≤ DiemDanhGia ≤ 5 |


## 7.4. Ràng buộc liên thuộc tính


*Bảng 7.4: Các ràng buộc liên thuộc tính*


| Mã số | Mô tả miền giá trị | Thành phần liên quan | Ghi chú |
| --- | --- | --- | --- |
| RB1 | Ngày trả phòng phải lớn hơn ngày nhận phòng của cùng một đơn đặt phòng. | NgayNhanPhong, NgayTraPhong, bảng DAT_PHONG | NgayTraPhong > NgayNhanPhong |
| RB2 | Số tiền giảm không được lớn hơn tổng tiền phòng. | SoTienGiam, TongTienPhong, bảng DAT_PHONG | SoTienGiam ≤ TongTienPhong |
| RB3 | Tổng tiền thanh toán phải bằng tổng tiền phòng trừ số tiền giảm. | TongTienPhong, SoTienGiam, TongTienThanhToan, bảng DAT_PHONG | TongTienThanhToan = TongTienPhong - SoTienGiam |
| RB4 | Ngày kết thúc khuyến mãi phải lớn hơn hoặc bằng ngày bắt đầu. | NgayBatDau, NgayKetThuc, bảng KHUYEN_MAI | NgayKetThuc ≥ NgayBatDau |
| RB5 | Ngày duyệt hồ sơ đối tác, nếu có, không được trước ngày nộp. | NgayNop, NgayDuyet, bảng HO_SO_DOI_TAC | NgayDuyet ≥ NgayNop |
| RB6 | Ngày duyệt khách sạn, nếu có, không được trước ngày đăng ký. | NgayDangKy, NgayDuyet, bảng KHACH_SAN | NgayDuyet ≥ NgayDangKy |
| RB7 | Ngày cập nhật khách sạn không được trước ngày đăng ký. | NgayDangKy, NgayCapNhat, bảng KHACH_SAN | NgayCapNhat ≥ NgayDangKy |
| RB8 | Ngày cập nhật tài khoản không được trước ngày tạo tài khoản. | NgayTao, NgayCapNhat, bảng TAI_KHOAN | NgayCapNhat ≥ NgayTao |
| RB9 | Ngày cập nhật đơn đặt phòng không được trước ngày tạo đơn. | NgayTao, NgayCapNhat, bảng DAT_PHONG | NgayCapNhat ≥ NgayTao |
| RB10 | Ngày hoàn tiền, nếu có, không được trước ngày yêu cầu hoàn tiền. | NgayYeuCau, NgayHoanTien, bảng HOAN_TIEN | NgayHoanTien ≥ NgayYeuCau |
| RB11 | Ngày xử lý yêu cầu hỗ trợ, nếu có, không được trước ngày tạo yêu cầu. | NgayTao, NgayXuLy, bảng YEU_CAU_HO_TRO | NgayXuLy ≥ NgayTao |


### Tầm ảnh hưởng


*Bảng 7.5: Tầm ảnh hưởng của các ràng buộc liên thuộc tính*


| Mã RB | Quan hệ | Thêm | Xóa | Sửa |
| --- | --- | --- | --- | --- |
| RB1 | DAT_PHONG | + | - | + |
| RB2 | DAT_PHONG | + | - | + |
| RB3 | DAT_PHONG | + | - | + |
| RB4 | KHUYEN_MAI | + | - | + |
| RB5 | HO_SO_DOI_TAC | + | - | + |
| RB6 | KHACH_SAN | + | - | + |
| RB7 | KHACH_SAN | + | - | + |
| RB8 | TAI_KHOAN | + | - | + |
| RB9 | DAT_PHONG | + | - | + |
| RB10 | HOAN_TIEN | + | - | + |
| RB11 | YEU_CAU_HO_TRO | + | - | + |


## 7.5. Ràng buộc liên bộ


*Bảng 7.6: Các ràng buộc liên bộ*


| Mã số | Mô tả miền giá trị | Thành phần liên quan | Ghi chú |
| --- | --- | --- | --- |
| RB1 | Tên vai trò phải khác nhau giữa các bộ trong bảng Vai trò. | TenVaiTro, bảng VAI_TRO | UK |
| RB2 | Email/tên đăng nhập tài khoản phải khác nhau giữa các bộ trong bảng Tài khoản. | Email, tên đăng nhập bảng TAI_KHOAN | UK |
| RB3 | Tên tiện nghi phải khác nhau giữa các bộ trong bảng Tiện nghi. | TenTienNghi, bảng TIEN_NGHI | UK |
| RB4 | Một tiện nghi không được gán trùng nhiều lần cho cùng một khách sạn. | MaKhachSan, MaTienNghi, bảng KHACH_SAN_TIEN_NGHI | Khóa chính ghép |
| RB5 | Một tiện nghi không được gán trùng nhiều lần cho cùng một loại phòng. | MaLoaiPhong, MaTienNghi, bảng LOAI_PHONG_TIEN_NGHI | Khóa chính ghép |
| RB6 | Mã code khuyến mãi phải khác nhau giữa các bộ trong bảng Khuyến mãi. | MaCode, bảng KHUYEN_MAI | UK |
| RB7 | Một khuyến mãi không được gán trùng nhiều lần cho cùng một khách sạn. | MaKhuyenMai, MaKhachSan, bảng KHUYEN_MAI_KHACH_SAN | Khóa chính ghép |
| RB8 | Mã xác nhận đặt phòng phải khác nhau giữa các đơn đặt phòng. | MaXacNhanDatPhong, bảng DAT_PHONG | UK |
| RB9 | Mỗi đơn đặt phòng chỉ được tạo tối đa một đánh giá. | MaDatPhong, bảng DANH_GIA | UK |


### Tầm ảnh hưởng


*Bảng 7.7: Tầm ảnh hưởng của các ràng buộc liên bộ*


| Mã RB | Quan hệ | Thêm | Xóa | Sửa |
| --- | --- | --- | --- | --- |
| RB1 | VAI_TRO | + | - | + |
| RB2 | TAI_KHOAN | + | - | + |
| RB3 | TIEN_NGHI | + | - | + |
| RB4 | KHACH_SAN_TIEN_NGHI | + | - | + |
| RB5 | LOAI_PHONG_TIEN_NGHI | + | - | + |
| RB6 | KHUYEN_MAI | + | - | + |
| RB7 | KHUYEN_MAI_KHACH_SAN | + | - | + |
| RB8 | DAT_PHONG | + | - | + |
| RB9 | DANH_GIA | + | - | + |


## 7.6. Ràng buộc liên quan hệ


*Bảng 7.8: Các ràng buộc liên quan hệ*


| Mã số | Mô tả miền giá trị | Thành phần liên quan | Ghi chú |
| --- | --- | --- | --- |
| RB1 | Tổng tiền phòng của một đơn phải bằng tổng chi phí các loại phòng theo từng ngày lưu trú và số lượng phòng của các chi tiết thuộc đơn đó. | DAT_PHONG, CHI_TIET_DAT_PHONG, CHI_TIET_GIA_DAT_PHONG | Dùng khi tính và đối soát tổng tiền phòng |
| RB2 | Mỗi ngày lưu trú trong Chi tiết giá đặt phòng phải nằm từ ngày nhận phòng đến trước ngày trả phòng của đơn đặt phòng tương ứng. | DAT_PHONG, CHI_TIET_DAT_PHONG, CHI_TIET_GIA_DAT_PHONG | NgayNhanPhong ≤ NgayLuuTru < NgayTraPhong |
| RB3 | Loại phòng được chọn trong Chi tiết đặt phòng phải thuộc đúng khách sạn của đơn đặt phòng. | DAT_PHONG, CHI_TIET_DAT_PHONG, LOAI_PHONG | MaKhachSan phải thống nhất |
| RB4 | Số lượng phòng đã đặt của một loại phòng trong từng ngày không được vượt quá SoLuongMoBan của quỹ phòng giá tương ứng. | QUY_PHONG_GIA, DAT_PHONG, CHI_TIET_DAT_PHONG, CHI_TIET_GIA_DAT_PHONG | Không tính các đơn đã hủy |
| RB5 | Chính sách hủy được áp dụng cho đơn đặt phòng phải thuộc đúng khách sạn của đơn. | DAT_PHONG, CHINH_SACH_HUY | DAT_PHONG.MaKhachSan = CHINH_SACH_HUY.MaKhachSan |
| RB6 | Nếu đơn sử dụng khuyến mãi theo khách sạn thì khuyến mãi đó phải được gán cho khách sạn của đơn trong bảng Khuyến mãi - Khách sạn. | DAT_PHONG, KHUYEN_MAI, KHUYEN_MAI_KHACH_SAN | Không áp dụng với khuyến mãi toàn hệ thống |
| RB7 | Khuyến mãi áp dụng cho đơn phải còn hiệu lực tại thời điểm đặt và tổng tiền phải đáp ứng giá trị đơn tối thiểu của khuyến mãi. | DAT_PHONG, KHUYEN_MAI | Kiểm tra ngày hiệu lực và điều kiện áp dụng |
| RB8 | Số tiền hoàn của một giao dịch không được vượt quá số tiền đã thanh toán thành công của giao dịch thanh toán tương ứng. | THANH_TOAN, HOAN_TIEN | SoTienHoan ≤ SoTien của thanh toán liên quan |
| RB9 | Đánh giá chỉ được tạo cho đơn đặt phòng đã hoàn tất thời gian lưu trú. | DAT_PHONG, DANH_GIA | Đơn phải ở trạng thái hoàn tất |
| RB10 | Nếu yêu cầu hỗ trợ gắn với một đơn đặt phòng và khách sạn thì đơn đó phải thuộc đúng khách hàng gửi yêu cầu và đúng khách sạn được tham chiếu. | TAI_KHOAN, DAT_PHONG, KHACH_SAN, YEU_CAU_HO_TRO | Áp dụng khi MaDatPhong/MaKhachSan có giá trị |


### Tầm ảnh hưởng


*Bảng 7.9: Tầm ảnh hưởng của các ràng buộc liên quan hệ*


| Mã RB | Quan hệ | Thêm | Xóa | Sửa |
| --- | --- | --- | --- | --- |
| RB1 | DAT_PHONG; CHI_TIET_DAT_PHONG; CHI_TIET_GIA_DAT_PHONG | + | + | + |
| RB2 | DAT_PHONG; CHI_TIET_DAT_PHONG; CHI_TIET_GIA_DAT_PHONG | + | + | + |
| RB3 | DAT_PHONG; CHI_TIET_DAT_PHONG; LOAI_PHONG | + | + | + |
| RB4 | QUY_PHONG_GIA; DAT_PHONG; CHI_TIET_DAT_PHONG; CHI_TIET_GIA_DAT_PHONG | + | + | + |
| RB5 | DAT_PHONG; CHINH_SACH_HUY | + | + | + |
| RB6 | DAT_PHONG; KHUYEN_MAI; KHUYEN_MAI_KHACH_SAN | + | + | + |
| RB7 | DAT_PHONG; KHUYEN_MAI | + | + | + |
| RB8 | THANH_TOAN; HOAN_TIEN | + | + | + |
| RB9 | DAT_PHONG; DANH_GIA | + | + | + |
| RB10 | TAI_KHOAN; DAT_PHONG; KHACH_SAN; YEU_CAU_HO_TRO | + | + | + |


---

# PHẦN B – QUY TẮC DÙNG FILE NÀY CHO DB-0

AI coding khi đọc file này phải:

1. Dùng Chương 6 để lấy danh sách bảng/cột và ý nghĩa dữ liệu.
2. Dùng Chương 7 để tham khảo PK/FK/UNIQUE/CHECK và các ràng buộc nghiệp vụ **chỉ khi chúng còn phù hợp với schema hiệu lực**.
3. Áp dụng toàn bộ override Gate 0 ở đầu file trước khi sinh DDL.
4. Không tạo `KHUYEN_MAI_KHACH_SAN`.
5. Không tạo `CHI_TIET_GIA_DAT_PHONG`.
6. Không tạo `CHINH_SACH_HUY.MaDatPhong`.
7. Có `HO_SO_DOI_TAC.MaTaiKhoanDuyet` theo Gate 0/ERD chuẩn.
8. Không tự thêm cột chỉ vì Chương 7 có nhắc tới nếu cột đó không còn trong Chương 6/ERD chuẩn.
9. Tiền khi chuyển sang SQL Server phải dùng `DECIMAL`, không dùng `FLOAT/REAL`, dù tài liệu mô tả khái niệm là “Số thực”.
10. Nếu còn xung đột chưa được Gate 0 giải quyết, ghi issue và không tự suy đoán.

**File này là tài liệu nguồn triển khai, không phải migration SQL.**

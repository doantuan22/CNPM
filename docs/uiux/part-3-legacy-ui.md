# Part 3 — Legacy UI inventory

Đây là danh sách migration còn lại sau đợt chuẩn hóa component; không phải yêu cầu đổi các luồng đang đúng nghiệp vụ.

| Khu vực | Hiện trạng | Hướng migration |
|---|---|---|
| Admin list/detail | Nhiều table, filter, badge trước đây dùng class cục bộ; danh sách chính đã chuyển status badge nhưng loading/empty/error còn theo trang | Chuyển mỗi lần sửa trang sang `QueryState`, Input/Select/Button |
| Owner booking | Booking status đã dùng `StatusBadge`; trang vẫn có card/table và mutation feedback cục bộ | Giữ bố cục Part 2; chuẩn hóa feedback theo lần chạm tới |
| Customer support/booking | Một số loading/error/result đã chia sẻ; còn form/status đặc thù và native control | Chuyển field và state có chọn lọc, bảo toàn workflow |
| Register/login/password/profile | Có RHF/Zod ở một số form nhưng control và submit state chưa đồng nhất tuyệt đối | Chuẩn hóa primitive và inline feedback, không đổi schema/API |
| Payment result/checkout | Booking summary dùng component domain; VNPAY redirect/result là luồng hiện hành | Không đổi hành vi thanh toán; chỉ chuẩn hóa loading/error presentation |
| Native controls | Còn các select, checkbox, radio, input ở form và filter cũ | Thay bằng primitive khi semantics tương ứng; native select ngắn vẫn hợp lệ |
| Pagination/table | Một số trang có pagination/page-size tự triển khai | Chưa hợp nhất API; kiểm tra aria-label/disabled khi migration |
| Icons | Phosphor là quy ước giao diện rộng; một vài trang còn Lucide trong code legacy | Không đổi icon hàng loạt trong Part 3 |

Không còn popup `alert()`/`confirm()` ở source đã quét. Không xóa stylesheet/component legacy theo suy đoán; cần xác nhận không còn consumer trước khi dọn.

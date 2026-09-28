# Part 3 — Backend status mapping

StatusBadge ánh xạ màu theo domain; phần text hiển thị nguyên trạng thái backend. Bảng dưới là các giá trị đã thấy trong constants/backend và response DTO hiện có. Không biến giá trị chưa biết thành trạng thái nghiệp vụ mới.

| Domain | Giá trị đã biết | Tone |
|---|---|---|
| Hotel | Hoạt động; Chờ duyệt; Đình chỉ; Ngừng hoạt động | success; warning; danger; neutral |
| Room type | Hoạt động; Ngừng bán | success; neutral |
| Room rate | Mở bán; Đóng bán | success; neutral |
| Booking | Chờ thanh toán; Đã xác nhận; Đã hủy; Hoàn tất | warning; success; neutral; success |
| Payment / refund | Chờ xử lý; Thành công; Thất bại | warning; success; danger |
| Account | Hoạt động; Khóa | success; danger |
| Partner application | Chờ duyệt; Đã duyệt; Từ chối | warning; success; danger |
| Promotion | Hoạt động; Ngừng | success; neutral |
| Review | Chờ duyệt; Hiển thị; Ẩn; Vi phạm | warning; success; neutral; danger |
| Support | Mới / Mới tiếp nhận; Đang xử lý; Đã xử lý | warning; info; success |

Các route customer/owner/admin đã chuyển dùng badge chung được ghi trong component audit và mã nguồn. Unknown status luôn có tone neutral và vẫn hiện nguyên chuỗi; không suy diễn theo substring. `Mới tiếp nhận` chỉ là alias màu hiển thị tương thích, không ghi ngược hoặc đổi nhãn backend.

Màu chỉ bổ sung nhận biết, không thay text. Quyền thao tác, route guard, trạng thái booking/payment và điều kiện nút vẫn dựa trên logic hiện hữu, không dựa vào màu.

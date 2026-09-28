# Part 3 — Notification system

## Chọn loại phản hồi

| Tình huống | Thành phần |
|---|---|
| Lỗi nhập liệu cần sửa | Error ngay dưới field, `aria-invalid` + `aria-describedby`; nếu form dài, `FormErrorSummary` đưa focus đến field |
| Lỗi tải hoặc lỗi form cần giữ ngữ cảnh | `Alert` inline có role alert |
| Thành công/thông tin ngắn sau hành động | Toast qua `useToast()` |
| Hành động có tác động phá huỷ/khó hoàn tác | `useConfirm()` hiển thị native `<dialog>` |
| Kết quả ổn định theo route (ví dụ payment result) | Nội dung trạng thái của trang, không toast thay thế |

## Provider/API

`FeedbackProvider` bọc router trong `app/providers.tsx`. `useToast().toast({ title, description?, variant? })` phát thông báo tạm thời có nút đóng. `useConfirm()` trả về Promise<boolean>, có nhãn hành động/hủy, biến thể danger, Escape/cancel và native focus management. Chỉ một confirmation được xử lý tại một thời điểm; yêu cầu confirm thứ hai đang mở trả false.

Toast dùng `role=status` cho success/info và `role=alert` cho lỗi, live region không assertive mặc định với trạng thái. Không đặt thông tin chỉ có trong toast nếu người dùng cần giữ lại để hoàn thành công việc.

## Tích hợp hiện tại

Confirm/toast được dùng ở các thao tác xóa/gỡ/đình chỉ và quyết định hồ sơ trong admin, owner. Hai form admin yêu cầu nội dung bắt buộc chuyển sang validation inline thay vì popup. Kiểm tra danh sách source với `rg` để bảo đảm không còn `alert()`/`confirm()` native.

## Quy tắc nội dung

Thông báo nêu hành động/kết quả bằng tiếng Việt, ngắn và cụ thể. Confirm phá huỷ phải nêu hậu quả và đặt focus vào dialog. Lỗi API cần giữ lại thông tin `ApiError` khi an toàn; không hiển thị stack trace hoặc payload kỹ thuật.

# Part 3 — Accessibility audit

## Đã xử lý trong component dùng chung

- Button báo loading bằng `aria-busy` và disable hành động gửi lặp.
- Input/error/hint có label và mô tả liên kết bằng ARIA.
- Combobox khai báo combobox/listbox/option, active descendant và thao tác phím; Escape đóng danh sách, Enter chọn mục hiện hành.
- Alert/toast dùng live semantics; confirmation dùng native dialog để có hành vi keyboard/focus gốc trình duyệt.
- Status luôn giữ nhãn, màu chỉ bổ trợ; giá và ngày có cách hiển thị dễ đọc.
- Các thao tác chỉ có icon được thêm accessible name ở khu vực ảnh khách sạn/loại phòng.

## Kiểm tra còn cần làm trên browser thật

Không có browser automation/browser executable được cài trong môi trường hiện tại; do đó chưa xác nhận trực quan bằng keyboard/screen reader, contrast đo bằng browser, focus trap native dialog trên từng engine, overflow và breakpoint ở 375/430/768/1024/1280/1440 px. Các điểm này được ghi rõ trong QA, không giả định là đã pass.

## Nguyên tắc migration

Khi chuyển form cũ, kiểm tra label liên kết đúng input, thông báo lỗi không chỉ dựa vào màu, tab order theo thứ tự đọc, trạng thái disabled/loading có thông báo, và touch target không giảm so với token của Part 1.

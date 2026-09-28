# Part 3 — Motion

## Quy tắc

- Giữ chuyển động có sẵn trong token/CSS của Part 1 khi nó giúp xác nhận tương tác.
- Spinner chỉ biểu thị tiến trình; nút giữ kích thước và nội dung để tránh layout shift.
- Không thêm animation cho status badge hoặc toàn bộ page.
- Tôn trọng `prefers-reduced-motion`; chuyển động không là điều kiện để hiểu trạng thái.
- Toast có thể xuất hiện/biến mất theo thời gian nhưng luôn có nút đóng. Confirm dùng native dialog thay cho animation tự dựng.

## Mức triển khai

Part 3 chỉ thêm spinner trạng thái button và các trạng thái feedback cần thiết. Các transition legacy chưa được dọn đồng loạt; xem `part-3-legacy-ui.md`. Không thêm thư viện motion.

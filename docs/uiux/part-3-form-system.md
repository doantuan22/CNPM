# Part 3 — Form interaction system

## Nền hiện hữu

Frontend dùng React Hook Form, Zod và `@hookform/resolvers/zod`. Các schema/API hiện có tiếp tục là nguồn validation; Part 3 không đổi payload hay quy tắc backend.

## Hợp đồng tương tác

- Label nhìn thấy được; placeholder không thay label.
- Lỗi nằm cạnh field, gắn qua `aria-invalid` và `aria-describedby`.
- Lỗi tổng quan chỉ dùng ở form dài và focus đúng field khi được chọn.
- Giữ dữ liệu người dùng khi API lỗi; thông báo lỗi ở form hoặc cạnh field tùy nguồn.
- Submit đang chạy phải có nhãn tiến trình/`loading`, chặn gửi lặp mà không bỏ mất nội dung nhãn.
- Điều kiện nghiệp vụ cũ và mutation giữ nguyên; không disable trường hợp người dùng cần thử submit để thấy lỗi xác thực.
- Combobox danh mục dài hoạt động với bàn phím và được nối RHF bằng `Controller`; giá trị định danh vẫn giữ đúng kiểu API.

## Áp dụng

`OwnerHotelFormPage` có combobox địa phương và summary lỗi form. Các nút dùng `Button` có thể chuyển sang `loading`. Primitive input/select/textarea được cải thiện label/error/focus nhưng các trang cũ còn native controls; inventory nằm ở `part-3-legacy-ui.md`.

## Kiểm soát phạm vi

Không sửa cấu trúc form đăng ký/thanh toán, validation của booking, số lượng phòng, chính sách thanh toán, API, DTO hay trường DB. Thay đổi có thể quan sát ở Part 3 chỉ là cách nhập/chọn, focus và hiển thị lỗi/đang gửi.

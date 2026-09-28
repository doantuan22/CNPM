# Part 3 — Component audit

## Phạm vi

Audit frontend Egode sau Part 1 (visual language) và Part 2 (page composition). Mục tiêu là thống nhất hành vi và trạng thái UI mà không đổi API, nghiệp vụ, phân quyền, route hay bố cục đã chốt. Không thêm dependency.

## Hiện trạng và quyết định

| Nhóm | Hiện trạng quan sát | Quyết định | Tiến độ |
|---|---|---|---|
| Button | `Button` dùng Radix Slot cho `asChild`; các nút submit có nhiều cách tự disable/loading | Giữ API, chuẩn hoá `loading`, `disabled`, `aria-busy`, spinner | Đã làm; cần tiếp tục chuyển các nút cục bộ |
| Input/select/textarea | Primitive đã có nhưng form còn nhiều native control và class riêng | Giữ native semantics; chuẩn hoá label, hint, lỗi, focus và kích thước qua primitive/token | Một phần; form cũ được liệt kê ở `part-3-legacy-ui.md` |
| Checkbox/radio | Style/label/hit area không nhất quán | Thêm `FormChoice` cho lựa chọn có thể click label | Có primitive; chuyển đổi theo form |
| Combobox | Danh sách tỉnh/thành dài dùng select/native pattern | Thêm combobox truy cập bằng bàn phím, lọc tiếng Việt, hỗ trợ RHF Controller | Đã dùng ở form khách sạn chủ sở hữu |
| Alert/toast/confirm | Cảnh báo có cấu trúc; một số trang dùng `alert()`/`confirm()` | Thêm Alert, provider toast và confirm dialog native; bỏ các popup JS đã rà | Đã thay các điểm tìm thấy trong source |
| Loading/empty/error | Nhiều page tự dựng spinner và thông báo | Thêm `QueryState` primitives; chuyển một số flow đại diện | Chuyển một phần; không tuyên bố đồng bộ toàn bộ |
| Status | Mỗi trang có màu và badge riêng | Dùng ánh xạ theo domain, nhãn backend nguyên vẹn, trạng thái chưa biết trung tính | Đã chuyển các trang danh sách/chi tiết đã nêu trong state map |
| Giá/ngày | Format rải rác | `PriceDisplay`, `formatCurrencyVND`, `formatDateVi`, `StayContext` | Có primitive; migration tiếp tục theo trang |
| Booking summary/hotel identity | Các khối định danh và tóm tắt lặp lại | Tạo composite domain components để dùng lại | BookingSummary/StayContext đã dùng ở luồng checkout; HotelIdentity sẵn sàng |

## Dấu vết chính

- Primitive mới nằm trong `frontend/src/components/common/`.
- Component gắn nghiệp vụ hiển thị nằm trong `frontend/src/components/domain/`.
- Toast/confirm được cung cấp bởi `FeedbackProvider` bên trong router/provider tree.
- Status server là chuỗi mở; component không tự thay nhãn hoặc diễn giải giá trị lạ.
- `window.alert()` và `window.confirm()` đã được loại khỏi source frontend được rà. Kiểm tra cuối: `rg -n "window\\.confirm|\\balert\\(" frontend/src`.

## Không nằm trong phạm vi

Không thay đổi endpoint/payload, trạng thái hoặc quy tắc booking/payment, workflow duyệt, quyền truy cập, thiết kế Part 1/Part 2 hay cài thêm UI framework. Dialog hiện chỉ dùng xác nhận; không tạo modal/drawer tổng quát nếu luồng hiện tại không cần.

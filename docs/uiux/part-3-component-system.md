# Part 3 — Component system

## Nguyên tắc

Part 1 giữ vai trò nguồn chuẩn về màu, typography, radius, spacing và phong cách. Part 2 giữ cấu trúc trang. Component Part 3 chuẩn hoá cách điều khiển, phản hồi lỗi/thành công và trạng thái tải; không làm lại layout.

## Ba lớp

1. **Primitive** (`components/common`): Button, Input, Select, Textarea, FormChoice, Combobox, Alert, QueryState, FormErrorSummary, feedback provider.
2. **Composite**: các nhóm field/error, empty/loading/query state và xác nhận hành động; lắp từ primitive có semantics chuẩn.
3. **Domain display** (`components/domain`): StatusBadge, PriceDisplay, HotelIdentity, StayContext, BookingSummary. Chỉ trình bày dữ liệu nhận từ domain; không tính lại nghiệp vụ.

## Hành vi đã chuẩn hoá

- `Button loading` tự disable nút thường, thêm `aria-busy`, giữ nguyên nội dung nhãn để trạng thái không làm layout nhảy. `asChild` tiếp tục dùng Radix Slot.
- Input-like fields phải có label hiển thị, `aria-invalid`, mô tả lỗi qua `aria-describedby`; hint/error có ID ổn định.
- `FormChoice` làm label có thể bấm và giữ target tối thiểu theo token CSS.
- `Combobox` hỗ trợ gõ lọc, ArrowUp/ArrowDown, Enter, Escape, active descendant, listbox semantics và lỗi field. Chỉ dùng cho danh mục đủ dài; danh sách ngắn vẫn có thể dùng select.
- `Alert` dùng role phù hợp với thông tin cần thông báo. `QueryState` tạo mẫu tải/rỗng/lỗi dùng lại.
- `StatusBadge` cần domain để ánh xạ màu. Chuỗi trạng thái luôn lấy nguyên từ backend.
- `PriceDisplay` dựa vào `formatCurrencyVND`; component không tính tổng.
- `StayContext` định dạng ngày date-only ở local calendar để tránh lùi ngày do UTC.

## Thư mục và hướng mở rộng

Đặt primitive dùng chung trong `components/common`, khối hiển thị domain trong `components/domain`; thêm biến thể bằng prop/variant có tên thay vì thêm class page-specific. Trước khi tạo component mới, tìm component cùng trách nhiệm và đưa vào danh sách audit. Không đưa trạng thái nghiệp vụ hoặc gọi API vào primitive.

## Migration

Component mới đã có và được áp dụng ở các trang admin, owner, customer và luồng booking được liệt kê trong state map/legacy inventory. Các form/list còn cục bộ chưa được chuyển đồng loạt; ưu tiên theo lần sửa trang để giảm rủi ro đổi hành vi.

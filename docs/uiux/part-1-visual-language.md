# Egode Phase 1 — Visual Language

Ngôn ngữ chung là **EGODE — CALM TRAVEL COMMERCE**. Public, auth, customer, owner và admin nhận diện cùng một sản phẩm qua action blue, typography, controls, border, icon và nhịp spacing; mật độ và imagery điều chỉnh theo vai trò.

## Typography

Giữ Inter và dùng scale hữu hạn: display 36–56 responsive cho hero; page title 28; section title 20; subsection/card title 16; body 14/16; label 14; supporting 13; caption 12; price/KPI 24. Weight chủ đạo 400, 500, 600; 700 dùng cho giá/số cần nhấn. Supporting text phải dễ đọc.

## Color/state

Action blue dùng cho action/selection/focus. Neutral text tách primary, secondary, muted, disabled. Surface tách page, raised, subtle, interactive, selected. State gồm success, warning, danger, info và nền subtle tương ứng. Không thêm hue riêng cho module. Status luôn có chữ, không truyền đạt chỉ bằng màu.

## Spacing và hình khối

Grid cơ sở 4px; scale 4, 8, 12, 16, 20, 24, 32, 40, 48, 64. Dùng proximity: label gần control, field cùng nhóm cách vừa phải, section cách xa hơn. Radius tối đa bốn cấp: 4px detail nhỏ; 8px control; 12px surface/media/dialog có lý do; pill chỉ status/chip gọn. Content mặc định dùng surface phẳng, border và spacing; shadow dành dropdown/popover/dialog hoặc surface thực sự nổi.

## Iconography

Phosphor Web là canonical vì class icon đang dùng rộng trong pages và được nạp toàn cục. Dùng 16px inline/small action, 18–20px control, 20–24px navigation. Icon cần vai trò chức năng; không đặt icon lớn trong ô màu chỉ để trang trí. Lucide React hiện còn trong DashboardNavigation; migrate theo component khi xác nhận đầy đủ icon tương đương, không chuyển hàng loạt.

## Imagery

- Hotel result: landscape gần 4:3 theo tỷ lệ hiện có, giữ chủ thể khi crop.
- Gallery: ảnh chính lớn và nhóm ảnh phụ; giữ bố cục hiện tại.
- Room: ảnh đủ lớn để hỗ trợ so sánh.
- Avatar/review: crop hiện có theo ngữ cảnh.
- Dùng object-fit cover cho thumbnail, placeholder neutral cùng tỷ lệ khi thiếu ảnh; tránh gradient nặng.

## Surface, controls và status

Card cho hotel entity, room offer, booking/payment summary, hotel management entity và KPI cần so sánh. Heading, intro, toolbar và một đoạn văn không tự động cần card. Admin module link dùng treatment đồng nhất, bỏ palette icon trang trí từng mục. Owner giữ hotel card, giảm shadow và dùng dấu status nhỏ.

Button variants: primary, secondary, outline, ghost, danger; size sm 36, md 44, lg 48; có hover, active, focus-visible, disabled, không translate/shadow trang trí. Field sm 36, md 44, lg 48; Input/Select đồng bộ border, radius, focus. Label rõ, placeholder không thay label, hint/error gần field, error liên kết ARIA. Badge status gọn; success cho hoạt động/hoàn tất, warning cho chờ, danger cho thất bại/từ chối/tạm ngưng, neutral cho hủy/vô hiệu, info cho đang xử lý. Transition ngắn và tôn trọng prefers-reduced-motion.

## Domain signature

Giữ pattern stay context strip (điểm đến/ngày/số đêm/khách), hotel identity block (tên/sao/rating/vị trí/trust), price composition (amount/đơn vị/đêm/tổng), room identity (ảnh/tên/sức chứa/giường/tiện ích/tồn/giá/action), booking status và inventory semantics cho owner. Phase 1 không thay bố cục lịch tồn phòng.

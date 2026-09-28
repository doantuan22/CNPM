# Egode Phase 1 — Visual Audit

**Phạm vi:** frontend/src assets, common components/layouts và các trang đại diện public, auth, booking, owner, admin; kiểm tra rộng màu, radius, shadow, arbitrary spacing, inline style, icon và surface. **Ngày:** 28/09/2026.

## Tóm tắt

Egode đã có nền tảng trắng–xanh, Inter, CSS variables, component dùng chung và class semantic. Các lớp này chưa cùng một nguồn: Tailwind theme khai báo lại palette gần giống variables.css; Button/Input/Select/Textarea dùng utility Tailwind với màu/radius/shadow khác hệ CSS; pages còn đặt utility trực tiếp. Phosphor Web được nạp toàn cục còn Lucide React được dùng trong ReviewSection. CSS có class component cũ và utility cùng xử lý một vai trò.

Audit tìm thấy hard-coded hex trong JSX/CSS, tùy biến spacing/kích thước bằng Tailwind arbitrary value, inline style ở layout/trang booking và nhiều wrapper có surface/radius/shadow lặp. Tìm kiếm tĩnh ghi nhận 83 dòng chứa hex literal, 293 dòng match nhóm arbitrary value và 13 dòng inline style JSX; đây là số dòng match, không phải số component duy nhất.

## Phân loại

| Hạng mục | Phân loại | Quan sát và quyết định |
| --- | --- | --- |
| Tông trắng–xanh, màu semantic, Inter | KEEP | Giữ bản sắc Egode và font; tăng tính nhất quán bằng token |
| Hotel/room/booking/payment entity và summary | KEEP | Là object nghiệp vụ độc lập, card có ý nghĩa |
| CSS variables | REFINE | Giữ alias legacy, bổ sung lớp token semantic |
| Tailwind theme | NORMALIZE | Dùng custom properties thay literal trùng lặp |
| Button React và CSS .btn | NORMALIZE | Cùng height/radius/state/focus; bỏ nhấc nút và shadow trang trí |
| Input/Select/Textarea | NORMALIZE | React field 44px, CSS class cũ 46px; focus/radius cũng khác |
| Status/badge | NORMALIZE | Một semantic mapping; chữ luôn thể hiện trạng thái |
| Typography | NORMALIZE | Scale role hữu hạn, giảm cỡ tùy ý gần nhau |
| Border/radius/elevation | NORMALIZE | Border và spacing mặc định; shadow dành cho surface nổi |
| Admin dashboard module tiles | REFINE | Giữ link/nội dung, bỏ icon hộp màu khác nhau từng module |
| Owner summary status emoji | REFINE | Giữ số liệu, thay emoji trang trí bằng dấu trạng thái nhỏ |
| Search/filter toolbar | REFINE | Giữ nhóm thao tác nhưng phân biệt toolbar với object card |
| Hero ảnh fallback dạng gradient | REPLACE | Dùng placeholder trung tính, không thay nguồn ảnh/API |
| Card chỉ bao heading/intro | REPLACE khi gặp trong phạm vi | Dùng hierarchy và spacing; không xóa wrapper có vai trò form/object |
| Phosphor và Lucide | NORMALIZE | Phosphor làm canonical vì class icon được dùng rộng ở pages; Lucide React còn ở DashboardNavigation nên migrate theo đợt, không chuyển ồ ạt |
| Arbitrary value cho ảnh/gallery/layout | KEEP có chủ đích | Tỷ lệ và kích thước nội dung có thể phụ thuộc asset |
| Arbitrary color/radius/shadow ở màn hình đại diện | REFINE | Dùng token hoặc class component |
| Inline style trình bày | NORMALIZE khi chạm tới | Không migrate hàng loạt legacy không liên quan |
| Toast runtime | KEEP / ghi chú | CSS có toast nhưng chưa thấy consumer; không thêm feature toast |

## Kết quả kiểm tra

- **Màu:** literal tồn tại trong shared CSS, JSX và utility; dashboard admin dùng purple/cyan/indigo/rose/orange cho từng module. Component field dùng slate/blue hard-coded.
- **Radius:** token 6–14px và pill cùng các utility rounded-2xl, rounded-[16px], [14px], [10px], [4px]. Một số mức hợp lý cho media/dialog; không ép tất cả bằng nhau.
- **Shadow:** shared CSS có bốn cấp; Button React thêm shadow và translate khi hover; home search/hero và admin/owner wrappers thường nổi quá mức.
- **Spacing/arbitrary:** nhiều utility tiêu chuẩn và pixel custom; custom hữu ích cho gallery, ảnh, max-width và bảng; cỡ chữ/khoảng cách tùy ý làm giảm nhịp chung.
- **Inline style:** có ở Navbar drawer, footer, BookingDetailPage và một số trang; phần lớn là trình bày.
- **Trùng chức năng:** Button React dùng Tailwind, .btn dùng CSS; Input/Select/Textarea cũng có hai nguồn style. Có card, hotel-card, room-card, stat-card, pill tabs và page-local wrappers.
- **Icon:** Phosphor Web CDN dùng rộng ở các page; lucide-react hiện còn trong DashboardNavigation. ReviewSection đã được đưa về Phosphor trong Phase 1. Không có Phosphor React trong dependencies.
- **Semantic không đồng nhất:** success/warning/error thay màu và focus style giữa các trang; input/select cao 44/46px.
- **Dấu hiệu template:** icon to trong hộp màu trên dashboard, rounded-xl/2xl và shadow trên nhiều wrapper, gradient placeholder, mọi nhóm nội dung bị card hóa.

## Giới hạn

Đây là audit tĩnh. Repo không có Playwright/browser automation sẵn để capture before/after nhiều viewport. Representative screen sẽ được kiểm tra bằng build, typecheck, lint và rà responsive/accessibility; phần không xác nhận trực quan sẽ ghi trong QA report.

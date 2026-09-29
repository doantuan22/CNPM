**EGODE**

**UPDATE_UIUX V2**

Research-backed Whole-Product UI Pattern Catalog + Implementation Prompt

_Phạm vi áp dụng: TOÀN BỘ UI/UX EGODE • mọi route • mọi page • mọi layout • mọi shared/domain component • mọi modal/drawer/popover • mọi loading/empty/error/permission/status state • desktop/tablet/mobile_

Mục tiêu  
Loại bỏ phần còn lại của cảm giác “AI-generated UI” trên TOÀN BỘ sản phẩm Egode, tăng chiều sâu sản phẩm, cải thiện hierarchy, domain controls, interaction feedback và motion. Bảy ảnh giao diện được cung cấp chỉ là mẫu tiêu biểu để chẩn đoán; chúng KHÔNG phải danh sách màn hình và KHÔNG giới hạn phạm vi triển khai.

Bản nghiên cứu: 29/09/2026

# 0\. CÁCH AI CODING PHẢI SỬ DỤNG TÀI LIỆU NÀY

**Đây là implementation brief, không phải tài liệu cảm hứng**

AI coding phải đọc toàn bộ, audit code/runtime trước, đối chiếu từng pattern với component hiện có, sau đó triển khai theo thứ tự và Quality Gate ở cuối tài liệu. Không được chọn ngẫu nhiên một mẫu rồi “make it modern”.

- **Mọi “Khảo sát thực tế”** là mô tả đã đối chiếu từ website/design system đang tồn tại và có URL nguồn ở Phụ lục A.
- **Mọi “Quyết định Egode”** là đề xuất thiết kế riêng cho Egode được suy ra từ nhiều nguồn; không được trình bày như thể các website tham chiếu sử dụng chính xác pixel/kích thước đó.
- **Không copy** màu thương hiệu, logo, wording, hình ảnh, CSS hoặc bố cục nguyên xi từ Booking.com, Agoda, Airbnb, Expedia, GitHub, Atlassian, Linear, Shopify hay Radix.
- **Không phá nghiệp vụ** route, API contract, RBAC, pricing, availability, payment, cancellation/refund và các state do backend quyết định.
- **Ưu tiên cải tiến incremental** và migration có kiểm chứng thay vì big-bang rewrite.

| **Nhãn trong tài liệu** | **Ý nghĩa** | **AI coding phải làm gì** |
| --- | --- | --- |
| VERIFIED | Đã xác minh qua nguồn web/design system thật | Có thể học principle/behavior; không copy visual identity. |
| EGODE DECISION | Quyết định thiết kế đề xuất cho Egode | Triển khai nếu tương thích code/business hiện có; document deviation. |
| MUST | Ràng buộc bắt buộc | Không được bỏ qua nếu không có blocker kỹ thuật được ghi rõ. |
| SHOULD | Khuyến nghị mạnh | Áp dụng trừ khi context cụ thể chứng minh không phù hợp. |
| DO NOT | Anti-pattern | Không triển khai hoặc phải loại bỏ dần. |

# 0.1. PHẠM VI ÁP DỤNG TOÀN HỆ THỐNG — 7 ẢNH CHỈ LÀ MẪU TIÊU BIỂU

**MUST — Bảy ảnh Egode trong tài liệu chỉ là bằng chứng trực quan tiêu biểu để nhận diện các vấn đề lặp lại. Không được hiểu chúng là 7 trang duy nhất cần sửa, 7 route duy nhất cần kiểm tra, hoặc phạm vi migration cuối cùng.**

- AI coding phải quét toàn bộ frontend trước khi triển khai: route map, page inventory, layout, shared component, domain component, form, table, overlay, feedback, trạng thái và responsive behavior.
- Phạm vi bắt buộc bao gồm toàn bộ Public, Authentication, Customer, Owner, Admin và toàn bộ các luồng Search → Hotel → Room → Booking → Payment → Result cùng các vùng Profile, Review, Support/Khiếu nại, Promotion, Report/Statistics và các màn hình phụ đang tồn tại trong repository.
- Phải kiểm tra cả những UI không xuất hiện như page độc lập: modal, dialog, drawer, dropdown, popover, combobox popup, notification surface, upload state, table empty state, permission state, 404/error page, loading/skeleton, form validation, destructive confirmation và mobile navigation.
- Các màn hình tiêu biểu trong Mục 2 chỉ là PILOT để chứng minh pattern V2. Sau khi pilot pass, AI coding BẮT BUỘC migrate các pattern đã chốt sang toàn bộ UI/UX có cùng semantic purpose.
- Không được kết thúc công việc với lý do “7 màn hình mẫu đã đẹp”. Definition of Done chỉ đạt khi toàn bộ UI inventory đã được đánh dấu MIGRATED, KEEP-WITH-JUSTIFICATION hoặc DEFERRED-WITH-BLOCKER; không còn mục UNKNOWN/UNAUDITED.
- Nếu một trang không cần thay đổi vì đã phù hợp V2, vẫn phải được audit và ghi nhận lý do KEEP. “Không sửa” không đồng nghĩa với “không cần kiểm tra”.

|     |     |     |
| --- | --- | --- |
| **Khu vực** | **Tối thiểu phải quét** | **Kết quả bắt buộc** |
| Public + Auth | Home, Search, Results, Hotel Detail, Room, Login, Register, Forgot/Reset và mọi public supporting screen | Map pattern + migrate/justify toàn bộ |
| Customer | Profile, bookings list/detail, cancel/refund, review, support và các state liên quan | Không còn mini-admin/generic component drift |
| Owner | Overview, hotels, room types, inventory/pricing, bookings, revenue, reports, profile | Hotel-operations language nhất quán toàn domain |
| Admin | Overview, accounts, partner approval, hotels, payments, reviews, support, promotions, reports | Platform-control patterns nhất quán toàn domain |
| Shared UI | Header/sidebar/nav, form controls, tables, cards, overlay/feedback, uploads, pagination, status, formatting | Canonical components; duplicate/legacy được quản lý |
| States + Responsive | Loading, empty, error, success, disabled, permission, long-content, mobile/tablet/desktop | Không còn state hoặc viewport chưa audit |

# 1\. KẾT LUẬN KHẢO SÁT & HƯỚNG THIẾT KẾ V2

Ba vòng cải tiến trước đã giúp Egode sạch và nhất quán hơn. Bảy ảnh tiêu biểu chỉ cho thấy một tập triệu chứng trực quan — chúng là mẫu chẩn đoán, không phải phạm vi sản phẩm. Các dấu hiệu “generic UI” như hierarchy yếu, domain controls chưa đủ chuyên biệt, feedback/motion thiếu quy tắc và CRUD-template patterns phải được AI coding quét lại trên TOÀN BỘ frontend để xác định mọi nơi bị ảnh hưởng trước khi migration.

**Design direction V2**

EGODE = EDITORIAL TRAVEL × PRECISION OPERATIONS. Public/Customer cần giàu hình ảnh, search context, trust, giá và decision cues; Owner/Admin cần dense, precise, scan-friendly, action hierarchy rõ. Hai phía dùng chung token, typography, iconography, control states và motion language.

| **Khu vực** | **Cảm giác đích** | **Không được rơi vào** |
| --- | --- | --- |
| Public / Home / Search | Travel discovery, search-first, giàu hình ảnh vừa đủ, quyết định nhanh | Generic split hero, feature-checklist marketing, card-grid landing page |
| Hotel / Room / Booking | Commerce rõ giá, availability, policy, review/trust, CTA gần quyết định | Card rỗng, metadata thiếu, raw input số lượng, summary vô nghĩa |
| Customer | Personal stay management, calm, reassuring | Mini admin dashboard |
| Owner | Hotel operations workspace, operational density | SaaS KPI template + form CRUD rộng toàn màn hình |
| Admin | Platform control, scanning, decision, auditability | Sidebar + duplicate navigation; mỗi row là một outline button |

**Nguồn khảo sát:** \[R01\] Booking.com, \[R02\] Agoda, \[R03\] Expedia, \[R04\] Airbnb, \[R21\] Linear — Nguồn thực tế cho travel search + layout restraint/consistency.

# 2\. AUDIT 7 MÀN HÌNH TIÊU BIỂU — BẰNG CHỨNG CHẨN ĐOÁN, KHÔNG PHẢI PHẠM VI TRIỂN KHAI

**Lưu ý phạm vi: 7 màn hình dưới đây được dùng để minh họa các anti-pattern đã quan sát trực tiếp. Mọi kết luận ở đây phải được xem như “pattern hypothesis” và được xác minh bằng full-repository/runtime audit. Khi cùng anti-pattern xuất hiện ở trang khác, AI coding phải sửa theo cùng canonical pattern; khi trang khác có vấn đề mới, phải bổ sung vào audit thay vì bỏ qua vì không có screenshot.**

Hình 2.1 — Đăng ký tài khoản: two-card selector.

- Hai card đều chứa icon trong ô vuông + title + description + CTA full-width: pattern rất phổ biến trong AI/template UI.
- Selection state và action đang trộn với nhau: người dùng “chọn vai trò” nhưng mỗi lựa chọn lại có button riêng.
- Khoảng trống viewport lớn, content cluster nhỏ làm màn hình có cảm giác prototype.
- Ưu tiên: biến thành selectable choice cards + một CTA “Tiếp tục”; giảm icon-box decoration.

Hình 2.2 — Search Results: filter + hotel result cards.

- Khung kết quả lớn nhưng phần giữa hotel card thiếu decision data; nhiều khoảng trắng không tạo hierarchy.
- Search bar vẫn giống form ngang: 4 control độc lập thay vì travel search control.
- CTA “Xem chi tiết” lặp trong từng card nhưng context giá/đánh giá/policy còn nghèo.
- Ưu tiên: richer HotelCard, TravelSearchBar, active-filter model, price/trust alignment.

Hình 2.3 — Hotel Detail + room availability.

- Gallery là phần mạnh nhất; từ vùng room list trở xuống lại quay về basic card/form.
- Room offer thiếu policy, availability emphasis, amenities hierarchy; số lượng phòng dùng raw number input.
- Booking summary phải chuyển từ empty informational card sang transaction surface có lifecycle.
- Ưu tiên: RoomOffer, QuantityStepper/Select, sticky booking summary.

Hình 2.4 — Owner: Hồ sơ khách sạn.

- Ba action ngang hàng tạo cạnh tranh visual: xem thống kê, booking, ngừng kinh doanh.
- Form kéo quá rộng; field ngắn chiếm gần toàn content width.
- Page title và entity identity chưa hợp nhất nên cảm giác CRUD editor.
- Ưu tiên: entity header + primary save, secondary action menu, readable form width 2-column theo semantics.

Hình 2.5 — Admin Overview.

- Content gần như lặp lại menu bên trái ở dạng danh sách liên kết; giá trị “overview” thấp.
- Thiếu các work queue / attention items / recent activity có ích cho admin.
- Ưu tiên: attention-first operations overview; chỉ dùng metric nếu backend có dữ liệu thật.

Hình 2.6 — Admin Account Table.

- Baseline table tốt nhưng filter bar vẫn có kiểu CRUD template: search + select + Tìm + Reset.
- Role và status đều dùng pill, gây nhiễu semantics; nút “Chi tiết” outline lặp mọi row.
- Ưu tiên: live/staged filter convention rõ, active filter chips có điều kiện, status compact, row action/link hoặc action menu.

Hình 2.7 — Home.

- Split hero “big heading + một từ xanh + checklist + ảnh bo góc + search box” là công thức cực phổ biến của site generators.
- Search chưa thực sự là centerpiece; hero copy và trust bullets chiếm vai trò marketing generic.
- Ưu tiên: search-first travel editorial composition, destination imagery/content chỉ khi có dữ liệu thật, không thêm section để lấp chỗ trống.

# 3\. KHẢO SÁT BỐ CỤC WEB THẬT — CÁC PATTERN ĐƯỢC XÁC MINH

## 3.1 Travel home/search — search là công cụ chính, không phải phụ kiện của hero

- **Booking.com \[R01\]:** homepage đặt Destination + Dates + Occupancy + Search ở phần entry chính, sau đó mới tới offers/trending content.
- **Agoda \[R02\]:** destination/property search, check-in, check-out, guest/room và Search nằm trong search module trung tâm; source hiện tại còn ghi keyboard hint cho destination suggestion.
- **Expedia \[R03\]:** Search stays bắt đầu từ “Where to?”, Dates, Travelers; traveler panel có Room 1, Adults, Children, Add another room, Done.
- **Airbnb \[R04\]\[R05\]:** search inputs được xác định theo destination, check-in/out, guests/pets; Airbnb đã chuẩn hóa hiển thị total price trong search results từ 2025.

**EGODE DECISION**

Home V2 phải chuyển từ “marketing hero có search bên dưới” sang “travel discovery có search là core interaction”. Hero text vẫn có thể tồn tại nhưng không được cạnh tranh với Search. Dữ liệu destination/deal chỉ render khi API/data thật có.

EGODE HOME V2 — schematic (không copy pixel)  
<br/>\[ Header / nav \]  
<br/>Khám phá nơi lưu trú phù hợp cho chuyến đi của bạn  
\[ Destination \]\[ 30/09 — 01/10 \]\[ 2 khách · 1 phòng \]\[ Tìm kiếm \]  
<br/>\[Ảnh/visual destination có dữ liệu thật\] \[Nội dung/trust nhỏ, không checklist generic\]  
<br/>Điểm đến / khách sạn nổi bật (chỉ khi có data)

## 3.2 Search results — card phải chứa dữ liệu phục vụ quyết định

- **Agoda search \[R06\]:** property result thể hiện ảnh, tên, star rating, location/distance, numeric guest rating + review count, per-night price và Free cancellation.
- **Booking.com city/results \[R07\]\[R08\]:** property cards/listing surfaces hiển thị property identity, rating/reviews, free cancellation availability và “From … per night”.
- **Airbnb \[R05\]:** total price with fees before taxes đã trở thành default trong search results, nhấn mạnh tính minh bạch giá.

**EGODE DECISION**

HotelCard phải tổ chức theo quyết định: Visual → Identity/location → rating/trust → relevant room/policy cues → price/total → CTA. Không nhồi tiện nghi; chỉ hiển thị decision-relevant data backend thực sự có.

HOTEL CARD V2 — schematic  
<br/>┌──────────────┬───────────────────────────────┬────────────────────┐  
│ IMAGE │ Hotel name ★★★ │ Giá từ │  
│ │ Vũng Tàu · vị trí │ 700.000 ₫ / đêm │  
│ │ 8.7 · 297 đánh giá │ Tổng ... nếu API có │  
│ │ Room/benefit nổi bật │ │  
│ │ ✓ hủy miễn phí (nếu có) │ \[ Xem phòng \] │  
└──────────────┴───────────────────────────────┴────────────────────┘

## 3.3 Hotel / room selection — room offer là transaction row

- **Booking.com hotel availability \[R09\]\[R10\]:** room selection được tổ chức theo Room type → Price → choices/policies → room quantity. Nội dung gồm capacity, bed, area, amenities; giá per night và total; cancellation/prepayment; limited availability; Select Rooms.
- **Nguyên tắc rút ra:** Room Offer không chỉ là “card phòng”. Nó là đơn vị so sánh giao dịch; các cột thông tin phải ổn định để scan.

**EGODE DECISION**

Thay raw number input bằng QuantityStepper hoặc compact room-count select. BookingSummary bên phải phải chuyển từ empty-card sang persistent transaction summary, cập nhật theo selection.

ROOM OFFER V2 — schematic  
<br/>┌────────────┬──────────────────────────┬────────────────────┐  
│ ROOM IMAGE │ Superior │ 700.000 ₫ / đêm │  
│ │ 24 m² · 2 khách │ Còn 3 phòng │  
│ │ 1 giường đôi │ │  
│ │ Wi‑Fi · Bữa sáng │ \[−\] 1 \[+\] │  
│ │ Hủy miễn phí (nếu có) │ \[ Chọn phòng \] │  
└────────────┴──────────────────────────┴────────────────────┘

## 3.4 Mature application layout — giảm chrome, tăng consistency

- **Linear 2026 \[R21\]\[R22\]:** refresh tập trung header/navigation/view controls nhất quán, icon đồng bộ và sidebar mờ hơn để content nổi lên; bài viết nhấn mạnh “pruning”, không tăng decoration.
- **Primer DataTable \[R18\]:** table header có title/subtitle/actions/filter; column header có thể sort; pagination dùng để giảm overload; empty table thay bằng blankslate.
- **Shopify admin migration \[R20\]:** filter/search toolbar và bulk-actions được chuyển đổi theo selection; bulk action area giữ selected count và action trong responsive toolbar.

**EGODE DECISION**

Owner/Admin V2 phải ưu tiên predictable header, compact controls, visible context và contextual actions; không thêm dashboard cards chỉ để “trông chuyên nghiệp”.

# 4\. PATTERN CATALOG V2 — BUTTON

**Nguồn khảo sát:** \[R11\] Primer Button, \[R12\] Primer Button Accessibility, \[R13\] Atlassian Button — VERIFIED

Khảo sát thực tế: Primer cho biết secondary là variant dùng thường xuyên, primary nên được giới hạn một button trên page/area khi có thể; Atlassian cũng hướng dẫn một primary CTA trong một khu vực, label bắt đầu bằng động từ rõ hành động, button dùng cho action còn link dùng cho navigation.

| **Vấn đề Egode** | **Nâng cấp bắt buộc** | **Mẫu V2** |
| --- | --- | --- |
| Nhiều outline/primary cạnh nhau | Một cluster chỉ có 1 primary; action phụ secondary/tertiary/menu | \[Lưu thay đổi\] \[Hủy\] \[•••\] |
| “Chi tiết >” lặp mọi row | Nếu chỉ là navigation → link/row affordance; nếu nhiều action → ActionMenu | Tên tài khoản … › hoặc \[•••\] |
| Icon + text dùng tùy tiện | Chỉ thêm icon khi tăng affordance; icon-only phải có accessible name | \[＋ Thêm tài khoản\] chỉ khi plus thực sự hữu ích |
| Loading làm button đổi kích thước | Giữ width; spinner/state trong button; block double-submit | \[spinner\] Đang lưu… |

**EGODE DECISION — Button API**

Canonical variants: primary, secondary, tertiary/ghost, danger, icon. Kích thước cụ thể phải map vào token hiện có; không tạo gradient/glow. Primary dùng tiết chế. Navigation không giả button.

- Hover: đổi background/border/color nhẹ; không nhấc 4px, không glow.
- Press: tactile nhưng nhỏ (ví dụ color shift; nếu dùng transform chỉ 1px hoặc scale rất nhẹ).
- Focus-visible: xuất hiện tức thì, không đợi animation.
- Loading: chống double submit; accessible busy state; không xóa label context nếu khiến meaning mơ hồ.

# 5\. PATTERN CATALOG V2 — COMBOBOX / AUTOCOMPLETE

**Nguồn khảo sát:** \[R02\] Agoda, \[R14\] WAI-ARIA Combobox, \[R15\] Atlassian Popup Select — VERIFIED

Agoda hiện dùng destination/property input có suggestion và hướng dẫn điều hướng bằng arrow/tab + Enter. WAI-ARIA định nghĩa combobox là input có popup, hỗ trợ editable/select-only và quy định aria-expanded/aria-controls cùng keyboard behavior. Atlassian Popup Select cho phép filter trong danh sách options.

**EGODE DECISION**

Combobox chỉ dùng khi option nhiều hoặc cần search. Destination, hotel selector lớn, large account/entity selector là candidates. Status 3–5 lựa chọn vẫn dùng Select/Dropdown đơn giản.

DESTINATION COMBOBOX V2  
<br/>┌──────────────────────────────────────┐  
│ 🔎 Vũng... │  
├──────────────────────────────────────┤  
│ Điểm đến │  
│ 📍 Vũng Tàu │  
│ Bà Rịa - Vũng Tàu │  
│ │  
│ Khách sạn (nếu API hỗ trợ) │  
│ 🏨 Bãi Sau Seaside Hotel │  
└──────────────────────────────────────┘

- Arrow Up/Down thay active option; Enter chọn; Escape đóng; focus/selection phải phân biệt.
- Async: có loading state, no-results state, debounce phù hợp; không spam API mỗi keystroke.
- Không đưa mọi option metadata vào chip; nhóm suggestion chỉ khi data thật có category.
- Popup width tối thiểu theo trigger; collision/viewport handling bắt buộc.

# 6\. PATTERN CATALOG V2 — DROPDOWN / ACTION MENU

**Nguồn khảo sát:** \[R16\] Primer ActionMenu, \[R17\] Radix Dropdown Menu, \[R23\] Atlassian Dropdown Menu — VERIFIED

Primer ActionMenu hỗ trợ hierarchy bằng group/divider/section title và keyboard arrows/Escape; Radix Dropdown Menu có focus management, typeahead, groups, radio/checkbox items và collision handling.

**EGODE DECISION**

Dropdown dùng cho compact secondary actions hoặc selection nhỏ. “•••” của Owner/Admin phải gom secondary/destructive actions; destructive action đặt cuối nhóm và có confirm nếu hậu quả lớn.

OWNER ENTITY ACTION MENU  
<br/>\[•••\]  
┌────────────────────────┐  
│ Xem thống kê │  
│ Quản lý đặt phòng │  
├────────────────────────┤  
│ Ngừng kinh doanh │ ← danger text, không tô đỏ cả menu  
└────────────────────────┘

- Menu mở từ trigger, focus vào item đầu tiên, Escape đóng và trả focus.
- Item label phải tự mô tả; icon không được là nguồn meaning duy nhất.
- Không dùng dropdown cho critical information; không nhét form dài vào menu.

# 7\. PATTERN CATALOG V2 — DATE PICKER / DATE RANGE

**Nguồn khảo sát:** \[R01\] Booking.com, \[R02\] Agoda, \[R03\] Expedia, \[R24\] WAI-ARIA Date Picker — VERIFIED

Các travel sites khảo sát đều đặt Dates là một phần cốt lõi của search. Booking.com thể hiện compact date range trigger; Agoda tách check-in/check-out trong search module; Expedia dùng Dates trong search stays. WAI-ARIA có mẫu date picker dạng dialog/calendar với month/year announcement.

**EGODE DECISION**

Public search dùng RangeDatePicker: một trigger hiển thị check-in → check-out, popup calendar cho range. Owner/Admin report có thể dùng compact range control khác. Không dùng cùng một date UI cho mọi domain nếu task khác nhau.

TRAVEL DATE RANGE V2  
<br/>\[ 30/09/2026 → 01/10/2026 \]  
↓  
┌──────────── Tháng 9 ────────────┬──────────── Tháng 10 ──────────┐  
│ Su Mo Tu We Th Fr Sa │ Su Mo Tu We Th Fr Sa │  
│ ... \[30\] │ \[01\] ... │  
└─────────────────────────────────┴─────────────────────────────────┘  
3 đêm / context update nếu có

- Checkout phải sau check-in theo business rule; invalid range phải được prevent/giải thích.
- Selected range + start/end cần nhận biết không chỉ bằng màu nếu có thể dùng shape/text state.
- Desktop có thể 2 tháng khi viewport đủ; mobile ưu tiên 1 tháng scroll/step, không ép calendar hai cột.
- Month/year change phải announce hợp lý; focus không bị mất.

# 8\. PATTERN CATALOG V2 — GUEST PICKER

**Nguồn khảo sát:** \[R03\] Expedia, \[R01\] Booking.com, \[R02\] Agoda — VERIFIED

Expedia hiện mô hình hóa Travelers theo room: Room 1 → Adults → Children (ages 0–17), có Add another room và Done. Booking.com compact occupancy thể hiện adults · children · room. Agoda thể hiện adults + room trong search.

**EGODE DECISION**

Không dùng raw numeric input cho “Khách”. Dùng popover có counters. Nếu Egode nghiệp vụ chưa quản lý tuổi trẻ em thì không được tự thêm age field. Room count/guest count phải bám contract hiện có.

GUEST & ROOM PICKER V2  
<br/>Khách & phòng  
┌───────────────────────────────┐  
│ Người lớn \[−\] 2 \[+\]  
│ Trẻ em \[−\] 0 \[+\] ← chỉ nếu backend có  
│ Phòng \[−\] 1 \[+\]  
│ │  
│ \[Xong\] │  
└───────────────────────────────┘

# 9\. PATTERN CATALOG V2 — TOAST / FLAG

**Nguồn khảo sát:** \[R25\] Radix Toast, \[R26\] Atlassian Designing Messages — VERIFIED

Radix Toast dành cho message ngắn; action trong toast phải là action có thể bỏ qua, nếu bắt buộc phản hồi thì dùng AlertDialog. Atlassian Flag dùng cho confirmation/alert/acknowledgment cần rất ít interaction; Banner dành cho critical system-level message, Section Message dành cho một section.

**EGODE DECISION**

Toast chỉ dùng cho acknowledgement không chặn task: “Đã lưu”, “Đã sao chép”. Business error cần người dùng xử lý phải dùng inline/section message hoặc dialog phù hợp.

| **Loại** | **Egode dùng khi** | **Ví dụ** |
| --- | --- | --- |
| Toast | Kết quả nhỏ, non-blocking | Đã cập nhật thông tin khách sạn |
| Section/Inline message | Lỗi/cảnh báo thuộc page/section | Không đủ phòng cho ngày đã chọn |
| Banner | Sự cố toàn hệ thống / mất chức năng nghiêm trọng | Cổng thanh toán đang bảo trì |
| Result state | Kết quả giao dịch lớn | Thanh toán thành công / chờ / thất bại |

- Toast không che CTA/header; stack có giới hạn; close button optional theo severity/duration.
- Không auto-dismiss critical information quá nhanh.
- Screen reader announcement phải phù hợp; không đưa tất cả update vào assertive live region.

# 10\. PATTERN CATALOG V2 — ALERT / CONFIRMATION

**Nguồn khảo sát:** \[R27\] WAI-ARIA Alert, \[R28\] WAI-ARIA AlertDialog, \[R29\] Radix AlertDialog — VERIFIED

WAI-ARIA phân biệt Alert (thông tin quan trọng nhưng không interrupt task, không lấy focus) và AlertDialog (interrupt workflow để lấy response). Radix AlertDialog trap focus, Title/Description được announce và Escape đóng.

**EGODE DECISION**

Xóa window.alert/window.confirm trong critical UX. Destructive confirm phải nói rõ đối tượng + hậu quả + hành động. Tránh “Bạn có chắc không?” chung chung.

ALERT DIALOG — EGODE  
<br/>Hủy đặt phòng EG-2026-00123?  
Theo chính sách hiện tại, hệ thống sẽ áp dụng mức hoàn tiền do backend trả về.  
<br/>\[ Giữ đặt phòng \] \[ Hủy đặt phòng \]

# 11\. PATTERN CATALOG V2 — STATUS / LOZENGE

**Nguồn khảo sát:** \[R30\] Atlassian Lozenge, \[R31\] Atlassian Tag Group, \[R32\] Atlassian Color — VERIFIED

Atlassian định nghĩa Lozenge là compact label cho thuộc tính có ý nghĩa ảnh hưởng cách hiểu/ưu tiên/hành động; content lý tưởng chỉ một hoặc hai từ. Tag guidance cảnh báo nhiều tags làm tăng cognitive noise. Semantic colors được chia neutral/brand/information/success/warning/danger...

**EGODE DECISION**

Role ≠ Status. Role trong admin table ưu tiên text/neutral metadata; Status dùng compact semantic label hoặc dot+label. Không mặc định pill full-round cho mọi metadata.

STATUS TIERS  
<br/>Detail header: ● Hoạt động  
Table/list: \[ Chờ duyệt \] (compact lozenge, không button-like)  
Transaction: ✓ Đặt phòng đã xác nhận  
Thanh toán đã hoàn tất

- Không rely on color alone: luôn có text.
- Status không interactive thì không có hover/cursor/button affordance.
- Không phát minh màu riêng theo từng page; dùng state mapping canonical.

# 12\. PATTERN CATALOG V2 — HOTEL CARD

**Nguồn khảo sát:** \[R06\] Agoda Search, \[R07\] Booking.com results, \[R05\] Airbnb total price — VERIFIED

Pattern thực tế ở travel lớn tập trung ảnh + identity + location + rating/review + price + cancellation/benefit relevant. Agoda còn đưa numeric rating/review count và per-night price; Booking.com hiển thị rating/reviews/free-cancellation options; Airbnb nhấn mạnh total-price transparency.

**EGODE DECISION**

HotelCard V2 là domain component, không generic Card. Cấu trúc desktop 3 vùng: media / decision info / price-action. Mobile stack image → identity → trust → price → CTA.

| **Anatomy** | **MUST** | **Không làm** |
| --- | --- | --- |
| Media | Ảnh thật + fallback; favorite overlay chỉ nếu feature có thật | Gradient nặng, nhiều badge phủ ảnh |
| Identity | Tên, sao nếu có, location | Tên nhỏ giữa hàng loạt pills |
| Trust | Rating + review count nếu API có | Fake “top choice”, fake scarcity |
| Commercial | Price semantic, total nếu backend trả, cancellation nếu có | Frontend tự tính authoritative total |
| Action | Một CTA rõ hoặc clickable entity pattern | Nhiều primary buttons |

# 13\. PATTERN CATALOG V2 — ROOM OFFER

**Nguồn khảo sát:** \[R09\] Booking.com hotel room selection, \[R10\] Booking.com pricing/choices — VERIFIED

Booking.com room table hiện thể hiện Room type, Today’s Price, Your choices và Select Rooms; nội dung gồm sleeps/bed/area/amenities, total vs per-night, cancellation/prepayment và stock cue. Đây là cơ sở để Egode nâng room row từ “card mô tả” lên “transaction offer”.

**EGODE DECISION**

RoomOffer phải hỗ trợ comparison ổn định. Giá, policy và quantity/action ở cùng vùng mỗi offer. Không hide cancellation/important policy chỉ trong tooltip.

| **Vùng** | **Nội dung đề xuất Egode** |
| --- | --- |
| Identity | Tên phòng, ảnh, capacity, bed, area nếu data có |
| Features | 2–4 tiện nghi quyết định; phần còn lại mở rộng |
| Policy | Hủy/hoàn, thanh toán, breakfast nếu backend trả |
| Availability | Còn X phòng / sold out / closed theo dữ liệu thật |
| Price | Per-night + total theo quote/backend contract |
| Selection | Stepper hoặc select; CTA rõ |

# 14\. PATTERN CATALOG V2 — ADMIN TABLE

**Nguồn khảo sát:** \[R18\] Primer DataTable, \[R19\] Primer DataTable Accessibility, \[R20\] Shopify IndexTable migration, \[R33\] Atlassian Dynamic Table — VERIFIED

Primer DataTable có table header với title/subtitle/actions/filter, sortable column header, pagination và blankslate cho no-data. Shopify migration cho admin table mô tả query container với search + status select và chuyển sang bulk-action toolbar khi có selection. Atlassian Dynamic Table hỗ trợ pagination/sorting/reordering.

**EGODE DECISION**

Admin table phải là “resource management surface”, không phải table nằm trong card cộng với 3 button filter. Toolbar có search/filter conventions; selection state đổi toolbar; row action dựa task.

ADMIN TABLE V2  
<br/>Quản lý tài khoản \[ + Thêm tài khoản \]  
Search \[\___\___\___\___\___\___\__\] Trạng thái \[Tất cả ▾\] Vai trò \[Tất cả ▾\]  
Active filters: \[Hoạt động ×\] Xóa lọc  
────────────────────────────────────────────────────────────────────  
ID Tài khoản / Email Vai trò Trạng thái ⋯  
#1749 Test User / email... Khách hàng ● Hoạt động ⋯  
...  
────────────────────────────────────────────────────────────────────  
1–20 / 284 ‹ 1 2 3 … 15 ›

- Nếu filter update trực tiếp thì không cần nút “Tìm”; nếu staged filters thì phải dùng Apply nhất quán. Chọn một convention theo API/performance.
- Reset/Clear chỉ xuất hiện khi filter khác default.
- Role ưu tiên text/neutral, status mới dùng semantic state.
- Sort header có keyboard + aria-sort; loading/sorting phải announce nếu custom.
- Responsive: không ép table 7–10 cột co nhỏ; chọn priority columns + horizontal scroll hoặc chuyển resource list ở mobile.

# 15\. OWNER / ADMIN PAGE ACTION HIERARCHY V2

**Nguồn khảo sát:** \[R11\] Primer Button, \[R13\] Atlassian Button, \[R16\] Primer ActionMenu, \[R21\] Linear UI refresh — VERIFIED

**EGODE DECISION**

Header của entity editor phải gom identity + status + primary save/action; secondary actions đi vào tertiary/menu. Không để destructive action ngang weight với routine navigation.

OWNER HOTEL HEADER V2  
<br/>← Khách sạn của tôi  
Bãi Sau Seaside Hotel ● Hoạt động  
Vũng Tàu  
<br/>Hồ sơ khách sạn \[ Lưu thay đổi \] \[•••\]  
├ Xem thống kê  
├ Quản lý đặt phòng  
└ Ngừng kinh doanh

- Form readable width: không kéo field text ngắn full 1200–1400px. Dùng max-width + semantic 2-column grid khi hợp lý.
- Actions trong form dài có thể sticky footer nhưng không duplicate ở 3 vị trí.
- Danger action cần separation + confirmation; không đặt red primary giữa routine buttons.

# 16\. ADMIN OVERVIEW V2 — TỪ “MENU LẶP” THÀNH ATTENTION SURFACE

**Nguồn khảo sát:** \[R21\] Linear UI refresh, \[R34\] Linear Priority Inbox — VERIFIED

Linear 2026 nhấn mạnh consistency và Priority Inbox tách việc cần chú ý khỏi update thông thường. Egode không cần copy Inbox, nhưng có thể học nguyên tắc attention-first: overview phải chỉ ra “việc cần xử lý”, không lặp lại navigation.

**EGODE DECISION**

Admin Overview chỉ được hiển thị queue/metric/activity mà backend thực sự cung cấp. Nếu chưa có API, giữ overview tối giản và không fake số liệu.

ADMIN OVERVIEW V2 — schematic  
<br/>Cần xử lý  
12 hồ sơ đối tác chờ duyệt →  
3 yêu cầu hỗ trợ chưa xử lý →  
2 giao dịch cần kiểm tra →  
<br/>Hoạt động gần đây (nếu backend có)  
...  
<br/>Tổng quan hệ thống (chỉ metric có nguồn dữ liệu thật)

# 17\. MOTION & EFFECTS SYSTEM V2

**Nguồn khảo sát:** \[R35\] Atlassian Motion, \[R36\] Atlassian Applying Motion, \[R37\] Radix Popover, \[R21\] Linear UI refresh — VERIFIED

Atlassian phân loại interactions 50–150ms và transitions 150–400ms; ví dụ dropdown entrance 150ms, modal entrance 250ms. Họ yêu cầu motion hướng sự chú ý, giữ context, hỗ trợ reduced motion và không thêm friction. Radix Popover expose transform-origin theo trigger để origin-aware animation. Linear refresh đi theo hướng calmer interface thay vì tăng chrome.

| **Element** | **Egode motion đề xuất** | **Implementation** |
| --- | --- | --- |
| Button hover/press | 50–150ms; color/border; press rất nhẹ | CSS transition; focus tức thì |
| Dropdown/Combobox/Popover | ~150ms enter, ~100ms exit; fade + translate/scale nhỏ từ trigger | transform-origin theo trigger; collision-aware |
| Modal/AlertDialog | ~250ms enter, ~200ms exit; overlay fade + content scale/fade nhẹ | Focus vào dialog ngay khi open; không đợi animation |
| Toast | ~180–250ms; slide/fade từ vị trí viewport | Không bounce; swipe optional nếu primitive hỗ trợ |
| Hotel card | 100–160ms border/shadow; image scale cực nhẹ nếu không ảnh hưởng performance | Không translate card lên nhiều px |
| Table row | 50–100ms background hover | Không shadow/elevation |
| Selected room/status | 100–150ms background/border | Không pulse liên tục |

**MUST — Motion accessibility**

Honor prefers-reduced-motion. Focus, error, confirmation và assistive announcement không được trì hoãn cho tới khi animation kết thúc.

CSS CONCEPT (adapt to existing tokens; not copy-paste mandate)  
<br/>@media (prefers-reduced-motion: reduce) {  
\*, \*::before, \*::after {  
animation-duration: 0.01ms !important;  
animation-iteration-count: 1 !important;  
transition-duration: 0.01ms !important;  
}  
}  
<br/>/\* Prefer semantic motion tokens rather than arbitrary per-page timing. \*/

# 18\. MICRO-INTERACTION & FEEDBACK MATRIX

| **Trigger** | **Immediate feedback** | **Completion** | **Error / recovery** |
| --- | --- | --- | --- |
| Save form | Button loading, prevent repeat | Toast + refreshed state | Inline/section error; preserve values |
| Apply filters | Control selected/loading | Results + count update | Retry; retain selected filters |
| Select room | Selection state + summary updates | CTA enabled / quote refresh | Availability changed → inline alert + refresh |
| Payment | Button loading + processing state | Result page from verified backend status | Pending/fail page; retry path per contract |
| Destructive action | AlertDialog context | Toast/result + state refresh | Dialog/inline error; do not silently close on fail |
| Upload image | Preview + upload progress if available | Thumbnail + success state | Per-file error + retry/remove |

# 19\. RESPONSIVE RULES CHO COMPONENT V2

| **Pattern** | **Desktop** | **Tablet** | **Mobile** |
| --- | --- | --- | --- |
| Travel Search | Inline destination/date/guest/search | 2-row or compact triggers | Stack/compact triggers; full-screen/popup selectors khi cần |
| Hotel Card | 3-zone horizontal | Image + info + price compact | Vertical; CTA/price gần cuối; không sidebar filter cố định |
| Room Offer | 3-zone transaction row | 2-zone or stacked sub-sections | Vertical; sticky/summary action nếu phù hợp |
| Admin Table | Full table + toolbar | Priority columns + scroll | Resource list hoặc selected columns; action menu |
| Combobox | Anchored popup | Anchored/full width | Popup/sheet tùy control và keyboard |
| Date Range | 2-month calendar nếu đủ rộng | 1–2 tháng tùy width | 1 tháng/scroll; touch targets rõ |

**MUST**

Mobile không phải desktop co nhỏ. Test 375 / 430 / 768 / 1024 / 1280 / 1440 (hoặc viewport registry của repo). Phải test long Vietnamese text, keyboard open, sticky collision, overflow và table density.

# 20\. IMPLEMENTATION PROMPT — AI CODING PHẢI LÀM NHƯ THẾ NÀO

**Bắt buộc audit trước code**

Đọc Part 1/2/3 docs hiện có, route map, common components, CSS/tokens, package.json và chạy frontend thật. Chụp screenshot baseline tại representative routes. Không bắt đầu bằng việc thay toàn bộ CSS.

## BƯỚC 0 — FULL UI INVENTORY TRƯỚC KHI MIGRATE

- Tạo docs/uiux/update-v2/full-ui-inventory.md bằng cách đọc route configuration và quét toàn bộ frontend. Liệt kê 100% route/page/layout/shared component/domain component/overlay/state quan trọng đang tồn tại.
- Mỗi entry tối thiểu có: Actor/Domain, Route hoặc Entry Point, Screen/Component, Page Pattern, Shared Components Used, Responsive Risk, Accessibility Risk, V2 Pattern Affected, Migration Status, Evidence/Notes.
- Migration Status chỉ được dùng: UNAUDITED → AUDITED → PILOTED (nếu là trang mẫu) → MIGRATED; hoặc KEEP-WITH-JUSTIFICATION / DEFERRED-WITH-BLOCKER. Cuối dự án không được còn UNAUDITED.
- Bảy screenshot trong Mục 2 được đánh dấu REPRESENTATIVE/PILOT ONLY trong inventory. Không dùng chúng làm whitelist phạm vi.
- Sau khi canonical pattern pass trên pilot, phải truy ngược usage bằng route/component search để migrate mọi consumer tương đương trên toàn sản phẩm.

1.  Tạo docs/uiux/update-v2/evidence-map.md: map từng quyết định trong tài liệu này tới source \[Rxx\] và component/page Egode bị ảnh hưởng.
2.  Tạo docs/uiux/update-v2/runtime-audit.md: thống kê Button/Select/Input/Combobox/Dropdown/Date/Guest/Toast/Alert/Status/HotelCard/RoomOffer/DataTable đang tồn tại, nơi sử dụng, duplicates và mức migration.
3.  Tạo canonical components V2 trước khi sửa page hàng loạt. Chỉ thêm dependency khi primitive hiện có không đáp ứng accessibility/behavior và dependency được justification.
4.  Triển khai PILOT trên các trang tiêu biểu: Registration → Search Results → Hotel Detail/Room → Owner Hotel Profile → Admin Account Table → Home → Admin Overview. Đây chỉ là bước kiểm chứng pattern, KHÔNG phải phạm vi kết thúc. Sau khi pilot đạt gate, migrate toàn bộ domain và toàn bộ UI inventory có cùng pattern.
5.  Mỗi PILOT page phải có before/after screenshot và checklist: hierarchy, action weight, states, responsive, keyboard, reduced motion. Sau pilot, mọi route/page còn lại phải có coverage evidence tối thiểu trong full-ui-inventory và route sweep QA.
6.  Sau khi pattern pass mới migrate TOÀN BỘ domain, không chỉ các trang đã chụp. Không xóa legacy component cho tới khi grep usage + tests xác nhận không còn consumer; mọi ngoại lệ phải có justification/blocker trong inventory.

## 20.1 Component architecture mục tiêu

FOUNDATION  
Button / IconButton / Input / Select / Checkbox / Radio / Status / Skeleton  
<br/>OVERLAY & FEEDBACK  
DropdownMenu / ActionMenu / Popover / Dialog / AlertDialog / Toast / InlineMessage  
<br/>TRAVEL DOMAIN  
TravelSearchBar / DestinationCombobox / DateRangePicker / GuestRoomPicker  
HotelCard / HotelIdentity / RatingSummary / PriceDisplay  
RoomOffer / QuantityStepper / BookingSummary / CancellationPolicy  
<br/>OPERATIONS  
PageHeader / ActionCluster / FilterToolbar / ActiveFilters / DataTable / EmptyState  
HotelContext / InventoryCell (nếu tồn tại) / TransactionStatus

## 20.2 Không over-componentize

- Chỉ tạo shared component nếu semantic purpose lặp lại hoặc có state/behavior đáng encapsulate.
- Domain component được format/present business data nhưng không quyết định authoritative business logic.
- PriceDisplay được format số; không tự tính tổng booking.
- BookingSummary render server-calculated values; không recalc từ giá client.
- Status mapping là presentation layer; không đổi backend enum/state transitions.

## 20.3. WHOLE-PRODUCT MIGRATION CONTRACT

- PUBLIC/AUTH: áp dụng V2 cho toàn bộ home/search/results/hotel/room/auth/onboarding và mọi shared public navigation/search surface.
- CUSTOMER: áp dụng V2 cho profile, booking list/detail, cancel/refund, review, support và mọi state/action có liên quan.
- OWNER: áp dụng V2 cho overview, hotel, room type, inventory/pricing, booking, revenue, report, profile và mọi form/editor/action surface.
- ADMIN: áp dụng V2 cho overview, accounts, partner applications, hotels, payments/refunds, reviews, support/complaints, promotions, reports và mọi list/detail/form.
- SHARED/CROSS-CUTTING: migrate header/sidebar/nav, button/input/select/combobox/dropdown/date/guest picker, toast/alert/dialog, status, table, pagination, upload, empty/error/loading/permission states và formatting utilities.
- Không được giữ một page cũ chỉ vì nó không nằm trong 7 screenshot. Scope được xác định bởi repository + route/component inventory, không bởi số ảnh người dùng cung cấp.

# 21\. ROADMAP TRIỂN KHAI UPDATE V2

| **Phase** | **Phạm vi** | **Output/Gate** |
| --- | --- | --- |
| U0 — Audit & Evidence | full route/UI/component inventory, runtime audit, evidence map, representative screenshots | Không code lớn; map 100% routes/screens/surfaces, không chỉ representative routes |
| U1 — Controls V2 | Button, action menu, select/combobox, date, guest, status | Keyboard + states + reduced-motion pass |
| U2 — Feedback V2 | toast, inline message, alert dialog, loading/error/empty | Loại alert/confirm browser trong critical UX |
| U3 — Travel Commerce | Toàn bộ Public/Auth/Customer travel commerce: Home, Search, Results, Hotel, Room, Booking, Payment/Result và related states | Search→Hotel→Room→Booking experience có domain density; toàn domain migrated/justified |
| U4 — Operations | Toàn bộ Owner/Admin operational UI: overview/list/detail/form/table/filter/action surfaces | Owner/Admin thoát CRUD template trên toàn domain; no fake metrics; shared patterns canonical |
| U5 — Whole-Product Migration | Migrate mọi route/page/component/state còn lại theo canonical V2; xử lý auth/customer/support/review/promotion/report và các screens không nằm trong pilot | 100% full-ui-inventory = MIGRATED / KEEP-WITH-JUSTIFICATION / DEFERRED-WITH-BLOCKER; zero unknown scope |
| U6 — Motion & Responsive | motion tokens, origin-aware overlay, responsive interactions trên toàn sản phẩm | 6 viewport critical QA + all-route desktop/mobile sweep; reduced motion pass |
| U7 — Regression Gate | E2E critical flows, accessibility, full UI coverage audit, visual regression, bundle impact | Release candidate; no critical regression; no UNAUDITED UI inventory entries |

# 22\. QUALITY GATES BẮT BUỘC

| **Gate** | **Phải chứng minh** | **FAIL nếu** |
| --- | --- | --- |
| Q1 Visual hierarchy | Primary action + decision data rõ trên pilot và nhất quán trên toàn bộ page patterns cùng loại | Nhiều primary, card rỗng, layout generic template còn tồn tại ở bất kỳ critical route nào |
| Q2 Component state | default/hover/focus/active/disabled/loading/error/selected cần thiết | Component chỉ được test default |
| Q3 Keyboard | Combobox/menu/dialog/date controls critical dùng keyboard | Mất focus, Escape/Arrow/Tab sai, inaccessible custom control |
| Q4 Feedback | Mọi mutation critical có pending/result/recovery | Click không feedback, double-submit, raw alert/confirm |
| Q5 Responsive | Critical journeys test 375–1440; toàn bộ routes có desktop + mobile smoke/visual sweep | CTA bị che, table vỡ, popup ngoài viewport hoặc có route chưa responsive-audit |
| Q6 Motion | Motion có purpose + reduced motion | Bounce/glow/decorative motion, focus bị delay |
| Q7 Business safety | Không thay pricing/availability/payment/RBAC authority | Frontend tự tính/tin dữ liệu đáng lẽ backend quyết định |
| Q8 Evidence | Mỗi pattern quan trọng trace tới source và Egode adaptation | Copy web tham chiếu không có lý do hoặc claim không có nguồn |
| Q9 Full UI Coverage | Full UI inventory 100%; mọi route/page/component/state có migration status + evidence/justification | Còn UNAUDITED/UNKNOWN entry; chỉ hoàn thiện 7 screenshot/pilot rồi dừng; có legacy critical UI chưa trace |

# 23\. DEFINITION OF DONE — UPDATE_UIUX V2

☐ Full UI inventory đã liệt kê 100% route/page/layout/shared component/domain component/overlay/state quan trọng của frontend Egode.

☐ Bảy screenshot được xác nhận là representative evidence/pilot only; phạm vi cuối cùng là TOÀN BỘ UI/UX trong repository.

☐ Mọi inventory entry có trạng thái MIGRATED, KEEP-WITH-JUSTIFICATION hoặc DEFERRED-WITH-BLOCKER; không còn UNAUDITED/UNKNOWN.

☐ Public/Auth/Customer/Owner/Admin đều đã được migration theo canonical V2, bao gồm các màn hình không xuất hiện trong screenshot.

☐ Modal/Dialog/Drawer/Popover/Dropdown/Combobox/Toast/Alert/Table/Form và loading/empty/error/permission/status states đã được audit xuyên toàn sản phẩm.

☐ Legacy CSS/component/page-specific implementation còn lại đã được trace; không có critical duplicate/override ngoài inventory.

☐ Home không còn generic split-hero formula; search là core interaction.

☐ Registration role choice tách selection khỏi CTA; không còn 2 CTA full-width cạnh tranh.

☐ TravelSearchBar dùng domain controls: DestinationCombobox + DateRange + Guest/Room + Search.

☐ HotelCard có stable decision hierarchy và dữ liệu thương mại/trust theo API thật.

☐ RoomOffer có price/policy/availability/selection composition rõ; không raw number input.

☐ BookingSummary có lifecycle và không tự tính authoritative total.

☐ Owner entity header có action hierarchy; destructive action không cùng weight với routine actions.

☐ Admin Overview không lặp sidebar; không fake work queue/metric.

☐ Admin table filter/action/status/row behavior được chuẩn hóa; không “Chi tiết” outline button mọi row nếu không cần.

☐ Role và Status được phân biệt semantics.

☐ Toast/Inline Alert/Banner/AlertDialog/Result State có usage contract.

☐ Không còn window.alert/window.confirm trong critical flow nếu migration an toàn.

☐ Combobox/Dropdown/Dialog critical có keyboard/focus đúng.

☐ Motion uses semantic timing; no decorative bounce/glow; prefers-reduced-motion được xử lý.

☐ 6 viewport QA pass trên critical journeys/pilot pages; tất cả route còn lại pass tối thiểu desktop + mobile route sweep, không có blocker layout/interaction.

☐ Build/typecheck/lint/tests pass theo project tooling.

☐ Visual regression evidence before/after được lưu cho pilot/critical screens; full route coverage matrix và smoke evidence được lưu cho toàn bộ UI.

☐ Không đổi business/API/schema ngoài scope; mọi deviation có decision record.

# 24\. ANTI-AI FINAL CHECKLIST

- Có component nào chỉ tồn tại để lấp khoảng trắng hoặc “make it premium” không?
- Có icon-box, pill, badge, gradient, glow nào không mang semantic meaning không?
- Có page nào vẫn theo công thức hero/card/KPI/table mà không xuất phát từ task không?
- Có action nào dùng button nhưng thực tế là navigation không?
- Có status/role/metadata nào đều biến thành pill không?
- Có tooltip đang giấu critical information không?
- Có motion nào nếu bỏ đi user không mất context gì không? Nếu có, cân nhắc bỏ.
- Có component nào copy shape/visual identity của website tham chiếu thay vì học principle không?
- Nếu bỏ toàn bộ màu, hierarchy có còn hiểu được không?
- Nếu đổi dữ liệu sang tên/địa chỉ/giá dài thực tế, layout có còn ổn không?

# 25\. FULL-UI COVERAGE CHECKLIST — KHÔNG ĐƯỢC GIỚI HẠN Ở 7 ẢNH

**AI coding phải sử dụng checklist này như release gate toàn sản phẩm. Một mục không xuất hiện trong ảnh người dùng vẫn thuộc scope nếu nó tồn tại trong frontend.**

- Public: Home, search controls, results, filters, hotel detail, gallery, room selection, supporting navigation/footer và tất cả public states.
- Auth/Onboarding: login, register customer/partner, forgot/reset, validation, success/error/pending states.
- Booking/Payment: room selection, quote/summary, promotion, confirmation, payment handoff, pending/success/failure/timeout/result.
- Customer: profile, booking list/detail, cancellation/refund, review, image upload, support/complaint và direct-URL permission behavior.
- Owner: overview, hotel list/detail/edit, room type CRUD, inventory/pricing calendar/editor, booking list/detail, revenue/report, profile.
- Admin: overview, accounts, partner approval, hotel management, payments/refunds, review moderation, support/complaint, promotions, reports.
- Shared/navigation: public header, dashboard shell, sidebar, topbar, breadcrumbs, page header, toolbar, tabs, pagination, responsive navigation.
- Controls: Button, IconButton, Input, Textarea, Select, Combobox, Dropdown/ActionMenu, Date/RangePicker, GuestPicker, Checkbox/Radio/Switch khi có.
- Feedback/overlay: Toast, Inline/Section Message, Banner, AlertDialog, Dialog, Drawer, Popover, Tooltip, upload progress, destructive confirmation.
- Data/commerce: HotelCard, RoomOffer, PriceDisplay, BookingSummary, BookingStatus, CancellationPolicy, InventoryGrid/Cell, Admin DataTable.
- States: default, hover, focus-visible, active, selected, disabled, loading, empty, error, success, permission, no-results, long-content, image-fallback.
- Responsive/accessibility: 375/430/768/1024/1280/1440 cho critical; desktop+mobile sweep toàn routes; keyboard/focus/reduced-motion/contrast/semantic checks.

# A. PHỤ LỤC A — NGUỒN KHẢO SÁT THỰC TẾ

Chỉ dùng các nguồn sau như evidence/pattern reference. URL được ghi để AI coding hoặc reviewer có thể kiểm tra lại. Các nguồn có thể thay đổi theo thời gian; trước khi copy bất kỳ behavior kỹ thuật cụ thể nào, cần kiểm tra phiên bản hiện tại.

| **ID** | **Nguồn** | **Pattern đã xác minh** | **URL** |
| --- | --- | --- | --- |
| \[R01\] | Booking.com — Official homepage search | Destination, date range, occupancy, Search as primary travel controls | [Mở nguồn](https://www.booking.com/index.html) |
| \[R02\] | Agoda — Official homepage/search | Destination/property autocomplete, check-in/out, guests/rooms, search module | [Mở nguồn](https://www.agoda.com/) |
| \[R03\] | Expedia — Hotels | Where to, Dates, Travelers; Room/Adults/Children/Add another room/Done | [Mở nguồn](https://www.expedia.com/Hotels) |
| \[R04\] | Airbnb Help — Using search filters | Destination, check-in/out, total guests and pets as search inputs | [Mở nguồn](https://www.airbnb.com/help/article/479) |
| \[R05\] | Airbnb News — Total price display | Total price with fees before taxes shown in search results globally | [Mở nguồn](https://news.airbnb.com/total-price-display-is-now-standard-globally) |
| \[R06\] | Agoda — Search result example | Image, star/location, rating/review, per-night price, free cancellation | [Mở nguồn](https://www.agoda.com/search?city=3984) |
| \[R07\] | Booking.com — Ho Chi Minh City hotels | Filters, rating/reviews, free cancellation options, from-price results | [Mở nguồn](https://www.booking.com/city/vn/ho-chi-minh-city.en-gb.html) |
| \[R08\] | Booking.com — Booking-home listing example | Property image/name, cancellation, score/reviews, from-price | [Mở nguồn](https://www.booking.com/booking-home/city/bf/kossiam.html) |
| \[R09\] | Booking.com — Hotel availability / room selection | Room type, today price, choices, select rooms, amenities, cancellation, availability | [Mở nguồn](https://www.booking.com/hotel/vn/dong-nhu-7.html) |
| \[R10\] | Booking.com — Room pricing/choice example | Original/current price, total, cancellation/prepayment, stock cue | [Mở nguồn](https://www.booking.com/hotel/vn/quy-hung.html) |
| \[R11\] | GitHub Primer — Button guidelines | One primary when possible; secondary common; button hierarchy | [Mở nguồn](https://primer.style/product/components/button/guidelines/) |
| \[R12\] | GitHub Primer — Button accessibility | Visible focus/hover; accessible names; target guidance | [Mở nguồn](https://primer.style/product/components/button/accessibility/) |
| \[R13\] | Atlassian Design — Button usage | One primary CTA; specific verb labels; button vs link semantics | [Mở nguồn](https://atlassian.design/components/button/button-legacy/usage) |
| \[R14\] | WAI-ARIA APG — Combobox | Combobox semantics, popup types, keyboard and ARIA states | [Mở nguồn](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) |
| \[R15\] | Atlassian Design — Popup select | Filterable options popup / selection behavior | [Mở nguồn](https://atlassian.design/components/select/popup-select/code) |
| \[R16\] | GitHub Primer — ActionMenu | Menu hierarchy, groups/dividers, keyboard/focus behavior | [Mở nguồn](https://primer.style/product/components/action-menu/guidelines/) |
| \[R17\] | Radix Primitives — Dropdown Menu | Focus management, keyboard, typeahead, grouping, collision handling | [Mở nguồn](https://www.radix-ui.com/primitives/docs/components/dropdown-menu) |
| \[R18\] | GitHub Primer — DataTable guidelines | Table header/actions/filter, sort, pagination, blankslate, responsive considerations | [Mở nguồn](https://primer.style/product/components/data-table/guidelines/) |
| \[R19\] | GitHub Primer — DataTable accessibility | aria-sort, keyboard sorting, pagination announcements | [Mở nguồn](https://primer.style/product/components/data-table/accessibility/) |
| \[R20\] | Shopify Dev — Migrate IndexTable | Query/filter area, status select, selection-driven bulk actions, responsive toolbar | [Mở nguồn](https://shopify.dev/docs/apps/build/app-home/migrate-from-polaris-react/index-table) |
| \[R21\] | Linear — 2026 UI refresh | Calmer interface, consistent headers/navigation/view controls, dimmer sidebar | [Mở nguồn](https://linear.app/changelog/2026-03-12-ui-refresh) |
| \[R22\] | Linear — Behind latest design refresh | Pruning inconsistency and standardizing interface structure | [Mở nguồn](https://linear.app/now/behind-the-latest-design-refresh) |
| \[R23\] | Atlassian Design — Dropdown Menu | Action/options menu and current behavior/positioning work | [Mở nguồn](https://atlassian.design/components/dropdown-menu/changelog) |
| \[R24\] | WAI-ARIA APG — Date Picker Combobox | Calendar dialog semantics and accessible month/year announcements | [Mở nguồn](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-datepicker/) |
| \[R25\] | Radix Primitives — Toast | Short-lived message; action must be safe to ignore; use AlertDialog when response required | [Mở nguồn](https://www.radix-ui.com/primitives/docs/components/toast) |
| \[R26\] | Atlassian Design — Designing messages | Banner/Flag/Section Message/Empty State usage distinctions | [Mở nguồn](https://atlassian.design/foundations/content/designing-messages) |
| \[R27\] | WAI-ARIA APG — Alert | Important message without interrupting task or moving focus | [Mở nguồn](https://www.w3.org/WAI/ARIA/apg/patterns/alert/) |
| \[R28\] | WAI-ARIA APG — AlertDialog | Interrupting message requiring response | [Mở nguồn](https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/) |
| \[R29\] | Radix Primitives — Alert Dialog | Focus trap, title/description announcements, Escape/return focus behavior | [Mở nguồn](https://www.radix-ui.com/primitives/docs/components/alert-dialog) |
| \[R30\] | Atlassian Design — Lozenge | Compact label for meaningful attribute; semantic appearances | [Mở nguồn](https://atlassian.design/components/lozenge/code) |
| \[R31\] | Atlassian Design — Tag Group usage | Moderation: too many tags add cognitive noise | [Mở nguồn](https://atlassian.design/components/tag-group/usage) |
| \[R32\] | Atlassian Design — Color roles | Neutral/brand/information/success/warning/danger semantic roles | [Mở nguồn](https://atlassian.design/foundations/color) |
| \[R33\] | Atlassian Design — Components overview / Dynamic table | Dynamic table: rows with pagination/sorting/reordering | [Mở nguồn](https://atlassian.design/components) |
| \[R34\] | Linear — Priority Inbox | Separates needs-attention notifications from other updates | [Mở nguồn](https://linear.app/changelog/2026-09-03-priority-inbox) |
| \[R35\] | Atlassian Design — Motion overview | Interaction 50–150ms, transitions 150–400ms; reduced motion; clarity | [Mở nguồn](https://atlassian.design/foundations/motion) |
| \[R36\] | Atlassian Design — Applying motion | Popup/modal timing, origin/context, focus not delayed by animation | [Mở nguồn](https://atlassian.design/foundations/motion/applying-motion) |
| \[R37\] | Radix Primitives — Popover | Focus/collision handling and transform-origin for origin-aware animation | [Mở nguồn](https://www.radix-ui.com/primitives/docs/components/popover) |

**Cảnh báo về độ chính xác**

Các website thương mại có thể A/B test hoặc thay UI theo locale/device/account. Tài liệu này chỉ khẳng định các chi tiết được nguồn công khai/crawl hiện tại hỗ trợ. Mọi kích thước/pixel cụ thể trong “EGODE DECISION” là quyết định đề xuất cho Egode, không phải claim rằng website tham chiếu dùng đúng giá trị đó.

# B. PHỤ LỤC B — CHECKLIST BÁO CÁO AI CODING SAU KHI THỰC HIỆN

AI coding phải trả kết quả theo cấu trúc sau, không chỉ nói “đã modernize UI”.

A. Runtime Audit  
B. Evidence Map \[Rxx\] → Egode decisions  
C. Components Created/Normalized  
D. Full UI Coverage Matrix + Pages Migrated (toàn bộ routes/screens, không chỉ 7 pilot)  
E. Before/After Screenshots  
F. Interaction & Motion Changes  
G. Keyboard / Accessibility Results  
H. Responsive QA by viewport  
I. Build / Typecheck / Lint / Tests  
J. Dependencies Added (reason + bundle impact)  
K. Legacy Remaining  
L. Known Limitations  
M. Deviations from update_UIUX and reasons
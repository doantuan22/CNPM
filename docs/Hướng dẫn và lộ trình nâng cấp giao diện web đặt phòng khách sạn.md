# Hướng dẫn và lộ trình nâng cấp giao diện web đặt phòng khách sạn

Oct 1, 2026 · @tuan

## Tóm tắt

Nên nâng cấp có chọn lọc thay vì viết lại: code nền của web đã vững, phần còn thiếu là một hệ thống style thống nhất và bốn hạng mục giao diện lớn (bản đồ, chọn ngày, trang chi tiết khách sạn, lịch giá cho chủ khách sạn).

- **Giữ nguyên:** tông trắng xanh, cấu trúc thư mục, route và phân quyền, luồng dữ liệu (TanStack Query, Zustand, React Hook Form + Zod).
- **Chỉnh sửa:** dọn CSS chồng lớp, đưa màu hard-code về token, thống nhất bộ icon, dùng lại component `Button`, `Input` đã có.
- **Nâng cấp hẳn:** bản đồ ở trang kết quả, date range picker, trang chi tiết khách sạn, lịch tháng chỉnh giá/phòng, `DataTable` dùng chung, biểu đồ và KPI cho dashboard.
- **Cách làm:** mỗi giai đoạn một nhánh riêng, chạy test trước và sau, không đổi chức năng khi đang đổi giao diện.

Tài liệu dựa trên ba nguồn: khảo sát UI/UX các trang booking lớn, báo cáo đọc mã nguồn frontend hiện tại, và các quy tắc thiết kế dashboard 2026. Chưa có bước nào được chạy kiểm tra trực quan trên trình duyệt.

## Hiện trạng frontend

Code nền sạch hơn dự đoán: không có gradient tím, không dùng emoji làm icon, không có ảnh placeholder, và hầu hết trang đã có trạng thái loading, lỗi, rỗng. Vấn đề nằm ở tính nhất quán và ba tính năng còn thiếu.

**Công nghệ:** React 19 + TypeScript + Vite, React Router 7, Tailwind CSS 4 kết hợp CSS thuần (BEM), Phosphor và Lucide cho icon, font Inter. Chưa có thư viện bản đồ, date picker hay biểu đồ.

| Nhóm | Hạng mục | Hành động |
| --- | --- | --- |
| Giữ nguyên | Route, guard theo vai trò, lazy loading, bộ lọc lưu trên URL, `Input`/`Select` có `aria-*`, skip link, gallery dùng `dialog` gốc | Không đụng, chỉ giữ nguyên hành vi |
| Chỉnh sửa | `booking-flow.css` chọn theo class Tailwind và dùng `!important` | Viết lại bằng class có tên rõ nghĩa, bỏ `!important` |
| Chỉnh sửa | Hơn 1.000 chỗ dùng màu Tailwind trực tiếp (`slate-*`, `gray-*`, `blue-*`...) | Chuyển dần sang token, bắt đầu từ trang công khai |
| Chỉnh sửa | Hai bộ icon (Phosphor nạp toàn cục, Lucide import rải rác) | Chọn một bộ |
| Chỉnh sửa | Nút và input viết tay ở nhiều page; style inline ở footer, trang hỗ trợ; alt ảnh chung ở admin | Dùng lại component sẵn có, chuyển inline thành class |
| Nâng cấp hẳn | Trang kết quả chưa có bản đồ | Chia đôi danh sách và bản đồ |
| Nâng cấp hẳn | Ngày dùng `input type="date"` gốc | Date range picker |
| Nâng cấp hẳn | `HotelDetailPage.tsx` dài 549 dòng | Tách file, làm lại gallery, thanh neo, hộp đặt phòng |
| Nâng cấp hẳn | Quỹ phòng và giá chỉ là bảng theo khoảng ngày | Lịch tháng có sửa hàng loạt |
| Nâng cấp hẳn | Hơn 6 bảng admin/owner viết tay, biểu đồ chỉ có `BarList` | `DataTable` chung, biểu đồ xu hướng, KPI có so sánh kỳ trước |

Điểm "hơi AI" còn sót: font Inter và xanh `#2563EB` là mặc định rất phổ biến, và mẫu icon trong ô vuông bo góc có màu ở một số trang. Tông trắng xanh vẫn giữ, chỉ cần chọn sắc xanh và font tiêu đề có chủ đích hơn.

## Bài học từ các trang booking lớn

Ba trang chi tiết mạnh nhất của ngành (Booking.com, Agoda, Airbnb) đều dựa vào cùng một công thức: ô tìm kiếm nổi bật, kết quả có bản đồ, giá tổng minh bạch, và một màu nhấn duy nhất cho hành động chính. Con số pixel dưới đây do các bài phân tích bên thứ ba quan sát và có thể đã thay đổi.

| Trang | Bài học | Áp dụng cho web của bạn |
| --- | --- | --- |
| Trang chủ | 99% người dùng tìm ô đặt phòng ngay khi vào trang, nhưng 30% site không đặt nó làm nội dung chính ([Baymard](https://baymard.com/research-articles/travel-site-ux-best-practices)). Agoda làm mờ nền khi focus và hiện giá ước tính ngay khi nhập. Booking.com đặt chip tìm kiếm phổ biến dưới ô tìm kiếm. | Hero có ảnh thật, ô tìm kiếm pill lớn (điểm đến, ngày nhận, ngày trả, số khách), làm mờ nền khi focus, chip tìm kiếm phổ biến |
| Kết quả tìm kiếm | Chia đôi danh sách và bản đồ cạnh nhau. 70% site mặc định chỉ có danh sách; 65% người dùng ở các site đó không dùng bản đồ ([Baymard](https://baymard.com/research-articles/accommodations-split-view)). Tránh overlay, sidebar lọc dọc, quảng cáo dọc. Cần ít nhất 5–10 bộ lọc đặc thù. | Split view, thanh lọc ngang, lọc giá, sao, điểm đánh giá, tiện nghi, bữa sáng, chính sách hủy, loại giường |
| Chi tiết khách sạn | Airbnb: lưới 5 ảnh (1 lớn, 4 nhỏ), thanh neo (Ảnh, Tiện nghi, Đánh giá, Vị trí), hộp đặt phòng dính bên phải, thanh đặt dính đáy trên mobile. Booking.com: tổng giá cả kỳ hiện ngay, đánh giá ngay dưới bảng phòng, một CTA duy nhất. | Làm đúng như vậy; phòng trên mobile dùng thẻ dọc thay bảng |
| Checkout | Booking.com sạch, làm nổi phần tổng giá. Agoda có đồng hồ đếm ngược và nhiều màu nên gây áp lực ([Snappymob](https://blog.snappymob.com/ui-ux-audit-booking-com-vs-agoda)). Năm 2019 Booking.com phải sửa cách hiển thị thông báo khan hiếm sau can thiệp của Ủy ban Châu Âu. | Một CTA chính dính, tổng giá nổi bật, không dùng đếm ngược hay "chỉ còn 1 phòng" nếu không phải dữ liệu thật |
| Dashboard chủ khách sạn | Booking.com Extranet có lịch giá và phòng ở hai chế độ danh sách và theo tháng, có sửa hàng loạt. KPI cốt lõi: công suất phòng, giá phòng trung bình (ADR), doanh thu trên mỗi phòng (RevPAR). | Lịch tháng, 4–6 thẻ KPI kèm kỳ trước và xu hướng |
| Quản trị viên | Sidebar 240–280px thu gọn được, lưới 12 cột, bảng dữ liệu làm trung tâm; giới hạn menu cấp cao và KPI trong 5–7 mục; phẳng, tương phản cao, bỏ bóng nặng và gradient ([AdminLTE](https://adminlte.io/blog/admin-dashboard-design/)) | `DataTable` chung có lọc, sắp xếp, hành động hàng loạt |

**Nút và card (theo phân tích design system của Airbnb):** ảnh là trung tâm và card không viền không bóng vì ảnh đã đủ nổi; nút yêu thích tròn 32×32px với padding 12px trong ảnh; nút hành động chính tối thiểu 48×48px; trái tim chuyển từ viền sang đặc bằng hiệu ứng ngắn; chỉ một màu nhấn, dùng tiết kiệm cho CTA; chip trắng nhỏ trên ảnh thay vì huy hiệu sặc sỡ ([nguồn](https://open-design.ai/plugins/design-system-airbnb/)).

## Hệ thống thiết kế đề xuất

Bộ token nằm sẵn trong `src/assets/css/variables.css`; việc cần làm là đặt tên theo vai trò và dùng cho triệt để. Các giá trị dưới đây là đề xuất khởi điểm của tài liệu này (không phải số đo từ web của bạn), nên thử trên vài trang rồi chỉnh.

| Nhóm | Token (tên theo vai trò) | Giá trị gợi ý | Ghi chú |
| --- | --- | --- | --- |
| Màu chính | `--color-primary` | `#2563EB` (đang dùng) | Nút chính, link, trạng thái chọn |
| Màu chính | `--color-primary-hover` / `-active` | `#1D4ED8` / `#1E40AF` (đang dùng) | Hover, nhấn |
| Màu chữ | `--color-text`, `--color-text-muted` | Xanh navy rất đậm và xám xanh | Nên thử navy thay đen thuần để hợp tông xanh |
| Nền | `--color-bg`, `--color-surface`, `--color-surface-subtle` | `#F7F8FA` (đang dùng), `#FFFFFF`, xám xanh rất nhạt | Tách vùng bằng nền, hạn chế viền |
| Viền | `--color-border` | Xám xanh nhạt | Chỉ dùng cho input, bảng, đường phân cách |
| Trạng thái | `--color-success`, `--color-warning`, `--color-danger` | Đang có sẵn | Chỉ dùng cho ý nghĩa, không trang trí |
| Điểm nhấn | `--color-accent` (tùy chọn) | Vàng hổ phách | Booking.com dùng vàng `#FEBA02` cho điểm nhấn nhỏ; dùng cho huy hiệu "Ưu đãi", sao đánh giá |
| Chữ | `--font-body`, `--font-heading` | Inter cho nội dung; thử Be Vietnam Pro hoặc Plus Jakarta Sans cho tiêu đề | Kiểm tra dấu tiếng Việt |
| Cỡ chữ | thang 12, 14, 16, 18, 24, 32, 40px |  | Tiêu đề đậm vừa (600–700), không dùng chữ mảnh |
| Bo góc | `--radius-sm` 8px, `--radius-md` 12px, `--radius-lg` 16px, `--radius-full` |  | Nút và input 8px, card 12px, chip và pill tròn hẳn, nút icon tròn 50% |
| Bóng | `--shadow-1` nhẹ, `--shadow-2` card nổi, `--shadow-3` popover/dialog |  | Card trong danh sách có thể không bóng |
| Khoảng cách | bậc 4px: 4, 8, 12, 16, 24, 32, 48 |  | Khoảng giữa các phần lớn hơn khoảng bên trong phần |
| Chuyển động | `--motion-fast` 150ms, `--motion-base` 200ms | `ease-out` | Giữ `prefers-reduced-motion` đã có |

**Quy tắc cho thành phần**

- **Nút chính:** một nút chính mỗi khu vực, cao tối thiểu 48px cho hành động quan trọng (Đặt phòng, Tìm kiếm). Nút phụ dùng viền hoặc nền nhạt.
- **Card khách sạn:** ảnh tỉ lệ cố định, carousel chấm nhỏ, nút yêu thích tròn ở góc, chip trắng nhỏ cho huy hiệu, dưới ảnh là tên, khu vực, điểm đánh giá, giá cho cả kỳ.
- **Ô nhập:** cao đồng nhất, focus có vòng rõ, lỗi hiện dưới ô bằng chữ chứ không chỉ đổi màu.
- **Bảng (`DataTable`):** hàng cao thoải mái, tiêu đề dính khi cuộn, cuộn ngang trên mobile, có trạng thái rỗng/lỗi/đang tải đồng nhất.
- **Hiệu ứng nên có:** làm mờ nền khi focus ô tìm kiếm, trái tim yêu thích chuyển viền sang đặc, hover nâng nhẹ card, skeleton khi tải. **Không nên:** đếm ngược giả, nhấp nháy, parallax nặng.
- **Tương phản:** chữ thường đạt tối thiểu 4.5:1; kiểm tra lại các cặp xám nhạt trên nền trắng.

## Lộ trình tổng quan

Làm nền trước rồi mới đến trang khách hàng, dashboard và rà soát; mỗi chặng chỉ bắt đầu khi cổng kiểm tra của chặng trước đã qua.

&#91;embedded content: lộ trình · 4 chặng, 3 cổng kiểm tra\]

Chặng 2 (tô màu) đáng làm trước nếu thời gian có hạn, vì bản đồ, chọn ngày và trang chi tiết đổi cảm nhận về web rõ nhất. Độ dài mỗi chặng chưa gán vì còn phụ thuộc thời gian bạn có.

## Chi tiết từng giai đoạn

Mỗi giai đoạn là một nhánh riêng, kết thúc khi toàn bộ test xanh và các tiêu chí hoàn thành bên dưới đều đạt. Thư viện được nhắc tên là gợi ý, cần kiểm tra tương thích với React 19 trước khi cài. Cách làm từng bước, kèm code mẫu trước và sau, nằm ở phần Hướng dẫn sửa chi tiết ngay bên dưới.

### Giai đoạn 0. Lưới an toàn

- Tạo nhánh mới, chạy toàn bộ test hiện có và ghi lại kết quả.
- Chụp ảnh màn hình các trang chính của cả ba vai trò để so sánh trước và sau.
- Liệt kê hành vi phải giữ nguyên: route, quyền truy cập, query params của bộ lọc, các mutation đặt phòng và thanh toán.
- **Hoàn thành khi:** có kết quả test gốc và bộ ảnh tham chiếu.

### Giai đoạn 1. Dọn nền: token và CSS

- Bổ sung token còn thiếu trong `variables.css`, đặt tên theo vai trò.
- Viết lại `booking-flow.css`: bỏ selector nhắm vào tổ hợp class Tailwind (`.bg-white.rounded-2xl`, `.shadow-md`) và bỏ `!important`; gắn class có tên rõ nghĩa vào markup.
- Xử lý selector theo cấu trúc Tailwind trong `components.css` (phần admin list).
- Thay màu Tailwind hard-code bằng token, làm theo nhóm trang: công khai và luồng đặt phòng trước, owner và admin sau.
- Chọn Phosphor làm bộ icon duy nhất; chuyển dần các import Lucide.
- Chuyển style inline ở `MainLayout.tsx` (footer), `SupportPage.tsx`, `SupportDetailPage.tsx` thành class.
- **Hoàn thành khi:** `booking-flow.css` không còn `!important` và không còn selector theo class Tailwind; trang công khai không còn màu Tailwind trực tiếp; giao diện không đổi so với ảnh tham chiếu.

### Giai đoạn 2. Component nền

- Dùng lại `Button`, `Input`, `Select` ở những nơi đang tự viết markup.
- Tạo `Card`, `PageHeader`, `EmptyState`, `Skeleton` và `DataTable` (tiêu đề dính, cuộn ngang trên mobile, trạng thái tải/rỗng/lỗi thống nhất).
- Tách footer khỏi `MainLayout.tsx` thành component riêng.
- **Hoàn thành khi:** ít nhất ba trang admin dùng `DataTable`; không còn nút và input viết tay trong các trang đã chuyển.

### Giai đoạn 3. Trang công khai

- **Tìm kiếm (`TravelSearchBar`):** thay `input type="date"` bằng date range picker (gợi ý `react-day-picker`), làm mờ nền khi focus, thêm chip tìm kiếm phổ biến dưới ô tìm kiếm.
- **Trang kết quả (`HotelListPage.tsx`):** chia đôi danh sách và bản đồ (gợi ý `react-leaflet` với OpenStreetMap, miễn phí); thanh lọc ngang; thêm lọc điểm đánh giá, bữa sáng, chính sách hủy, loại giường; card có carousel ảnh và nút yêu thích. Cần xác nhận API đã trả tọa độ khách sạn trước khi làm bản đồ.
- **Trang chi tiết (`HotelDetailPage.tsx`, 549 dòng):** tách thành các khối (`HotelGallery`, `HotelSectionNav`, `RoomList`, `BookingPanel`, `ReviewSection`) mà không đổi logic báo giá và đặt phòng; làm lưới ảnh 1+4, thanh neo, hộp đặt phòng dính bên phải và thanh đặt dính đáy trên mobile, hiện tổng giá cả kỳ.
- **Hoàn thành khi:** trang kết quả có bản đồ phản ứng theo bộ lọc; ô ngày dùng picker; `HotelDetailPage.tsx` dưới 200 dòng và các khối tách có test.

### Giai đoạn 4. Đặt phòng và thanh toán

- Làm lại phần trình bày của `BookingDetailPage.tsx` (305 dòng) và `PaymentResultPage.tsx`: bố cục hai cột, tóm tắt đặt phòng bên phải, tổng giá nổi bật, một CTA chính.
- Giữ nguyên toàn bộ trạng thái thanh toán và hủy; tách các phần hiển thị theo trạng thái.
- **Hoàn thành khi:** luồng từ chọn phòng đến kết quả thanh toán chạy đúng như trước; không có đếm ngược hay thông báo khan hiếm không có dữ liệu thật.

### Giai đoạn 5. Dashboard chủ khách sạn

- **Tổng quan:** 4–6 thẻ KPI (đặt phòng hôm nay, check-in/out, công suất, doanh thu) kèm kỳ trước và xu hướng.
- **Quỹ phòng và giá (`OwnerInventoryPricingPage.tsx`):** lịch tháng có chọn nhiều ngày và sửa hàng loạt, giữ chế độ bảng làm chế độ xem thứ hai.
- **Báo cáo:** thêm biểu đồ xu hướng (gợi ý `recharts`), thay dần `BarList` ở nơi cần.
- **Hoàn thành khi:** chủ khách sạn sửa giá hoặc đóng phòng cho nhiều ngày bằng lịch trong dưới ba thao tác; KPI khớp số liệu từ API.

### Giai đoạn 6. Quản trị viên

- Chuyển các bảng tài khoản, khách sạn, thanh toán, đánh giá, hỗ trợ, khuyến mãi sang `DataTable`.
- Thống nhất `StatusBadge`, bộ lọc và phân trang giữa các trang.
- Sidebar gọn, giới hạn số mục cấp cao trong 5–7 nhóm.
- **Hoàn thành khi:** toàn bộ danh sách admin dùng chung một bảng và một kiểu bộ lọc.

### Giai đoạn 7. Rà soát cuối

- Kiểm tra responsive ở các ngưỡng đang dùng (480, 640, 760, 960, 1180px), bảng cuộn ngang trên mobile.
- Kiểm tra bàn phím và focus, nhãn form của các bộ lọc tự viết, alt ảnh (đặc biệt `AdminReviewDetailPage.tsx`), tương phản màu.
- Đo tốc độ tải trang công khai, tối ưu ảnh.
- **Hoàn thành khi:** không còn lỗi focus/nhãn trong các luồng chính; các trang chính đạt mục tiêu tải đã đặt ra.

## Hướng dẫn sửa chi tiết (có mẫu)

Mỗi hạng mục dưới đây đi theo bốn bước cố định: **Sửa ở đâu** (file), **Sửa thế nào** (các bước đánh số), **Mẫu** (code trước và sau), **Kiểm tra** (cách biết đã xong). Cứ làm lần lượt từ trên xuống, phần nào xong thì tick vào mục "Hoàn thành khi" ở phần Chi tiết từng giai đoạn.

**Lưu ý quan trọng về các mẫu:** tài liệu này được viết từ báo cáo đọc mã nguồn, chưa phải từ việc mở trực tiếp từng file. Vì vậy các mẫu là khung để làm theo, còn tên prop, hook, class và đường dẫn import thực tế trong code của bạn có thể khác. Khi giao cho AI coding, hãy dán mẫu kèm nội dung file thật và yêu cầu nó điều chỉnh cho khớp, không sao chép nguyên văn.

**Quy ước trong các mẫu**

- `// TRƯỚC` là dạng thường gặp hiện nay (minh họa), `// SAU` là dạng cần đạt.
- Chữ trong ngoặc vuông như `[tên-file]`, `[HotelCardProps]` là chỗ bạn thay bằng tên thật.
- Token mới trong CSS dùng tiền tố `--ds-` (design system) để không trùng với namespace màu `--color-*` của Tailwind 4; bảng token ở phần Hệ thống thiết kế vẫn là tên theo vai trò.
- Lệnh tìm kiếm dùng `rg` (ripgrep); nếu chưa cài, dùng tìm kiếm toàn dự án của VS Code với cùng biểu thức.

### Giai đoạn 1: token và CSS

**Bước 1.1. Thêm token mới**

- **Sửa ở đâu:** `src/assets/css/variables.css`.
- **Sửa thế nào:** giữ nguyên các biến đang có, thêm khối mới ở cuối `:root` đặt tên theo vai trò. Các giá trị `#2563EB`, `#1D4ED8`, `#1E40AF`, `#F7F8FA`, `#FFFFFF` là giá trị đang dùng; các giá trị còn lại là gợi ý khởi điểm, chỉnh theo mắt bạn.

```css
/* variables.css: thêm vào cuối :root */
:root {
  /* màu theo vai trò */
  --ds-primary: #2563EB;
  --ds-primary-hover: #1D4ED8;
  --ds-primary-active: #1E40AF;
  --ds-primary-soft: #EFF4FF;       /* nền nhạt: mục đang chọn, chip */
  --ds-text: #0F2A4A;               /* navy đậm thay cho đen thuần */
  --ds-text-muted: #5B6B82;         /* kiểm tra tương phản >= 4.5:1 */
  --ds-bg: #F7F8FA;
  --ds-surface: #FFFFFF;
  --ds-surface-subtle: #F1F5FB;
  --ds-border: #DDE3EC;
  --ds-focus-ring: #93B4F8;

  /* màu trạng thái (có thể trỏ tới các biến thành công/cảnh báo/lỗi đã có) */
  --ds-success: #15803D;
  --ds-success-soft: #DCFCE7;
  --ds-warning: #B45309;
  --ds-warning-soft: #FEF3C7;
  --ds-danger: #B91C1C;
  --ds-danger-soft: #FEE2E2;

  /* bo góc và bóng theo cấp */
  --ds-radius-sm: 8px;              /* nút, input */
  --ds-radius-md: 12px;             /* card */
  --ds-radius-lg: 16px;             /* khối lớn, dialog */
  --ds-shadow-1: 0 1px 2px rgb(15 42 74 / 0.06);
  --ds-shadow-2: 0 4px 12px rgb(15 42 74 / 0.10);
  --ds-shadow-3: 0 12px 32px rgb(15 42 74 / 0.16);

  /* chuyển động */
  --ds-motion-fast: 150ms;
  --ds-motion-base: 200ms;
}
```

- **Kiểm tra:** mở ứng dụng, không có gì đổi (mới chỉ thêm biến). Chạy test.

**Bước 1.2. Nối token vào Tailwind**

- **Sửa ở đâu:** `src/index.css`, khối `@theme` quanh dòng 9.
- **Sửa thế nào:** Tailwind 4 cần `@theme inline` khi giá trị trỏ tới biến khác. Thêm ánh xạ cạnh các dòng đã có để dùng được `bg-primary`, `text-ink`, `border-line`, `rounded-card`.

```css
/* index.css */
@theme inline {
  --color-primary: var(--ds-primary);
  --color-primary-hover: var(--ds-primary-hover);
  --color-primary-soft: var(--ds-primary-soft);
  --color-ink: var(--ds-text);
  --color-ink-muted: var(--ds-text-muted);
  --color-surface: var(--ds-surface);
  --color-surface-subtle: var(--ds-surface-subtle);
  --color-line: var(--ds-border);
  --radius-control: var(--ds-radius-sm);
  --radius-card: var(--ds-radius-md);
}
```

- **Kiểm tra:** thử một phần tử `<div className="bg-primary text-white">` ở trang tạm; thấy màu xanh `#2563EB` là nối đúng. Xóa phần tử thử.

**Bước 1.3. Thay màu Tailwind hard-code bằng token**

- **Sửa ở đâu:** trước hết `src/pages/public`, `src/components/hotels`, `src/components/common`, `src/pages/customer/BookingDetailPage.tsx`. Owner và admin để sau.
- **Sửa thế nào:** dùng bảng thay thế dưới đây. Lưu ý `blue-600/700/800` của Tailwind trùng đúng ba màu xanh đang dùng (`#2563EB`, `#1D4ED8`, `#1E40AF`), nên thay xong giao diện không đổi.

| Cũ (Tailwind) | Mới (token) | Dùng cho |
| --- | --- | --- |
| `text-slate-900`, `text-gray-900` | `text-ink` | Chữ chính |
| `text-slate-500`, `text-gray-500`, `text-gray-600` | `text-ink-muted` | Chữ phụ |
| `bg-white` | `bg-surface` | Nền card, input |
| `bg-slate-50`, `bg-gray-50` | `bg-surface-subtle` | Nền vùng phụ |
| `border-slate-200`, `border-gray-200` | `border-line` | Viền |
| `bg-blue-600` | `bg-primary` | Nền nút chính |
| `hover:bg-blue-700` | `hover:bg-primary-hover` | Hover nút chính |
| `bg-blue-50` | `bg-primary-soft` | Mục đang chọn |
| `rounded-xl`, `rounded-2xl` (card) | `rounded-card` | Bo góc card |
| `rounded-lg` (nút, input) | `rounded-control` | Bo góc điều khiển |

```tsx
// TRƯỚC (minh họa)
<div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
  <h3 className="text-gray-900 font-semibold">Phòng Deluxe</h3>
  <p className="text-gray-500 text-sm">Giường đôi, 28 m²</p>
</div>

// SAU
<div className="bg-surface border border-line rounded-card p-6 shadow-[var(--ds-shadow-1)]">
  <h3 className="text-ink font-semibold">Phòng Deluxe</h3>
  <p className="text-ink-muted text-sm">Giường đôi, 28 m²</p>
</div>
```

- **Kiểm tra:** đếm số chỗ còn sót trong phạm vi đã làm, kết quả phải về 0.

```bash
rg -n "(text|bg|border|ring|from|to)-(slate|gray|zinc|neutral|red|amber|blue|green)-[0-9]+" src/pages/public src/components/hotels src/components/common
```

**Bước 1.4. Viết lại `booking-flow.css`**

- **Sửa ở đâu:** `src/assets/css/booking-flow.css` (selector theo class Tailwind ở dòng 8; `!important` ở dòng 108–129 và 154–155) cùng các file TSX của luồng đặt phòng.
- **Sửa thế nào:**
  1. Mở file, với mỗi rule đang chọn theo tổ hợp `.bg-white.rounded-2xl`, `.shadow-md`, tìm trong TSX phần tử nó nhắm tới (tìm theo class đó).
  2. Đặt cho phần tử đó một class có tên theo vai trò, ví dụ `booking-panel`, `booking-summary`, `booking-step`.
  3. Chuyển nội dung rule sang class mới, dùng token thay vì giá trị cứng.
  4. Gỡ `!important`: nó thường cần vì phần tử vừa có utility Tailwind vừa có rule ghi đè. Bỏ utility xung đột khỏi markup để class mới quyết định.
  5. Giữ vùng bao `.booking-flow` làm scope.

```css
/* TRƯỚC (minh họa) */
.booking-flow .bg-white.rounded-2xl {
  border: 1px solid #e5e7eb !important;
  box-shadow: none !important;
}

/* SAU */
.booking-flow .booking-panel {
  background: var(--ds-surface);
  border: 1px solid var(--ds-border);
  border-radius: var(--ds-radius-md);
  box-shadow: var(--ds-shadow-1);
}
```

```tsx
// TRƯỚC
<div className="bg-white rounded-2xl shadow-md p-6">

// SAU
<section className="booking-panel p-6">
```

- **Kiểm tra:** `rg -n "!important" src/assets/css/booking-flow.css` không còn kết quả; `rg -n "\.bg-|\.rounded-|\.shadow-" src/assets/css/booking-flow.css` không còn kết quả; so ảnh chụp luồng đặt phòng với ảnh gốc ở giai đoạn 0.

**Bước 1.5. Thống nhất bộ icon**

- **Sửa ở đâu:** `src/main.tsx` dòng 4 cho biết Phosphor đang nạp dạng nào; các import Lucide như `src/components/hotels/HotelGalleryDialog.tsx` dòng 1.
- **Sửa thế nào:** liệt kê các chỗ dùng Lucide bằng `rg -n "from 'lucide-react'" src`, rồi đổi từng chỗ theo bảng tên bên dưới. Nếu dòng 4 nạp `@phosphor-icons/web` (font icon) thì dùng thẻ `<i>`; nếu là `@phosphor-icons/react` thì import component.

| Lucide | Phosphor |
| --- | --- |
| `Search` | `MagnifyingGlass` |
| `ChevronLeft`, `ChevronRight`, `ChevronDown` | `CaretLeft`, `CaretRight`, `CaretDown` |
| `Calendar` | `CalendarBlank` |
| `Wifi` | `WifiHigh` |
| `MapPin`, `Star`, `Heart`, `Users`, `Bed`, `X`, `Check` | cùng tên |

```tsx
// TRƯỚC
import { X } from 'lucide-react';
<X size={20} />

// SAU, nếu Phosphor nạp dạng component
import { X } from '@phosphor-icons/react';
<X size={20} weight="regular" />

// SAU, nếu Phosphor nạp dạng font (@phosphor-icons/web)
<i className="ph ph-x" aria-hidden="true" />
```

- **Kiểm tra:** khi hết import Lucide, gỡ gói khỏi `package.json` bằng `npm uninstall lucide-react`, chạy build.

**Bước 1.6. Chuyển style inline thành class**

- **Sửa ở đâu:** `src/components/layouts/MainLayout.tsx` dòng 42 (footer), `src/pages/customer/SupportPage.tsx` dòng 51, `SupportDetailPage.tsx` dòng 28. Không đụng `BarList.tsx` dòng 34 vì độ rộng thanh là giá trị động hợp lý.
- **Sửa thế nào:** chép các thuộc tính trong `style={{ ... }}` sang một class trong `layout.css` (footer) hoặc dùng utility Tailwind tương đương.

```tsx
// TRƯỚC (minh họa)
<div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>

// SAU
<div className="mx-auto max-w-[1200px] px-4 py-8">
```

- **Kiểm tra:** `rg -n "style=\{\{" src/components/layouts src/pages/customer` chỉ còn các giá trị động.

### Giai đoạn 2: component nền

**Bước 2.1. Dùng lại `Button`, `Input`, `Select` thay cho markup viết tay**

- **Sửa ở đâu:** `src/components/common/Button.tsx` (đã có), các page còn nút và input tự viết như `OwnerBookingsPage.tsx` dòng 146 và các bộ lọc của admin.
- **Sửa thế nào:**
  1. Mở `Button.tsx`, kiểm tra đã có đủ biến thể `primary`, `secondary`, `ghost` và kích thước chưa. Thiếu thì thêm, dùng token ở giai đoạn 1.
  2. Tìm nút viết tay bằng lệnh bên dưới, đổi từng chỗ sang `<Button>`.
  3. Làm tương tự với `<input>` và `<select>` tự khai báo: chuyển sang `Input`, `Select` để có sẵn label, lỗi và `aria-*`.

```tsx
// Button.tsx: bảng biến thể gợi ý (màu lỗi dùng token sẵn có trong variables.css)
const variants = {
  primary: 'bg-primary text-white hover:bg-primary-hover',
  secondary: 'bg-surface text-ink border border-line hover:bg-surface-subtle',
  ghost: 'text-primary hover:bg-primary-soft',
} as const;

const sizes = {
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',   // nút quan trọng: Đặt phòng, Tìm kiếm
} as const;
```

```tsx
// TRƯỚC
<button className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        disabled={isPending} onClick={onSave}>Lưu</button>

// SAU
<Button variant="primary" disabled={isPending} onClick={onSave}>Lưu</Button>
```

```bash
rg -n "<button" src/pages src/components --glob "!src/components/common/**"
rg -n "<input|<select|<textarea" src/pages
```

- **Kiểm tra:** số kết quả của hai lệnh giảm dần; nút giữ nguyên hành vi (bấm, vô hiệu khi đang gửi).

**Bước 2.2. Tạo `Card`, `PageHeader`, `EmptyState`**

- **Sửa ở đâu:** tạo ba file mới trong `src/components/common/` (nếu thư mục có `index.ts` thì thêm dòng export).
- **Sửa thế nào:** chép các mẫu sau, rồi thay dần các khối `div` có `bg-white border rounded` và các tiêu đề trang tự viết.

```tsx
// src/components/common/Card.tsx
import type { HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  padded?: boolean;
  interactive?: boolean;
};

export function Card({ padded = true, interactive = false, className = '', ...props }: CardProps) {
  return (
    <div
      className={[
        'bg-surface border border-line rounded-card',
        padded ? 'p-5' : '',
        interactive ? 'transition-shadow duration-200 hover:shadow-[var(--ds-shadow-2)]' : '',
        className,
      ].join(' ')}
      {...props}
    />
  );
}
```

```tsx
// src/components/common/PageHeader.tsx
import type { ReactNode } from 'react';

type PageHeaderProps = { title: string; description?: string; actions?: ReactNode };

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-ink">{title}</h1>
        {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
```

```tsx
// src/components/common/EmptyState.tsx
import type { ReactNode } from 'react';

type EmptyStateProps = { title: string; description?: string; action?: ReactNode };

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {description && <p className="max-w-md text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
```

- **Kiểm tra:** áp dụng thử ở một trang, so ảnh với bản gốc; tiêu đề trang chỉ có một `h1`.

**Bước 2.3. Tạo `DataTable` dùng chung**

- **Sửa ở đâu:** file mới `src/components/common/DataTable.tsx`.
- **Sửa thế nào:** chép mẫu. Bảng xử lý sẵn ba trạng thái (đang tải, lỗi, rỗng) nên các page không phải tự viết lại. Tiêu đề chỉ dính khi bảng có chiều cao giới hạn, vì vậy vùng bao dùng `max-h-[70vh] overflow-auto`. Muốn mở chi tiết một dòng thì đặt `Link` trong ô đầu tiên (bàn phím truy cập được) thay vì gắn `onClick` lên cả hàng.

```tsx
// src/components/common/DataTable.tsx
import type { ReactNode } from 'react';
import { EmptyState } from './EmptyState';

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: 'left' | 'right';
};

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[] | undefined;
  getRowKey: (row: T) => string | number;
  caption: string;          // đọc cho trình đọc màn hình
  isLoading?: boolean;
  error?: string | null;
  emptyTitle?: string;
};

function TableSkeleton({ columns }: { columns: number }) {
  return (
    <div className="rounded-card border border-line bg-surface p-4" aria-busy="true">
      {Array.from({ length: 5 }).map((_, r) => (
        <div key={r} className="grid gap-4 py-3" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((__, c) => (
            <div key={c} className="h-4 animate-pulse rounded bg-surface-subtle" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function DataTable<T>({
  columns, rows, getRowKey, caption, isLoading, error, emptyTitle = 'Chưa có dữ liệu',
}: DataTableProps<T>) {
  if (isLoading) return <TableSkeleton columns={columns.length} />;
  if (error) return <div role="alert" className="rounded-card border border-line bg-surface p-4 text-sm">{error}</div>;
  if (!rows || rows.length === 0) return <EmptyState title={emptyTitle} />;

  return (
    <div className="max-h-[70vh] overflow-auto rounded-card border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 bg-surface-subtle text-ink-muted">
          <tr>
            {columns.map(c => (
              <th key={c.key} scope="col"
                  className={'px-4 py-3 font-medium ' + (c.align === 'right' ? 'text-right' : '')}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(row => (
            <tr key={getRowKey(row)} className="hover:bg-surface-subtle">
              {columns.map(c => (
                <td key={c.key} className={'px-4 py-3 ' + (c.align === 'right' ? 'text-right' : '')}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- **Kiểm tra:** đặt `DataTable` thử ở một trang admin với ba trạng thái (giả lập tải, lỗi, rỗng); bảng cuộn ngang được ở 360px. Việc thay bảng thật ở các trang admin làm ở Giai đoạn 6.

### Giai đoạn 3A: ô tìm kiếm và chọn ngày

**Bước 3A.1. Cài date picker và viết hàm đổi ngày an toàn múi giờ**

- **Sửa ở đâu:** terminal ở thư mục frontend; file mới `src/lib/dates.ts`.
- **Sửa thế nào:** cài thư viện (kiểm tra bản đang cài hỗ trợ React 19 trước khi chốt), rồi thêm hai hàm đổi ngày. Không dùng `toISOString()` cho ngày nhập phòng: ở múi giờ UTC+7 nó có thể lùi về ngày hôm trước.

```bash
npm i react-day-picker
```

```ts
// src/lib/dates.ts
export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
```

- **Kiểm tra:** chọn ngày 5/10 thì `toIso` trả `2026-10-05`, không phải `2026-10-04`.

**Bước 3A.2. Tạo `DateRangeField`**

- **Sửa ở đâu:** file mới `src/components/common/DateRangeField.tsx`.
- **Sửa thế nào:** chép mẫu. Component tự đóng khi bấm ra ngoài hoặc nhấn `Esc`, hiện một tháng trên màn hình hẹp và hai tháng trên màn hình rộng, không cho chọn ngày đã qua. Dòng import icon đổi theo cách Phosphor đang được nạp (xem bước 1.5).

```tsx
// src/components/common/DateRangeField.tsx
import { useEffect, useRef, useState } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import { vi } from 'react-day-picker/locale';
import 'react-day-picker/style.css';
import { CalendarBlank } from '@phosphor-icons/react';   // đổi theo bước 1.5

type Props = {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  label?: string;
};

const fmt = (d?: Date) =>
  d ? d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) : 'Chọn ngày';

export function DateRangeField({ value, onChange, label = 'Nhận phòng - Trả phòng' }: Props) {
  const [open, setOpen] = useState(false);
  const [wide] = useState(() => window.matchMedia('(min-width: 768px)').matches);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(o => !o)}
        className="flex h-14 w-full items-center gap-3 px-4 text-left"
      >
        <CalendarBlank size={20} aria-hidden="true" />
        <span className="flex flex-col">
          <span className="text-xs text-ink-muted">{label}</span>
          <span className="text-sm font-medium text-ink">
            {fmt(value?.from)} - {fmt(value?.to)}
          </span>
        </span>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={label}
          className="absolute left-0 top-full z-40 mt-2 rounded-card border border-line bg-surface p-3 shadow-[var(--ds-shadow-3)]"
        >
          <DayPicker
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={wide ? 2 : 1}
            locale={vi}
            disabled={{ before: new Date() }}
          />
        </div>
      )}
    </div>
  );
}
```

- **Kiểm tra:** mở bằng bàn phím (Tab rồi Enter), đóng bằng `Esc`, chọn khoảng ngày hiện đúng trên nút.

**Bước 3A.3. Thay hai `input type="date"` trong `TravelSearchBar`**

- **Sửa ở đâu:** `src/components/hotels/TravelSearchBar.tsx`.
- **Sửa thế nào:** giữ nguyên state dạng chuỗi và cách ghép query string hiện có (để bộ lọc trên URL và trang kết quả không bị ảnh hưởng); chỉ đổi phần nhập.

```tsx
// TRƯỚC (minh họa)
<input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)} />
<input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)} />

// SAU
import { useMemo } from 'react';
import { DateRangeField } from '../common/DateRangeField';
import { fromIso, toIso } from '../../lib/dates';

const range = useMemo(
  () => ({
    from: checkIn ? fromIso(checkIn) : undefined,
    to: checkOut ? fromIso(checkOut) : undefined,
  }),
  [checkIn, checkOut],
);

<DateRangeField
  value={range}
  onChange={r => {
    setCheckIn(r?.from ? toIso(r.from) : '');
    setCheckOut(r?.to ? toIso(r.to) : '');
  }}
/>
```

- **Kiểm tra:** bấm Tìm kiếm thì URL `/hotels?...` có đúng tên tham số ngày như trước đây; tải lại trang thì ô ngày hiện đúng khoảng đã chọn.

**Bước 3A.4. Dáng pill, làm mờ nền khi focus, chip tìm kiếm phổ biến**

- **Sửa ở đâu:** vẫn `TravelSearchBar.tsx`, và `HomePage.tsx` nếu chip đặt ở trang chủ.
- **Sửa thế nào:** bọc toàn bộ ô tìm kiếm trong một `form` dạng pill, bật cờ `active` khi có phần tử bên trong nhận focus và rời đi, vẽ lớp mờ phía sau. Chip lấy từ danh sách điểm đến mà trang chủ đã tải, không gõ cứng.

```tsx
const [active, setActive] = useState(false);

<>
  {active && <div className="fixed inset-0 z-20 bg-black/30" aria-hidden="true" />}

  <form
    onFocusCapture={() => setActive(true)}
    onBlurCapture={e => {
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setActive(false);
    }}
    onSubmit={handleSubmit}   // giữ nguyên hàm submit hiện có
    className="relative z-30 mx-auto grid max-w-4xl grid-cols-1 divide-y divide-line rounded-[28px] border border-line bg-surface shadow-[var(--ds-shadow-2)] md:grid-cols-[1.4fr_1.2fr_1fr_auto] md:divide-x md:divide-y-0"
  >
    {/* ô điểm đến (Combobox sẵn có) | DateRangeField | GuestPicker sẵn có */}
    <Button type="submit" size="lg" className="m-2 rounded-full px-8">Tìm</Button>
  </form>
</>

{/* chip phổ biến, dùng dữ liệu điểm đến đã có */}
<ul className="mt-4 flex flex-wrap justify-center gap-2">
  {destinations.slice(0, 5).map(d => (
    <li key={d.id}>
      <button type="button" onClick={() => pickDestination(d)}
              className="rounded-full bg-surface px-3 py-1.5 text-sm text-ink border border-line hover:bg-primary-soft">
        {d.name}
      </button>
    </li>
  ))}
</ul>
```

- **Kiểm tra:** bấm vào ô tìm kiếm thì nền mờ đi, bấm ra ngoài thì hết mờ; bấm chip thì ô điểm đến được điền; trên 360px các ô xếp dọc, không tràn ngang.

### Giai đoạn 3B: trang kết quả, bản đồ và bộ lọc ngang

**Bước 3B.1. Kiểm tra dữ liệu tọa độ trước khi làm bản đồ**

- **Sửa ở đâu:** chưa sửa gì, chỉ kiểm tra `src/features/hotels` (kiểu dữ liệu, hàm gọi API) và phản hồi thật của API danh sách khách sạn.
- **Sửa thế nào:** tìm xem khách sạn đã có vĩ độ và kinh độ chưa.

```bash
rg -n "latitude|longitude|lat\b|lng\b" src/features src/types
```

- **Kiểm tra:** nếu API đã trả hai số này thì làm tiếp. Nếu chưa, dừng lại và bổ sung ở backend (thêm hai trường vào bảng khách sạn và vào phản hồi danh sách); làm bản đồ trước khi có dữ liệu là làm vô ích.

**Bước 3B.2. Cài bản đồ**

- **Sửa ở đâu:** terminal ở thư mục frontend.
- **Sửa thế nào:** dùng Leaflet với bản đồ nền OpenStreetMap. Kiểm tra bản `react-leaflet` đang cài hỗ trợ React 19. Bản đồ nền miễn phí của OpenStreetMap có quy định sử dụng: bắt buộc ghi nguồn (mẫu bên dưới đã có) và không phù hợp cho lưu lượng lớn; khi web đông người, chuyển sang nhà cung cấp ô bản đồ riêng.

```bash
npm i leaflet react-leaflet
npm i -D @types/leaflet
```

**Bước 3B.3. Tạo `HotelsMap`**

- **Sửa ở đâu:** file mới `src/components/hotels/HotelsMap.tsx`, thêm CSS của nhãn giá vào `src/assets/css/components.css`.
- **Sửa thế nào:** marker dạng nhãn giá (dùng `divIcon`, không cần ảnh marker mặc định vốn hay lỗi với bundler). Chỉ truyền vào chuỗi giá đã định dạng, vì nhãn được chèn dưới dạng HTML.

```tsx
// src/components/hotels/HotelsMap.tsx
import { useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapHotel = {
  id: string | number;
  name: string;
  lat: number;
  lng: number;
  priceLabel: string;      // ví dụ '1.250.000 đ', đã định dạng sẵn
};

type Props = {
  hotels: MapHotel[];
  activeId: string | number | null;
  onSelect: (id: string | number) => void;
};

const priceIcon = (label: string, active: boolean) =>
  L.divIcon({
    className: '',
    html: `<span class="map-price${active ? ' map-price--active' : ''}">${label}</span>`,
    iconSize: [0, 0],
  });

function FitBounds({ hotels }: { hotels: MapHotel[] }) {
  const map = useMap();
  useEffect(() => {
    if (hotels.length === 0) return;
    const bounds = L.latLngBounds(hotels.map(h => [h.lat, h.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [hotels, map]);
  return null;
}

export function HotelsMap({ hotels, activeId, onSelect }: Props) {
  return (
    <MapContainer center={[16.05, 108.2]} zoom={6} className="h-full w-full rounded-card" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds hotels={hotels} />
      {hotels.map(h => (
        <Marker
          key={h.id}
          position={[h.lat, h.lng]}
          icon={priceIcon(h.priceLabel, h.id === activeId)}
          eventHandlers={{ click: () => onSelect(h.id) }}
          title={h.name}
        />
      ))}
    </MapContainer>
  );
}
```

```css
/* components.css */
.map-price {
  display: inline-block;
  transform: translate(-50%, -100%);
  padding: 4px 10px;
  border: 1px solid var(--ds-border);
  border-radius: 9999px;
  background: var(--ds-surface);
  color: var(--ds-text);
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  box-shadow: var(--ds-shadow-2);
}
.map-price--active {
  background: var(--ds-primary);
  border-color: var(--ds-primary);
  color: #fff;
}
```

- **Kiểm tra:** render thử `HotelsMap` với hai khách sạn giả; thấy hai nhãn giá đúng vị trí, bản đồ tự thu phóng để chứa cả hai.

**Bước 3B.4. Chia đôi danh sách và bản đồ trong `HotelListPage`**

- **Sửa ở đâu:** `src/pages/public/HotelListPage.tsx`.
- **Sửa thế nào:**
  1. Thêm hook đo kích thước màn hình (mẫu đầu) để chỉ dựng bản đồ khi cần. Dựng Leaflet trong vùng đang ẩn sẽ ra bản đồ bị méo.
  2. Bọc danh sách và bản đồ vào lưới hai cột ở màn hình rộng. Trên desktop không dùng overlay (nghiên cứu Baymard ghi nhận overlay làm người dùng bỏ sót chức năng sắp xếp); trên điện thoại dùng nút "Bản đồ" mở màn hình bản đồ riêng.
  3. Giữ nguyên toàn bộ logic lọc, sắp xếp, phân trang và query params hiện có. Bản đồ chỉ nhận danh sách khách sạn của trang đang xem.
  4. Nối thẻ và nhãn giá: rê chuột lên thẻ thì nhãn giá sáng lên; bấm nhãn giá thì cuộn tới thẻ.

```tsx
// hook dùng chung: src/hooks/useMediaQuery.ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatches(m.matches);
    m.addEventListener('change', on);
    return () => m.removeEventListener('change', on);
  }, [query]);
  return matches;
}
```

```tsx
// HotelListPage.tsx: phần mới, đặt quanh danh sách hiện có
const isDesktop = useMediaQuery('(min-width: 1024px)');
const [activeId, setActiveId] = useState<string | number | null>(null);
const [showMap, setShowMap] = useState(false);

const mapHotels: MapHotel[] = hotels
  .filter(h => h.latitude != null && h.longitude != null)       // tên trường theo API thật
  .map(h => ({
    id: h.id,
    name: h.name,
    lat: h.latitude,
    lng: h.longitude,
    priceLabel: formatPrice(h.minPrice),                          // hàm định dạng giá sẵn có
  }));

const scrollToCard = (id: string | number) => {
  setActiveId(id);
  document.getElementById(`hotel-${id}`)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
};

return (
  <div className="mx-auto max-w-[1400px] px-4">
    {/* thanh lọc ngang: bước 3B.5 */}

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <ul className="grid gap-4">
        {hotels.map(h => (
          <li key={h.id} id={`hotel-${h.id}`} onMouseEnter={() => setActiveId(h.id)}>
            <HotelCard hotel={h} />
          </li>
        ))}
      </ul>

      {isDesktop && (
        <aside className="sticky top-20 h-[calc(100vh-6rem)] isolate">
          <HotelsMap hotels={mapHotels} activeId={activeId} onSelect={scrollToCard} />
        </aside>
      )}
    </div>

    {!isDesktop && (
      <>
        <Button className="fixed bottom-4 left-1/2 z-30 -translate-x-1/2" onClick={() => setShowMap(true)}>
          Bản đồ
        </Button>
        {showMap && (
          <div className="fixed inset-0 z-40 bg-surface isolate">
            <Button variant="secondary" className="absolute left-3 top-3 z-[1000]" onClick={() => setShowMap(false)}>
              Đóng
            </Button>
            <HotelsMap hotels={mapHotels} activeId={activeId} onSelect={setActiveId} />
          </div>
        )}
      </>
    )}
  </div>
);
```

- **Kiểm tra:** lọc hoặc đổi trang thì bản đồ đổi theo; `isolate` giữ bản đồ không đè lên thanh điều hướng khi cuộn; khách sạn thiếu tọa độ vẫn hiện trong danh sách nhưng không có nhãn giá; đổi kích thước cửa sổ qua ngưỡng 1024px không báo lỗi.

**Bước 3B.5. Thanh lọc ngang thay sidebar lọc**

- **Sửa ở đâu:** `HotelListPage.tsx` (khối bộ lọc hiện có), file mới `src/components/hotels/FilterChip.tsx`.
- **Sửa thế nào:** đưa các bộ lọc thông dụng lên một hàng chip cuộn ngang, các bộ lọc ít dùng vào nút "Tất cả bộ lọc" mở ngăn trượt. Trạng thái lọc vẫn nằm trên URL như hiện nay. Tên tham số trong mẫu chỉ là ví dụ: dùng đúng tên đang có trong `HotelListPage.tsx`. Các bộ lọc chưa có (điểm đánh giá, bữa sáng, chính sách hủy, loại giường) chỉ hoạt động khi API hỗ trợ lọc theo chúng, nên kiểm tra phía backend trước.

```tsx
// src/components/hotels/FilterChip.tsx
import type { ReactNode } from 'react';

type Props = { pressed: boolean; onClick: () => void; children: ReactNode };

export function FilterChip({ pressed, onClick, children }: Props) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={[
        'h-10 shrink-0 rounded-full border px-4 text-sm transition-colors duration-150',
        pressed
          ? 'border-primary bg-primary-soft text-primary'
          : 'border-line bg-surface text-ink hover:bg-surface-subtle',
      ].join(' ')}
    >
      {children}
    </button>
  );
}
```

```tsx
// HotelListPage.tsx
import { useSearchParams } from 'react-router-dom';

const [params, setParams] = useSearchParams();

const toggle = (key: string, value: string) => {
  const next = new URLSearchParams(params);
  if (next.get(key) === value) next.delete(key);
  else next.set(key, value);
  next.delete('page');                       // đổi bộ lọc thì về trang 1
  setParams(next, { replace: true });
};

<div className="flex gap-2 overflow-x-auto py-3" role="group" aria-label="Bộ lọc nhanh">
  <FilterChip pressed={params.get('freeCancel') === '1'} onClick={() => toggle('freeCancel', '1')}>
    Hủy miễn phí
  </FilterChip>
  <FilterChip pressed={params.get('breakfast') === '1'} onClick={() => toggle('breakfast', '1')}>
    Có bữa sáng
  </FilterChip>
  <FilterChip pressed={params.get('rating') === '8'} onClick={() => toggle('rating', '8')}>
    Đánh giá từ 8 trở lên
  </FilterChip>
  <Button variant="secondary" onClick={() => setFiltersOpen(true)}>Tất cả bộ lọc</Button>
</div>
```

- **Kiểm tra:** bấm chip thì URL đổi và danh sách lọc đúng; tải lại trang chip vẫn sáng đúng; Tab qua các chip và Enter để bật tắt được; bấm "Quay lại" của trình duyệt trả về đúng trạng thái trước.

### Giai đoạn 3C: trang chi tiết khách sạn

**Bước 3C.1. Vẽ bản đồ ranh giới của file 549 dòng trước khi cắt**

- **Sửa ở đâu:** chỉ đọc `src/pages/public/HotelDetailPage.tsx`, chưa sửa.
- **Sửa thế nào:** đánh dấu (bằng comment tạm) các vùng của file để biết cắt ở đâu. Nguyên tắc: phần gọi API và tính báo giá ở lại page hoặc vào một hook; phần chỉ hiển thị chuyển thành component nhận props.

```text
Vùng A  khai báo hook, useQuery, state           -> ở lại page (hoặc chuyển vào hook useHotelBooking)
Vùng B  tính toán: nights, tổng tiền, quote      -> ở lại page hoặc hook; KHÔNG chuyển vào component hiển thị
Vùng C  JSX gallery                              -> HotelGallery
Vùng D  JSX điều hướng theo phần                 -> HotelSectionNav
Vùng E  JSX danh sách phòng (RoomOffer)          -> RoomList
Vùng F  JSX hộp đặt phòng                        -> BookingPanel
Vùng G  JSX đánh giá, tiện nghi, vị trí          -> giữ hoặc tách sau
```

- **Kiểm tra:** ghi lại ba kịch bản báo giá để so sánh sau khi tách: 1 phòng 1 đêm; 2 loại phòng khác nhau 3 đêm; trường hợp có khuyến mãi hoặc hết phòng (nếu hệ thống hỗ trợ). Ghi tổng tiền hiển thị của từng kịch bản.

**Bước 3C.2. Tách từng khối, mỗi lần một khối**

- **Sửa ở đâu:** `HotelDetailPage.tsx`, tạo thư mục mới `src/components/hotels/detail/`.
- **Sửa thế nào:** lặp lại cho từng khối: (1) tạo file mới, dán nguyên JSX của vùng đó; (2) mọi biến mà JSX dùng thành props; (3) trong page thay JSX cũ bằng thẻ component mới; (4) chạy build và test; (5) commit. Không sửa logic trong lúc tách.

```tsx
// TRƯỚC (trong HotelDetailPage.tsx, khoảng 120 dòng)
<section id="rooms">
  <h2>Chọn phòng</h2>
  {rooms.map(room => (
    /* ... dùng selection, setSelection, quote ... */
  ))}
</section>

// SAU
<RoomList rooms={rooms} selection={selection} onChangeQuantity={setQuantity} />
```

```text
src/pages/public/HotelDetailPage.tsx          còn khoảng 150 dòng: lấy dữ liệu + ghép các khối
src/components/hotels/detail/
  HotelGallery.tsx
  HotelSectionNav.tsx
  RoomList.tsx
  BookingPanel.tsx
```

- **Kiểm tra:** sau mỗi khối tách, giao diện và ba kịch bản báo giá không đổi; `HotelDetailPage.tsx` giảm dần về dưới 200 dòng.

**Bước 3C.3. Lưới ảnh một lớn bốn nhỏ**

- **Sửa ở đâu:** `src/components/hotels/detail/HotelGallery.tsx`; kiểm tra `HotelGalleryDialog.tsx` có nhận chỉ số ảnh bắt đầu chưa, chưa có thì thêm prop `startIndex`.
- **Sửa thế nào:** trên desktop dùng lưới 4 cột, 2 hàng (ảnh chính chiếm 2×2, bốn ảnh nhỏ), trên mobile chỉ hiện ảnh chính. Có xử lý trường hợp ít hơn năm ảnh hoặc chưa có ảnh.

```tsx
// src/components/hotels/detail/HotelGallery.tsx
import { Button } from '../../common/Button';

type Img = { id: string | number; url: string };
type Props = { name: string; images: Img[]; onOpen: (index: number) => void };

export function HotelGallery({ name, images, onOpen }: Props) {
  if (images.length === 0) {
    return <div className="grid h-64 place-items-center rounded-card bg-surface-subtle text-ink-muted">Chưa có ảnh</div>;
  }
  const [main, ...rest] = images;
  const side = rest.slice(0, 4);

  return (
    <div id="photos" className="relative grid gap-2 overflow-hidden rounded-card md:h-[420px] md:grid-cols-4 md:grid-rows-2">
      <button type="button" onClick={() => onOpen(0)}
              className={'h-64 md:h-auto ' + (side.length > 0 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-4 md:row-span-2')}>
        <img src={main.url} alt={`${name}, ảnh chính`} className="h-full w-full object-cover" />
      </button>

      {side.map((img, i) => (
        <button key={img.id} type="button" onClick={() => onOpen(i + 1)} className="hidden md:block">
          <img src={img.url} alt={`${name}, ảnh ${i + 2}`} className="h-full w-full object-cover" />
        </button>
      ))}

      <Button variant="secondary" className="absolute bottom-3 right-3" onClick={() => onOpen(0)}>
        Xem tất cả {images.length} ảnh
      </Button>
    </div>
  );
}
```

- **Kiểm tra:** thử với 0, 1, 3 và 8 ảnh; bấm ảnh nào thì hộp xem ảnh mở đúng ảnh đó; ở 360px chỉ hiện một ảnh lớn và nút xem tất cả.

**Bước 3C.4. Thanh điều hướng theo phần, dính khi cuộn**

- **Sửa ở đâu:** file mới `HotelSectionNav.tsx`; thêm `id` và `scroll-mt-28` cho từng `section` trong page; `src/assets/css/base.css` (hoặc file CSS nền đang dùng) cho cuộn mượt.
- **Sửa thế nào:** giá trị `top-16` phải bằng chiều cao thanh điều hướng chính; đo lại rồi chỉnh. Mục nào của trang chưa có thì bỏ khỏi danh sách.

```tsx
// src/components/hotels/detail/HotelSectionNav.tsx
const SECTIONS = [
  { id: 'photos', label: 'Ảnh' },
  { id: 'rooms', label: 'Phòng' },
  { id: 'amenities', label: 'Tiện nghi' },
  { id: 'reviews', label: 'Đánh giá' },
  { id: 'location', label: 'Vị trí' },
];

export function HotelSectionNav() {
  return (
    <nav aria-label="Các phần của trang" className="sticky top-16 z-20 -mx-4 border-b border-line bg-surface px-4">
      <ul className="flex gap-6 overflow-x-auto">
        {SECTIONS.map(s => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="block py-3 text-sm text-ink-muted hover:text-ink">{s.label}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

```css
/* base.css */
html { scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
```

```tsx
// trong page: mỗi phần có id khớp với thanh điều hướng
<section id="rooms" className="scroll-mt-28"> ... </section>
```

- **Kiểm tra:** bấm từng mục thì cuộn tới đúng phần và tiêu đề phần không bị thanh dính che.

**Bước 3C.5. Hộp đặt phòng dính bên phải và thanh đặt dính đáy trên mobile**

- **Sửa ở đâu:** `BookingPanel.tsx` (mới), bố cục hai cột trong `HotelDetailPage.tsx`.
- **Sửa thế nào:** `BookingPanel` chỉ hiển thị, nhận sẵn số liệu đã tính từ page (không tự tính báo giá). Cột phải chỉ dính được khi không có tổ tiên nào đặt `overflow: hidden`; nếu hộp không dính, tìm và gỡ `overflow-hidden` ở các thẻ bao ngoài.

```tsx
// src/components/hotels/detail/BookingPanel.tsx
import { Button } from '../../common/Button';
import { Card } from '../../common/Card';

type Line = { id: string | number; name: string; qty: number; amount: string };
type Props = {
  nights: number;
  total: string;                 // đã định dạng, là tổng cho cả kỳ lưu trú
  lines: Line[];
  policyLabel?: string;          // ví dụ dòng chính sách hủy lấy từ dữ liệu thật
  canBook: boolean;
  isQuoting: boolean;
  onBook: () => void;
};

export function BookingPanel({ nights, total, lines, policyLabel, canBook, isQuoting, onBook }: Props) {
  return (
    <Card className="shadow-[var(--ds-shadow-2)]">
      <p className="text-sm text-ink-muted">Tổng cho {nights} đêm</p>
      <p className="text-2xl font-semibold text-ink" aria-live="polite">{isQuoting ? 'Đang tính giá...' : total}</p>

      {lines.length > 0 && (
        <ul className="mt-3 divide-y divide-line text-sm">
          {lines.map(l => (
            <li key={l.id} className="flex justify-between gap-3 py-2">
              <span>{l.name} × {l.qty}</span>
              <span>{l.amount}</span>
            </li>
          ))}
        </ul>
      )}

      {policyLabel && <p className="mt-3 text-xs text-ink-muted">{policyLabel}</p>}

      <Button size="lg" className="mt-4 w-full" disabled={!canBook || isQuoting} onClick={onBook}>
        Đặt phòng
      </Button>
    </Card>
  );
}
```

```tsx
// HotelDetailPage.tsx: bố cục hai cột
<div className="grid gap-8 pb-24 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-0">
  <div className="grid gap-10">
    <RoomList ... />
    {/* tiện nghi, đánh giá, vị trí */}
  </div>

  <aside className="hidden lg:sticky lg:top-28 lg:block lg:self-start">
    <BookingPanel {...panelProps} />
  </aside>
</div>

{/* thanh đặt dính đáy trên mobile */}
<div className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-line bg-surface px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
  <div>
    <p className="text-xs text-ink-muted">Tổng {nights} đêm</p>
    <p className="font-semibold text-ink">{total}</p>
  </div>
  <Button size="lg" disabled={!canBook || isQuoting} onClick={onBook}>Đặt phòng</Button>
</div>
```

- **Kiểm tra:** cuộn trang dài thì hộp bên phải đứng yên trong khung nhìn; đổi số phòng thì tổng tiền cập nhật và khớp đúng ba kịch bản đã ghi ở bước 3C.1; trên 360px thanh đáy không che nội dung cuối trang; tổng hiển thị là tổng cả kỳ lưu trú, không chỉ giá mỗi đêm.

### Giai đoạn 4: đặt phòng và thanh toán

**Bước 4.1. Lập bảng trạng thái đặt phòng trước khi đổi giao diện**

- **Sửa ở đâu:** chỉ đọc `src/pages/customer/BookingDetailPage.tsx` (305 dòng) và `PaymentResultPage.tsx`.
- **Sửa thế nào:** tìm mọi chỗ kiểm tra trạng thái và ghi ra bảng: mỗi trạng thái hiển thị gì và có nút hành động nào. Bảng này là "hợp đồng" để sau khi đổi giao diện không ai mất nút hay hiện nhầm nút.

```bash
rg -n "status ===|status !==|case '" src/pages/customer/BookingDetailPage.tsx src/pages/customer/PaymentResultPage.tsx
```

| Trạng thái (điền theo code thật) | Hiển thị | Nút hành động |
| --- | --- | --- |
| \[chờ thanh toán\] | \[thông tin, hạn thanh toán nếu có\] | \[Thanh toán\], \[Hủy\] |
| \[đã xác nhận\] | \[thông tin, mã đặt phòng\] | \[Hủy nếu còn cho phép\] |
| \[hoàn thành\] | \[thông tin\] | \[Viết đánh giá\] |
| \[đã hủy\] | \[lý do, hoàn tiền nếu có\] | không |

- **Kiểm tra:** bảng khớp với code; sau khi đổi giao diện, duyệt lại từng dòng của bảng bằng dữ liệu thử.

**Bước 4.2. Tách phần hiển thị, giữ nguyên mutation**

- **Sửa ở đâu:** `BookingDetailPage.tsx`, file mới trong `src/components/bookings/`.
- **Sửa thế nào:** giữ nguyên `useQuery`, `useMutation` và các hàm thanh toán, hủy ở page. Tách hai khối trình bày: `BookingSummary` (cột phải: khách sạn, phòng, ngày, tổng tiền) và `BookingActions` (khối hành động theo trạng thái). Dùng lại cách tách ở bước 3C.2: dán JSX, biến thành props, build, test, commit.

```tsx
// BookingDetailPage.tsx: dạng sau khi tách
return (
  <div className="booking-flow mx-auto max-w-5xl px-4 py-8">
    <PageHeader title={`Đặt phòng ${booking.code}`} description={statusLabel} />

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="grid gap-6">
        <BookingActions booking={booking} onPay={pay} onCancel={cancel} isPaying={isPaying} />
        {/* thông tin khách, yêu cầu đặc biệt, đánh giá theo trạng thái */}
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <BookingSummary booking={booking} />
      </aside>
    </div>
  </div>
);
```

- **Kiểm tra:** với dữ liệu thử của từng trạng thái ở bảng 4.1, nút hành động hiện đúng như trước khi tách.

**Bước 4.3. Khối tóm tắt: tổng giá nổi bật, chính sách hủy hiện rõ**

- **Sửa ở đâu:** `src/components/bookings/BookingSummary.tsx` (mới).
- **Sửa thế nào:** tổng tiền là dòng lớn nhất; các dòng chi tiết xếp gọn phía trên; chính sách hủy hiện ngay trong khối, không giấu vào liên kết. Trong mẫu, các trường `booking.*` đặt theo tên minh họa, đổi sang tên thật.

```tsx
// src/components/bookings/BookingSummary.tsx
import { Card } from '../common/Card';
import { StatusBadge } from '../domain/StatusBadge';

export function BookingSummary({ booking }: { booking: BookingView }) {
  return (
    <Card className="shadow-[var(--ds-shadow-1)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-ink">{booking.hotelName}</h2>
          <p className="text-sm text-ink-muted">{booking.roomSummary}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-ink-muted">Nhận phòng</dt><dd className="text-right">{booking.checkInLabel}</dd>
        <dt className="text-ink-muted">Trả phòng</dt><dd className="text-right">{booking.checkOutLabel}</dd>
        <dt className="text-ink-muted">Số đêm</dt><dd className="text-right">{booking.nights}</dd>
      </dl>

      <div className="mt-4 border-t border-line pt-4">
        <div className="flex items-baseline justify-between">
          <span className="text-ink-muted">Tổng thanh toán</span>
          <span className="text-2xl font-semibold text-ink">{booking.totalLabel}</span>
        </div>
      </div>

      {booking.cancellationText && (
        <p className="mt-4 rounded-control bg-surface-subtle p-3 text-sm text-ink">
          {booking.cancellationText}
        </p>
      )}
    </Card>
  );
}
```

- **Kiểm tra:** tổng tiền khớp con số cũ; chính sách hủy hiện đúng chữ lấy từ dữ liệu, không tự viết thêm.

**Bước 4.4. Trang kết quả thanh toán ba trạng thái rõ ràng**

- **Sửa ở đâu:** `src/pages/customer/PaymentResultPage.tsx`, file mới `src/components/bookings/ResultBanner.tsx`.
- **Sửa thế nào:** một banner có biểu tượng, tiêu đề, một câu giải thích và hành động tiếp theo, dùng cho cả ba kết quả (thành công, đang xử lý, thất bại). Lỗi dùng `role="alert"`, còn lại `role="status"` để trình đọc màn hình đọc được.

```tsx
// src/components/bookings/ResultBanner.tsx
import type { ReactNode } from 'react';

type Props = {
  tone: 'success' | 'pending' | 'error';
  title: string;
  description: string;
  actions?: ReactNode;
};

const toneClass = {
  success: 'border-[var(--ds-success)]',
  pending: 'border-line',
  error: 'border-[var(--ds-danger)]',
} as const;   // --ds-success / --ds-danger: ánh xạ từ token trạng thái có sẵn trong variables.css

export function ResultBanner({ tone, title, description, actions }: Props) {
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={`rounded-card border-2 bg-surface p-6 text-center ${toneClass[tone]}`}
    >
      <h1 className="text-xl font-semibold text-ink">{title}</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{description}</p>
      {actions && <div className="mt-5 flex justify-center gap-2">{actions}</div>}
    </div>
  );
}
```

- **Kiểm tra:** giả lập cả ba kết quả thanh toán; mỗi kết quả có ít nhất một nút đi tiếp (xem đặt phòng, thử lại, về trang chủ).

**Bước 4.5. Gỡ yếu tố tạo áp lực không có thật**

- **Sửa ở đâu:** toàn bộ `src/pages/customer`, `src/components/bookings`, `src/components/hotels`.
- **Sửa thế nào:** tìm đồng hồ đếm ngược và thông báo khan hiếm. Nếu đó là hạn giữ phòng hay hạn thanh toán thật từ hệ thống thì hiển thị bằng chữ thường ("Giữ chỗ đến 18:30"), không dùng màu đỏ nhấp nháy; nếu là nội dung cố định không có dữ liệu thật thì xóa.

```bash
rg -n "setInterval|countdown|Còn lại|còn lại|chỉ còn|hết hạn" src/pages src/components
```

- **Kiểm tra:** mọi con số về số phòng còn lại hay hạn giữ chỗ đều đến từ API; lệnh trên không còn kết quả nào là nội dung gõ cứng.

### Giai đoạn 5: dashboard chủ khách sạn

**Bước 5.1. Xác nhận số liệu trước khi vẽ thẻ KPI**

- **Sửa ở đâu:** chỉ đọc `src/pages/owner/OwnerDashboardPage.tsx`, `OwnerAnalyticsModule.tsx` và các hàm trong `src/features/owner`.
- **Sửa thế nào:** thẻ KPI chỉ đáng tin khi API trả đủ dữ liệu để tính. Đối chiếu bảng sau với những gì API đang trả; chỉ làm thẻ nào có đủ dữ liệu, thẻ nào thiếu thì đánh dấu để bổ sung ở backend.

| KPI | Công thức | Dữ liệu cần có |
| --- | --- | --- |
| Công suất phòng | phòng-đêm đã bán / phòng-đêm khả dụng | Số phòng-đêm đã bán và khả dụng theo kỳ |
| ADR (giá phòng trung bình) | doanh thu phòng / phòng-đêm đã bán | Doanh thu phòng và phòng-đêm đã bán |
| RevPAR (doanh thu trên mỗi phòng khả dụng) | doanh thu phòng / phòng-đêm khả dụng (bằng ADR × công suất) | Doanh thu phòng và phòng-đêm khả dụng |
| Đặt phòng mới | số đặt phòng tạo trong kỳ | Danh sách đặt phòng theo ngày tạo |
| Check-in / check-out hôm nay | số đặt phòng có ngày nhận / trả là hôm nay | Danh sách đặt phòng theo ngày ở |

- **Kiểm tra:** với một khách sạn thử, tính tay một KPI từ dữ liệu đặt phòng và so với con số API trả về; hai số phải bằng nhau.

**Bước 5.2. Thẻ KPI có so sánh kỳ trước**

- **Sửa ở đâu:** file mới `src/components/owner/KpiCard.tsx`; dùng trong `OwnerDashboardPage.tsx`.
- **Sửa thế nào:** mỗi thẻ gồm tên, giá trị lớn, dòng so với kỳ trước. Màu của dòng thay đổi truyền qua `tone` chứ không tự suy ra, vì có chỉ số giảm lại là tốt (ví dụ tỉ lệ hủy). Chỉ đặt 4–6 thẻ trên cùng một hàng.

```tsx
// src/components/owner/KpiCard.tsx
import { Card } from '../common/Card';

type Props = {
  label: string;
  value: string;
  deltaText?: string;                       // ví dụ '+4,2% so với kỳ trước'
  tone?: 'good' | 'bad' | 'neutral';
};

const toneClass = {
  good: 'text-[var(--ds-success)]',
  bad: 'text-[var(--ds-danger)]',
  neutral: 'text-ink-muted',
} as const;

export function KpiCard({ label, value, deltaText, tone = 'neutral' }: Props) {
  return (
    <Card>
      <p className="text-sm text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
      {deltaText && <p className={`mt-1 text-xs ${toneClass[tone]}`}>{deltaText}</p>}
    </Card>
  );
}
```

```tsx
// OwnerDashboardPage.tsx
<section aria-label="Chỉ số chính" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <KpiCard label="Công suất phòng" value={fmtPercent(kpi.occupancy)} deltaText={kpi.occupancyDelta} tone={kpi.occupancyTone} />
  <KpiCard label="ADR" value={fmtMoney(kpi.adr)} deltaText={kpi.adrDelta} tone={kpi.adrTone} />
  <KpiCard label="RevPAR" value={fmtMoney(kpi.revpar)} deltaText={kpi.revparDelta} tone={kpi.revparTone} />
  <KpiCard label="Đặt phòng mới" value={String(kpi.newBookings)} deltaText={kpi.newBookingsDelta} tone={kpi.newBookingsTone} />
</section>
```

- **Kiểm tra:** hiển thị đúng khi chưa có dữ liệu (không có `NaN`, không có `undefined`); ở 360px các thẻ xếp một cột.

**Bước 5.3. Khối "việc cần làm hôm nay"**

- **Sửa ở đâu:** `OwnerDashboardPage.tsx`, phía trên hàng KPI.
- **Sửa thế nào:** ba số liên kết thẳng tới danh sách đặt phòng đã lọc sẵn (dùng đúng tên tham số lọc của `OwnerBookingsPage.tsx`). Khối này trả lời câu hỏi chủ khách sạn hỏi đầu tiên mỗi sáng.

```tsx
<Card>
  <h2 className="font-semibold text-ink">Hôm nay</h2>
  <ul className="mt-3 grid gap-2 sm:grid-cols-3">
    <li><Link className="block rounded-control bg-surface-subtle p-3 hover:bg-primary-soft" to={todayCheckInLink}>
      <span className="text-2xl font-semibold text-ink">{today.checkIn}</span>
      <span className="block text-sm text-ink-muted">khách nhận phòng</span>
    </Link></li>
    {/* tương tự: khách trả phòng, đặt phòng chờ xử lý */}
  </ul>
</Card>
```

- **Kiểm tra:** bấm vào từng số mở đúng danh sách đã lọc, số đếm khớp số dòng trong danh sách.

**Bước 5.4. Lịch tháng cho quỹ phòng và giá**

- **Sửa ở đâu:** file mới `src/components/owner/InventoryCalendar.tsx`; `src/pages/owner/OwnerInventoryPricingPage.tsx` (bảng hiện ở dòng 154 giữ làm chế độ xem thứ hai).
- **Sửa thế nào:** lịch hiển thị giá và số phòng còn của từng ngày. Bấm hai lần để chọn khoảng (bấm ngày đầu rồi ngày cuối), bên cạnh là biểu mẫu áp dụng giá, số phòng hoặc đóng bán cho khoảng vừa chọn. Biểu mẫu gọi lại đúng hàm cập nhật theo khoảng ngày mà trang hiện đang dùng, nên không cần đổi API.

```tsx
// src/components/owner/InventoryCalendar.tsx
import { useState } from 'react';
import { toIso } from '../../lib/dates';
import { Button } from '../common/Button';

export type DayCell = { price: number; available: number; closed: boolean };
export type IsoRange = { from: string; to: string };

type Props = {
  month: Date;
  cells: Record<string, DayCell>;      // khóa là 'yyyy-MM-dd'
  selected: IsoRange | null;
  onSelect: (range: IsoRange) => void;
  onMonthChange: (next: Date) => void;
  formatPrice: (v: number) => string;  // dùng hàm định dạng giá sẵn có
};

const WEEK = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export function InventoryCalendar({ month, cells, selected, onSelect, onMonthChange, formatPrice }: Props) {
  const [anchor, setAnchor] = useState<string | null>(null);
  const y = month.getFullYear(), m = month.getMonth();
  const offset = (new Date(y, m, 1).getDay() + 6) % 7;            // tuần bắt đầu thứ Hai
  const total = new Date(y, m + 1, 0).getDate();
  const today = toIso(new Date());

  const pick = (iso: string) => {
    if (!anchor) { setAnchor(iso); onSelect({ from: iso, to: iso }); return; }
    const [from, to] = anchor <= iso ? [anchor, iso] : [iso, anchor];
    onSelect({ from, to });
    setAnchor(null);
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <Button variant="secondary" onClick={() => onMonthChange(new Date(y, m - 1, 1))}>Tháng trước</Button>
        <h3 className="font-semibold text-ink">Tháng {m + 1}/{y}</h3>
        <Button variant="secondary" onClick={() => onMonthChange(new Date(y, m + 1, 1))}>Tháng sau</Button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-muted">
        {WEEK.map(w => <div key={w}>{w}</div>)}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {Array.from({ length: offset }).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: total }).map((_, i) => {
          const iso = toIso(new Date(y, m, i + 1));
          const cell = cells[iso];
          const past = iso < today;
          const inRange = !!selected && iso >= selected.from && iso <= selected.to;
          return (
            <button
              key={iso}
              type="button"
              disabled={past}
              aria-pressed={inRange}
              onClick={() => pick(iso)}
              className={[
                'flex min-h-[72px] flex-col items-start rounded-control border p-2 text-left transition-colors',
                inRange ? 'border-primary bg-primary-soft' : 'border-line bg-surface hover:bg-surface-subtle',
                cell?.closed ? 'opacity-60' : '',
                past ? 'cursor-not-allowed opacity-40' : '',
              ].join(' ')}
            >
              <span className="text-xs text-ink-muted">{i + 1}</span>
              <span className="text-sm font-medium text-ink">{cell ? formatPrice(cell.price) : '-'}</span>
              <span className="text-xs text-ink-muted">
                {cell ? (cell.closed ? 'Đóng bán' : `${cell.available} phòng`) : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

```tsx
// OwnerInventoryPricingPage.tsx: ghép lịch với biểu mẫu áp dụng
const [range, setRange] = useState<IsoRange | null>(null);
const [view, setView] = useState<'calendar' | 'table'>('calendar');

<div role="tablist" aria-label="Chế độ xem" className="mb-4 flex gap-2">
  <FilterChip pressed={view === 'calendar'} onClick={() => setView('calendar')}>Lịch</FilterChip>
  <FilterChip pressed={view === 'table'} onClick={() => setView('table')}>Bảng</FilterChip>
</div>

{view === 'calendar' ? (
  <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
    <InventoryCalendar month={month} cells={cells} selected={range}
                       onSelect={setRange} onMonthChange={setMonth} formatPrice={formatPrice} />
    <Card>
      <h3 className="font-semibold text-ink">Áp dụng cho khoảng đã chọn</h3>
      {/* Input giá mỗi đêm, Input số phòng, ô chọn đóng bán */}
      <Button className="mt-4 w-full" disabled={!range || isSaving} onClick={() => applyRange(range!, values)}>
        Áp dụng
      </Button>
    </Card>
  </div>
) : (
  /* bảng hiện có, giữ nguyên */
)}
```

- **Kiểm tra:** chọn 5 ngày liên tiếp, đặt giá mới, bấm áp dụng thì cả 5 ô đổi giá và bảng ở chế độ "Bảng" cũng hiện giá mới; ngày đã qua không chọn được; thử chọn khoảng vắt qua hai tháng (bấm ngày đầu, chuyển tháng, bấm ngày cuối) và kiểm tra cả hai tháng đều nhận giá mới.

**Bước 5.5. Biểu đồ xu hướng**

- **Sửa ở đâu:** `src/pages/owner/OwnerRevenuePage.tsx`, `OwnerAnalyticsModule.tsx`; file mới `src/components/analytics/TrendChart.tsx`.
- **Sửa thế nào:** cài `recharts` (kiểm tra bản hỗ trợ React 19), bọc thành một component nhận mảng `{ label, value }`. `BarList` vẫn dùng cho danh sách xếp hạng (ví dụ loại phòng bán chạy).

```bash
npm i recharts
```

```tsx
// src/components/analytics/TrendChart.tsx
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

type Point = { label: string; value: number };
type Props = { data: Point[]; ariaLabel: string; format: (v: number) => string };

export function TrendChart({ data, ariaLabel, format }: Props) {
  return (
    <div className="h-64" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--ds-border)" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={format} width={64} />
          <Tooltip formatter={(v: number) => format(v)} />
          <Area type="monotone" dataKey="value" stroke="var(--ds-primary)" fill="var(--ds-primary)" fillOpacity={0.12} strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- **Kiểm tra:** biểu đồ hiện đúng với 0 điểm, 1 điểm và 30 điểm dữ liệu; số trục dùng cùng hàm định dạng với phần còn lại của trang; mỗi biểu đồ có bảng số liệu hoặc tóm tắt bằng chữ gần đó để người dùng trình đọc màn hình vẫn nắm được thông tin.

### Giai đoạn 6: trang quản trị viên

**Bước 6.1. Chuyển từng bảng tự viết sang `DataTable`**

- **Sửa ở đâu:** các file dưới đây. Cột ở cột "Gợi ý cột" chỉ là ví dụ: giữ đúng những cột mỗi trang đang hiển thị, không thêm bớt.

| File | Vị trí bảng | Gợi ý cột (đối chiếu với trang thật) |
| --- | --- | --- |
| `src/pages/admin/AdminAccountsPage.tsx` | dòng 96 | Họ tên, email, vai trò, trạng thái, ngày tạo |
| `src/pages/admin/AdminHotelsPage.tsx` | dòng 91 | Tên khách sạn, chủ khách sạn, khu vực, trạng thái |
| `src/pages/admin/AdminPaymentsPage.tsx` | dòng 127 | Mã giao dịch, đặt phòng, số tiền, trạng thái, thời gian |
| `src/pages/admin/AdminReviewsPage.tsx` | dòng 137 | Khách sạn, người đánh giá, điểm, trạng thái kiểm duyệt |
| `src/pages/admin/AdminSupportPage.tsx` | dòng 108 | Tiêu đề, người gửi, trạng thái, ngày gửi |
| `src/pages/owner/OwnerBookingsPage.tsx` | dòng 173 | Mã đặt phòng, khách, ngày ở, tổng tiền, trạng thái |

- **Sửa thế nào:** làm từng trang một theo năm bước: (1) chép danh sách cột đang hiển thị; (2) khai báo `columns` ngoài thân component; (3) thay thẻ `<table>` bằng `<DataTable>`; (4) bỏ đoạn JSX tải, lỗi, rỗng tự viết, vì `DataTable` đã xử lý; (5) giữ nguyên phân trang và bộ lọc hiện có phía dưới và phía trên bảng.

```tsx
// TRƯỚC (minh họa) AdminAccountsPage.tsx
{isLoading && <PageSpinner />}
{error && <p className="text-red-600">Không tải được dữ liệu</p>}
{data && data.items.length === 0 && <p>Không có tài khoản</p>}
{data && data.items.length > 0 && (
  <table className="w-full text-sm">
    <thead>...</thead>
    <tbody>
      {data.items.map(a => (
        <tr key={a.id}>
          <td><Link to={`/admin/accounts/${a.id}`}>{a.fullName}</Link></td>
          <td>{a.email}</td>
          <td>{a.role}</td>
          <td>{a.status}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}

// SAU
import { DataTable, type Column } from '../../components/common/DataTable';

const columns: Column<Account>[] = [
  { key: 'name',   header: 'Họ tên',    cell: a => <Link to={`/admin/accounts/${a.id}`} className="text-primary hover:underline">{a.fullName}</Link> },
  { key: 'email',  header: 'Email',     cell: a => a.email },
  { key: 'role',   header: 'Vai trò',   cell: a => roleLabel(a.role) },
  { key: 'status', header: 'Trạng thái', cell: a => <StatusBadge status={a.status} /> },
];

<DataTable
  caption="Danh sách tài khoản"
  columns={columns}
  rows={data?.items}
  getRowKey={a => a.id}
  isLoading={isLoading}
  error={error ? 'Không tải được danh sách tài khoản' : null}
  emptyTitle="Chưa có tài khoản nào"
/>
```

- **Kiểm tra:** sau mỗi trang, so ảnh chụp trước và sau; đổi trang, lọc, sắp xếp vẫn chạy; ba trạng thái tải, lỗi, rỗng đều hiện đúng; liên kết mở chi tiết vẫn đúng đường dẫn.

**Bước 6.2. Thanh bộ lọc dùng chung**

- **Sửa ở đâu:** file mới `src/components/common/FilterBar.tsx`; các page admin đang tự viết vùng lọc.
- **Sửa thế nào:** gói các ô lọc vào cùng một khung để mọi trang có dáng giống nhau; bản thân ô lọc vẫn dùng `Input`, `Select` sẵn có và vẫn ghi trạng thái lên URL như hiện nay.

```tsx
// src/components/common/FilterBar.tsx
import type { ReactNode } from 'react';
import { Button } from './Button';

type Props = { children: ReactNode; onReset?: () => void };

export function FilterBar({ children, onReset }: Props) {
  return (
    <div role="search" className="mb-4 flex flex-wrap items-end gap-3 rounded-card border border-line bg-surface p-3">
      {children}
      {onReset && <Button variant="ghost" onClick={onReset}>Xóa bộ lọc</Button>}
    </div>
  );
}
```

```tsx
// dùng trong trang
<FilterBar onReset={resetFilters}>
  <Input label="Tìm kiếm" value={q} onChange={e => setQ(e.target.value)} />
  <Select label="Trạng thái" value={status} onChange={e => setStatus(e.target.value)}>
    {/* các option hiện có */}
  </Select>
</FilterBar>
```

- **Kiểm tra:** thanh lọc xếp gọn trên 360px; "Xóa bộ lọc" trả URL về trạng thái không lọc và đưa về trang 1.

**Bước 6.3. Một bảng màu trạng thái duy nhất cho `StatusBadge`**

- **Sửa ở đâu:** `src/components/domain/StatusBadge.tsx` và các chỗ tự dựng nhãn trạng thái.
- **Sửa thế nào:** gom ánh xạ trạng thái sang sắc thái (thành công, cảnh báo, lỗi, trung tính) vào một nơi; mọi trang dùng chung. Lấy danh sách giá trị trạng thái thật từ kiểu dữ liệu, không đoán.

```bash
rg -n "enum|z\.enum|status:" src/features src/types
```

```ts
// src/components/domain/statusTone.ts
export type Tone = 'success' | 'warning' | 'danger' | 'neutral';

export const statusTone: Record<string, Tone> = {
  // điền theo giá trị thật, ví dụ:
  // ACTIVE: 'success',
  // PENDING: 'warning',
  // REJECTED: 'danger',
  // CANCELLED: 'neutral',
};

export const toneClass: Record<Tone, string> = {
  success: 'bg-[var(--ds-success-soft)] text-[var(--ds-success)]',
  warning: 'bg-[var(--ds-warning-soft)] text-[var(--ds-warning)]',
  danger: 'bg-[var(--ds-danger-soft)] text-[var(--ds-danger)]',
  neutral: 'bg-surface-subtle text-ink-muted',
};
```

- **Kiểm tra:** cùng một trạng thái có cùng màu ở danh sách, chi tiết và dashboard; chữ trên nền nhạt đạt tương phản 4.5:1.

**Bước 6.4. Gom menu bên trái về 5–7 nhóm**

- **Sửa ở đâu:** `src/components/layouts/DashboardNavigation.tsx`.
- **Sửa thế nào:** khai báo menu thành cấu hình theo nhóm thay vì từng liên kết rời. Dưới đây là cách nhóm đề xuất cho quản trị viên từ chín trang hiện có.

```ts
// cấu hình menu admin
export const adminNav = [
  { group: 'Tổng quan', items: [
    { to: '/admin', label: 'Bảng điều khiển' },
    { to: '/admin/analytics', label: 'Phân tích' },
  ]},
  { group: 'Đối tác và khách sạn', items: [
    { to: '/admin/partner-applications', label: 'Hồ sơ đối tác' },
    { to: '/admin/hotels', label: 'Khách sạn' },
  ]},
  { group: 'Người dùng', items: [
    { to: '/admin/accounts', label: 'Tài khoản' },
  ]},
  { group: 'Giao dịch', items: [
    { to: '/admin/payments', label: 'Thanh toán' },
    { to: '/admin/promotions', label: 'Khuyến mãi' },
  ]},
  { group: 'Nội dung và hỗ trợ', items: [
    { to: '/admin/reviews', label: 'Đánh giá' },
    { to: '/admin/support', label: 'Hỗ trợ' },
  ]},
];
```

- **Kiểm tra:** mục đang mở được tô sáng đúng (kể cả trang chi tiết con như `/admin/hotels/:id`); điều hướng bằng bàn phím; ngăn kéo trên màn hình nhỏ vẫn mở được.

**Bước 6.5. Hàng đợi việc cần xử lý ở dashboard admin**

- **Sửa ở đâu:** `src/pages/admin/AdminDashboardPage.tsx`.
- **Sửa thế nào:** đặt lên đầu trang ba đến bốn ô "cần xử lý" (hồ sơ đối tác chờ duyệt, yêu cầu hỗ trợ mới, đánh giá chờ kiểm duyệt). Mỗi ô là liên kết tới danh sách đã lọc sẵn theo trạng thái chờ. Số đếm phải lấy từ API đang dùng cho dashboard, hoặc thêm một điểm cuối đếm nếu chưa có.

```tsx
<section aria-label="Cần xử lý" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
  <Link to="/admin/partner-applications?status=PENDING" className="rounded-card border border-line bg-surface p-4 hover:bg-primary-soft">
    <span className="text-2xl font-semibold text-ink">{queue.partnerPending}</span>
    <span className="block text-sm text-ink-muted">Hồ sơ đối tác chờ duyệt</span>
  </Link>
  {/* tương tự cho hỗ trợ mới và đánh giá chờ kiểm duyệt */}
</section>
```

- **Kiểm tra:** bấm ô nào mở đúng danh sách với bộ lọc đã bật; tên tham số và giá trị trạng thái (`status`, `PENDING`) đổi cho khớp với trang danh sách thật.

### Giai đoạn 7: kiểm tra và nghiệm thu

**Bước 7.1. Chạy bộ lệnh quét toàn dự án**

- **Sửa ở đâu:** không sửa, chỉ chạy ở thư mục frontend và ghi số liệu để so với lúc bắt đầu.
- **Sửa thế nào:** chạy lần lượt các lệnh; mỗi lệnh có kết quả mong muốn. Tên script test và build lấy theo `package.json`.

```bash
npm run build
npm test

# màu Tailwind hard-code còn lại (mục tiêu: giảm về gần 0, phần còn lại có lý do)
rg -c "(text|bg|border|ring)-(slate|gray|zinc|neutral|red|amber|blue|green)-[0-9]+" src --glob "*.{tsx,css}"

# các dấu hiệu của CSS khó bảo trì (mục tiêu: không còn)
rg -n "!important" src/assets/css

# icon và nút
rg -n "from 'lucide-react'" src                       # mục tiêu: không còn
rg -n "<button" src/pages                              # mục tiêu: không còn nút viết tay

# bảng và ngày
rg -n "<table" src/pages                               # mục tiêu: chỉ còn trong DataTable
rg -n 'type="date"' src                                # mục tiêu: chỉ còn chỗ có lý do riêng

# style inline (mục tiêu: chỉ còn giá trị động như độ rộng thanh biểu đồ)
rg -n "style=\{\{" src

# ảnh để rà alt (xem từng kết quả)
rg -n 'alt=""' src
```

- **Kiểm tra:** ghi từng con số vào biên bản nghiệm thu; con số nào chưa về mục tiêu thì ghi lý do hoặc tạo việc xử lý.

**Bước 7.2. Kiểm tra responsive**

- **Sửa ở đâu:** trình duyệt, công cụ DevTools chế độ thiết bị.
- **Sửa thế nào:** mở từng trang chính ở các độ rộng 360, 640, 768, 1024 và 1280px. Trang nào cũng phải không có thanh cuộn ngang toàn trang (trừ bảng có vùng cuộn riêng), nút bấm đủ lớn để chạm (tối thiểu 44px), chữ không bị cắt.
- **Kiểm tra:** xem danh sách tick ở cuối phần này.

**Bước 7.3. Kiểm tra bàn phím và trình đọc màn hình**

- **Sửa ở đâu:** trình duyệt.
- **Sửa thế nào:** rút chuột ra, đi hết các luồng chính chỉ bằng `Tab`, `Shift+Tab`, `Enter`, `Space` và `Esc`. Chạy thêm Lighthouse (có sẵn trong Chrome DevTools) hạng mục Accessibility ở các trang chính; tự xử lý mọi lỗi nhãn form, tương phản, thiếu `alt` nó chỉ ra.

Những điểm hay sót:

1. Vòng focus phải nhìn thấy rõ ở mọi nút, liên kết và ô nhập.
2. Hộp thoại (xem ảnh, ngăn lọc, lịch ngày) giữ focus bên trong khi mở và trả focus về nút mở khi đóng.
3. Mỗi ô nhập có nhãn; lỗi đọc được (không chỉ đổi màu viền).
4. Ảnh có nội dung thì có `alt` mô tả; ảnh chỉ để trang trí thì `alt=""`. Ví dụ ảnh đánh giá ở `AdminReviewDetailPage.tsx` dòng 106 đang dùng chữ chung "Ảnh đánh giá", nên ghi rõ hơn (ví dụ tên khách sạn và thứ tự ảnh).
5. Đọc lại tương phản các chữ xám nhạt trên nền trắng và nền xám xanh.

**Bước 7.4. Tốc độ tải**

- **Sửa ở đâu:** các thẻ `<img>` ở trang chủ, kết quả, chi tiết; hero trang chủ.
- **Sửa thế nào:** ảnh dưới màn hình đầu tiên tải lười và có kích thước cố định để trang không nhảy; ảnh lớn đầu trang (hero) thì ưu tiên tải.

```tsx
// ảnh trong danh sách, dưới nếp gấp màn hình
<img src={url} alt={alt} width={640} height={480}
     loading="lazy" decoding="async" className="aspect-[4/3] w-full object-cover" />

// ảnh hero, đầu trang
<img src={heroUrl} alt={heroAlt} width={1600} height={900}
     fetchPriority="high" className="h-full w-full object-cover" />
```

- **Kiểm tra:** chạy Lighthouse hạng mục Performance ở trang chủ, kết quả và chi tiết; mục tiêu thường dùng của Google cho người dùng thật là LCP không quá 2,5 giây, INP không quá 200 ms, CLS không quá 0,1. Ghi lại kết quả trước và sau nâng cấp.

**Danh sách nghiệm thu cuối**

- [ ] `npm run build` và `npm test` đều xanh
- [ ] Ba luồng chính chạy đủ: khách tìm và đặt phòng, chủ khách sạn sửa giá và xem đặt phòng, quản trị viên duyệt hồ sơ đối tác
- [ ] Tổng tiền hiển thị khớp trong ba kịch bản báo giá đã ghi ở bước 3C.1
- [ ] Không còn `!important` trong `booking-flow.css`
- [ ] Không còn màu Tailwind hard-code ở trang công khai và luồng đặt phòng
- [ ] Một bộ icon duy nhất
- [ ] Ô ngày dùng date picker, trang kết quả có bản đồ, trang chi tiết có lưới ảnh, thanh neo và hộp đặt phòng dính
- [ ] Lịch giá và phòng của chủ khách sạn chạy, sửa được nhiều ngày một lần
- [ ] Tất cả danh sách admin dùng `DataTable`
- [ ] Không còn đồng hồ đếm ngược hay thông báo khan hiếm không có dữ liệu thật
- [ ] 360px không có cuộn ngang ở cả ba khu vực
- [ ] Đi hết các luồng chính chỉ bằng bàn phím
- [ ] Lighthouse Accessibility không còn lỗi nghiêm trọng ở các trang chính
- [ ] Checklist "tránh giao diện do AI sinh" ở trên đã tick hết

## Hướng dẫn thiết kế theo vai trò

Mỗi vai trò có mục tiêu khác nhau nên phong cách cũng khác: khách hàng cần cảm hứng và sự tin cậy, chủ khách sạn và quản trị viên cần tốc độ và độ rõ ràng.

| Vai trò | Mục tiêu | Phong cách | Trang ưu tiên |
| --- | --- | --- | --- |
| Khách hàng | Tìm, so sánh và đặt phòng nhanh, tin tưởng vào giá | Ảnh lớn, nhiều khoảng trắng, nút chính nổi bật, giá tổng minh bạch | Trang chủ, kết quả, chi tiết khách sạn, đặt phòng |
| Chủ khách sạn | Nắm tình hình hôm nay, chỉnh giá và phòng nhanh | Gọn, nhiều dữ liệu, thẻ KPI có xu hướng, lịch tháng | Tổng quan, quỹ phòng và giá, đặt phòng, doanh thu |
| Quản trị viên | Duyệt, kiểm soát, xử lý khiếu nại | Bảng dữ liệu là trung tâm, lọc và hành động hàng loạt, ít trang trí | Hồ sơ đối tác, khách sạn, thanh toán, hỗ trợ, đánh giá |

### Khách hàng

1. **Trang chủ:** hero với ảnh điểm đến thật, ô tìm kiếm pill lớn, chip tìm kiếm phổ biến, các điểm đến và khách sạn nổi bật dùng chung `HotelCard`. Tránh khuôn "hero, 3 card, dải logo, bảng giá, FAQ".
2. **Kết quả:** danh sách bên trái, bản đồ bên phải, thanh lọc ngang phía trên, sắp xếp rõ ràng, phân trang giữ nguyên trạng thái bộ lọc trong URL.
3. **Chi tiết:** lưới ảnh, thanh neo, danh sách phòng dạng thẻ, đánh giá ngay dưới phòng, vị trí trên bản đồ, hộp đặt phòng dính.
4. **Đặt phòng:** tóm tắt bên phải, tổng giá rõ, chính sách hủy hiện trước khi bấm đặt, một CTA chính.

### Chủ khách sạn

1. **Tổng quan:** việc cần làm hôm nay (check-in, check-out, đặt mới), 4–6 KPI kèm kỳ trước, đánh giá chưa trả lời.
2. **Quỹ phòng và giá:** lịch tháng, chọn nhiều ngày rồi sửa giá hoặc số phòng một lần, chế độ bảng là phương án thứ hai.
3. **Báo cáo và doanh thu:** ba chỉ số công suất, ADR, RevPAR đặt cạnh nhau để so sánh; biểu đồ xu hướng theo thời gian.

### Quản trị viên

1. **Dashboard:** vài KPI chính và hàng đợi việc cần xử lý (hồ sơ đối tác chờ duyệt, khiếu nại mới, đánh giá bị báo cáo).
2. **Danh sách:** `DataTable` chung với lọc, sắp xếp, phân trang, `StatusBadge` thống nhất.
3. **Trang chi tiết:** thông tin chính bên trái, hành động duyệt/từ chối bên phải và luôn hiện rõ.

## Checklist tránh giao diện do AI sinh

Không có dấu hiệu nào dưới đây đủ để kết luận nguồn gốc giao diện, nhưng khi xuất hiện thành cụm thì người dùng nhận ra ngay. Tick sau mỗi giai đoạn; mục nào đã sạch ở code hiện tại được ghi chú.

- [ ] Không có gradient tím hoặc xanh-tím không có lý do thương hiệu (code hiện tại: chưa thấy)
- [ ] Không dùng emoji làm icon (code hiện tại: chưa thấy)
- [ ] Một bộ icon duy nhất, không đặt icon trong ô vuông bo góc có màu nếu không có mục đích
- [ ] Không có hàng ba card giống hệt nhau chỉ để lấp chỗ; mỗi card mang dữ liệu thật
- [ ] Không có thanh viền màu 3–4px bên trái card làm trang trí (code hiện tại: chỉ thấy trong timeline thanh toán, hợp lý)
- [ ] Không có card lồng card chỉ để trang trí; phân cấp bằng nền và khoảng trắng
- [ ] Bo góc và bóng theo cấp, không dùng một giá trị cho mọi thứ
- [ ] Font và cặp xanh được chọn có chủ đích, không để mặc định
- [ ] Nội dung cụ thể: "Cách trung tâm 400m, hủy miễn phí đến 18:00" thay cho "Trải nghiệm đẳng cấp"
- [ ] Ảnh khách sạn thật, chất lượng cao; không có ảnh stock chung chung hay lorem ipsum (code hiện tại: chưa thấy)
- [ ] Có thiết kế riêng cho trạng thái rỗng, lỗi và đang tải ở mọi danh sách
- [ ] Không có đếm ngược giả hay thông báo khan hiếm không có dữ liệu thật

## Quy trình làm việc với AI coding

AI sinh giao diện chung chung khi nó phải tự quyết các việc mà bạn chưa quyết. Vì vậy hãy đưa cho nó quyết định (token, component, phạm vi) và bắt nó làm từng bước nhỏ.

1. **Một nhánh, một giai đoạn.** Mỗi giai đoạn bắt đầu bằng việc chạy test và kết thúc bằng việc chạy lại test.
2. **Đưa bối cảnh cố định cho AI.** Tạo file `DESIGN.md` ở thư mục gốc chứa bảng token, quy tắc thành phần và danh sách điều cấm (gradient tím, emoji icon, đếm ngược giả). Yêu cầu AI đọc file này trước mỗi nhiệm vụ.
3. **Giao từng phần nhỏ.** Một trang hoặc một component mỗi lần, nêu rõ file được sửa và file không được sửa.
4. **Bắt dừng và báo cáo.** Sau mỗi bước, AI liệt kê file đã đổi và kết quả test, không tự đi tiếp.
5. **Tự xem bằng mắt.** Mở trình duyệt, so với ảnh tham chiếu ở giai đoạn 0, kiểm tra trên mobile.
6. **Commit nhỏ, mô tả rõ.** Dễ hoàn tác khi một bước làm hỏng giao diện.

**Prompt mẫu cho một nhiệm vụ giao diện**

```
Đọc DESIGN.md trước khi làm.
Nhiệm vụ: [mô tả một trang hoặc component, ví dụ: làm lại khối hộp đặt phòng ở HotelDetailPage].
Phạm vi: chỉ sửa [danh sách file]. KHÔNG đổi logic, API, hook, route hay quyền truy cập.
Yêu cầu giao diện:
- Dùng token trong variables.css, không dùng màu Tailwind trực tiếp.
- Dùng Button, Input, Select sẵn có; không viết lại nút hay input.
- Có đủ trạng thái loading, lỗi, rỗng.
- Responsive từ 360px; kiểm tra bàn phím và focus.
Khi xong: liệt kê file đã đổi, chạy test và báo kết quả, nêu điều chưa chắc chắn. Nếu thay đổi có nguy cơ đổi hành vi, dừng và hỏi trước.
```

**Prompt mẫu cho bản đồ ở trang kết quả**

```
Thêm bản đồ vào HotelListPage theo bố cục chia đôi (danh sách trái, bản đồ phải trên desktop; nút chuyển Danh sách/Bản đồ trên mobile).
Trước khi code: kiểm tra API khách sạn có trả tọa độ (vĩ độ, kinh độ) chưa và báo lại; nếu chưa, dừng.
Dùng react-leaflet với OpenStreetMap (kiểm tra tương thích React 19).
Yêu cầu: marker hiện giá; bấm marker làm nổi card tương ứng và ngược lại; bản đồ phản ứng theo bộ lọc và phân trang đang có; giữ nguyên query params trên URL.
Không đổi logic lọc và sắp xếp hiện tại.
```

## Rủi ro và cách giảm thiểu

Rủi ro lớn nhất là đổi giao diện làm lệch hành vi đặt phòng, thanh toán hoặc quyền truy cập, vì logic và hiển thị đang nằm chung trong các file lớn.

| Rủi ro | Dấu hiệu | Cách giảm thiểu |
| --- | --- | --- |
| Đổi markup làm vỡ CSS chọn theo class Tailwind | Trang đặt phòng mất kiểu sau khi sửa | Làm giai đoạn 1 trước; không sửa markup luồng đặt phòng khi chưa viết lại `booking-flow.css` |
| Tách `HotelDetailPage` làm lệch báo giá hoặc đặt phòng | Giá hoặc số phòng hiển thị khác trước | Giữ nguyên hook và hàm tính; chỉ tách phần hiển thị; so sánh giá ở vài kịch bản trước và sau |
| Bản đồ thiếu dữ liệu | API không trả tọa độ | Kiểm tra API trước; nếu thiếu, bổ sung ở backend hoặc ẩn marker cho khách sạn chưa có tọa độ |
| Thư viện mới không hợp React 19 | Lỗi khi cài hoặc chạy | Kiểm tra phiên bản tương thích trước khi cài, thử trên nhánh riêng |
| Đổi con số dashboard sai ý nghĩa | KPI không khớp báo cáo cũ | Xác nhận nguồn dữ liệu và công thức trước khi đổi hình thức |
| Làm quá nhiều việc một lúc | Nhánh lớn, test đỏ, khó hoàn tác | Mỗi giai đoạn một nhánh; commit nhỏ; dừng khi test đỏ |
| Bỏ sót accessibility và mobile | Bộ lọc khó dùng trên điện thoại hoặc bàn phím | Kiểm tra ở từng giai đoạn, không chờ đến giai đoạn 7 |

## Nguồn tham khảo

Ngày tra cứu: 30/09/2026. Phần mô tả Booking.com, Agoda, Airbnb dựa vào các bài phân tích công khai, không phải quan sát trực tiếp.

- [Baymard: 5 UX Best Practices for Travel Accommodation Sites](https://baymard.com/research-articles/travel-site-ux-best-practices)
- [Baymard: Optimal Layout for Hotel Search Results](https://baymard.com/research-articles/accommodations-split-view)
- [Snappymob: UI/UX Audit Booking.com vs Agoda](https://blog.snappymob.com/ui-ux-audit-booking-com-vs-agoda)
- [Airbnb design system (OpenDesign)](https://open-design.ai/plugins/design-system-airbnb/)
- [Airbnb DESIGN.md (VoltAgent)](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/airbnb/DESIGN.md)
- [Booking.com Partners: Updating rates and availability](https://partner.booking.com/en-us/help/rates-availability/extranet-calendar/updating-your-rates-and-availability)
- [Booking.com: bảng màu thương hiệu](https://www.designyourway.net/blog/booking-logo/)
- [Booking.com urgency-based UX](https://www.markhub24.com/post/booking-com-s-urgency-based-ux-design)
- [AdminLTE: Admin Dashboard Design 2026](https://adminlte.io/blog/admin-dashboard-design/)
- [Modern Dashboard UI: 2026 patterns](https://artofstyleframe.com/blog/dashboard-design-patterns-web-apps/)
- [SimpleKPI: Boutique hotel KPI dashboard](https://www.simplekpi.com/kpi-dashboard-examples/boutique-hotel-kpi-dashboard-example)
- [AI Slop Design fix guide](https://vibecodekit.dev/ai-slop-design)
- Báo cáo khảo sát frontend do người dùng cung cấp (đọc tĩnh mã nguồn)

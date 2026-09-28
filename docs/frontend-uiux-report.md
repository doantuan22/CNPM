# Báo cáo khảo sát Frontend và UI/UX StayHub

**Ngày khảo sát:** 28/09/2026  
**Phạm vi:** Mã nguồn trong thư mục `frontend`, tập trung vào cấu trúc ứng dụng, hệ thống giao diện, khu vực quản trị, đăng ký tài khoản và các luồng thanh toán. Báo cáo mô tả hiện trạng trong mã nguồn; không thay đổi chức năng hoặc thiết kế.

## 1. Tổng quan

Frontend được xây dựng bằng React và TypeScript, chạy với Vite. Ứng dụng có giao diện công khai cho khách đặt phòng và các khu vực có xác thực cho khách hàng, chủ khách sạn, đối tác và quản trị viên. Điều hướng dùng React Router; dữ liệu máy chủ chủ yếu được gọi qua các service và quản lý trạng thái truy vấn bằng TanStack Query. Zustand dùng cho một số trạng thái phía ứng dụng.

Giao diện hiện kết hợp ba cách triển khai: component React dùng chung, các class CSS ngữ nghĩa trong bộ CSS nội bộ và utility class của Tailwind. Hệ thống màu và biến giao diện đã có định nghĩa chung, nhưng nhiều trang vẫn tự dựng bố cục và điều khiển riêng. Vì vậy, cách hiển thị một số trường nhập liệu, nút, khoảng cách và thông báo chưa hoàn toàn đồng nhất.

## 2. Cấu trúc Frontend

Điểm vào ứng dụng nằm tại `frontend/src/main.tsx`. `App.tsx` thiết lập các provider và ranh giới xử lý lỗi; `AppRoutes.tsx` khai báo route, tải lười các trang và bảo vệ các trang cần đăng nhập hoặc vai trò phù hợp.

| Thư mục | Trách nhiệm chính |
| --- | --- |
| `app` | Khởi tạo ứng dụng và cấu hình cấp ứng dụng |
| `routes` | Khai báo route, phân quyền và điều hướng |
| `pages` | Các trang theo nghiệp vụ, gồm trang công khai, admin, chủ khách sạn và đăng ký |
| `components/common` | Các thành phần dùng chung như nút, trường nhập, select và trạng thái |
| `components/layouts` | Khung trang công khai và khung dashboard |
| `components/auth` | Thành phần và xử lý liên quan đến xác thực |
| `components/analytics`, `hotels`, `reviews` | Thành phần theo nhóm nghiệp vụ |
| `features` | Mã theo tính năng |
| `hooks` | Hook dùng lại |
| `lib` | Tiện ích và cấu hình nền |
| `services` | Gọi API/backend |
| `types` | Kiểu dữ liệu TypeScript |
| `assets/css` | Biến, nền tảng, layout, component và style luồng đặt phòng |

Các thư viện đáng chú ý gồm React Hook Form và Zod cho biểu mẫu, Tailwind CSS v4 cho utility style. Phông Inter và bộ biểu tượng Phosphor được nạp ở cấp trang HTML; một số khu vực cũng dùng Lucide.

## 3. Các lớp UI/UX và cách triển khai

### 3.1. Lớp bố cục

- **Giao diện công khai:** navbar, nội dung trang và footer; trên màn hình nhỏ navbar mở menu dạng drawer.
- **Giao diện dashboard:** sidebar điều hướng, topbar có tìm kiếm/tài khoản và vùng nội dung chính. Admin và chủ khách sạn dùng chung hướng bố cục dashboard nhưng có menu theo vai trò.
- **Nội dung nghiệp vụ:** trang danh sách, chi tiết, biểu mẫu, bảng, thẻ thống kê và trạng thái rỗng được lắp từ component chung hoặc JSX riêng theo từng trang.
- **Lớp style:** CSS token và class nội bộ kết hợp utility class Tailwind. Một số trang đặt phần lớn style trực tiếp trên JSX.

### 3.2. Token và tông màu

| Vai trò | Giá trị quan sát được | Cách dùng |
| --- | --- | --- |
| Màu chính | `#2563EB` | Nút chính, liên kết và trạng thái được chọn |
| Màu chính khi hover | `#1D4ED8` | Hover/focus của hành động chính |
| Màu xanh đậm | `#1E40AF` | Biến thể nhấn mạnh |
| Nền xanh nhạt | `#EFF6FF` | Nền nhấn nhẹ |
| Nền chính | Trắng | Card, trường nhập và vùng nội dung |
| Nền phụ | `#F7F8FA`, `#F1F5F9` | Nền dashboard và vùng phụ |
| Chữ tiêu đề | `#1F2937` | Tiêu đề và nội dung quan trọng |
| Chữ thường | `#4B5563` | Nội dung mô tả |
| Chữ phụ | `#6B7280` | Hint, nhãn phụ |
| Viền | `#E5E7EB`, `#D1D5DB` | Khung thẻ, input và phân tách |
| Thành công | `#16A34A`, nền `#DCFCE7` | Hoạt động/thành công |
| Cảnh báo | `#F59E0B`, nền `#FEF3C7` | Chờ xử lý/cảnh báo |
| Lỗi/nguy hiểm | `#DC2626`, nền `#FEE2E2` | Lỗi và hành động nguy hiểm |
| Đánh giá/khuyến mại | Cam `#F59E0B`, đỏ `#DC2626` | Sao đánh giá và giảm giá |

Font chủ đạo là Inter. Cỡ bo góc có các mức nhỏ đến lớn và dạng pill; card thường có viền sáng và bóng đổ nhẹ. Thời lượng chuyển động định nghĩa ở mức khoảng 150–200 ms. Các biến kích thước layout gồm header khoảng 68 px, sidebar khoảng 264 px và chiều rộng nội dung tối đa khoảng 1536 px. Một phần màu cũng được khai báo lại trong cấu hình theme Tailwind, tạo hai nơi cần đối chiếu khi chỉnh token.

### 3.3. Nút, trường nhập và combo box

- **Nút dùng chung:** component Button có các biến thể primary, secondary, outline, ghost, danger và kích thước sm, md, lg; có xử lý focus và disabled.
- **Trường nhập dùng chung:** component Input hỗ trợ label, hint, lỗi và thuộc tính hỗ trợ truy cập; chiều cao mặc định khoảng 44 px.
- **Select dùng chung:** component Select sử dụng thẻ select HTML gốc, label/hint/error tương tự Input.
- **Khác biệt hiện tại:** class CSS `.input` và `.select` định nghĩa chiều cao khoảng 46 px. Trang dùng component có thể khác trang dùng class hoặc utility Tailwind. Một số select tự thêm biểu tượng mũi tên trang trí.
- **Combo box:** khảo sát mã nguồn không thấy một component combo box tìm kiếm dùng chung. Các bộ lọc lựa chọn chủ yếu là select HTML gốc; tìm kiếm theo chữ thường là ô input riêng.
- **Bảng và bộ lọc:** trang danh sách thường đặt ô tìm kiếm, select trạng thái/phương thức hoặc nút lọc phía trên bảng. Có trang lọc ngay khi nhập; có trang dùng nút áp dụng/xóa bộ lọc.

### 3.4. Thông báo và trạng thái

CSS có style cho cụm toast và các biến thể toast, nhưng không thấy nơi sử dụng runtime tương ứng trong mã đã khảo sát. Thông báo thực tế phần lớn được hiển thị ngay trong trang dưới dạng banner thành công/lỗi, lỗi cạnh trường nhập, trạng thái chờ, spinner hoặc empty state. Một số lỗi nghiệp vụ dùng `window.alert`; hành động nhạy cảm có dùng `window.confirm`. Vì thế cách hiển thị và khả năng tương tác của thông báo còn phụ thuộc từng trang.

Topbar có nút chuông ở một số layout, nhưng trong các phần đã khảo sát chưa thấy một bảng thông báo hoàn chỉnh được mở từ nút đó. Điều này chỉ mô tả UI được tìm thấy trong frontend, không kết luận về các xử lý backend ngoài phạm vi mã đã đọc.

## 4. Trang quản trị và trang chủ khách sạn

### 4.1. Khung quản trị

Admin dùng dashboard layout với sidebar nhóm chức năng và vùng nội dung. Menu được chia thành:

- **Điều hành nền tảng:** Tổng quan, Tài khoản, Hồ sơ đăng ký, Khách sạn.
- **Vận hành sàn:** Thanh toán & giao dịch, Đánh giá, Hỗ trợ & khiếu nại, Khuyến mãi, Thống kê.

Trang tổng quan hiển thị các lối tắt/tổng quan theo dạng card, KPI và khu vực nội dung kiểm soát. Sidebar có thể chuyển sang drawer ở màn hình hẹp; một số thành phần topbar tìm kiếm được ẩn ở kích thước tablet.

### 4.2. Nhóm trang admin

| Nhóm | Bố cục và điều khiển chính |
| --- | --- |
| Tài khoản | Trang danh sách có tiêu đề, nút tạo, ô tìm kiếm, lọc trạng thái/role, bảng và phân trang; trang chi tiết và trang tạo/sửa là biểu mẫu riêng |
| Hồ sơ đối tác | Danh sách có bộ lọc trạng thái và bảng; chi tiết hiển thị hồ sơ/tài liệu cùng hành động duyệt hoặc từ chối và lý do |
| Khách sạn | Danh sách và trang chi tiết; phần chi tiết dùng các card thông tin, chỉnh sửa và điều khiển tạm ngưng/kích hoạt |
| Thanh toán & giao dịch | Tìm kiếm, lọc trạng thái/phương thức, bộ lọc nhanh, bảng và phân trang; chi tiết có số tiền, khách, nhà cung cấp, tham chiếu ngân hàng, khách sạn, dòng thời gian và khu vực hoàn tiền |
| Đánh giá | Danh sách/chi tiết cùng hành động duyệt, ẩn hoặc xử lý; một số hành động có xác nhận |
| Hỗ trợ & khiếu nại | Danh sách lọc theo trạng thái; chi tiết có thông tin yêu cầu và thao tác xử lý/kết quả |
| Khuyến mãi | Danh sách và biểu mẫu tạo/sửa; có select loại giảm giá, giá trị, giới hạn, ngày và bật/tắt |
| Thống kê | Bộ lọc khoảng ngày, thẻ KPI, biểu đồ và thao tác tải/làm mới dữ liệu |

Mẫu bố cục phổ biến của trang danh sách là tiêu đề và hành động ở đầu trang, bộ lọc trong thanh/card kế tiếp, rồi bảng có phân trang. Trang chi tiết thường gom thông tin theo card và đặt hành động nghiệp vụ gần nội dung liên quan.

### 4.3. Khu vực chủ khách sạn

Chủ khách sạn dùng dashboard shell với menu nghiệp vụ như Tổng quan, Khách sạn của tôi, Loại phòng, Quỹ phòng & giá bán, Đặt phòng, Doanh thu, Báo cáo thống kê và Hồ sơ cá nhân. Trang “Khách sạn của tôi” dùng thẻ tổng số theo trạng thái, ô tìm kiếm, các nút lọc trạng thái và card khách sạn. Mỗi card có ảnh, tên, địa điểm, số loại phòng, trạng thái và nút đi tới quản lý/quỹ phòng.

Các trang nghiệp vụ khác được tổ chức quanh danh sách hoặc biểu mẫu theo từng loại dữ liệu: loại phòng, tồn phòng/giá, đặt phòng và doanh thu. Báo cáo này không đánh giá tính đúng đắn của nghiệp vụ hay kết nối backend; chỉ ghi nhận cách frontend bố trí màn hình và điều khiển.

## 5. Biểu mẫu đăng ký và tạo hồ sơ

### 5.1. Đăng ký tài khoản khách hàng hoặc đối tác

Trang đăng ký bắt đầu bằng bước chọn loại tài khoản qua các card lựa chọn, gồm khách hàng và đối tác khách sạn. Sau khi chọn, biểu mẫu tài khoản dùng chung gồm họ tên, ngày sinh, tên đăng nhập, giới tính dạng radio, email, điện thoại, mật khẩu, xác nhận mật khẩu và checkbox điều khoản. Mật khẩu có thể bật/tắt hiển thị. Lỗi được đặt cạnh trường hoặc hiển thị thành cảnh báo; khi gửi có trạng thái chờ.

Sau khi đăng ký, tài khoản khách hàng quay về trang chính; tài khoản đối tác tiếp tục tới trang nộp hồ sơ đối tác.

### 5.2. Hồ sơ đăng ký đối tác khách sạn

Trang nộp hồ sơ yêu cầu đăng nhập. Trang thay đổi nội dung theo trạng thái hồ sơ: thông tin đã gửi/đang chờ, kết quả hoặc biểu mẫu nộp lại nếu bị từ chối. Các trường bao gồm thông tin định danh, giấy phép/thuế và URL tài liệu; người dùng xác nhận tính chính xác trước khi gửi.

### 5.3. Tạo khách sạn của chủ khách sạn

Biểu mẫu tạo hồ sơ khách sạn có banner thông tin về bước xét duyệt và các card trường dữ liệu: tên khách sạn, số sao, vị trí/địa chỉ, giờ nhận-trả phòng và mô tả. Cuối biểu mẫu có thao tác hủy và gửi duyệt; sau khi gửi, frontend điều hướng về phần quản lý khách sạn.

### 5.4. Admin tạo tài khoản

Biểu mẫu admin có họ tên, tên đăng nhập, email, điện thoại, vai trò lấy từ API và mật khẩu khởi tạo kèm hướng dẫn. Hành động chính là lưu; hành động phụ là hủy. Vai trò được chọn bằng select gốc.

### 5.5. Biểu mẫu tài khoản khác

Frontend còn có luồng quên mật khẩu, đặt lại mật khẩu và hồ sơ cá nhân. Các biểu mẫu này sử dụng pattern trường nhập, báo lỗi và gửi dữ liệu tương tự; cách trình bày cụ thể nằm trong trang tương ứng.

## 6. Đặt phòng và thanh toán

Luồng đặt phòng hiện có trang chi tiết khách sạn để chọn loại phòng/số lượng theo lựa chọn của khách; sau khi tạo booking, frontend chuyển đến `/bookings/:id`. Trang chi tiết booking hiển thị các dòng phòng đã đặt và có hành động thanh toán. Khi thanh toán, frontend gọi service tạo thanh toán VNPAY rồi chuyển hướng tới URL do backend trả về.

Trang kết quả thanh toán có các trạng thái thành công, thất bại và đang chờ; nội dung gồm mã tham chiếu booking, số tiền và liên kết điều hướng tiếp.

Ngoài luồng trên, router còn khai báo các route luồng đặt phòng nhiều bước dạng `/booking/:id/room`, `/booking/:id/confirm`, `/booking/:id/payment` và `/payment/:id`, được xử lý bởi nhóm trang `EcodeFlowPages`. Trang thanh toán trong luồng này có thông tin bảo mật, tổng tiền và nút thanh toán VNPAY.

Trong phạm vi admin, màn hình giao dịch tập trung vào tra cứu và theo dõi giao dịch/hoàn tiền như đã nêu ở phần trên. Báo cáo tách riêng luồng giao diện và lời gọi service được nhận diện; không khẳng định trạng thái cấu hình, phản hồi hoặc quy tắc thanh toán phía backend.

## 7. Responsive và khả năng tiếp cận

Responsive được triển khai bằng breakpoint của Tailwind và media query trong CSS. Sidebar dashboard đổi sang drawer ở màn hình nhỏ; menu công khai có drawer; một số thanh tìm kiếm bị ẩn ở kích thước tablet; lưới thẻ và biểu mẫu có thể thu về một cột.

Có các hỗ trợ như liên kết bỏ qua điều hướng, focus-visible, label, thuộc tính ARIA, trạng thái disabled và vai trò alert/status ở một số component. Mức độ áp dụng chưa đồng đều vì nhiều trang tạo input/nút trực tiếp thay vì dùng component chung. Khi khảo sát thay đổi UI cần kiểm tra cả kích thước nhỏ, trạng thái lỗi, đang tải và bàn phím.

## 8. Nhận xét về tính nhất quán

1. Token màu, font, radius và shadow đã có nền tảng dùng chung, phù hợp với phong cách sáng, gọn, ưu tiên màu xanh.
2. Cùng loại điều khiển có thể được dựng bằng component, class CSS hoặc Tailwind trực tiếp; chiều cao và khoảng cách vì thế có thể khác nhau.
3. CSS có định nghĩa toast nhưng luồng thông báo thực tế chủ yếu là banner inline, alert hoặc confirm của trình duyệt.
4. Select hiện chủ yếu là native select; chưa có combo box tìm kiếm dùng chung trong phần mã đã khảo sát.
5. Theme Tailwind và token CSS có một số giá trị trùng lặp, nên khi cập nhật cần kiểm tra cả hai.
6. Một số route đặt phòng cũ và mới cùng tồn tại; cần xem route thực tế và điểm điều hướng trước khi sửa giao diện để không làm đứt luồng.

## 9. Các file tham chiếu chính

| File/nhóm file | Nội dung |
| --- | --- |
| `frontend/src/main.tsx`, `App.tsx`, `AppRoutes.tsx` | Khởi tạo, provider, route và bảo vệ quyền |
| `frontend/src/assets/css/variables.css` | Token màu, font, kích thước và hiệu ứng |
| `frontend/src/assets/css/base.css`, `layout.css`, `components.css`, `booking-flow.css` | Nền tảng style và các lớp UI |
| `frontend/src/components/common` | Nút, input, select và thành phần dùng chung |
| `frontend/src/components/layouts` | Khung giao diện và điều hướng |
| `frontend/src/pages` | Trang admin, chủ khách sạn, đăng ký, đặt phòng và thanh toán |
| `frontend/src/services` | Tầng gọi API/backend từ frontend |
| `frontend/package.json` | Thư viện và lệnh phát triển frontend |

---

Báo cáo phản ánh mã frontend được khảo sát tại thời điểm ghi ngày ở đầu tài liệu. Nội dung tập trung vào cấu trúc và biểu hiện giao diện; không bao gồm kiểm thử thực thi hoặc xác minh dữ liệu trực tiếp trên backend.

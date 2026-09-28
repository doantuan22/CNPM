# EGODE — CALM TRAVEL COMMERCE

## Tuyên ngôn

Egode là sản phẩm đặt phòng và vận hành lưu trú. Ngôn ngữ thiết kế giúp người dùng chọn nơi ở, hiểu giá và trạng thái, rồi hoàn tất thao tác với sự tin cậy. Giao diện bình tĩnh, rõ, giàu ngữ cảnh du lịch và có mật độ thông tin theo vai trò.

**Tính chất:** clear, trustworthy, travel-oriented, transactional, calm, efficient, image-aware, content-first, data-aware, professional.

Egode không theo thẩm mỹ playful startup, fintech dashboard, enterprise ERP, social media, luxury editorial hay futuristic AI. Giữ tông trắng–xanh và cảm giác tin cậy hiện tại.

## Ba mật độ, cùng một DNA

| Khu vực | Trọng tâm | Nhịp điệu |
| --- | --- | --- |
| Public | Ảnh nơi ở, điểm đến, search context, giá, đánh giá và quyết định đặt phòng | Thoáng; imagery là nội dung chính |
| Owner | Tồn phòng, giá, đơn đặt, trạng thái và hành động vận hành | Gọn; ưu tiên scan và thao tác |
| Admin | Danh sách, hồ sơ, thanh toán, kiểm duyệt và xử lý ngoại lệ | Mật độ cao; ưu tiên dữ liệu/trạng thái/bảng |

Auth và booking dùng cùng màu, chữ, control và trạng thái; bố cục vẫn theo flow hiện tại.

## 8 nguyên tắc thị giác

1. **Content before container:** heading, text, ảnh, giá, trạng thái, spacing và divider trước khi thêm card.
2. **Hierarchy before decoration:** size, weight, vị trí, spacing và contrast dẫn dắt; màu/shadow chỉ củng cố.
3. **Blue is action:** xanh primary dùng cho CTA, lựa chọn, active nav, link quan trọng và focus.
4. **Whitespace is structure:** nội dung cùng nhóm gần nhau; section khác nhau có nhịp tách rõ.
5. **Hotel imagery is primary content:** ảnh hỗ trợ quyết định; crop theo ngữ cảnh, tránh overlay/badge phủ ảnh không cần.
6. **Price is first-class data:** amount nổi bật, đơn vị/đêm nhẹ hơn, tổng tiền và phí minh bạch theo dữ liệu backend.
7. **Status is semantic:** nhãn chữ là bắt buộc; màu và icon chỉ hỗ trợ.
8. **Consistency over novelty:** bản sắc đến từ composition, chữ, ảnh, nhịp và pattern du lịch, không phải decoration mới.

## Mẫu tham chiếu

- Material Design 3: học semantic token, states, focus, accessibility; không lấy visual identity Material.
- Apple HIG: học hierarchy, clarity, restraint; không giả lập UI hệ điều hành.
- OTA: học search có context, giá dễ scan, trust gần quyết định, so sánh phòng; không sao chép brand/composition.
- Stripe Dashboard: học density, data hierarchy, table readability; không tạo cảm giác fintech.
- Linear: học kỷ luật spacing và interaction; không lấy dark aesthetic/developer-tool style.

## Invariant

- Giữ #2563EB, #1D4ED8, #1E40AF, #EFF6FF, neutral trắng/xám và semantic green/amber/red.
- Giữ route, IA, nghiệp vụ, flow booking, API và thứ tự section lớn.
- Không thêm framework, icon library hay animation library.
- Card dành cho hotel, room offer, booking/payment, hotel entity và KPI cần so sánh.
- Mỗi vùng có một CTA primary rõ. Không thêm variant trang trí.
- Phase 1 tạo token/common controls và áp dụng có kiểm soát lên màn hình đại diện; không tự bắt đầu Phase 2.

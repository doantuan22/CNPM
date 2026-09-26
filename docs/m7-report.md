# M7 – After-sales Report

Covers Review (+ ảnh đánh giá qua Cloudinary), Support/Complaint, Admin moderation cho cả hai, và FE tương ứng (Customer Center + Admin after-sales). Không có role/module CSKH riêng — mọi xử lý phía admin dùng chung `VAI_TRO = "Quản trị hệ thống"` đã có.

## 0. Audit trước khi triển khai

- `DANH_GIA`/`HINH_ANH_DANH_GIA`/`YEU_CAU_HO_TRO` đã có sẵn đầy đủ cột cần thiết từ DB-0 (`database/DATABASE_SOURCE_CHAPTER_6_7.md` §6.20–6.22) — không có `CHECK` giới hạn domain trên `DANH_GIA.TrangThai`/`YEU_CAU_HO_TRO.TrangThai` (chỉ `LoaiYeuCau IN (N'Hỗ trợ', N'Khiếu nại')` và `NgayXuLy >= NgayTao` có CK), nên định nghĩa `REVIEW_STATUS`/`SUPPORT_STATUS` ở tầng ứng dụng như các module trước.
- **RB9** (`Chương 7`): "Đánh giá chỉ được tạo cho đơn đặt phòng đã hoàn tất thời gian lưu trú — đơn phải ở trạng thái hoàn tất." Trước M7, **không có nơi nào** từng chuyển `DAT_PHONG` sang `"Hoàn tất"` — M5/M6 chỉ có `"Chờ thanh toán" → "Đã xác nhận" → "Đã hủy"`. Quyết định: **không đổi schema** — thêm một lazy sweep thứ hai (`booking-completion.ts`, cùng kiểu với `booking-expiry.ts` của M6): `UPDATE DAT_PHONG SET TrangThai='Hoàn tất' WHERE TrangThai='Đã xác nhận' AND NgayTraPhong < NOW()`, chạy tại mọi điểm đọc trạng thái booking (list/detail/cancel/review). Không có M7 Design Issue nào cần treo.
- **RB26** (`UQ_DANH_GIA_MaDatPhong`): đã có sẵn unique constraint trên `DANH_GIA.MaDatPhong` — dùng làm lưới an toàn thứ hai (bắt lỗi Prisma P2002 → 409) phía sau kiểm tra "đã có đánh giá chưa" ở service, chống race hai request đánh giá cùng lúc.
- **G0-09 / Override 0.2** (đã ghi từ M0): `YEU_CAU_HO_TRO` **không có cột `MaKhachSan`** dù RB31 trong tài liệu gốc có đề cập — validate ownership khi tạo yêu cầu (RB10) chỉ còn áp dụng cho `MaDatPhong` (phải thuộc đúng khách hàng gửi yêu cầu), không có gì để kiểm tra thêm cho khách sạn.
- Domain `DANH_GIA.TrangThai` trong tài liệu chỉ liệt kê ví dụ "Hiển thị, Ẩn, Vi phạm,..." — không có trạng thái "chưa duyệt" nào được đặt tên. Thêm `PENDING = "Chờ duyệt"` (đúng pattern đã dùng cho `KHACH_SAN`/`HO_SO_DOI_TAC`) làm trạng thái khởi tạo, khớp với 3 hành động admin được yêu cầu ("duyệt/ẩn/đánh dấu vi phạm" = 3 đích, cần đúng 1 trạng thái xuất phát trước khi duyệt).
- Ảnh đánh giá tái dùng `CloudinaryIntegration`/pattern "data URI trong JSON body" đã có từ M3 (`owner-hotels.service.ts`) — nhưng M3 **chưa từng validate loại file/kích thước**. M7 thêm việc validate này (`review-images.ts`, pure function, unit test riêng) mà không sửa lại M3 (ngoài phạm vi).

## 1. Review

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/bookings/:id/review` | Auth customer, chỉ chủ booking, booking phải `"Hoàn tất"` |
| GET | `/api/bookings/:id/review` | Auth customer, chỉ chủ booking — trả `null` nếu chưa đánh giá |
| GET | `/api/admin/reviews` | Admin — filter `trangThai`/`search`, paginate |
| GET | `/api/admin/reviews/:id` | Admin — chi tiết kèm ảnh + khách hàng + khách sạn + booking |
| PATCH | `/api/admin/reviews/:id/moderate` | Admin — `{trangThai: Hiển thị\|Ẩn\|Vi phạm}` |

`MaKhachHang` = `req.user.maTaiKhoan`, `MaKhachSan` = suy từ `DAT_PHONG` đã tra được — **không có field nào trong body có thể set 2 giá trị này**. `TrangThai` cũng không nằm trong `createReviewSchema` — khách hàng không có cách nào tự set trạng thái kiểm duyệt (không phải do check ở service, mà do schema request không tồn tại field này).

Điều kiện tạo (theo đúng thứ tự check trong `reviews.service.ts`): booking tồn tại (404) → đúng chủ (403) → đã `"Hoàn tất"` (400 nếu chưa, sau khi chạy sweep §0) → chưa từng đánh giá (409, cả pre-check và DB constraint) → điểm 1–5 (400, Zod) → ảnh hợp lệ nếu có (400, `review-images.ts`).

## 2. Review images (Cloudinary)

Không có secret nào lộ ra frontend — flow giống M3: FE đọc file thành base64 data URI (`fileToDataUrl`, đã có sẵn), gửi trong JSON body, backend gọi `CloudinaryIntegration.uploadImage()` (dùng `CLOUDINARY_API_KEY/SECRET` chỉ tồn tại server-side), DB chỉ lưu `URL` trả về (đúng schema `HINH_ANH_DANH_GIA.URL`).

**Validate loại file/kích thước** (`review-images.ts`, pure, 6 unit test): chỉ nhận data URI `image/{png,jpe?g,webp,gif}`, tối đa **6 ảnh/đánh giá**, tối đa **5MB/ảnh** (áp dụng trước khi gọi Cloudinary, không tốn quota cho ảnh chắc chắn sai).

**Trạng thái credential**: dự án này **có sẵn credential Cloudinary thật** trong `.env` (khác VNPAY — không phải placeholder `dev`/`dev`). Test tự động (`reviews.test.ts`) vẫn **mock `CloudinaryIntegration`** hoàn toàn (giống M3's `owner-hotels.test.ts`) để bộ test không phụ thuộc mạng/quota — nhưng live smoke (§6) gọi **thật**, không mock, và một ảnh PNG nhỏ đã **upload thành công thật** lên `res.cloudinary.com/dfyfpuguj/...` — xem log live smoke. Do đó không có giới hạn "chưa test được với ảnh thật" ở đây, khác với VNPAY (M6) nơi credential vẫn là placeholder.

## 3. Support / Complaint

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/support` | Auth customer — `{loaiYeuCau, tieuDe, noiDung, maDatPhong?}` |
| GET | `/api/support` | Auth customer — chỉ yêu cầu của chính mình |
| GET | `/api/support/:id` | Auth customer — chỉ yêu cầu của chính mình (403 nếu không) |
| GET | `/api/admin/support` | Admin — filter `trangThai`/`loaiYeuCau`/`search`, paginate |
| GET | `/api/admin/support/:id` | Admin — chi tiết |
| PATCH | `/api/admin/support/:id` | Admin — `{trangThai: Đang xử lý\|Đã xử lý, ketQuaXuLy?}` |

`MaTaiKhoanKhachHang` luôn là `req.user.maTaiKhoan` khi tạo. Nếu có `maDatPhong`, **RB10** được kiểm: booking đó phải thuộc đúng khách hàng gửi yêu cầu (403 nếu không, 400 nếu không tồn tại) — không có `MaKhachSan` để kiểm thêm (§0).

**"Tiếp nhận"/"xử lý"** gộp vào một endpoint `PATCH /admin/support/:id`: chuyển `"Mới"→"Đang xử lý"` (tiếp nhận) hoặc `→"Đã xử lý"` (xử lý, bắt buộc `ketQuaXuLy`, set `NgayXuLy=now`). **`MaTaiKhoanXuLy` luôn là admin đang đăng nhập, ghi đè bất kỳ giá trị nào gửi lên** (test gửi `maTaiKhoanXuLy: 999999` giả, verify DB vẫn ghi đúng admin thật). Một khi `"Đã xử lý"`, yêu cầu **bất biến** — mọi PATCH tiếp theo trả 400.

## 4. Security / Ownership / RBAC

- Mọi endpoint customer đều `authenticate + requireRole(Khách hàng)`; mọi endpoint admin đều `authenticate + requireAdmin` (chặn ở tầng router, trước khi vào controller).
- Ownership review: booking không tồn tại → 404; không đúng chủ → 403 (cả tạo và xem).
- Ownership support: yêu cầu không đúng chủ → 403 (xem); `maDatPhong` không đúng chủ → 403 (tạo).
- Customer gọi bất kỳ endpoint `/admin/reviews/*` hoặc `/admin/support/*` → 403 (RBAC chặn trước khi chạm service — verified bằng test thật, không phải giả định).
- Không tin `MaKhachHang`/`MaKhachSan`/`TrangThai` (review) hay `MaTaiKhoanXuLy` (support) từ client — tất cả suy từ session hoặc từ chính booking đã tra trong DB.

## 5. Frontend

**Customer Center:**
- `BookingDetailPage` (đã có từ M6) — thêm `<ReviewSection>`: chỉ hiện khi `TrangThai === "Hoàn tất"`; chưa có đánh giá → form (chấm 1–5 sao, nội dung, chọn ảnh — `fileToDataUrl` có sẵn); đã có → hiển thị lại kèm badge trạng thái kiểm duyệt.
- `SupportPage` (`/support`, mới) — danh sách yêu cầu của mình + form tạo (loại, tiêu đề, nội dung, chọn đặt phòng liên quan từ danh sách booking của mình — không bắt buộc).
- `SupportDetailPage` (`/support/:id`, mới) — chi tiết + kết quả xử lý khi có.

**Admin:**
- `AdminReviewsPage`/`AdminReviewDetailPage` (`/admin/reviews[/:id]`, mới) — danh sách có filter trạng thái + tìm kiếm, chi tiết có 3 nút hành động (Duyệt/Ẩn/Đánh dấu vi phạm).
- `AdminSupportPage`/`AdminSupportDetailPage` (`/admin/support[/:id]`, mới) — danh sách filter loại + trạng thái + tìm kiếm, chi tiết có nút "Tiếp nhận" + form kết quả xử lý (nút "Đánh dấu đã xử lý" disable tới khi có nội dung).
- `AdminDashboardPage` thêm 2 thẻ liên kết tới hai trang trên (trước đó là placeholder tĩnh từ TECH-0).
- `Navbar` thêm mục "Hỗ trợ".

Mọi trang đều có đủ loading/error/empty (list rỗng)/validation (nút disable, thông báo lỗi field)/success states.

## 6. Tests + Live smoke

**Backend — 232/232 PASS** (23 file, gồm 198 cũ từ M1–M6 + **34 test mới**):
- `review-images.test.ts` (6, unit) — mime hợp lệ/không hợp lệ, quá số lượng, quá kích thước.
- `reviews.test.ts` (16, integration, DB thật, Cloudinary mocked) — sweep hoàn tất lazy, 401/403/404/400 (chưa hoàn tất, điểm ngoài 1–5, ảnh sai mime), 201 tạo thành công + upload ảnh (mock, verify gọi đúng số lần), 409 duplicate, `GET review` null→có giá trị, admin list/filter/detail/moderate + 403 cho customer + 404.
- `support.test.ts` (12, integration, DB thật) — 401/403 tạo, tạo có/không `maDatPhong`, 403 gắn booking người khác, 400 loại sai, khách chỉ thấy yêu cầu của mình (403 xem người khác, 404 không tồn tại), admin 403 cho customer, admin list/filter/detail/claim/resolve (verify `MaTaiKhoanXuLy` không bị giả từ body), 400 xử lý thiếu `ketQuaXuLy`, bất biến sau khi đã xử lý, 404.

**Frontend — 81/81 PASS** (17 file, gồm 55 cũ từ M1–M6 + **26 test mới**): 3 test thêm vào `BookingDetailPage.test.tsx` (ẩn/hiện ReviewSection, submit review, hiển thị review đã có) + 6 file mới (`SupportPage`, `SupportDetailPage`, `AdminReviewsPage`, `AdminReviewDetailPage`, `AdminSupportPage`, `AdminSupportDetailPage`) — mỗi trang có test loading/error/empty (khi áp dụng) và ít nhất một hành động success.

**Live smoke (server thật, không qua vitest, đã xóa script sau khi chạy)** — chạy `tsx src/server.ts` thật: đăng ký + đăng nhập customer thật → tạo booking `"Đã xác nhận"` với `NgayTraPhong` trong quá khứ trực tiếp qua DB (mô phỏng một kỳ nghỉ đã qua) → `GET /bookings/:id` **live sweep thật** đổi `TrangThai` thành `"Hoàn tất"` → `POST review` thành công **kèm upload ảnh thật lên Cloudinary** (không mock — xem §2) → tạo lần 2 bị `409` → `POST /support` (khiếu nại, gắn booking) → tạo admin qua DB, đăng nhập thật → `PATCH moderate → "Hiển thị"` → customer thử tự duyệt review của mình → `403` → admin "tiếp nhận" (`"Đang xử lý"`) → admin "xử lý" (`"Đã xử lý"` + kết quả) → customer xem lại review (`"Hiển thị"`) và support (`"Đã xử lý"` + đúng nội dung kết quả). Toàn bộ log khớp kỳ vọng ở mọi bước.

## 7. Database schema có thay đổi không

**KHÔNG.** Không `CREATE`/`ALTER TABLE` nào trong M7. Sweep "Hoàn tất" (§0) dùng đúng `NgayTraPhong`/`TrangThai` sẵn có, tái dùng đúng status `"Hoàn tất"` đã nằm trong domain `BOOKING_STATUS` từ M5 (chỉ chưa từng được set trước M7). Không có M7 Design Issue nào cần treo.

## 8. Regression M1–M6

232 test backend cũ (M1–M6) và 55 test frontend cũ đều PASS nguyên — không sửa hành vi bất kỳ module nào trước M7, chỉ thêm mới (module `reviews`/`support`, 2 field mới trong `bookings.service.ts` để gọi sweep hoàn tất, không đổi output của bất kỳ API cũ nào).

## 9. M7 kết quả

**PASS** — mọi yêu cầu đều có bằng chứng chạy thật (232 test backend + 81 test frontend + 1 live smoke thật qua server đang chạy, bao gồm một lượt upload ảnh Cloudinary thật), không có hạng mục BLOCKED.

- [x] Review: ownership, điều kiện hoàn tất lưu trú (RB9), tối đa 1 đánh giá/booking (RB26 + DB constraint), điểm 1–5, nội dung + ảnh, trạng thái kiểm duyệt theo domain hiện có
- [x] Admin: xem danh sách/lọc/tìm kiếm/chi tiết/duyệt-ẩn-đánh dấu vi phạm — customer không tự đổi trạng thái kiểm duyệt được (không có field, không có route)
- [x] Review images qua Cloudinary — validate loại file/kích thước, không lộ secret ra FE, test tự động mock third-party, live smoke xác nhận upload thật hoạt động
- [x] Support/Complaint: tạo (có/không booking), xem danh sách/chi tiết của chính mình; Admin: danh sách/filter/tiếp nhận/xử lý, `MaTaiKhoanXuLy` luôn từ admin đăng nhập
- [x] Ownership/RBAC đầy đủ cả hai chiều (customer↔customer khác, customer↔admin-only) — verified bằng test thật, không phải suy luận
- [x] Frontend Customer Center + Admin after-sales đầy đủ loading/error/empty/validation/success
- [x] Backend/Frontend lint + typecheck + build + test PASS
- [x] Live smoke thật: booking → review → support → admin moderation/xử lý → customer xem kết quả
- [x] Không đổi schema, không có Design Issue treo
- [x] Không mở rộng sang reports/analytics, promotion admin, deployment

Đủ điều kiện chuyển sang phase sau.

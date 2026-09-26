# M5 – BOOKING Report

Covers DB-4 (booking + concurrency), BE-5 (tạo đặt phòng thật), FE-3 (xác nhận đặt phòng). Chưa có payment.

## 1. Audit trước khi triển khai

- `DAT_PHONG` đã có sẵn đầy đủ cột cần thiết: `MaXacNhanDatPhong` (unique), `MaChinhSachHuy` (bắt buộc, không null), `MaKhuyenMai` (tùy chọn), `TongTienPhong`/`SoTienGiam`/`TongTienThanhToan`, `GhiChu`, `TrangThai`, `NgayTao`/`NgayCapNhat` — không thiếu cột nào, không cần đổi schema.
- Không có `CHI_TIET_GIA_DAT_PHONG` (đúng Gate 0) — giá vẫn phải suy từ `QUY_PHONG_GIA` tại thời điểm đặt, y hệt logic M4, chỉ khác là đọc trong transaction có khóa thay vì đọc thường.
- Không có cột "tồn kho đã đặt" nào trên `QUY_PHONG_GIA` để trừ trực tiếp — đúng yêu cầu đề bài ("Không trừ trực tiếp SoLuongPhong"), availability tiếp tục được tính bằng `SoLuongPhong - SUM(CHI_TIET_DAT_PHONG đang hoạt động)`, y hệt công thức M2/M4.
- `hotels/availability.ts` (M2) đã có `computeRoomTypeAvailability`/`buildBookedByDate` thuần túy, không phụ thuộc cách lấy dữ liệu — tận dụng lại cho M5, chỉ khác nguồn dữ liệu đầu vào (đọc có khóa thay vì đọc thường). Đã tách thêm hàm `priceRoomLine()` dùng chung giữa Quote (M4) và Booking (M5) để đảm bảo hai luồng luôn tính đúng-y-hệt-nhau về mặt số học (đã refactor `quotes.service.ts` để dùng lại hàm này, xác nhận 19 test Quote cũ vẫn PASS nguyên sau refactor).
- Phát hiện một file "foundation" từ giai đoạn đầu dự án: `frontend/src/features/bookings/types.ts` chỉ là type placeholder tổng quát (`id: string`, `userId: string`,...) chưa từng được import ở đâu — thay hoàn toàn bằng type thật khớp response API, không ảnh hưởng gì (verify: không có file nào khác import type cũ).
- Route `/bookings` (trang "Quản lý đặt phòng") đã tồn tại từ M1 nhưng chỉ là empty-state tĩnh — tận dụng lại đúng route này làm trang "Booking result" (hiển thị khi có state điều hướng kèm booking vừa tạo), thay vì tạo route mới, vì M5 không yêu cầu danh sách "lịch sử đặt phòng" (cần thêm API GET riêng, ngoài phạm vi).
- Không phát hiện nhu cầu đổi schema nào — không có M5 Design Issue.

## 2. Booking API

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/hotels/:id/bookings` | Yêu cầu `authenticate` + `requireRole('Khách hàng')`. Body: `{checkIn, checkOut, rooms:[{maLoaiPhong, soLuong}], promoCode?, ghiChu?}` |

Toàn bộ `availability`, giá từng ngày (`QUY_PHONG_GIA`), `TongTienPhong`, khuyến mãi, `SoTienGiam`, `TongTienThanhToan`, chính sách hủy đều **được tính lại hoàn toàn ở backend, trong transaction** — không tin bất kỳ giá trị nào từ báo giá (quote) trước đó hay từ body request (Zod schema của booking không có field tổng tiền nào để gửi lên). Chi tiết trong `backend/src/config/openapi.ts`.

## 3. Transaction & concurrency (chiến lược khóa)

**Chọn `WITH (UPDLOCK, ROWLOCK, HOLDLOCK)` trên câu SELECT các dòng `QUY_PHONG_GIA` liên quan, thay vì đặt cả transaction ở mức cô lập `SERIALIZABLE`.** Lý do: `SERIALIZABLE` thuần túy khiến hai transaction cùng đọc "còn bao nhiêu phòng" bằng shared range-lock (tương thích với nhau), cả hai đều **thấy** đủ phòng và cùng tiến hành INSERT — chỉ đến bước INSERT mới xung đột khóa, dẫn đến khả năng deadlock hoặc (tệ hơn) cả hai vẫn có thể commit tùy thời điểm engine giải quyết xung đột. `UPDLOCK` (U-lock) thì khác: U-lock không tương thích với chính nó, nên **transaction thứ hai bị chặn ngay tại bước đọc (SELECT)** cho đến khi transaction thứ nhất commit/rollback xong — đây là mẫu hình chuẩn của SQL Server cho bài toán "đọc rồi quyết định rồi ghi" (pessimistic concurrency / inventory hold), triệt tiêu khả năng race ngay từ gốc thay vì xử lý xung đột ở cuối.

Luồng trong transaction (`bookings.service.ts` + `bookings.repository.ts`):

1. `SELECT MaLoaiPhong, NgayApDung, GiaPhong, SoLuongPhong FROM QUY_PHONG_GIA WITH (UPDLOCK, ROWLOCK, HOLDLOCK) WHERE MaLoaiPhong IN (...) AND NgayApDung trong khoảng lưu trú` — khóa tất cả các đêm/loại phòng liên quan tới yêu cầu đặt phòng này. Transaction cạnh tranh nào đụng vào cùng loại phòng + khoảng ngày giao nhau sẽ bị chặn ngay tại đây.
2. Đọc số phòng đã bị chiếm (`CHI_TIET_DAT_PHONG` join `DAT_PHONG`, loại trừ `TrangThai = 'Đã hủy'`) — đọc thường (không cần hint) vì đã được bảo vệ bởi khóa ở bước 1.
3. Tính lại `available`/giá cho từng dòng phòng bằng `priceRoomLine()` (dùng chung với Quote). Nếu bất kỳ dòng nào không đủ phòng hoặc thiếu giá (`QUY_PHONG_GIA` bị xóa/hết hạn giữa chừng) → ném lỗi **409 Conflict**, toàn bộ transaction **rollback tự động** (Prisma interactive transaction tự rollback khi callback throw).
4. Nếu có `promoCode`: tra cứu + đánh giá lại bằng `evaluatePromotion()` (M4) trong cùng transaction; nếu không hợp lệ → **400** (từ chối thẳng, không âm thầm bỏ qua mã giảm giá — xem mục 6), rollback.
5. Đọc lại chính sách hủy đang `Hoạt động` (quy tắc M4: chính sách cũ nhất còn hoạt động), sinh `MaXacNhanDatPhong` (16 ký tự, đủ ngẫu nhiên, dưới giới hạn `VARCHAR(20)`), `INSERT DAT_PHONG` (luôn `TrangThai = 'Chờ thanh toán'`) + `INSERT CHI_TIET_DAT_PHONG` cho từng dòng phòng.
6. Commit.

## 4. Trạng thái booking ban đầu

Luôn là **`"Chờ thanh toán"`** (`BOOKING_STATUS.PENDING_PAYMENT`) — đúng vị trí trong luồng payment sẽ làm ở phase sau (chưa thanh toán, chưa xác nhận). Booking không tự trừ `SoLuongPhong` của `QUY_PHONG_GIA`; availability tiếp tục được suy ra động, và các booking `"Đã hủy"` (giả lập trong test) không chiếm tồn — verify bằng test thật (mục 5).

## 5. Kết quả test

**Backend — 143/143 PASS** (126 cũ từ M1–M4 + **17 mới**: 3 unit test `priceRoomLine` trong `availability.test.ts` + **14 integration test** trong `bookings.test.ts`, chạy thật với SQL Server):

- Booking hợp lệ, tính đúng tổng tiền, `TrangThai` ban đầu đúng, `GhiChu` lưu đúng.
- Nhiều loại phòng trong 1 request (2 `CHI_TIET_DAT_PHONG`, tổng tiền đúng).
- Ngày không hợp lệ → 400. Loại phòng không thuộc khách sạn → 400.
- Đặt phòng đè lên đêm thiếu `QUY_PHONG_GIA` → **409**, verify **không để lại `DAT_PHONG` rác** (đếm số dòng trước/sau bằng nhau).
- Hết phòng (loại phòng chỉ còn 1, đặt lần 2) → **409**, verify **không để lại rác**.
- Booking `"Đã hủy"` (tạo thẳng qua DB, giả lập lịch sử) **không chiếm tồn** — đặt lại đúng slot đó vẫn thành công (201).
- **Quote cũ nhưng giá đã đổi**: đổi giá `QUY_PHONG_GIA` sau khi đã "xem quote", gọi booking → backend dùng giá mới, không dùng giá cũ.
- Mã khuyến mãi hết hạn → **400**, không tạo `DAT_PHONG` (verify đếm trước/sau). Mã không tồn tại → 400.
- Áp mã khuyến mãi hợp lệ → `MaKhuyenMai`/`SoTienGiam` được lưu đúng vào `DAT_PHONG`.
- RBAC: chưa đăng nhập → 401; đăng nhập với vai trò không phải "Khách hàng" (thử với "Chủ khách sạn") → 403.
- **Concurrency — 2 request đồng thời tranh 1 phòng cuối cùng** (`Promise.all` gửi 2 request `POST` giống hệt nhau cho loại phòng chỉ còn 1 phòng): kết quả luôn là đúng 1 request `201` + 1 request `409`; verify bằng SQL thật rằng tổng `SUM(SoLuongPhong)` trong `CHI_TIET_DAT_PHONG` cho loại phòng đó là **1**, không phải 2 — **không overbooking**. Chạy lại 3 lần liên tiếp với fixture mới mỗi lần, kết quả ổn định cả 3 lần.

**Frontend — 40/40 PASS** (37 cũ + **3 mới** trong `HotelDetailPage.test.tsx`): chưa đăng nhập thấy nút "Đăng nhập để đặt phòng" thay vì nút xác nhận; khách hàng đã đăng nhập xác nhận đặt phòng thành công → điều hướng sang trang kết quả kèm đúng dữ liệu; xác nhận thất bại do xung đột tồn kho (409) → hiển thị lỗi + nút "Làm mới báo giá".

Toàn bộ regression: backend `lint`/`tsc --noEmit`/`build` (`prisma generate && tsc`)/`test` PASS; frontend `lint`/`tsc -b`/`vite build`/`test` PASS.

## 6. Quyết định thiết kế đáng chú ý

- **Promo không hợp lệ tại thời điểm đặt phòng → từ chối thẳng (400), không âm thầm bỏ qua giảm giá.** Khác với Quote (M4) vốn "soft-fail" (vẫn trả 200 kèm cờ `PromoHopLe=false` để FE hiển thị), Booking từ chối hẳn: nếu khách hàng gõ một mã cụ thể mà mã đó vừa hết hạn/hết lượt ngay trước khi bấm xác nhận, âm thầm tính tiền đầy đủ mà không báo sẽ là một khoản phụ thu bất ngờ với khách. Từ chối + để FE gọi lại Quote (nút "Làm mới báo giá") là lựa chọn minh bạch hơn.
- **"Hết phòng"/"thiếu giá" tại thời điểm đặt → 409 Conflict**, phân biệt với 400 (input sai) và 404 (không tìm thấy) — đúng ngữ nghĩa HTTP cho xung đột trạng thái tài nguyên do race condition, và FE dùng mã 409 riêng để hiển thị nút "Làm mới báo giá".
- **`MaXacNhanDatPhong` sinh bằng `Date.now().toString(36) + randomBytes(3)`** (tiền tố `BK`, ~16 ký tự, dưới giới hạn `VARCHAR(20)`) — đủ ngẫu nhiên cho quy mô hệ thống này, không cần vòng lặp retry khi trùng (chưa từng va chạm trong toàn bộ test/smoke).

## 7. Frontend flow

`HotelDetailPage.tsx` nối tiếp trực tiếp panel Quote đã có từ M4: sau khi có báo giá hợp lệ (`KhaDung=true`), hiện thêm ô "Ghi chú" (tùy chọn) và nút xác nhận, với 3 trạng thái theo vai trò:

- Chưa đăng nhập → nút "Đăng nhập để đặt phòng" (điều hướng `/login`).
- Đăng nhập nhưng không phải "Khách hàng" → nút disabled kèm ghi chú giải thích.
- Khách hàng đã đăng nhập → nút "Xác nhận đặt phòng" gọi `POST /hotels/:id/bookings` với đúng ngày/loại phòng/số lượng đang chọn và (nếu đang áp dụng) mã khuyến mãi đã được xác nhận hợp lệ (`PromoHopLe=true`) ở bước Quote.

Trạng thái: loading ("Đang xử lý..."), lỗi (alert đỏ hiển thị message thật từ backend; riêng lỗi 409 có thêm nút "Làm mới báo giá" gọi lại Quote). Thành công → điều hướng sang `/bookings` kèm dữ liệu booking vừa tạo qua router state.

`BookingsPage.tsx` (route `/bookings`, đã có sẵn từ M1): nếu được điều hướng tới kèm booking vừa tạo → hiển thị màn "Booking result" đầy đủ (mã xác nhận, trạng thái, khách sạn, ngày lưu trú, chi tiết từng loại phòng, tổng tiền phòng, giảm giá, tổng thanh toán, ghi chú, chính sách hủy với các mốc hoàn tiền); nếu truy cập trực tiếp/refresh (không có state) → giữ nguyên empty-state gốc từ M1. **Không tạo bất kỳ luồng thanh toán nào** — chỉ có ghi chú "chức năng thanh toán sẽ được hỗ trợ ở phase tiếp theo".

## 8. Regression M1–M4

Toàn bộ 126 test backend cũ (M1–M4) và 37 test frontend cũ vẫn PASS nguyên vẹn. Refactor `quotes.service.ts` để dùng chung `priceRoomLine()` với Booking không làm thay đổi hành vi — xác nhận bằng 19 test Quote cũ (M4) vẫn PASS y hệt trước refactor.

## 9. Database schema có thay đổi không

**KHÔNG.** Không `CREATE`/`ALTER TABLE` nào trong M5, không có M5 Design Issue nào cần treo. Toàn bộ yêu cầu (transaction, khóa, lưu `MaChinhSachHuy`/`MaKhuyenMai`/các tổng tiền, trạng thái ban đầu) đều dùng đúng các cột đã có sẵn từ DB-0/Gate 0.

## 10. M5 kết quả

**PASS** — toàn bộ yêu cầu đều có bằng chứng chạy thật: 14 test tích hợp DB thật (bao gồm test concurrency chạy song song thật trên SQL Server, lặp lại 3 lần ổn định) + smoke test HTTP thật (đăng ký → đăng nhập → tìm kiếm → chi tiết → quote → xác nhận đặt phòng → verify tồn kho giảm đúng → verify các lỗi 400/401 đúng mã), không có hạng mục BLOCKED.

- [x] Backend tính lại toàn bộ availability/giá/khuyến mãi/tổng tiền/chính sách hủy — không tin quote hay input từ FE
- [x] Transaction + khóa (`UPDLOCK`/`ROWLOCK`/`HOLDLOCK`) chống overbooking — verified bằng test đồng thời thật, lặp lại ổn định
- [x] Rollback sạch — không để lại `DAT_PHONG`/`CHI_TIET_DAT_PHONG` rác khi thất bại (verified bằng đếm số dòng trước/sau)
- [x] Trạng thái ban đầu `"Chờ thanh toán"`, không trừ trực tiếp `SoLuongPhong`
- [x] FE hoàn thiện flow Hotel Detail → Quote → Xác nhận → Booking result, đủ loading/error/concurrency-conflict states
- [x] Chưa đụng đến payment/refund/cancel/review
- [x] Backend/Frontend lint/typecheck/build/test PASS
- [x] Regression M1–M4 nguyên vẹn (143 backend + 40 frontend)
- [x] Không đổi schema, không có Design Issue treo

Đủ điều kiện chuyển sang phase sau (thanh toán).

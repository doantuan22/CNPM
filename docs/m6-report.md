# M6 – Payment, Cancellation & Refund Report

Covers thanh toán VNPAY Sandbox, chống giữ phòng vô thời hạn ("Chờ thanh toán" timeout), hủy đặt phòng theo chính sách hủy, và hoàn tiền (kèm idempotency cho callback/retry).

## 0. Audit trước khi triển khai

- `THANH_TOAN`/`HOAN_TIEN` đã có sẵn đầy đủ cột cần thiết (M5 report §baseline không đổi): `MaGiaoDichDoiTac VARCHAR(100)`, `TrangThai NVARCHAR(30)` không có `CHECK` giới hạn domain (khác `LoaiYeuCau` của `YEU_CAU_HO_TRO` — bảng đó có CK, còn `THANH_TOAN`/`HOAN_TIEN` không) — tự do định nghĩa `PAYMENT_STATUS`/`REFUND_STATUS` ở tầng ứng dụng như `BOOKING_STATUS`/`CANCELLATION_POLICY_STATUS` đã làm.
- `DAT_PHONG` không có cột "hạn thanh toán"/"trạng thái hết hạn" riêng — chỉ có `NgayTao`/`TrangThai` sẵn có. Quyết định: **không đổi schema** — dùng `NgayTao` + timeout (env `PAYMENT_TIMEOUT_MINUTES`, mặc định 15 phút) để phát hiện hold quá hạn, và **tái dùng chính status `"Đã hủy"` đã có** thay vì thêm status mới ("Hết hạn") — mọi nơi trong codebase đã kiểm tra `TrangThai <> 'Đã hủy'` để tính occupancy (availability, quote, booking, payment, refund), nên tái dùng đúng status này là **một điểm ghi duy nhất** miễn phí toàn hệ thống. Xem chi tiết §2.
- Phát hiện env đã có sẵn khung `VNPAY_TMN_CODE/VNPAY_HASH_SECRET/VNPAY_PAYMENT_URL/VNPAY_RETURN_URL/VNPAY_IPN_URL` (giá trị dev/dev — sandbox thật chưa cấp) từ trước, nhưng `VNPAY_RETURN_URL`/`VNPAY_IPN_URL` trỏ `/api/v1/payment/...` — **sai prefix**, vì `app.ts` mount API ở `/api` (không có `/v1`). Đã sửa thành `/api/payments/vnpay-return`/`/api/payments/vnpay-ipn` (khớp route thật triển khai ở §1) — sửa cả `.env`, `.env.example`, default trong `env.ts`.
- Không có cột nào trên `THANH_TOAN` để lưu riêng `vnp_TransactionNo`/`vnp_PayDate` của VNPAY (chỉ có 1 cột `MaGiaoDichDoiTac`) — cần cả hai để gọi API hoàn tiền thật của VNPAY sau này. Quyết định: **không đổi schema** — đóng gói `txnRef:transactionNo:payDate` vào chính `MaGiaoDichDoiTac` (`vnpay.ts` `encodeGatewayRef`/`decodeGatewayRef`), vẫn nằm trong `VARCHAR(100)`. Không có Design Issue nào cần treo.
- `CHI_TIET_DAT_PHONG` không lưu giá từng dòng (đúng Gate 0, kế thừa từ M5) — nghĩa là `GET /bookings/:id` **không thể** dựng lại `GiaTheoDem`/`ThanhTien` cho từng dòng phòng như response tạo booking (M5) — chỉ còn tổng `TongTienPhong`/`SoTienGiam`/`TongTienThanhToan` ở mức `DAT_PHONG` là chính xác/lưu trữ được. Response detail trả `GiaTheoDem`/`ThanhTien` = `null` cho từng dòng, FE hiển thị "tên loại phòng × số lượng" không kèm giá dòng — đây là giới hạn thiết kế đã có từ Gate 0, không phải lỗi M6.

## 1. Payment (VNPAY Sandbox)

| Method | Path | Ghi chú |
|---|---|---|
| POST | `/api/bookings/:id/payments/vnpay` | Auth customer, chỉ chủ booking. Tạo `THANH_TOAN` "Chờ xử lý" + trả `paymentUrl` |
| GET | `/api/bookings/:id/payments/status` | Auth customer, chỉ chủ booking. Trả `THANH_TOAN[]` kèm `HOAN_TIEN[]` lồng trong |
| GET | `/api/payments/vnpay-return` | Public (ký bằng `vnp_SecureHash`) — redirect trình duyệt sau khi thanh toán, 302 về `FRONTEND_URL/payment/result` |
| GET | `/api/payments/vnpay-ipn` | Public (ký bằng `vnp_SecureHash`) — server-to-server, nguồn xác nhận có thẩm quyền |
| POST | `/api/payments/refunds/:id/retry` | Auth customer, chỉ chủ (qua chain HOAN_TIEN→THANH_TOAN→DAT_PHONG) |

**Số tiền luôn lấy từ `DAT_PHONG.TongTienThanhToan` đọc lại trong `createVnpayPayment`** — request body không có field amount nào cả (test "spoofed body {amount:1}" xác nhận backend bỏ qua hoàn toàn, `THANH_TOAN.SoTien` luôn khớp DB, xem `payments.test.ts`).

Chữ ký VNPAY (`backend/src/modules/payments/vnpay.ts`) implement đúng thuật toán tài liệu VNPAY: sort key, `encodeURIComponent` rồi `%20`→`+`, nối `k=v&...`, HMAC-SHA512 với `VNPAY_HASH_SECRET`. `buildPaymentUrl` build URL đầy đủ (`vnp_Amount` = VND×100); `verifyVnpaySignature` dùng chung cho cả return-URL và IPN.

## 2. Callback/IPN idempotency + Booking timeout

**Idempotency:** `PaymentsService.handleCallback()` là một hàm duy nhất dùng chung cho cả return-URL và IPN. Luồng: verify signature → tìm `THANH_TOAN` theo `vnp_TxnRef` (prefix-match vì field bị viết đè thành `txnRef:transactionNo:payDate` sau khi thành công) → **nếu đã ở trạng thái cuối (Thành công/Thất bại) thì trả `RspCode 02`, không đụng gì cả** — đây là chốt idempotency chính. Verified bằng test "repeating the exact same IPN does not double-confirm" (`payments.test.ts`): gọi IPN 2 lần với cùng params, lần 2 trả `02`, DB vẫn đúng 1 `THANH_TOAN`, `DAT_PHONG` vẫn `Đã xác nhận` đúng 1 lần.

Các nhánh lỗi khác đều **không mutate**: sai `vnp_SecureHash` → `97`; amount không khớp `THANH_TOAN.SoTien` đã lưu → `04` (để `PENDING`, cho phép VNPAY gửi lại); `vnp_TxnRef` không tồn tại → `01`. Chỉ khi verify signature + tìm thấy payment `PENDING` + amount khớp mới thực sự finalize, trong 1 transaction.

**Booking timeout (M6 §2):** không đổi schema (xem §0) — `booking-expiry.ts` chạy 1 câu `UPDATE DAT_PHONG SET TrangThai='Đã hủy' ... WHERE TrangThai='Chờ thanh toán' AND NgayTao < cutoff`, gọi **lazily** (không cron/timer) tại mọi điểm đọc trạng thái/tồn kho: đầu transaction tạo booking (trước khi lock `QUY_PHONG_GIA`), trước khi tạo/tra payment, và trước khi list/detail/cancel booking. Verified bằng test thật: một `DAT_PHONG` "Chờ thanh toán" với `NgayTao` chỉnh lùi 60 phút (> mặc định 15 phút) **tự động bị hủy** ngay khi có request đặt phòng khác tranh cùng slot, và slot đó **đặt lại thành công** — còn một hold còn "tươi" thì vẫn chặn đúng như cũ (`bookings-cancel.test.ts`).

**Edge case đã xử lý:** thanh toán thành công đến (IPN) **sau khi** booking đã bị timeout-hủy hoặc bị khách hủy giữa lúc đang thanh toán → `confirmBookingIfPending` trả về 0 dòng ảnh hưởng (guard `WHERE TrangThai='Chờ thanh toán'`) → **không hồi sinh booking đã hủy**, và vì VNPAY thật đã báo nhận tiền, hệ thống **tự tạo `HOAN_TIEN` 100%** ngay lập tức (không giữ tiền khách cho một booking không còn hợp lệ) — test "a late success after the booking already expired" (`bookings-cancel.test.ts`) verify cả 2 vế: booking không đổi lại thành "Đã xác nhận", và `HOAN_TIEN` được tạo + gọi gateway.

## 3. Cancellation

`POST /bookings/:id/cancel` — service tự đọc `DAT_PHONG`, kiểm tra `MaTaiKhoanKhachHang === req.user` (403 nếu không đúng chủ) và `TrangThai ∈ {Chờ thanh toán, Đã xác nhận}` (400 nếu đã "Đã hủy"/"Hoàn tất"). Transition dùng 1 câu `UPDATE ... WHERE TrangThai IN (...)` (guard chống race/double-cancel — trả 0 dòng nếu đã đổi trạng thái ở nơi khác, service trả `409`).

**Chọn tier hoàn tiền** (`bookings/refund-policy.ts`, pure function, unit test riêng): so giờ-trước-nhận-phòng (mốc là **00:00 UTC ngày `NgayNhanPhong`** — cột này là SQL `DATE`, không có giờ, nên đây là mốc chính xác nhất có thể, và FE preview dùng đúng mốc này) với từng `CHI_TIET_CHINH_SACH_HUY.SoGioTruocNhanPhong` **đã lưu sẵn trên `DAT_PHONG.MaChinhSachHuy`** (không phải chính sách "đang active" — đúng yêu cầu "lấy CHINH_SACH_HUY đã lưu trong DAT_PHONG"), chọn tier có threshold lớn nhất mà vẫn thỏa `hoursBefore >= threshold`. Không tier nào thỏa → 0%. `TyLeHoanTien` không bao giờ lấy từ client.

## 4. Refund

- Chỉ tạo `HOAN_TIEN` khi có `THANH_TOAN` **"Thành công"** cho booking đó — booking "Chờ thanh toán" (chưa từng trả tiền) bị hủy thì **không tạo `HOAN_TIEN` nào**, dù tier là gì (test "no HOAN_TIEN is ever created for it").
- `SoTienHoan = round(SoTien_đã_trả × %)`, và `computeRefundAmount()` **clamp cứng** `Math.min(..., amountPaid)` — không bao giờ vượt số đã trả thành công, kể cả nếu % > 100 do lỗi logic (unit test riêng).
- **Gateway abstraction**: `RefundGateway` interface + `VnpayRefundGateway` (gọi thật `merchant_webapi/api/transaction`, `vnp_Command=refund`, ký HMAC-SHA512 kiểu pipe-join đúng tài liệu refund API của VNPAY). Test dùng `FakeRefundGateway` (dependency-injected qua constructor, cùng pattern với `BookingsRepository`) — **không gọi network thật trong test suite** (lý do: `.env` chỉ có `VNPAY_TMN_CODE=dev`/`VNPAY_HASH_SECRET=dev`, không phải merchant thật, nên một network call thật sẽ luôn thất bại/không xác định — test phải không phụ thuộc mạng để chạy ổn định trong CI).
- **Không bao giờ fake refund thành công**: `attemptGatewayRefund()` chỉ set `HOAN_TIEN.TrangThai = "Thành công"` khi gateway (thật hoặc fake trong test) trả `success: true`; gateway lỗi/mạng lỗi → `"Thất bại"`, `NgayHoanTien = null`, giữ nguyên để retry — verified bằng test "a gateway rejection leaves the refund Thất bại".
- **Retry idempotent, không double-refund**: `PaymentsService.retryRefund()` — nếu `HOAN_TIEN` đã `"Thành công"` thì trả nguyên trạng, **không gọi gateway lần 2** (verified: gọi `retryRefund` 2 lần liên tiếp sau khi đã thành công, `FakeRefundGateway.calls.length` vẫn là 1).
- **Live smoke xác nhận đúng hành vi "không fake"**: chạy cancel thật qua server thật với `VNPAY_HASH_SECRET=dev` (không phải merchant thật) → gọi API refund thật của VNPAY sandbox → VNPAY từ chối (sai TMN code thật) → `HOAN_TIEN` chính xác ghi `"Thất bại"`, không giả thành công. Đây là **behaviour đúng cần có**, không phải bug — với credential sandbox thật, đúng cùng code path sẽ ghi "Thành công".

## 5. Frontend flow

- `BookingsPage` (`/bookings`) — đổi từ empty-state tĩnh (M5) thành **danh sách thật** (`GET /bookings`), mỗi dòng có badge trạng thái, bấm vào để sang trang chi tiết.
- `BookingDetailPage` (`/bookings/:id`, mới) — chi tiết đầy đủ + nút **"Thanh toán qua VNPAY"** (chỉ hiện khi "Chờ thanh toán", gọi API tạo payment rồi `window.location.href = paymentUrl`) + nút **"Hủy đặt phòng"** (chỉ hiện khi "Chờ thanh toán"/"Đã xác nhận") mở panel xác nhận hiển thị **preview số tiền hoàn dự kiến** (`features/bookings/refund-preview.ts` — bản sao thuần túy của `refund-policy.ts` bên backend, chỉ để hiển thị trước, backend luôn tính lại độc lập và là nguồn sự thật cuối) + phần **Thanh toán & hoàn tiền** liệt kê từng `THANH_TOAN`/`HOAN_TIEN` kèm badge trạng thái và nút **"Thử lại"** cho hoàn tiền chưa thành công.
- `PaymentResultPage` (`/payment/result`, mới — đích redirect của `vnpay-return`) — đọc `bookingId`/`status` từ query chỉ để hiển thị tạm, rồi gọi `GET /bookings/:id/payments/status` để lấy **trạng thái thật** (test riêng xác nhận: URL hint nói "success" nhưng backend nói "Thất bại" → trang hiển thị thất bại, không tin query param).
- `HotelDetailPage` sau khi tạo booking giờ điều hướng thẳng tới `/bookings/:id` (thay vì `/bookings` kèm state) để khách vào thẳng trang có nút thanh toán.

Frontend không tự quyết định trạng thái/số tiền ở đâu cả — mọi badge/số tiền hiển thị đều lấy trực tiếp từ response backend; `refund-preview.ts` chỉ là ước lượng trước khi xác nhận.

## 6. Tests + Live smoke

**Backend — 198/198 PASS** (14 file test, gồm 178 cũ từ M1–M5 + **55 test mới cho M6**):
- `refund-policy.test.ts` (9, unit) — chọn tier, clamp %, biên chính xác (đúng threshold, ngay dưới threshold, âm giờ).
- `vnpay.test.ts` (9, unit) — build URL đúng `vnp_Amount×100`, round-trip signature, phát hiện tamper, encode/decode gateway ref.
- `payments.test.ts` (17, integration, DB thật) — tạo payment (ownership 401/403/404/400, amount giả bị bỏ qua, đã thanh toán rồi thì 400), `GET status` ownership, IPN (thành công xác nhận booking; **duplicate IPN không double-confirm**; sai signature `97`; sai amount `04`; TxnRef lạ `01`; thất bại không xác nhận booking), return-URL redirect đúng.
- `bookings-cancel.test.ts` (20, integration, DB thật + service-level với `FakeRefundGateway`) — ownership/state (401/403/404/400/409), **hủy chưa-trả-tiền không tạo refund**, **hủy giải phóng phòng thật** (đặt lại được qua API thật), **timeout giải phóng phòng thật** (2 test: hold cũ bị sweep, hold mới không bị đụng), 3 tier hoàn tiền (100%/50%/0%), refund không vượt payment, gateway lỗi → "Thất bại" không fake, retry idempotent + 403 retry hộ người khác, late-success-after-expiry auto-refund.

**Frontend — 55/55 PASS** (11 file, gồm 40 cũ từ M1–M5 đã cập nhật theo route mới + **15 test mới**): `BookingsPage.test.tsx`, `BookingDetailPage.test.tsx` (detail render, thanh toán redirect, refund preview, xác nhận hủy, ẩn nút hủy khi đã hủy, retry refund), `PaymentResultPage.test.tsx` (tin backend hơn URL hint).

**Live smoke (server thật, không qua vitest)** — chạy `tsx src/server.ts` thật, gọi HTTP thật end-to-end: `register` → `login` → tạo booking thật (`Chờ thanh toán`) → `POST payments/vnpay` (paymentUrl thật trên `sandbox.vnpayment.vn`) → **tự ký IPN bằng đúng thuật toán VNPAY với `VNPAY_HASH_SECRET=dev`** (hợp lệ vì cả 2 phía dùng cùng secret) → `RspCode 00` → gọi lại IPN y hệt → `RspCode 02` (idempotent) → verify DB `DAT_PHONG` = "Đã xác nhận" → `POST cancel` thật → `TrangThai` = "Đã hủy", `HOAN_TIEN` 500.000đ (100%, đúng tier 231h trước nhận phòng) được tạo → gọi refund gateway thật tới VNPAY sandbox (dev/dev, không phải merchant thật) → VNPAY từ chối → `HOAN_TIEN` = **"Thất bại"** (đúng — không fake) → `GET payments/status` phản ánh đúng toàn bộ. Script tạm, đã xóa sau khi chạy — không có gì thêm vào repo.

## 7. Database schema có thay đổi không

**KHÔNG.** Không `CREATE`/`ALTER TABLE` nào trong M6. Hai chỗ tưởng cần cột mới đều giải quyết được trong ứng dụng (§0): timeout dùng `NgayTao` sẵn có + tái dùng status `"Đã hủy"`; lưu `vnp_TransactionNo`/`vnp_PayDate` đóng gói vào `MaGiaoDichDoiTac` sẵn có. Không có M6 Design Issue nào cần treo.

## 8. Regression M1–M5

Toàn bộ 143 test backend cũ (M1–M5) vẫn PASS nguyên (nay nằm trong tổng 198, +35 test mới không tính booking/payments/refund ở trên là con số cũ chưa đổi — không có test cũ nào bị sửa hành vi). Frontend: cập nhật duy nhất 1 chỗ trong `HotelDetailPage.test.tsx` (route đích sau khi đặt phòng đổi từ `/bookings` sang `/bookings/:id` — route thay đổi có chủ ý, không phải hành vi cũ bị hỏng), 40 test cũ còn lại PASS y hệt.

## 9. M6 kết quả

**PASS** — mọi yêu cầu đều có bằng chứng chạy thật (198 test backend + 55 test frontend + 1 live smoke thật qua server đang chạy), không có hạng mục BLOCKED.

- [x] Payment VNPAY Sandbox: tạo yêu cầu, payment URL, return URL, IPN, tra cứu trạng thái — amount luôn từ `DAT_PHONG`
- [x] Payment thành công → `THANH_TOAN` Thành công + `DAT_PHONG` Đã xác nhận; thất bại → lưu đúng trạng thái, không xác nhận booking
- [x] Callback/IPN idempotent — verified bằng test gọi trùng thật
- [x] Booking "Chờ thanh toán" không giữ phòng vô thời hạn — dùng trạng thái + `NgayTao` có sẵn, không đổi schema
- [x] Cancellation: ownership + state + tier theo `CHINH_SACH_HUY` lưu trên booking + tính tỷ lệ hoàn ở backend
- [x] Refund: tạo đúng, tính ở backend, không vượt payment, retry/callback idempotent, không double-refund, không refund giả cho booking chưa trả tiền
- [x] Frontend: trang Payment (nút thanh toán trong Booking Detail), payment result, booking detail/history, Cancel Booking, hiển thị chính sách hủy, preview hoàn tiền, refund status
- [x] Backend/Frontend lint + typecheck + build + test PASS
- [x] Live smoke thật: booking → payment sandbox → callback/IPN → confirmed → cancel → refund/status
- [x] Không đổi schema, không có Design Issue treo
- [x] Không mở rộng sang review/support/reports/analytics

Đủ điều kiện chuyển sang phase sau.

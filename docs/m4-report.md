# M4 – COMMERCIAL RULES Report

Covers DB-3 (đọc chính sách hủy + khuyến mãi), BE-5 (Quote API + logic khuyến mãi), FE-3 (bước Quote trong booking flow).

## 1. Audit trước khi triển khai

- `CHINH_SACH_HUY` không có `MaDatPhong`/`MaKhachSan` (chính sách hủy là dữ liệu **hệ thống**, không gắn theo khách sạn hay đơn đặt phòng cụ thể) — đúng G0-03, không có cách map "chính sách áp dụng cho khách sạn X". Quyết định: chính sách áp dụng cho một quote là **chính sách `Hoạt động` có `MaChinhSachHuy` nhỏ nhất** (cũ nhất còn hoạt động) — quy tắc xác định (deterministic), không phải suy đoán, và ổn định vì chính sách mới luôn có id lớn hơn.
- `KHUYEN_MAI` không có bảng `KHUYEN_MAI_KHACH_SAN` (đúng G0-01) — khuyến mãi chỉ toàn hệ thống (`PhamViApDung='Toàn hệ thống'`), không có khuyến mãi riêng theo khách sạn.
- Không có `CHI_TIET_GIA_DAT_PHONG` — giá phòng lấy trực tiếp theo ngày từ `QUY_PHONG_GIA`, đúng logic availability đã có từ M2 (`hotels/availability.ts`).
- `hotels.repository.ts`'s `roomTypeInclude(checkIn, checkOut)` (M2) đã đúng shape cần cho Quote (giá + tồn kho theo ngày) — export lại để `quotes` module tái sử dụng nguyên, tránh viết lại logic availability lần 2.
- Không phát hiện nhu cầu đổi schema nào trong M4 — không có M4 Design Issue.

## 2. API đã làm

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/cancellation-policies` | Public — danh sách chính sách hủy đang `Hoạt động` kèm các mốc hoàn tiền |
| GET | `/api/cancellation-policies/:id` | Public — chi tiết một chính sách |
| POST | `/api/hotels/:id/quote` | Public — báo giá: `{checkIn, checkOut, rooms: [{maLoaiPhong, soLuong}], promoCode?}` |

Chi tiết contract trong `backend/src/config/openapi.ts`.

## 3. Logic Quote

`quotes.service.ts`, theo đúng thứ tự spec yêu cầu:

1. Xác nhận khách sạn tồn tại và đang hoạt động; xác nhận mọi `maLoaiPhong` được yêu cầu thuộc đúng khách sạn (400 nếu không).
2. Với mỗi loại phòng: dùng lại `computeRoomTypeAvailability` (M2) trên khoảng đêm `[NgayNhanPhong, NgayTraPhong)` (checkout không tính là đêm ở) để lấy `GiaTheoDem`/`SoPhongConLai`/`DuPhong`/`CoGiaDayDu` cho từng ngày; nếu thiếu `QUY_PHONG_GIA` cho bất kỳ đêm nào → `CoGiaDayDu=false`, `GiaTheoDem=null`, `ThanhTien=null` (không crash, không đoán giá).
3. `KhaDung = tất cả dòng đều DuPhong && CoGiaDayDu`; `TongTienPhong = tổng ThanhTien` (dòng `null` tính là 0).
4. Nếu có `promoCode`: tra `KHUYEN_MAI` theo mã, đếm số lần đã dùng (loại trừ đơn `Đã hủy`), rồi chạy qua `evaluatePromotion()` (pure function, có 10 unit test riêng) kiểm tra: `TrangThai`, còn hạn (`NgayBatDau`/`NgayKetThuc`), còn lượt (`SoLuongGioiHan`, 0 = không giới hạn), đạt `GiaTriDonToiThieu`, rồi tính `SoTienGiam` theo `LoaiGiamGia` (Phần trăm — chặn trần `MucGiamToiDa` nếu > 0; Số tiền cố định — không chặn trần), và không bao giờ vượt quá `TongTienPhong`.
5. `TongTienThanhToan = TongTienPhong - SoTienGiam`.
6. Trả kèm chính sách hủy áp dụng (mục 1).
7. Toàn bộ **luôn trả 200** kèm cờ trạng thái rõ ràng (`KhaDung`, `PromoHopLe`, `PromoThongBao`) thay vì chặn cả request — chỉ input sai thật sự (ngày sai, phòng không thuộc khách sạn, phòng trùng trong request) mới trả 400.
8. **Frontend không thể ghi đè tổng tiền**: Zod schema của request quote không có field `TongTienThanhToan`/`SoTienGiam` — client gửi kèm các field này sẽ bị bỏ qua hoàn toàn; có test riêng xác nhận (gửi `TongTienThanhToan: 1, SoTienGiam: 999999999` → server vẫn trả giá trị tự tính đúng), và xác nhận lại bằng smoke test thật (mục 7).

## 4. Logic khuyến mãi (Gate 0)

- Chỉ hỗ trợ khuyến mãi **toàn hệ thống**, không có bảng/khái niệm khuyến mãi theo khách sạn.
- Validate đầy đủ: mã tồn tại, `TrangThai='Hoạt động'`, trong khoảng `NgayBatDau`–`NgayKetThuc`, còn lượt sử dụng nếu có giới hạn, đạt giá trị đơn tối thiểu.
- 2 loại giảm giá: **Phần trăm** (có thể có trần `MucGiamToiDa`, `=0` nghĩa là không trần) và **Số tiền cố định** (không áp trần `MucGiamToiDa`).
- Giảm giá không bao giờ vượt quá `TongTienPhong` (làm tròn số nguyên).
- Đơn `Đã hủy` không tính vào số lượt đã dùng của một mã khuyến mãi.

## 5. UI đã làm

`HotelDetailPage.tsx` — hoàn thiện panel "Báo giá" bên cạnh danh sách loại phòng (thay hoàn toàn placeholder tĩnh cũ):

- Chọn loại phòng → tự động gọi Quote API (không cần bấm thêm nút); có ô chỉnh số lượng phòng (tự gọi lại quote khi đổi).
- Hiển thị: số đêm × số phòng, giá/đêm, tổng tiền phòng, ô nhập mã khuyến mãi + nút "Áp dụng", thông báo hợp lệ/không hợp lệ của mã, số tiền giảm, tổng thanh toán cuối cùng (nổi bật), chính sách hủy kèm các mốc hoàn tiền theo giờ.
- States: loading (spinner), error (alert đỏ), sold-out/thiếu giá (`KhaDung=false` → alert vàng), chưa chọn phòng (hướng dẫn).
- Nút "Tiếp tục đặt phòng" **luôn disabled** kèm ghi chú đây chỉ là báo giá tạm tính — đúng yêu cầu **không tạo `DAT_PHONG` thật trong M4**.
- Toàn bộ số liệu hiển thị lấy thẳng từ response của `POST /hotels/:id/quote` — frontend không tự cộng/trừ/nhân giá ở bất kỳ đâu.

## 6. Regression M1–M3

- **Backend**: toàn bộ 95 test cũ (M1: auth/RBAC/profile/admin/partners; M2: search/hotel-detail/rooms/availability; M3: owner hotels/room-types/rates + locations + amenities) vẫn PASS nguyên vẹn, không chỉnh sửa logic của các module đó (chỉ export thêm `roomTypeInclude` từ `hotels.repository.ts`, không đổi hành vi).
- **Frontend**: toàn bộ test cũ (auth pages, hotel list/detail, owner portal, protected route, app shell) vẫn PASS; `HotelDetailPage.test.tsx` được mở rộng thêm test cho Quote (route selection cũ vẫn giữ nguyên hành vi, chỉ thêm mock cho `features/quotes/api`).

## 7. Tests / Kết quả

**Backend — 126/126 PASS** (95 cũ + **31 mới**: 10 `promotion-pricing.test.ts` [unit, pure logic], 2 `cancellation-policies.test.ts`, 19 `quotes.test.ts` [integration, DB thật]). `quotes.test.ts` bao phủ đúng toàn bộ danh sách tối thiểu yêu cầu: nhiều đêm, nhiều loại phòng, ngày trả phòng không tính đêm, thiếu `QUY_PHONG_GIA`, hết phòng, khuyến mãi hợp lệ (phần trăm không trần, phần trăm có trần, số tiền cố định), khuyến mãi chưa bắt đầu/hết hạn, chưa đạt giá trị tối thiểu, mã không tồn tại, hết lượt sử dụng, đơn đã hủy không tính vào lượt dùng, và **client không thể ghi đè tổng tiền**.

**Frontend — 37/37 PASS** (30 cũ + **7 mới** trong `HotelDetailPage.test.tsx`: gọi quote khi chọn phòng + hiển thị tổng tiền/chính sách hủy, áp mã khuyến mãi thành công, áp mã không hợp lệ, cảnh báo hết phòng, lỗi request).

Toàn bộ regression: backend `lint`/`tsc --noEmit`/`build`/`test` PASS; frontend `lint`/`tsc -b`/`vite build`/`test` PASS (build thật qua `tsc -b`, không chỉ `--noEmit`).

## 8. Integration smoke (chạy thật)

Chạy `tsx watch src/server.ts` (server thật, SQL Server thật) rồi `curl` qua đúng hành trình **Search → Hotel Detail → chọn phòng/ngày → Quote → nhập mã khuyến mãi → xác nhận tổng tiền & chính sách hủy**, dùng khách sạn thật "Grand Saigon Hotel" (`MaKhachSan=4`, loại phòng Standard `MaLoaiPhong=4`, 900.000đ/đêm):

1. `GET /api/hotels?checkIn=...&checkOut=...` → thấy khách sạn trong kết quả tìm kiếm.
2. `GET /api/hotels/4` và `GET /api/hotels/4/rooms?checkIn=2026-09-27&checkOut=2026-09-29&guests=2` → Standard có giá `900.000đ/đêm`, còn phòng.
3. `POST /api/hotels/4/quote` (2 đêm, 2 phòng Standard, không mã): `TongTienPhong=3.600.000`, `TongTienThanhToan=3.600.000`, `KhaDung=true`, trả kèm chính sách hủy "Hủy linh hoạt (demo)" với 3 mốc hoàn tiền (48h/100%, 24h/50%, 0h/0%).
4. Seed tạm một mã khuyến mãi thật (`SMOKE10`: giảm 10%, tối thiểu 1.000.000đ, trần 200.000đ) → gọi lại quote với `promoCode: "smoke10"` (chữ thường, kiểm tra không phân biệt hoa/thường) → `SoTienGiam=200.000` (10% của 3.600.000 = 360.000 bị chặn đúng trần 200.000), `TongTienThanhToan=3.400.000`, `PromoHopLe=true`. Xóa mã tạm ngay sau khi xong.
5. Gọi lại với mã không tồn tại (`NOPE_DOES_NOT_EXIST`) → vẫn 200, `PromoHopLe=false`, `PromoThongBao="Mã khuyến mãi không tồn tại"`, `TongTienThanhToan` giữ nguyên `3.600.000` (không mất giá phòng dù mã sai).
6. Gửi kèm `TongTienThanhToan: 1, SoTienGiam: 999999999` trong body request → server bỏ qua hoàn toàn, vẫn trả đúng `3.600.000` tự tính — xác nhận thật bằng HTTP, không chỉ bằng test.
7. `GET /api/cancellation-policies` → trả đúng danh sách chính sách hủy, không có field `MaDatPhong`/`MaKhachSan` nào trong response (đúng G0-03).

Không tạo `DAT_PHONG` nào trong toàn bộ smoke test — đúng phạm vi M4.

## 9. Database schema có thay đổi không

**KHÔNG.** Không `CREATE`/`ALTER TABLE` nào trong M4, không có M4 Design Issue nào cần treo. Toàn bộ nhu cầu (đọc chính sách hủy hệ thống, khuyến mãi toàn hệ thống, tính giá theo `QUY_PHONG_GIA`) đều giải quyết được với schema hiện có từ DB-0/Gate 0.

## 10. M4 kết quả

**PASS** — toàn bộ yêu cầu đều có bằng chứng chạy thật (test tích hợp DB thật + smoke test HTTP thật), không có hạng mục BLOCKED.

- [x] Đọc `CHINH_SACH_HUY`/`CHI_TIET_CHINH_SACH_HUY` đúng, không xử lý hủy đơn thật
- [x] Khuyến mãi toàn hệ thống, validate đầy đủ (mã/hạn/trạng thái/tối thiểu/loại giảm/trần/lượt dùng)
- [x] Quote API tính đúng giá theo `QUY_PHONG_GIA` từng ngày, không tính đêm checkout
- [x] Backend tính toàn bộ giá/giảm giá/tổng tiền — frontend không thể ghi đè (có test + smoke xác nhận)
- [x] FE hoàn thiện bước Quote: giá, mã khuyến mãi, giảm giá, tổng tiền, chính sách hủy, đủ loading/error/invalid-promo/sold-out states
- [x] Không tạo `DAT_PHONG` thật trong M4
- [x] Backend/Frontend lint/typecheck(`tsc -b`)/build/test PASS
- [x] Regression M1–M3 nguyên vẹn (126 backend + 37 frontend)
- [x] Không đổi schema, không có Design Issue treo

Đủ điều kiện chuyển sang phase sau (M5 — tạo đơn đặt phòng thật / thanh toán).

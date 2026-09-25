# M2 – DISCOVERY Report

Covers DB-2 (dev/demo data), BE-2 (public hotel search + detail), BE-4 read-only (price + availability), and FE-2 (Search → Results → Hotel Detail → Room Selection).

## 1. Audit trước khi triển khai

- Schema đã có sẵn đầy đủ (22 bảng từ DB-0, không cần thay đổi): `DIA_PHUONG`, `KHACH_SAN`, `HINH_ANH_KHACH_SAN`, `TIEN_NGHI`, `KHACH_SAN_TIEN_NGHI`, `LOAI_PHONG`, `HINH_ANH_LOAI_PHONG`, `LOAI_PHONG_TIEN_NGHI`, `QUY_PHONG_GIA` (đã có `UNIQUE(MaLoaiPhong, NgayApDung)` từ đợt resolve DDI-02), `DAT_PHONG`, `CHI_TIET_DAT_PHONG`.
- `frontend/src/pages/{HotelListPage,HotelDetailPage}.tsx` và `frontend/src/features/{hotels,bookings}/types.ts` chỉ là placeholder tĩnh (dữ liệu hard-code) — thay thế hoàn toàn bằng dữ liệu thật.
- `backend/src/modules/{health,auth,profile,accounts,partners}` xác lập pattern module (routes/controller/service/repository[/test]) — áp dụng nguyên cho `hotels` và `amenities`.
- Phát hiện 1 bug thật trong middleware dùng lại từ M1: `validateRequest` chỉ chấp nhận `AnyZodObject`, nhưng schema tìm kiếm M2 cần `.refine()` (trả về `ZodEffects`, không phải `ZodObject`) để validate `checkOut > checkIn` — đã nới kiểu sang `ZodTypeAny` (thay đổi tối thiểu, không ảnh hưởng các route khác).

## 2. API đã làm

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/api/hotels` | Search/list — `location`, `checkIn`/`checkOut` (bắt buộc), `guests`, `minPrice`/`maxPrice`, `starRating`, `amenities` (id, phân tách dấu phẩy), `page`/`limit`, `sort` (`price_asc\|price_desc\|star_desc\|newest`) |
| GET | `/api/hotels/:id` | Hotel detail — thông tin, ảnh, tiện nghi (không cần ngày) |
| GET | `/api/hotels/:id/rooms` | Danh sách loại phòng + giá + tồn phòng theo `checkIn`/`checkOut` (bắt buộc) + `guests` (lọc sức chứa) |
| GET | `/api/amenities` | Danh sách tiện nghi công khai — phục vụ UI filter |

Toàn bộ public, không cần auth (đúng scope Discovery). Chi tiết contract trong `backend/src/config/openapi.ts`.

## 3. UI đã làm

- **HomePage**: tích hợp `SearchForm` (địa điểm/ngày/khách) ngay ở hero, submit điều hướng sang `/hotels` kèm query params.
- **HotelListPage**: search bar dùng lại, sidebar filter (khoảng giá, hạng sao tối thiểu, tiện nghi — nạp từ `/api/amenities`), dropdown sort, lưới kết quả (ảnh/hạng sao/giá "từ .../đêm"/badge "Hết phòng"), phân trang. Toàn bộ state đồng bộ hai chiều với URL query params (`useSearchParams`) — có thể copy/share/refresh link.
- **HotelDetailPage**: header + gallery + mô tả + tiện nghi; form đổi ngày/khách cập nhật lại danh sách phòng; danh sách loại phòng hiển thị sức chứa/giường/diện tích, giá/đêm, tổng tiền cho cả kỳ lưu trú, số phòng còn lại, badge "Hết phòng" và disable khi `ConHang=false`; chọn loại phòng hiển thị tóm tắt ở sidebar; nút "Tiếp tục đặt phòng" bị disable với ghi chú rõ ràng "mở ở M3" (không implement booking, đúng scope).
- Tất cả trang có đủ trạng thái: loading (spinner + `role="status"`), error (`role="alert"` + message thật từ API), empty ("Không tìm thấy khách sạn phù hợp" / "Không có loại phòng phù hợp"), validation (ngày trả phải sau ngày nhận, cả ở form ngoài và trong trang chi tiết).

## 4. Seed/dev data đã thêm

`backend/prisma/seed-discovery.ts` (chạy: `npm run seed:discovery` trong `backend/`) — script TypeScript (không phải `.sql`) vì cần băm mật khẩu bcrypt thật cho 3 tài khoản demo, dùng chung `hashPassword()`/Prisma Client với ứng dụng, **idempotent** (đã verify chạy 2 lần cho cùng kết quả — không tạo trùng, `QUY_PHONG_GIA` dùng `upsert`):

- 3 tài khoản demo: `seed_owner` (Chủ khách sạn), `seed_admin` (Quản trị hệ thống, dùng làm `MaTaiKhoanDuyet`), `seed_customer` (Khách hàng, dùng cho các đơn mẫu).
- 3 địa phương: Hồ Chí Minh, Hà Nội, Đà Nẵng.
- 8 tiện nghi, 1 chính sách hủy hệ thống (+ 3 mức hoàn tiền).
- 4 khách sạn (`TrangThai='Hoạt động'`, đã duyệt): Grand Saigon Hotel (5★, HCM), Saigon Riverside Inn (3★, HCM), Hanoi Boutique Residence (4★, Hà Nội), Da Nang Beach Resort (5★, Đà Nẵng) — 9 loại phòng tổng cộng, mỗi loại có ảnh + tiện nghi riêng.
- **405 bản ghi `QUY_PHONG_GIA`** (9 loại phòng × 45 ngày kể từ ngày chạy seed), giá có phụ thu cuối tuần (+15% đêm Thứ 6/Thứ 7).
- **3 đơn đặt phòng mẫu** dựng sẵn 3 kịch bản availability: (1) đặt một phần (4/6 phòng Standard tại Grand Saigon), (2) hết phòng hoàn toàn (2/2 Suite tại Da Nang), (3) **đã hủy** (5/5 Deluxe tại Da Nang, cùng khoảng ngày với kịch bản 2) — dựng riêng để chứng minh booking hủy không bị tính vào tồn kho.

## 5. Availability logic

Tách thành module thuần (`backend/src/modules/hotels/availability.ts`), không phụ thuộc DB, unit-test độc lập:

- Kỳ lưu trú là nửa khoảng `[NgayNhanPhong, NgayTraPhong)` — `enumerateNights()` sinh danh sách đêm, **loại trừ ngày trả phòng**.
- `available(đêm) = QUY_PHONG_GIA.SoLuongPhong(đêm) − booked(đêm)`, với `booked(đêm)` là tổng `CHI_TIET_DAT_PHONG.SoLuongPhong` của các đơn có `DAT_PHONG.TrangThai ≠ 'Đã hủy'` và khoảng lưu trú phủ đêm đó.
- Tồn phòng cho cả kỳ = **min** qua tất cả các đêm (đêm nghẽn cổ chai/bottleneck). Đêm không có bản ghi `QUY_PHONG_GIA` → coi là 0 (không có gì để bán).
- Giá tổng = tổng giá các đêm nếu **mọi** đêm đều có `QUY_PHONG_GIA`, ngược lại `null` (không định giá được).
- Repository lọc điều kiện lấy dữ liệu ứng viên tại DB (trạng thái Hoạt động, sức chứa, ngày, `TrangThai='Mở bán'`); phần lọc theo `minPrice`/`maxPrice` chạy sau khi tính toán (in-memory) vì giá phụ thuộc kết quả tính toán — phù hợp quy mô demo hiện tại, cần tối ưu lại (query-level) nếu số khách sạn tăng lớn ở phase sau — ghi nhận là giới hạn đã biết, không phải lỗi.

## 6. Tests / Kết quả

**Backend — 68/68 tests PASS** (52 cũ từ M1 + DDI cleanup, 16 mới cho `hotels`, cộng 1 test `amenities` — chi tiết dưới), toàn bộ chạy thật với SQL Server + Prisma (không mock):

- `availability.test.ts` (11, thuần logic không cần DB): loại trừ ngày trả phòng, 1 đêm, ngày không hợp lệ, đủ chỗ không booking, trừ đúng theo booking, không âm khi overbook, sold-out khi thiếu `QUY_PHONG_GIA`, loại trừ booking hủy, gộp nhiều đêm/nhiều booking chồng lấn, format ngày.
- `hotels.test.ts` (16, tích hợp DB thật, dùng dữ liệu seed): search/filter theo địa điểm, phân trang, lọc theo khoảng giá, lọc theo sức chứa khách, ngày không hợp lệ (bị 400) và thiếu ngày bắt buộc, hotel detail (200 + 404), room list có giá khi không booking, **availability có booking** (trừ đúng số phòng), **checkout date không tính là một đêm bị chiếm** (kiểm chứng bằng truy vấn ngay sau ngày trả phòng của 1 booking có sẵn), **sold out** (0 phòng, `ConHang=false`), **không overcount booking đã hủy** (booking hủy cùng ngày/cùng số lượng với booking sold-out ở phòng khác, xác nhận không ảnh hưởng), lọc theo sức chứa ở room list, 404 khi khách sạn không tồn tại.
- `amenities.test.ts` (1): danh sách công khai, sắp xếp theo tên.

**Frontend — 26/26 tests PASS** (16 cũ + 10 mới):

- `HotelListPage.test.tsx` (6): loading, render kết quả kèm giá + badge "Hết phòng", empty state, error state, điều hướng sang chi tiết kèm ngày, filter hạng sao kích hoạt lại query đúng tham số.
- `HotelDetailPage.test.tsx` (4): loading, error, render đầy đủ info/tiện nghi/phòng (phân biệt phòng còn chỗ và hết chỗ — nút hết chỗ bị disable), empty state khi không có loại phòng phù hợp.

**Toàn bộ regression**: backend `lint`/`typecheck`/`build`/`test` PASS; frontend `lint`/`typecheck`/`build`/`test` PASS (build thật qua `tsc -b && vite build`, không chỉ `tsc --noEmit`).

## 7. Integration smoke (chạy thật)

Chạy `tsx src/server.ts` (server thật, cổng TCP thật, không phải supertest in-process) rồi gọi qua `curl` đúng hành trình: **Search → Results → Hotel Detail → chọn ngày → Room List → Price → Availability**, dùng dữ liệu seed thật:

1. `GET /api/hotels?checkIn=2026-10-15&checkOut=2026-10-17&guests=2&sort=price_asc` → trả đúng 4 khách sạn, sắp xếp theo giá tăng dần, tên/địa chỉ tiếng Việt hiển thị đúng.
2. `GET /api/hotels/4` (Grand Saigon Hotel) → đầy đủ thông tin, 3 ảnh, 6 tiện nghi.
3. `GET /api/hotels/4/rooms?checkIn=2026-10-15&checkOut=2026-10-17&guests=2` → 3 loại phòng, giá có phụ thu cuối tuần tính đúng, tồn phòng đầy đủ (không có booking trong khoảng này).

Một lần thử dùng `location=Hồ Chí Minh` trực tiếp qua tham số dòng lệnh bash bị lỗi mã hoá (`Hồ` → `H?`) — đây là giới hạn của môi trường shell/curl trong phiên làm việc này (đã gặp và xác nhận y hệt ở M1/DB-0), **không phải lỗi ứng dụng**: bằng chứng là `hotels.test.ts` (dùng chuỗi JS thật, không qua ranh giới shell) test chính xác filter `location` này và PASS, và response JSON từ các bước 1–3 ở trên hiển thị tiếng Việt hoàn toàn chính xác.

## 8. Database schema có thay đổi không

**KHÔNG.** Không `CREATE`/`ALTER TABLE` nào trong M2. Chỉ thêm dữ liệu qua `seed-discovery.ts` vào các bảng đã tồn tại từ DB-0. Đúng 22 bảng, không có M2 Design Issue nào cần user quyết định.

## 9. M2 kết quả

**PASS.**

- [x] DB-2 dev data đầy đủ, idempotent, đủ để test mọi kịch bản (kể cả sold-out và booking đã hủy)
- [x] BE-2 search + hotel detail hoạt động thật
- [x] BE-4 price + availability tính đúng theo đúng business rule (nửa khoảng ngày, loại trừ hủy)
- [x] FE-2 Search → Results → Detail → Room Selection hoàn thiện, đồng bộ URL, đủ loading/error/empty/validation states
- [x] Backend/Frontend lint/typecheck/build/test đều PASS
- [x] Integration smoke chạy thật qua HTTP thật, dữ liệu thật
- [x] Không có schema change, không có M2 Design Issue treo
- [x] Không mở rộng scope sang booking/payment/promotion/review/support/owner management

## 10. Đủ điều kiện sang M3 chưa

**Đủ điều kiện.** Không có design issue hay công việc dở dang nào cần giải quyết trước M3. Ghi chú duy nhất mang tính kỹ thuật (không chặn): việc lọc `minPrice`/`maxPrice` hiện tính in-memory sau khi lấy dữ liệu ứng viên từ DB — hoạt động chính xác ở quy mô hiện tại, nhưng nên chuyển sang lọc ở tầng query nếu số lượng khách sạn tăng lên đáng kể ở các phase sau.

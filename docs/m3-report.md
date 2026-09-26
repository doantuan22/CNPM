# M3 – SUPPLY / OWNER MANAGEMENT Report

Covers BE-3 (owner hotel/room/amenity/image management), BE-4 write-side (inventory/pricing), and FE-5 (Owner Portal).

## 1. Audit trước khi triển khai

- `backend/src/integrations/cloudinary.integration.ts` đã có sẵn `uploadImage(filePathOrBase64, folder)` / `deleteImage(publicId)` — dùng nguyên, không viết lại.
- `backend/.env` chỉ có Cloudinary placeholder (`dev`/`dev`/`dev`, không phải tài khoản thật) — ghi nhận ngay từ đầu, ảnh hưởng đến khả năng test upload ảnh thật (xem mục 3).
- `HINH_ANH_KHACH_SAN`/`HINH_ANH_LOAI_PHONG` chỉ có cột `URL`, không có cột lưu Cloudinary `public_id` — không thể đổi schema để thêm cột, nên khi xóa ảnh, `public_id` được suy ra ngược từ chính `URL` (`common/utils/cloudinary-url.ts`), không cần schema mới.
- `multer` có trong `package.json` nhưng chưa được dùng ở đâu; quyết định **không** dùng multipart/multer cho M3 — endpoint ảnh nhận base64 data URI trong JSON body (tái sử dụng đúng `CloudinaryIntegration.uploadImage` vốn đã nhận `filePathOrBase64`), tránh thêm tầng phức tạp không cần thiết. Phải tăng giới hạn body JSON toàn cục lên `10mb` trong `app.ts` (mặc định 100kb quá nhỏ cho ảnh base64).
- `frontend/src/pages/OwnerDashboardPage.tsx` chỉ là placeholder tĩnh — thay hoàn toàn bằng dữ liệu thật.
- Route `/owner` đã được bảo vệ bởi `ProtectedRoute allowedRoles={[PARTNER]}` từ M1 — tái sử dụng nguyên.
- Phát hiện: chưa có API public liệt kê `DIA_PHUONG` — cần cho dropdown chọn địa phương khi đăng ký khách sạn (và hữu ích luôn cho ô "địa điểm" ở form tìm kiếm M2). Thêm `GET /api/locations` (module `locations`, cùng pattern tối giản với `amenities` từ M2) — không đổi schema, chỉ thêm 1 endpoint đọc.

## 2. API đã làm

Toàn bộ dưới `/api/owner/*`, yêu cầu `authenticate` + `requireRole('Chủ khách sạn')`; mọi endpoint theo id đều kiểm tra ownership ở service layer (`getOwnedHotel`/`getOwnedRoomType`): 404 nếu không tồn tại, 403 nếu tồn tại nhưng thuộc owner khác.

| Method | Path | Ghi chú |
|---|---|---|
| GET | `/owner/hotels` | Danh sách khách sạn của tôi |
| POST | `/owner/hotels` | Đăng ký khách sạn — luôn `TrangThai='Chờ duyệt'`, `MaTaiKhoanDuyet=null`, owner lấy từ token, không tin body |
| GET/PATCH | `/owner/hotels/:id` | Xem/cập nhật — `TrangThai`/`MaTaiKhoanDuyet`/`NgayDuyet`/`MaTaiKhoanSoHuu` không nằm trong whitelist PATCH |
| PUT | `/owner/hotels/:id/amenities` | Thay toàn bộ danh sách tiện nghi khách sạn |
| POST/PATCH/DELETE | `/owner/hotels/:id/images[/​:imageId]` | Upload / đặt ảnh đại diện / xóa ảnh khách sạn |
| GET/POST | `/owner/hotels/:hotelId/room-types` | Danh sách / tạo loại phòng cho khách sạn sở hữu |
| GET/PATCH | `/owner/room-types/:id` | Xem/cập nhật loại phòng (bao gồm `TrangThai` mở/ngừng bán — không cần duyệt admin, khác với duyệt khách sạn) |
| PUT | `/owner/room-types/:id/amenities` | Thay toàn bộ tiện nghi loại phòng |
| POST/PATCH/DELETE | `/owner/room-types/:id/images[/​:imageId]` | Upload / đặt ảnh đại diện / xóa ảnh loại phòng |
| GET | `/owner/room-types/:id/rates?from=&to=` | Xem `QUY_PHONG_GIA` theo khoảng ngày |
| PUT | `/owner/room-types/:id/rates` | Tạo/cập nhật hàng loạt (upsert theo `(MaLoaiPhong, NgayApDung)` — không bao giờ tạo trùng) |
| GET | `/api/locations` | Public — danh sách `DIA_PHUONG` |

Chi tiết contract trong `backend/src/config/openapi.ts`.

## 3. Cloudinary đã tích hợp đến đâu

- **Đã tích hợp thật** ở tầng code: `OwnerHotelsService.addImage`/`OwnerRoomTypesService.addImage` gọi thẳng `CloudinaryIntegration.uploadImage()`; xóa ảnh gọi `CloudinaryIntegration.deleteImage()` (best-effort — lỗi phía Cloudinary không chặn việc xóa row DB, tránh ảnh "mồ côi" trong DB nếu Cloudinary tạm thời lỗi).
- **BLOCKED cho phần gọi Cloudinary thật**: môi trường này không có tài khoản Cloudinary thật (`.env` chỉ có placeholder `dev`), nên **không thể** xác nhận upload ảnh thật lên Cloudinary trong integration smoke. Test tự động (`owner-hotels.test.ts`, `owner-room-types.test.ts`) mock `CloudinaryIntegration` — đây là thực hành chuẩn cho một SaaS bên thứ ba trả phí, khác với việc mock chính backend/DB đang test (không vi phạm nguyên tắc "không mock backend"). Toàn bộ phần còn lại của luồng (upload thành công → tạo `HINH_ANH_*` row → set ảnh đại diện → xóa) được test đầy đủ với Cloudinary giả lập.
- Secret Cloudinary (`CLOUDINARY_API_SECRET`) chỉ tồn tại ở backend (`config/env.ts`/`config/cloudinary.ts`), **không** xuất hiện ở frontend dưới bất kỳ hình thức nào — frontend chỉ gửi base64 ảnh lên backend, backend mới là bên gọi Cloudinary.
- DB chỉ lưu `URL` trả về từ Cloudinary, đúng theo cột đã có sẵn trong schema — không thêm cột nào.

## 4. UI đã làm

- **OwnerDashboardPage**: danh sách khách sạn sở hữu (ảnh, hạng sao, trạng thái, địa phương), nút "Đăng ký khách sạn mới", empty/loading/error states.
- **OwnerHotelFormPage**: form đăng ký khách sạn (tên, địa chỉ, địa phương từ `/api/locations`, hạng sao, giờ nhận/trả phòng, mô tả), validate đầy đủ, sau khi tạo điều hướng sang trang quản lý.
- **OwnerHotelManagePage**: form sửa thông tin khách sạn; quản lý hình ảnh (upload/xóa/đặt đại diện, preview lưới); quản lý tiện nghi (checkbox, lưu ngay khi tick); danh sách loại phòng + form tạo nhanh loại phòng mới.
- **OwnerRoomTypeManagePage**: form sửa thông tin loại phòng + nút bật/tắt "Ngừng bán"/"Mở bán lại"; quản lý hình ảnh riêng của loại phòng; quản lý tiện nghi riêng; **giao diện quản lý giá/quỹ phòng theo ngày** — form áp dụng giá + số lượng cho một khoảng ngày (bulk), bảng hiển thị giá hiện tại trong khoảng đang xem.
- Toàn bộ có đủ loading/error/empty/validation/success states; giữ nguyên design system Tailwind hiện tại, không redesign.

## 5. Ownership / RBAC — kết quả test

- Toàn bộ endpoint `/owner/*` chặn tài khoản Khách hàng → **403**, chặn không token → **401** (test thật).
- Owner A truy cập/sửa/tạo con-tài-nguyên (loại phòng, ảnh, giá) trên khách sạn của Owner B → **403** ở mọi endpoint (hotel detail, hotel update, room-type create, room-type update, image upload, rates get/put) — verified bằng test thật với 2 tài khoản owner riêng biệt.
- Hotel/room-type không tồn tại → **404** (phân biệt rõ với 403).
- Mass-assignment guard: gửi kèm `MaTaiKhoanSoHuu`/`TrangThai` khi tạo khách sạn bị bỏ qua hoàn toàn — khách sạn luôn thuộc về người gọi API và luôn ở `Chờ duyệt`; `PATCH` khách sạn gửi kèm `TrangThai` cũng bị bỏ qua.

## 6. Inventory / Pricing — kết quả test

- Tạo mới hàng loạt ngày → đọc lại đúng qua `GET .../rates?from=&to=`.
- Cập nhật lại đúng ngày đã tồn tại → **không tạo dòng trùng** (verify trực tiếp bằng SQL: `COUNT(*) = 1` sau 2 lần PUT cùng ngày), giá/số lượng được ghi đè đúng.
- Gửi trùng `NgayApDung` **trong cùng một request** → **400** (chặn ở tầng validate, không chạm DB).
- `GiaPhong < 0` hoặc `SoLuongPhong < 0` → **400**.
- Cross-owner GET/PUT rates → **403**.

## 7. Regression M1/M2

- **M1 (auth/RBAC/profile/admin accounts/partners)**: 68 test cũ vẫn PASS nguyên vẹn, không chỉnh sửa logic liên quan.
- **M2 (search/hotel-detail/rooms/availability)**: 16 test cũ vẫn PASS nguyên vẹn, **không đụng đến** `hotels.service.ts`/`availability.ts` của M2. Thêm hẳn 1 test M3 chuyên biệt xác nhận **không phá logic availability**: đặt giá/số lượng qua owner API → gọi `GET /api/hotels/:id/rooms` (endpoint public M2) → xác nhận đúng `SoPhongConLai`/`GiaTheoDem`; sau đó đặt `SoLuongPhong=0` qua owner API → xác nhận endpoint public ngay lập tức phản ánh `ConHang=false`. Test này chứng minh explicit rằng M3 ghi dữ liệu đúng chỗ M2 đọc, không có logic trùng lặp/lệch pha.

## 8. Tests / Kết quả

**Backend — 95/95 PASS** (68 M1 + 16 M2 + 11 availability unit-test cũ + 1 amenities + **26 mới cho M3**: 12 `owner-hotels.test.ts`, 7 `owner-room-types.test.ts`, 7 `owner-rates.test.ts`, +1 `locations.test.ts`), chạy thật với SQL Server + Prisma, chỉ mock `CloudinaryIntegration` (bên thứ ba, xem mục 3).

**Frontend — 33/33 PASS** (26 cũ + **7 mới**: 4 `OwnerDashboardPage.test.tsx` loading/empty/error/list, 3 `OwnerHotelFormPage.test.tsx` validation/success-redirect/error).

Toàn bộ regression: backend `lint`/`typecheck`/`build`/`test` PASS; frontend `lint`/`typecheck`/`build` (`tsc -b && vite build`)/`test` PASS.

## 9. Integration smoke (chạy thật)

Chạy `tsx src/server.ts` (server thật) rồi qua `curl` đúng hành trình: **Owner login → quản lý khách sạn → tạo loại phòng → thiết lập giá/quỹ phòng → kiểm tra lại public Hotel Detail/Availability của M2**, dùng tài khoản `seed_owner` (đã seed từ M2) và khách sạn thật "Grand Saigon Hotel":

1. Login `seed_owner` → access token thật.
2. `GET /owner/hotels` → đúng 4 khách sạn thuộc tài khoản này.
3. `POST /owner/hotels/4/room-types` → tạo "Family Room (M3 smoke test)" thành công.
4. `PUT /owner/room-types/39/rates` → set giá 1.200.000đ, 3 phòng cho 2 ngày.
5. `GET /api/hotels/4/rooms` (**endpoint public M2, không auth**) → loại phòng mới xuất hiện đúng: `GiaTheoDem=1200000`, `TongTien=2400000` (2 đêm), `SoPhongConLai=3`, `ConHang=true`.
6. Thêm kiểm chứng "không tự duyệt": tạo khách sạn mới hoàn toàn qua `POST /owner/hotels` → `TrangThai='Chờ duyệt'`, `MaTaiKhoanDuyet=null` → gọi `GET /api/hotels/:id` public ngay lập tức → **404** (khách sạn chưa duyệt không hiện public), đúng theo rule "không cho owner tự duyệt khách sạn".

Toàn bộ dữ liệu test tạo ra trong bước smoke (loại phòng #39, giá, khách sạn demo #58) đã được dọn sạch sau khi xong. **Riêng bước upload ảnh thật lên Cloudinary: BLOCKED** — không có tài khoản Cloudinary thật trong môi trường này (xem mục 3); phần này chỉ được xác nhận qua test tự động với Cloudinary giả lập, không phải qua smoke test thật.

## 10. Database schema có thay đổi không

**KHÔNG.** Không `CREATE`/`ALTER TABLE` nào trong M3. Không có M3 Design Issue nào cần schema mới — nhu cầu lưu `public_id` Cloudinary được giải quyết bằng cách suy ra từ `URL` thay vì thêm cột.

## 11. M3 kết quả

**PASS**, với một hạng mục **BLOCKED do giới hạn môi trường** (không phải lỗi code): xác nhận upload ảnh thật lên Cloudinary trong integration smoke. Toàn bộ phần còn lại — CRUD khách sạn/loại phòng, ownership/RBAC, ảnh (qua Cloudinary giả lập), tiện nghi, inventory/pricing, và regression M1/M2 — đều PASS với bằng chứng chạy thật (test tích hợp DB thật + smoke test HTTP thật).

- [x] Owner CRUD/update hotel đúng quyền
- [x] Cross-owner access = 403 (mọi loại tài nguyên: hotel, room type, image, rates)
- [x] Room type management đầy đủ
- [x] Amenities/images quản lý được (ảnh dùng Cloudinary giả lập trong test do môi trường không có tài khoản thật)
- [x] Inventory-price create/update hoạt động đúng
- [x] Duplicate (MaLoaiPhong, NgayApDung) bị reject
- [x] M2 availability vẫn đúng sau khi cập nhật inventory (có test chuyên biệt + smoke thật)
- [x] Backend/Frontend lint/typecheck/build/test PASS
- [x] Không đổi schema, không có Design Issue treo
- [ ] Upload ảnh thật lên Cloudinary — **BLOCKED** (không có credential thật trong môi trường)

Đủ điều kiện chuyển sang phase sau, với lưu ý: khi có tài khoản Cloudinary thật, nên chạy lại một smoke test thủ công cho riêng luồng upload ảnh trước khi coi tính năng ảnh là production-ready.

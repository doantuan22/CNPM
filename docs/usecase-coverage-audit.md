# UC01–UC40 Coverage Audit

**Audit date:** 2026-09-27
**Scope:** current source under `D:\CNPM`; this report is updated for the scoped UC03/UC32 and UC04 implementations. No database schema or migration was modified.
**Requirement source:** the UC01–UC40 list supplied in the audit prompt is the authoritative specification. No repository UC catalog was sought or required.

## Method and evidence rules

- Primary evidence is the current implementation: Express route/controller/service/repository, React route/page/API client, Prisma model/SQL migration, RBAC/ownership code, and test source.
- `COMPLETE` means the required user flow has a reachable backend implementation, reachable UI, applicable persistence/read model, applicable access control, and test source.
- `PARTIAL` means a material portion exists but an explicit required capability is absent (for example, a form without its approval/delivery workflow).
- `MISSING` means the required capability has no corresponding current endpoint/UI implementation.
- **Test wording:** historical entries may say **“test source present, runtime not verified.”** For this scoped change, observable redirected command logs are used as runtime evidence where noted. Historical `m*-report.md` files are context only and are not used as runtime proof.
- Public discovery UCs legitimately have `Public / N/A` in the RBAC column. Analytics UCs legitimately read existing tables rather than owning a separate persistence table.

## Executive result

| Status | Count | Share of 40 |
|---|---:|---:|
| COMPLETE | 40 | 100% |
| PARTIAL | 0 | 0% |
| MISSING | 0 | 0% |
| **Implemented coverage (COMPLETE only)** | **40 / 40** | **100%** |

## UC matrix

Abbreviations: `BE` = backend route/service; `FE` = frontend route/page/API; `DB` = primary read/write tables; `TS` = test source. All listed paths are absolute.

### Customer UCs (UC01–UC16)

| UC | Requirement | BE evidence | FE evidence | DB evidence | RBAC / ownership | Test evidence | Status |
|---|---|---|---|---|---|---|---|
| UC01 | Đăng nhập | `POST /api/auth/login`, `AuthService.login` in `D:\CNPM\backend\src\modules\auth\auth.routes.ts` / `auth.service.ts` | `/login`, `LoginPage`; `D:\CNPM\frontend\src\features\auth\api.ts` | `TAI_KHOAN`, `VAI_TRO` | Public login; locked account rejected | `backend\src\modules\auth\auth.test.ts`; frontend login test source; **test source present, runtime not verified** | COMPLETE |
| UC02 | Đăng ký tài khoản khách hàng | `POST /api/auth/register`; server assigns customer role | `/register`, `RegisterPage`; auth API | `TAI_KHOAN` FK `VAI_TRO`; unique email/username | Public registration; role is server-selected, not client-selected | `auth.test.ts`; frontend register test source; **test source present, runtime not verified** | COMPLETE |
| UC03 | Đăng ký tài khoản đối tác | Authenticated `POST /api/partners/apply`; creates pending profile in `PartnersService.apply`; `GET /api/partners/me` returns only the caller's latest profile | Protected `/partner/apply`, `PartnerApplyPage` shows Chờ duyệt/Đã duyệt/Từ chối and rejection reason | `HO_SO_DOI_TAC` → `TAI_KHOAN` | Customer-only submission; account ID comes from token; no client-controlled status/role | `D:\CNPM\backend\src\modules\partners\partners.test.ts`: submit, own-scope, status; targeted runtime **10/10 pass** | COMPLETE |
| UC04 | Quên mật khẩu | `POST /api/auth/forgot-password` creates a signed, 15-minute reset URL and sends it through the `EmailService`/Nodemailer SMTP adapter; `/reset-password` verifies it and updates the password | `/forgot-password`, `/reset-password`; `ForgotPasswordPage`, `ResetPasswordPage` | `TAI_KHOAN.MatKhau` and `NgayCapNhat` updated by reset; no reset-token table is required by this design | Public generic response prevents enumeration; used token becomes invalid because it fingerprints the former password hash; rate-limited | `auth.service.test.ts` (SMTP fake, failure, valid/invalid/expired/used token); `auth.test.ts` (API response and old/new login); `PasswordResetPages.test.tsx`; targeted tests passed | COMPLETE |
| UC05 | Tìm kiếm thông tin khách sạn | `GET /api/hotels` with validation/filter/pagination | `/hotels`, `HotelListPage`, `features/hotels/api.ts` | `KHACH_SAN`, `DIA_PHUONG`, `LOAI_PHONG`, `QUY_PHONG_GIA`, amenities | Public | `hotels.test.ts`, `HotelListPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC06 | Cập nhật thông tin cá nhân | `GET/PATCH /api/profile/me` | Protected `/profile`, `ProfilePage`; auth API `getMe/updateMe` | `TAI_KHOAN` | `authenticate`; service updates only the authenticated account and whitelists fields | `profile.test.ts`; profile UI test source; **test source present, runtime not verified** | COMPLETE |
| UC07 | Xem thông tin khách sạn | `GET /api/hotels/:id` | `/hotels/:id`, `HotelDetailPage` | `KHACH_SAN`, `DIA_PHUONG`, `HINH_ANH_KHACH_SAN`, `TIEN_NGHI`, `KHACH_SAN_TIEN_NGHI` | Public | `hotels.test.ts`, `HotelDetailPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC08 | Xem thông tin loại phòng | `GET /api/hotels/:id/rooms` | Hotel detail loads room availability via `getHotelRooms` | `LOAI_PHONG`, `HINH_ANH_LOAI_PHONG`, `LOAI_PHONG_TIEN_NGHI`, `QUY_PHONG_GIA` | Public | `hotels.test.ts`, `HotelDetailPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC09 | Đặt phòng | `POST /api/hotels/:id/bookings`; server recomputes price/promotion/availability in a locked transaction | Booking action in `HotelDetailPage`; `createBooking` API | `DAT_PHONG`, `CHI_TIET_DAT_PHONG`, `QUY_PHONG_GIA`, `KHUYEN_MAI`, `CHINH_SACH_HUY` | Customer role only; customer ID comes from token | `bookings.test.ts` includes price/promo/anti-overbooking source; booking UI test source; **test source present, runtime not verified** | COMPLETE |
| UC10 | Thanh toán | Customer `POST /api/bookings/:id/payments/vnpay`; signed VNPAY return/IPN and status route | `BookingDetailPage`, `/payment/result`, `PaymentResultPage`; payments API | `THANH_TOAN`, `DAT_PHONG`; refunds use `HOAN_TIEN` | Customer role and booking ownership; gateway callbacks verify VNPAY signature | `payments.test.ts`, payment-result/booking-detail UI test source; **test source present, runtime not verified** | COMPLETE |
| UC11 | Xem thông tin đặt phòng | `GET /api/bookings/:id` | Protected `/bookings/:id`, `BookingDetailPage` | `DAT_PHONG`, `CHI_TIET_DAT_PHONG`, hotel/room/policy/payment/refund relations | Customer role; service ownership check | `bookings-cancel.test.ts`; booking-detail UI test source; **test source present, runtime not verified** | COMPLETE |
| UC12 | Xem lịch sử đặt phòng | `GET /api/bookings` | Protected `/bookings`, `BookingsPage` | `DAT_PHONG` and related hotel data | Customer role; `listMine` is customer-scoped | `bookings-cancel.test.ts`, `BookingsPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC13 | Hủy đặt phòng | `POST /api/bookings/:id/cancel`; cancellation/refund policy handling | Cancel flow in `BookingDetailPage` | `DAT_PHONG`, `CHI_TIET_DAT_PHONG`, `CHINH_SACH_HUY`, `CHI_TIET_CHINH_SACH_HUY`, `THANH_TOAN`, `HOAN_TIEN` | Customer role and booking ownership/state checks | `bookings-cancel.test.ts`; booking-detail UI test source; **test source present, runtime not verified** | COMPLETE |
| UC14 | Đánh giá khách sạn | `POST/GET /api/bookings/:id/review`; completed-booking eligibility checked server-side | Review section in `BookingDetailPage`; reviews API | `DANH_GIA`, `HINH_ANH_DANH_GIA`, `DAT_PHONG` | Customer role; booking owner only; one review per booking | `reviews.test.ts`; booking-detail UI test source; **test source present, runtime not verified** | COMPLETE |
| UC15 | Áp dụng mã khuyến mãi | Quote and booking services evaluate promo server-side; booking route accepts `promoCode` | Hotel booking flow passes promo code | `KHUYEN_MAI`, then `DAT_PHONG.MaKhuyenMai` / monetary fields | Public quote; booking application is customer-only; server does not trust totals | `promotion-pricing.test.ts`, `quotes.test.ts`, `bookings.test.ts`; booking UI test source; **test source present, runtime not verified** | COMPLETE |
| UC16 | Gửi yêu cầu hỗ trợ/khiếu nại | `POST /api/support` | Protected `/support`, `SupportPage`; support API | `YEU_CAU_HO_TRO`, optional `DAT_PHONG` | Customer role; attached booking must belong to caller | `support.test.ts`, `SupportPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |

### Partner / hotel-owner UCs (UC17–UC26)

| UC | Requirement | BE evidence | FE evidence | DB evidence | RBAC / ownership | Test evidence | Status |
|---|---|---|---|---|---|---|---|
| UC17 | Đăng ký khách sạn mới | `POST /api/owner/hotels`; `OwnerHotelsService.create` | `/owner/hotels/new`, `OwnerHotelFormPage` | `KHACH_SAN`; optional images/amenities relations | `authenticate + requireRole(PARTNER)` | `owner-hotels.test.ts`; `OwnerHotelFormPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC18 | Cập nhật thông tin khách sạn | `PATCH /api/owner/hotels/:id`, amenities/image operations | `/owner/hotels/:id`, `OwnerHotelManagePage` | `KHACH_SAN`, `HINH_ANH_KHACH_SAN`, `KHACH_SAN_TIEN_NGHI` | Partner-only; `getOwnedHotel` gives 404 unknown / 403 other owner | `owner-hotels.test.ts`; owner UI test source; **test source present, runtime not verified** | COMPLETE |
| UC19 | Xóa khách sạn | Partner `POST /api/owner/hotels/:id/deactivate`; uses existing `TrangThai='Ngừng hoạt động'` | Confirmation action in `OwnerHotelManagePage` | `KHACH_SAN` retained with all FK history | Partner ownership; inactive is idempotent and suspended hotels remain admin-controlled | Owner regression tests pass; public queries select only `Hoạt động` | COMPLETE |
| UC20 | Thêm loại phòng | `POST /api/owner/hotels/:hotelId/room-types` | Room-type creation form in `OwnerHotelManagePage` | `LOAI_PHONG` | Partner-only; parent hotel ownership checked | `owner-room-types.test.ts`; owner UI source; **test source present, runtime not verified** | COMPLETE |
| UC21 | Cập nhật loại phòng | `PATCH /api/owner/room-types/:id`, room amenities/images | `/owner/room-types/:id`, `OwnerRoomTypeManagePage` | `LOAI_PHONG`, `HINH_ANH_LOAI_PHONG`, `LOAI_PHONG_TIEN_NGHI` | Partner-only; room type's hotel ownership checked | `owner-room-types.test.ts`; owner UI source; **test source present, runtime not verified** | COMPLETE |
| UC22 | Cập nhật thông tin quỹ phòng | `PUT /api/owner/room-types/:id/rates` bulk upsert | Rate form/table in `OwnerRoomTypeManagePage` | `QUY_PHONG_GIA` | Partner-only; owned room type required | `owner-rates.test.ts`; owner UI source; **test source present, runtime not verified** | COMPLETE |
| UC23 | Xóa loại phòng | Partner `POST /api/owner/room-types/:id/deactivate`; uses `TrangThai='Ngừng bán'` | Confirmation action in `OwnerRoomTypeManagePage` | `LOAI_PHONG` and rate/booking relations retained | Parent-hotel ownership; inactive room type is excluded from public query/quote/booking | Owner regression tests pass | COMPLETE |
| UC24 | Xem danh sách đặt phòng | `GET /api/owner/hotels/:hotelId/bookings` and `/:bookingId`, paginated/filterable read model | `/owner/hotels/:id/bookings` and detail page | Reads `DAT_PHONG`, lines, customer display name and payment status only | Partner role + hotel ownership before every query; no mutations | Backend build/typecheck and owner regression tests pass | COMPLETE |
| UC25 | Xem doanh thu | `GET /api/owner/hotels/:id/analytics`; computes successful payments less successful refunds | `/owner/hotels/:id/analytics`, `OwnerAnalyticsPage` | Reads `DAT_PHONG`, `CHI_TIET_DAT_PHONG`, `THANH_TOAN`, `HOAN_TIEN`, `QUY_PHONG_GIA` | Partner-only; ownership checked before aggregation | `owner-analytics.test.ts`, `OwnerAnalyticsPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC26 | Xem báo cáo thống kê | Owner analytics above; system `GET /api/admin/analytics` also exists | Owner and admin analytics pages | Booking/payment/refund/room inventory and system breakdown tables | Owner data is hotel-scoped; system report is admin-only | `owner-analytics.test.ts`, `admin-analytics.test.ts`, analytics UI test source; **test source present, runtime not verified** | COMPLETE |

### Administrator UCs (UC27–UC40)

| UC | Requirement | BE evidence | FE evidence | DB evidence | RBAC / ownership | Test evidence | Status |
|---|---|---|---|---|---|---|---|
| UC27 | Xem tài khoản | `GET /api/admin/accounts` and `/:id` | `/admin/accounts`, `/admin/accounts/:id` | `TAI_KHOAN`, `VAI_TRO` | `authenticate + requireAdmin` | `accounts.test.ts`; admin-account UI test source; **test source present, runtime not verified** | COMPLETE |
| UC28 | Thêm tài khoản | `POST /api/admin/accounts`; `AccountsService.create` validates role/duplicates and returns a safe account | `AdminCreateAccountPage`, `/admin/accounts/new`, link from account list | `TAI_KHOAN`, `VAI_TRO` | `authenticate + requireAdmin` | `accounts.test.ts` targeted runtime: create + customer 403; `AdminGroup4Pages.test.tsx` success/error UI | COMPLETE |
| UC29 | Cập nhật tài khoản | `PATCH /api/admin/accounts/:id` | Account detail edit form | `TAI_KHOAN`, `VAI_TRO` | Admin-only | `accounts.test.ts`; `AdminAccountDetailPage` test source; **test source present, runtime not verified** | COMPLETE |
| UC30 | Khóa tài khoản | `POST /api/admin/accounts/:id/lock`; login rejects locked account | Lock/unlock controls in `AdminAccountDetailPage` | `TAI_KHOAN.TrangThai` | Admin-only | `accounts.test.ts`; admin account UI source; **test source present, runtime not verified** | COMPLETE |
| UC31 | Xóa tài khoản | `DELETE /api/admin/accounts/:id`; safe-delete hard deletes only without history, otherwise locks | Delete confirmation in `AdminAccountDetailPage` | `TAI_KHOAN` and dependent-record checks | Admin-only | `accounts.test.ts`; admin account UI source; **test source present, runtime not verified** | COMPLETE |
| UC32 | Duyệt đăng ký kinh doanh khách sạn mới | Admin `GET /api/admin/partner-applications`, `GET /:id`, `POST /:id/approve`, `POST /:id/reject`; `PartnersService.moderate` uses guarded transaction and token admin ID | `/admin/partner-applications`, detail page, approve/reject controls with loading/error/success; dashboard link | `HO_SO_DOI_TAC`, `TAI_KHOAN`, `VAI_TRO`; no schema changes and no hotel creation | `authenticate` + `requireAdmin`; only pending records process; reject reason required; approval changes role to `Chủ khách sạn`; `NgayDuyet >= NgayNop`; no `MaTaiKhoanDuyet` body trust | `D:\CNPM\backend\src\modules\partners\partners.test.ts`: RBAC, list/detail, approve, token approver, role transition, reject, repeat-processing, rollback; targeted runtime **10/10 pass** | COMPLETE |
| UC33 | Cập nhật thông tin khách sạn | `GET/PATCH /api/admin/hotels/:id`, whitelist editable hotel fields | `/admin/hotels`, `AdminHotelDetailPage`, Dashboard link | `KHACH_SAN` (no schema change) | `authenticate + requireAdmin`; customer/owner denied | `admin-hotels.test.ts` targeted runtime; Group 4 UI loading/empty/error/success tests | COMPLETE |
| UC34 | Đình chỉ khách sạn | `POST /api/admin/hotels/:id/suspend`, `/reactivate` | Suspend/reactivate confirmation flow in hotel detail | Existing `KHACH_SAN.TrangThai` | Admin-only; suspension is excluded by public active inventory predicates | Targeted test proves public detail 404 while suspended and 200 after reactivation; Group 4 UI flow test | COMPLETE |
| UC35 | Xem thông tin thanh toán | Read-only `GET /api/admin/payments` and `/:id`, pagination/filters/refunds | `/admin/payments`, `AdminPaymentDetailPage`, pagination/filter and read-only detail | `THANH_TOAN`, `DAT_PHONG`, `HOAN_TIEN` | `authenticate + requireAdmin`; response excludes password, email and provider secret/signature fields | `admin-payments.test.ts` targeted runtime and Group 4 UI tests | COMPLETE |
| UC36 | Xem chi tiết đánh giá | `GET /api/admin/reviews/:id` | `/admin/reviews/:id`, `AdminReviewDetailPage` | `DANH_GIA`, `HINH_ANH_DANH_GIA`, related booking/customer/hotel | Admin-only | `reviews.test.ts`; `AdminReviewDetailPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC37 | Xóa đánh giá vi phạm | `DELETE /api/admin/reviews/:id` performs a body-less, admin-only safe removal: `Vi phạm` → existing `Ẩn`; repeat is idempotent | Explicit confirmation/action in `AdminReviewsPage` and `AdminReviewDetailPage`, with loading/success/error/disabled states | `DANH_GIA` and `HINH_ANH_DANH_GIA` are retained; no schema change | `authenticate + requireAdmin`; customer/owner 403; final state is server-decided | `reviews.test.ts` targeted runtime: RBAC, 404, retained row/image, status, public-detail regression, idempotency and unaffected review; targeted UI tests 6/6 | COMPLETE — “Xóa” is documented as safe public removal, not hard deletion. |
| UC38 | Xử lý hỗ trợ/khiếu nại | Admin `GET /api/admin/support`, `/:id`, `PATCH /:id`; assigns processing admin from token | `/admin/support`, `/admin/support/:id`, `AdminSupportDetailPage` | `YEU_CAU_HO_TRO`, optional `DAT_PHONG`, `TAI_KHOAN` | Admin-only; processor identity cannot be supplied by client; resolved items immutable | `support.test.ts`; admin support UI test source; **test source present, runtime not verified** | COMPLETE |
| UC39 | Thêm mã khuyến mãi | `POST /api/admin/promotions` | `/admin/promotions/new`, `AdminPromotionFormPage` | `KHUYEN_MAI` | Admin-only; unique code and commercial validation | `promotions.test.ts`, `AdminPromotionFormPage.test.tsx`; **test source present, runtime not verified** | COMPLETE |
| UC40 | Ngừng khuyến mãi | `POST /api/admin/promotions/:id/deactivate` | Promotion management UI calls `deactivatePromotion` | `KHUYEN_MAI.TrangThai` | Admin-only | `promotions.test.ts`, promotion UI test source; **test source present, runtime not verified** | COMPLETE |

## Database coverage: 22 tables

The 22 tables are defined by `D:\CNPM\database\migrations\001_core_identity.sql` through `006_payment_after_sales.sql`; Prisma represents the same 22 models in `D:\CNPM\backend\prisma\schema.prisma`. “Covered” means the current source reads/writes the table for at least one UI/API module; it does **not** claim that migration or SQL constraint scripts were executed in this audit.

| # | Table | Current source/module coverage | Relevant UCs | Key schema safeguards / audit note |
|---:|---|---|---|---|
| 1 | `VAI_TRO` | Auth, accounts, RBAC role lookup | 01, 02, 03, 27–31 | Unique role name; FK from account. |
| 2 | `TAI_KHOAN` | Auth/profile/admin account, partner application, ownership | 01–04, 06, 16, 27–32, 38 | Unique username/email, role FK, date consistency. |
| 3 | `HO_SO_DOI_TAC` | Customer partner application/status | 03, 32 | Pending/approved/rejected columns and approver fields exist; UC32 workflow is not implemented. |
| 4 | `DIA_PHUONG` | Hotel discovery and owner hotel create/update validation | 05, 07, 17, 18 | Hotel locality FK. |
| 5 | `KHACH_SAN` | Discovery, owner management, bookings, analytics/reviews | 05, 07, 09, 14, 17–19, 25–26, 33–34, 36 | Owner/approver/locality FKs; star/date checks. Admin approval/suspension is absent. |
| 6 | `HINH_ANH_KHACH_SAN` | Hotel detail and owner image management | 07, 17–18 | Hotel FK; owner API can add/delete/set primary image. |
| 7 | `TIEN_NGHI` | Hotel/room amenity lookups and validation | 05, 07–08, 18, 21 | Unique amenity name. |
| 8 | `KHACH_SAN_TIEN_NGHI` | Hotel detail and owner amenity replacement | 05, 07, 18 | Composite PK prevents duplicate hotel–amenity links. |
| 9 | `LOAI_PHONG` | Discovery, booking, owner room-type management | 05, 08–09, 17, 20–23, 25–26 | Hotel FK; capacity/area checks. Deletion operation absent. |
| 10 | `HINH_ANH_LOAI_PHONG` | Room display and owner room image management | 08, 20–21 | Room-type FK. |
| 11 | `LOAI_PHONG_TIEN_NGHI` | Room amenity management/display | 08, 20–21 | Composite PK prevents duplicate room–amenity links. |
| 12 | `QUY_PHONG_GIA` | Search availability, quote, booking, owner rate/inventory, occupancy reporting | 05, 08–09, 15, 22, 25–26 | Non-negative price/quantity; unique `(MaLoaiPhong, NgayApDung)`. |
| 13 | `CHINH_SACH_HUY` | Booking cancellation policy selection/display | 09, 11, 13 | Referenced by booking. |
| 14 | `CHI_TIET_CHINH_SACH_HUY` | Refund-tier calculation | 13 | Non-negative hours and 0–100 refund percentage. |
| 15 | `KHUYEN_MAI` | Quote/booking promo application and admin management | 09, 15, 39–40 | Unique code; discount/date/value checks. System-wide scope is enforced by current service. |
| 16 | `DAT_PHONG` | Create/list/detail/cancel/pay/review/support/analytics | 09–16, 24–26, 35–36 | FK graph; check-in/out and server-total arithmetic constraints. Owner booking-list and admin payment-detail UCs absent. |
| 17 | `CHI_TIET_DAT_PHONG` | Booking line items, detail, cancellation/analytics | 09, 11–13, 24–26 | Booking/room FKs; `SoLuongPhong >= 1`. |
| 18 | `THANH_TOAN` | VNPAY creation/callback/status, cancellation/refund, analytics | 10, 13, 25–26, 35 | Booking FK; positive amount check. No admin payment detail/list endpoint. |
| 19 | `HOAN_TIEN` | Cancellation refund/retry and revenue netting | 10, 13, 25–26 | Payment FK; non-negative refund and chronology check. |
| 20 | `DANH_GIA` | Customer review and admin moderation/detail | 14, 36–37 | One review per booking (`UNIQUE MaDatPhong`); score 1–5. Status moderation exists, delete does not. |
| 21 | `HINH_ANH_DANH_GIA` | Customer review images and admin review detail | 14, 36–37 | Review FK. |
| 22 | `YEU_CAU_HO_TRO` | Customer support/complaint and admin handling/analytics | 16, 26, 38 | Customer/processor/optional booking FKs; request type and processing-date checks. |

## Concrete missing and partial work

1. **UC03/UC32:** implemented admin review/approve/reject for `HO_SO_DOI_TAC`, set `MaTaiKhoanDuyet`/`NgayDuyet` from the authenticated admin, activate the existing `Chủ khách sạn` role transactionally, and add admin/customer UI plus targeted tests. Approval does not create a hotel.
2. **UC19:** define deletion versus archive semantics for hotels, then add partner-owned endpoint/UI/tests that respect bookings and related FK history.
3. **UC23:** define deletion versus archive semantics for room types, then add partner-owned endpoint/UI/tests compatible with inventory and booked line items.
4. **UC24:** add a partner-owned hotel booking list/detail read model, endpoint, UI route/page, ownership enforcement, and tests.

## Surplus, legacy, and placeholder findings

These are not treated as UC coverage unless mapped above.

| Item | Evidence | Finding |
|---|---|---|
| Legacy VNPAY placeholder class | `D:\CNPM\backend\src\integrations\vnpay.integration.ts` throws “planned for later phase”; active payment routes/services/tests are under `modules\payments` | Likely obsolete/unwired duplicate implementation. It should not be selected by active routes; retain only if intentionally deprecated or remove in a separate change. |
| Password-reset SMTP adapter | `D:\CNPM\backend\src\modules\email\email.service.ts` | Active UC04 implementation. `NodemailerEmailService` sends only when SMTP is configured; `FakeEmailService` is used by tests and makes no network request. |
| Partner approval / hotel approval fields without workflow | `HO_SO_DOI_TAC` and `KHACH_SAN` migrations contain approval fields | UC32 and Group 4 admin hotel operations now have explicit APIs/UI; no database workflow change was made. |
| Admin aggregate analytics | `GET /api/admin/analytics`, `AdminAnalyticsPage` | Legitimate UC26 reporting; separate Group 4 payment list/detail now fulfils UC35. |
| Image deletion controls | Owner APIs/pages delete hotel/room **images** only | These must not be mistaken for UC19 hotel deletion or UC23 room-type deletion. |

## Runtime-verification limitation

For Coverage Group 4/5, observable command results recorded: backend `lint`, `typecheck`, `build`; Group 4 targeted integration tests **16/16 pass** (`accounts`, `admin-hotels`, `admin-payments`); UC37 review tests **18/18 pass**; frontend `lint`, `typecheck`, `build`; Group 4 UI tests **7/7 pass** and UC37 Admin Review UI tests **6/6 pass**. UC37 regression verifies retained audit rows/images, RBAC, idempotency and no removed content in the public hotel-detail read model. The current public hotel read model has no review/rating summary, so no rating aggregate is applicable. No database schema or migration file was changed. Full-suite results outside these targeted commands are not claimed here.

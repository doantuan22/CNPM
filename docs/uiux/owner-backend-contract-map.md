# Owner Portal backend and database contract map

## Source of truth and authorization

Owner APIs authenticate the actor and require the existing Partner role. Hotel-scoped operations call `getOwnedHotel(ownerId, hotelId)`; room type and rate operations call ownership-checked room type services. Frontend hotel context is only a scope selector. No DB schema or backend API change is part of this UI migration.

## Module contracts

| Module | DB/domain source | Current backend/API | Supported capability | Limits / gaps |
|---|---|---|---|---|
| Hotels | `KHACH_SAN`, `HINH_ANH_KHACH_SAN`, hotel amenities; `MaTaiKhoanSoHuu` ownership | `GET/POST /owner/hotels`; `GET/PATCH /owner/hotels/:id`; existing amenity/image/deactivate routes | List owned hotels and their status/count; detail/edit/create; status and image/amenity operations | No aggregate hotel analytics endpoint is needed for the UI. |
| Room Types | `LOAI_PHONG` belongs to `KHACH_SAN`; images/amenities are related tables | `GET/POST /owner/hotels/:hotelId/room-types`; `GET/PATCH /owner/room-types/:roomTypeId`; existing image/amenity/deactivate routes | List/create under a hotel; detail/edit; status; images/amenities | The old `/partner/hotels/:id/room-types` frontend route passed hotel ID as room type ID. No backend route change needed. |
| Inventory & Pricing | `QUY_PHONG_GIA` unique by `(MaLoaiPhong, NgayApDung)`, with `GiaPhong`, `SoLuongPhong`, `TrangThai` | `GET /owner/room-types/:roomTypeId/rates?from&to`; `PUT` same path with `{ rates: [{ NgayApDung, GiaPhong, SoLuongPhong, TrangThai? }] }` | Date-range rate rows and bulk upsert of up to 366 unique days; statuses limited by current backend schema | Availability is a daily room-type rate row, not a derived aggregate or reservation ledger. UI must show returned rows and avoid deriving availability. No cross-hotel inventory endpoint. |
| Bookings | `DAT_PHONG` belongs to `KHACH_SAN`; room detail, payments and guest data are related | `GET /owner/hotels/:hotelId/bookings` with page/limit/status/from/to/search; `GET /owner/hotels/:hotelId/bookings/:bookingId` | Hotel-scoped list, filters, pagination, detail | No all-hotels aggregate. Hotel ID is required for list and detail; do not fetch every hotel concurrently to simulate aggregate. |
| Revenue | `THANH_TOAN`, `HOAN_TIEN`, `DAT_PHONG` | `GET /owner/hotels/:hotelId/analytics?from&to` | Backend calculates successful gross payments, successful refunds, net revenue, booking totals, status counts, popular room types, occupancy | There is no dedicated revenue endpoint, payout ledger, export, daily/monthly revenue series, or finance transaction detail. Revenue UI may show only supplied total metrics; it must not sum bookings client-side or fabricate a trend. |
| Reports | Booking counts/status, popular room types, occupancy derived from backend analytics repository and `QUY_PHONG_GIA` | Same hotel analytics endpoint | Booking totals/by status, top room types, occupancy ratio and room-night denominators, revenue metrics | No period comparison, cancellation rate, time series, report export, or arbitrary report endpoint. Reports can present only supported operational metrics. |
| Owner profile | `TAI_KHOAN`; partner application in `HO_SO_DOI_TAC` | Shared authenticated profile routes/API | Existing account profile | Keep distinct from hotel profile. No owner-only profile contract required. |

## Revenue and report metric truth

`OwnerAnalyticsService.getHotelAnalytics` ownership-checks the hotel, then returns `MaKhachSan`, normalized range, total booking count, booking counts by status, gross successful payment sum, successful refund sum, net received, top five room types, occupancy percentage (nullable), sold room nights, and sellable room nights. Backend date ranges are converted to an exclusive end for aggregation. The frontend uses these values as delivered and does not calculate authoritative metrics.

## Database changes / API changes

- Database changes: **none**.
- API contract changes: **none**.
- No generated or hard-coded production data is introduced.

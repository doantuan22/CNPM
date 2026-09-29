# Owner Portal restructuring — implementation report

## A. Audit Summary

Audit scope covered owner routes, sidebar active state, owner pages, partner wrappers, hooks/API clients/types, analytics response types, backend Owner controllers/services/repositories/schemas, and the relevant database models. See [owner-portal-audit.md](./owner-portal-audit.md).

- Duplicate entry flows were confirmed: Overview/Hotels shared one page component; Room Types and Inventory led to Hotel Detail; Bookings first showed a hotel chooser; Revenue and Reports led to the same analytics page.
- The legacy `/partner/hotels/:id/room-types` route used the hotel ID as `OwnerRoomTypeManagePage`'s room type ID.
- Hotel Detail also hosted room type creation/list and rate editing was nested in Room Type detail.
- Owner pages now have distinct canonical routes and each operational module handles hotel scope in-page.

## B. Database / Backend Contract Summary

| Module | Domain source / API | Actual supported capability |
|---|---|---|
| Hotels | `KHACH_SAN`; `/owner/hotels` and `/owner/hotels/:hotelId` | Owned hotel list/detail and current edit operations. |
| Room Types | `LOAI_PHONG`; `/owner/hotels/:hotelId/room-types`, `/owner/room-types/:roomTypeId` | List/create scoped to hotel; detail/edit scoped to room type. |
| Inventory | `QUY_PHONG_GIA`; `/owner/room-types/:roomTypeId/rates?from&to` | Stored per-day rate, sellable quantity and open/closed status; bulk upsert. |
| Bookings | `DAT_PHONG`; `/owner/hotels/:hotelId/bookings` and `/:bookingId` | Hotel-scoped search/filter/pagination and detail. |
| Revenue | `THANH_TOAN`, `HOAN_TIEN`, `/owner/hotels/:hotelId/analytics` | Backend gross successful payments, successful refunds and net received for a date range. |
| Reports | Booking/rate/room type domain, same owner analytics endpoint | Booking totals/status, popular room types and occupancy ratio plus room-night denominators. |
| Owner profile | `TAI_KHOAN`, existing shared profile API | Existing authenticated account profile. |

Ownership authorization remains server-side. The detailed endpoint and metric map is in [owner-backend-contract-map.md](./owner-backend-contract-map.md).

## C. Old IA

Sidebar items did not consistently identify real destinations: some opened a chooser, then Hotel Detail; Revenue and Reports converged on one analytics page. Hotel Detail and Room Type detail each contained responsibilities belonging to other modules.

## D. New IA

Overview, Hotels, Room Types, Inventory & Pricing, Bookings, Revenue, Reports, and Profile now have independent sidebar destinations. Hotel Detail and Room Type Detail remain entity pages. The complete route/purpose/data/action map is in [owner-information-architecture.md](./owner-information-architecture.md).

## E. Route Migration

- Canonical routes are `/owner/overview`, `/owner/hotels`, `/owner/room-types`, `/owner/inventory-pricing`, `/owner/bookings`, `/owner/bookings/:bookingId`, `/owner/revenue`, `/owner/reports`, and `/owner/profile`.
- Old partner and hotel-nested routes redirect with `replace`; hotel/booking IDs are converted to explicit semantic parameters/query context.
- Legacy room type hotel route now redirects to `/owner/room-types?hotelId=…`; it no longer treats that ID as a room type ID.
- Booking detail uses `?hotelId=…` because the existing detail API requires both hotel and booking IDs.
- Full old-to-new map: [owner-route-map.md](./owner-route-map.md).

## F. Hotel Context Architecture

- `hotelId` lives in the URL query, so refresh, deep links and Back/Forward preserve scope.
- One owned hotel is auto-selected and added to the URL. Multiple hotels are selected in the current module. There is no synthetic “all hotels” option.
- Selector options are sourced from `GET /owner/hotels`; an ID absent from the current owner's list is cleared. API ownership validation remains authoritative.
- Sidebar navigation carries the selected `hotelId` into other hotel-scoped modules. Room type and booking list queries remain keyed by their semantic IDs; hotel switch does not keep previous booking results as placeholder data.
- Logout removes cached owner queries so another account cannot reuse the previous owner's hotel list.

## G. Module Results

- **Overview:** explicit `/owner/overview` page identity, separate from hotel search/filter page.
- **Hotels:** `/owner/hotels`; hotel list/search and hotel profile links remain in this domain.
- **Room Types:** inline hotel context, real room type list, create form and room type detail links; Hotel Detail no longer owns room type CRUD.
- **Inventory:** separate workspace for hotel, room type, date range, returned daily rows and bulk update using the existing API payload and status values. It does not infer inventory.
- **Bookings:** in-page hotel selector, existing filters/pagination and canonical booking detail links; hotel ID remains part of the existing API request.
- **Revenue:** finance-focused totals for gross payments, refunds and net received. No fabricated revenue chart/series.
- **Reports:** separate operational composition for booking statuses, popular room types and occupancy.
- **Profile:** dedicated `/owner/profile` navigation; shared profile implementation and `/profile` compatibility remain.

## H. Backend Gaps

- No all-hotels booking or analytics aggregation. The interface therefore requires one hotel context; it does not fan out into many requests.
- Analytics has no revenue time series, period comparison, report export, cancellation rate, or transaction-level finance ledger. These were not added to the UI.
- Booking detail API requires both hotel ID and booking ID. A deep link without a hotel context must ask for the scope before fetching.

## I. DB Changes

**None.** Existing schema and business semantics are unchanged.

## J. API Changes

**None.** The UI uses existing owner API contracts. Backend ownership and role checks remain authoritative.

## K. Legacy Removed

- Removed the old shared Revenue/Reports selector wrappers and obsolete analytics page component.
- Removed inline room type creation/list from Hotel Detail and rate editor from Room Type detail; each now links to its dedicated module.
- Old URLs remain as controlled redirects for compatibility; old page flows are no longer destinations.

## L. QA Results

- Typecheck: **pass** (`npm.cmd run typecheck`).
- Lint: **pass** (`npm.cmd run lint`).
- Tests: **pass**, 25 tests across 5 files (`npm.cmd test`), including context selection/validation and legacy route redirects.
- Production build: **pass** (`npm.cmd run build`).
- API-backed live browser QA could not run: no service was listening on local port 5000 in this environment. No test hotel or production data was fabricated.

## M. Multi-hotel Test Results

- 0 hotels: selector logic returns no scope; modules show the create-hotel state.
- 1 hotel: context logic auto-selects it and writes `hotelId` to the URL.
- 3 hotels: context logic requires a choice; selector updates current module URL.
- Invalid hotel ID: context logic rejects and clears it.
- Legacy Analytics/Bookings/Room Types redirects preserve hotel scope and semantic IDs.
- Runtime Hotel A → Hotel B request/data isolation, user-to-user logout/login, full mobile browser interactions and live backend authorization remain unverified without the running API/browser session. Query keys include hotel or room type IDs; bookings no longer display prior hotel data as placeholder content.

## N. Files Changed

- Frontend routes, redirects, sidebar, hotel context hook/selector, Owner module pages, bookings/detail pages, hotel/room type pages, auth logout cache clearing and owner module styles.
- Tests: owner context logic/UI and legacy route redirects.
- Documentation: audit, backend contract map, IA, route map and this report.

## O. Known Limitations

- Revenue and Reports use the same backend analytics endpoint, but have distinct purpose and page composition. Only metrics present in that response are shown.
- Booking detail route needs `hotelId` context because the API contract requires it.
- Live API authorization and end-to-end responsive checks await a running backend and browser test environment.

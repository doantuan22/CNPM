# Owner Portal frontend audit

## Scope and sources

Audited owner routes and navigation in `frontend/src/routes/AppRoutes.tsx` and `components/layouts/DashboardNavigation.tsx`, owner page components, `pages/EcodeFlowPages.tsx`, feature API/hooks/types, and the UI direction in `docs/update_UIUX_Egode.md`. Backend and database contracts are mapped separately in `owner-backend-contract-map.md`.

## Existing route and page inventory

| Area | Existing route(s) | Existing implementation | Finding |
|---|---|---|---|
| Overview / Hotels | `/owner`, `/partner/dashboard`, `/partner/hotels` | `OwnerDashboardPage` | One component changes title based on path. `/owner` actually behaves as hotels list. |
| Hotel detail/edit | `/owner/hotels/:id`, `/partner/hotels/:id` | `OwnerHotelManagePage` | `id` is hotel ID; detail includes inline room type creation/list and action links. |
| Room type detail | `/owner/room-types/:id` | `OwnerRoomTypeManagePage` | `id` is parsed as roomTypeId; page also embeds rate editing. |
| Broken room type alias | `/partner/hotels/:id/room-types` | `OwnerRoomTypeManagePage` | `id` means hotelId in URL but is consumed as roomTypeId. |
| Room type entry | `/partner/room-types`, `/partner/room-type-form` | `PartnerInventoryPage(mode=rooms)` | Hotel selection list links to Hotel Detail, so module is not a destination. |
| Inventory entry | `/partner/inventory-pricing` | `PartnerInventoryPage` | Hotel selection list links to Hotel Detail; no inventory workspace. Rate editing is nested in room type detail. |
| Bookings | `/partner/bookings`, `/owner/hotels/:id/bookings` | `PartnerBookingsPage`, `OwnerBookingsPage` | Partner route is a hotel selector; hotel route has actual list. |
| Booking detail | `/owner/hotels/:id/bookings/:bookingId` | `OwnerBookingDetailPage` | Both semantic IDs required by API; detail nested under hotel URL. |
| Analytics / Revenue / Reports | `/owner/hotels/:id/analytics`, `/partner/revenue`, `/partner/reports` | `OwnerAnalyticsPage`, selection wrappers | Revenue and Reports both select a hotel then navigate to the same analytics component. |
| Profile | `/profile` | `ProfilePage` | Shared profile URL, not owner-specific URL. |

## Existing state and contracts

- TanStack Query is used. Existing keys scope room types by hotel ID, rates by room type ID and date range, bookings by hotel ID and filters, analytics by hotel ID and date range.
- `useMyHotels()` provides the current owner's hotel list. There is no owner hotel selection context or cross-module persistence.
- Owner API clients already support hotel CRUD, hotel-scoped room type list/create, room type detail/update, rate range read/bulk upsert, hotel-scoped bookings list/detail, and hotel-scoped analytics.
- Hotel and room type detail pages enforce server-side ownership through owner endpoints; frontend selection is not an authorization boundary.
- The project UI uses Tailwind utilities plus existing CSS classes and shared loading/error/status components. Owner redesign must continue the operations-oriented, restrained V2 direction in `docs/update_UIUX_Egode.md`.

## Duplicates and navigation defects

1. Overview and hotel list share one component and are selected by pathname.
2. Room Types and Inventory menu destinations are hotel selection launchers that return to Hotel Detail.
3. Bookings menu first shows a selector, while the real module is on a different hotel-nested URL.
4. Revenue and Reports use the same selector and same analytics endpoint/page.
5. Room type alias route has a parameter semantic mismatch (`hotelId` is passed where `roomTypeId` is expected).
6. Hotel Detail acts as a launcher for room types, booking, and analytics; hotel-scoped inline room type creation duplicates room type module responsibility.
7. Sidebar active state maps analytics to Reports and omits canonical route identities.

## Migration status

The target IA, route map, selector behavior, backend limitations, and verification cases are documented in the adjacent owner audit files. Any UI capability not supported by an existing backend contract is explicitly reported as a gap; this migration does not add DB fields or API contracts.

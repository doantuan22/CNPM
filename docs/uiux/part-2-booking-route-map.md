# Egode Phase 2 — Booking Route Map

**Trace sources:** frontend route table and in-repo `Link`/`navigate`/`window.location` references; booking/payment hooks and API client; backend VNPAY return controller and OpenAPI description; backend booking/payment tests. No test or callback route was removed.

## Journey as implemented

```text
/                         public search
  → /hotels?location&checkIn&checkOut&guests
  → /hotels/:hotelId?checkIn&checkOut&guests
       choose 1+ room types and quantities → backend quote
       POST /hotels/:hotelId/bookings      → creates booking
  → /bookings/:bookingId                   review, payment, after-sales
  → external VNPAY hosted page
  → backend callback → /payment/result?...
  → /bookings/:bookingId                   inspect final state / next action
```

This is the safe canonical UX path for the current system. The customer mentally reviews the selected rooms and server quote before submitting; the existing create-booking API is the transaction boundary on hotel detail. `/bookings/:id` is the committed booking and central after-sales page. Part 2 does not move the mutation or claim a pre-create confirmation page that the API does not currently support.

## Route classification

| Route | Classification | Evidence / dependency | Migration decision |
| --- | --- | --- | --- |
| `/` | CANONICAL | HomePage search navigates to `/hotels` with stay query | Keep |
| `/hotels` | CANONICAL | Results reads/writes URL params; primary search result path | Keep |
| `/search-results` | LEGACY alias | Same HotelListPage, no in-repo navigation reference | Keep routable; later redirect only after external-link check |
| `/hotels/:id` | CANONICAL | Results link passes checkIn/checkOut/guests; HotelDetail queries room types and quote; POST create-booking | Keep |
| `/hotel-detail/:id` | LEGACY alias | Same HotelDetailPage, no in-repo navigation reference | Keep routable |
| `/bookings/:id` | CANONICAL | Hotel detail navigates here after successful create with `justBooked`; handles payment/cancel/refund/review | Keep as transaction/after-sales home |
| `/booking-detail/:id` | LEGACY alias | Same BookingDetailPage, no in-repo link found | Keep routable |
| `/booking/:id/room` | TRANSITIONAL | `BookingRoomPage` fetches an already-created booking, shows room lines/total; only link in `EcodeFlowPages` goes to confirm | Do not show as “choose room” or pre-create step; preserve until external usage checked |
| `/booking/:id/confirm` | TRANSITIONAL | `BookingConfirmPage` fetches an existing booking and links backward to room/payment; no inbound link from hotel selection | Display-only legacy sequence, not the current commit boundary |
| `/booking/:id/payment` | TRANSITIONAL | `PaymentPage` fetches existing booking and creates VNPAY payment; internal link from confirm | Uses same backend payment mutation; retain pending migration review |
| `/payment/:id` | LEGACY alias | Same PaymentPage; no in-repo link found | Keep routable |
| `/payment/result` | CANONICAL callback | Backend payment controller redirects to this path; backend integration test asserts it | Never rename/remove without backend callback and environment config migration |
| `/payment-result` | LEGACY alias | Same result component; no in-repo links or callback reference | Keep routable |
| VNPAY `paymentUrl` | CANONICAL external transition | Backend creates authoritative payment amount, returns hosted URL; frontend uses `window.location.href` | Preserve full-page navigation |

## Navigation and service trace

- Home `handleSearch` → `/hotels?...`.
- HotelListPage → `/hotels/:id?...` retaining location/date/guest query where available.
- HotelDetailPage calls `useCreateQuote` with the full multi-room selection and optional promo. It calls `useCreateBooking` only when quote matches current selection and is available.
- On successful booking create, HotelDetailPage navigates to `/bookings/:id` with in-memory `justBooked` presentation state. The deep link still works because booking data is fetched by ID.
- BookingDetailPage uses `useBookingDetail`, `useCreateVnpayPayment`, `useCancelBooking`, `useRetryRefund`, and `ReviewSection`; it uses backend booking total and status.
- EcodeFlowPages provides separate already-created booking room → confirm → payment links. Nothing in the current hotel-selection implementation links into `/booking/:id/room` or `/booking/:id/confirm`.
- Backend VNPay callback redirects to `/payment/result`; result page can query payment status when it receives a booking identifier. No frontend route/test reference supports deleting the result alias.
- Route guards: room/confirm/payment/result and booking detail are under `ProtectedRoute` (any authenticated user); ownership/state is still enforced by backend. Do not weaken the guard while changing layout.
- Test references: backend booking/payment tests cover APIs and the `/payment/result` redirect. No frontend browser test config was found during Part 1 audit; there are no in-repo tests that target the transitional paths.

## UX migration without API change

1. Keep the search context in URL query parameters from results through hotel detail; keep date/guest edits reflected in the URL.
2. Treat room quantity selection + quote as the selection and review surface, with total and policies/data adjacent to the create action.
3. Label the create action accurately: it creates a booking, not merely a quote. Keep price/availability backend-authoritative.
4. After create, show a booking identity/status and payment/after-sales options on `/bookings/:id`.
5. Payment stays in one primary page context; external VNPAY navigation is expected, and `/payment/result` remains stable.
6. Transitional route pages can share visual primitives but should not be promoted in primary navigation or represented as a competing canonical journey.
7. Keep aliases until actual external usage, email templates and saved links have been checked; this audit did not delete, redirect or deprecate a route.

# Egode Phase 2 — Information Architecture

Part 2 inherits the **EGODE — CALM TRAVEL COMMERCE** identity and Part 1 tokens. This IA describes the job and parent context for existing screens; it does not create new business capabilities or change role permissions.

## Product-level structure

```text
PUBLIC — Travel discovery
Home → Search results → Hotel detail + room selection → Booking created
                                                    → Booking review/payment
                                                    → Payment result

CUSTOMER — Personal travel management
Bookings → Booking detail → Payment / cancellation / refund / review
Profile
Support → Support detail

OWNER — Hotel operations
Overview
Hotels → Hotel context → Room types → Inventory/pricing by date
                         → Hotel bookings → Booking detail
                         → Revenue / reports
Profile

ADMIN — Platform governance
Overview / work-domain shortcuts
Accounts → Account detail / create
Partner applications → Application decision
Hotels → Hotel detail
Payments → Payment detail
Reviews → Review detail
Support → Ticket detail
Promotions → Promotion editor
Analytics
```

## Actor navigation

### Public visitor

- **Primary objective:** find and compare an available hotel, then select rooms.
- **Primary navigation:** Home, search/results, hotel detail, sign in/register.
- **Context that travels:** destination, check-in, check-out, guests in the URL query. Room quantities are chosen on hotel detail and remain page-local until the quote/booking mutation.
- **Next decision:** room combination and backend quote; then create the booking.

### Customer

- **Primary object:** a stay/booking, rather than aggregate activity metrics.
- **Primary navigation:** Bookings, Profile, Reviews (reached from an eligible booking), Support.
- **Context that travels:** booking reference, hotel, stay dates, room labels/quantities, status and authoritative booking/payment totals.
- **After-sales task:** use the booking detail to pay, cancel, view refund state, or submit a review when its status allows it; support stays a separate domain with booking context when provided by existing data.

### Owner / partner

- **Primary object hierarchy:** Hotel → Room type → dated rate/inventory → booking → revenue/report.
- **Primary navigation:** Overview, Hotels, Room types, Inventory & pricing, Bookings, Revenue, Reports, Profile.
- **Hotel context:** multi-hotel lists are real (`useMyHotels`). Existing selector pages choose a hotel and then route into its management/detail surface. Hotel ID is carried in the route for hotel-specific records. Part 2 should clarify that chosen context with identity/breadcrumbs and links, not add a hidden/global selector that bypasses the existing data model.
- **Primary action varies by domain:** edit hotel; edit room; update dated price/stock; inspect a guest booking; inspect performance.

### Admin

- **Primary objective:** govern accounts, partner applications, properties, payments, reviews, tickets and promotions.
- **Primary navigation:** persistent sidebar grouped by platform governance and operations; detail screens link back to their queue.
- **Density:** high enough for queue and evidence comparison. Decision actions stay adjacent to the evidence and status they affect.
- **No separate customer-support portal:** support remains one admin work domain and one customer-facing support area, protected by existing role routes.

## Canonical product journey and invariants

1. Search uses URL-backed location/date/guest/filter/sort context.
2. Hotel detail reads that context, lets the customer update it and uses `guests` to filter eligible room types.
3. The customer chooses any available combination and quantity of room types; the backend quote remains authoritative for availability, promotion and price.
4. The existing create-booking mutation is submitted from hotel detail. Part 2 does not move or duplicate this transaction boundary.
5. `/bookings/:id` is the central post-create page: status, hotel/stay/rooms, payment, cancellation/refund and review eligibility.
6. VNPAY is an external page. Its backend callback returns to `/payment/result`; the customer can then return to the booking detail.

The IA distinguishes the intended customer mental model (search → evaluate → select → review → pay → result) from the existing API boundary. It must not present an uncreated booking as committed or make display-only legacy screens appear to be separate transactions.

## Domain composition rules

| Domain | Primary information | Supporting information | Composition signature |
| --- | --- | --- | --- |
| Public discovery | Search inputs, location/date/guest context | Real hotel/destination content if available | Search-led, image-aware, medium-low density |
| Public comparison | Hotel identity, location/rating, stay context, starting price | Decision-relevant amenities and availability | Stable hotel result rows + compact refinable filters |
| Customer travel | Booking status, hotel, dates, room labels/quantity, total | Payment/refund/policy/support/review | Personal travel list and entity detail, no generic KPI dashboard |
| Owner operations | Selected hotel, dated stock/price, guest/stay/status | Revenue and reports for selected hotel | Dense, operational, clear property context and date semantics |
| Admin governance | Queue, evidence, status, amount, history | Audit/related records | Consistent list/detail/form grammar, explicit decision proximity |

## Wayfinding and URL policy

- Keep current role guards and path parameters intact.
- New sidebar links should use one chosen existing owner route vocabulary consistently; aliases remain routable until external usage is checked.
- Customer sub-navigation should appear as a compact context aid on customer tasks, not as a dashboard shell.
- Keep query parameters for search context; do not silently drop them when moving from results to hotel detail or back.
- Maintain breadcrumbs from hotel detail pages and admin detail screens to their domain parent.

# Egode UI/UX V2 — Evidence Map

References below identify the research principle; Egode-specific structure is an adaptation, not a claim that the reference uses the same layout, color or measurements. The route and component names are resolved against `full-ui-inventory.md`.

| V2 decision / rule | Brief evidence | Egode surfaces affected | Local validation evidence |
|---|---|---|---|
| Search is the primary travel task; destination, dates, occupancy and search are one domain interaction | R01–R04 | `HomePage`, `SearchForm`, `HotelListPage`, `HotelDetailPage` | URL query parameters and current search form contract; no invented child-age fields |
| Result cards prioritize image, identity/location, rating/reviews, relevant policy and price/CTA only when backend provides values | R05–R08 | `HotelListPage`, hotel result rows, hotel identity/price components | Hotel API DTOs and current HotelList data usage |
| Room offers compare identity, capacity, policy, availability, backend price and quantity in a stable row | R09–R10 | `HotelDetailPage`, room type selection, quote and booking summary | Quote and room-type response fields; no client authoritative total |
| Limit primary actions; buttons perform actions and links navigate; keep loading dimensions and visible focus | R11–R13 | Global `Button`, page headers, all resource lists/forms | Existing button API and route handlers; Part 3 interaction tests |
| Combobox keyboard/focus semantics; use only where option search is useful | R14–R15 | Owner hotel forms, destination/hotel selection if data supports it | Existing `Combobox` keyboard implementation and options |
| Menus group secondary/destructive actions, return focus, support Escape and avoid hiding critical info | R16–R17, R23 | Navbar account menu, dashboard/mobile navigation, owner/admin action surfaces | Existing route/action references; no new permissions |
| Travel date range and occupancy are domain controls; adapt mobile calendar to viewport | R01–R03, R24 | Search, hotel context, analytics date filters | Existing date-only/query contracts; date validation schemas |
| Toast acknowledges non-blocking outcomes; consequential decisions need dialog; inline errors remain near task | R25–R29 | All mutation pages, feedback provider, booking/payment/support/review | Existing `useToast`, `useConfirm`, mutation handlers; source scan zero raw browser alert/confirm |
| Status labels are concise, semantic and distinct from role/neutral metadata; color is not sole cue | R30–R32 | Admin/owner/customer lists and details, `StatusBadge` | Open backend status map and neutral unknown behavior |
| Data table header/filter/sort/empty/pagination are a resource-management surface with mobile plan | R18–R20, R33 | Admin accounts/hotels/payments/reviews/support/promotions/applications; owner bookings | Existing columns/filter/query/pagination per page; no API consolidation |
| Overview should surface useful attention only when backend exposes it; do not fabricate metrics | R21–R22, R34 | Admin and owner dashboard | Current dashboard data hooks; overview contains no invented queue requirement |
| Motion should clarify origin/context, remain brief and honor reduced motion; focus is immediate | R35–R37 | Shared fields/buttons/combobox/dialog/toast/nav/cards/tables | CSS token/media query audit and keyboard source tests |
| Avoid copy, preserve Egode identity and all backend authority | Brief §§0, 20.2, Q7 | All 69 routes and shared/domain presentation | Part 2 route map/IA, API hooks/DTOs, role guards, callback path |

## Implementation decision log

1. Reuse current Part 1 tokens and Part 3 primitives; no new design framework is justified by the existing stack.
2. Keep every registered route, alias, `ProtectedRoute`, API call, mutation timing, enum, price/availability authority and VNPAY callback path.
3. Only surface hotel rating, review count, total price, cancellation, room stock, child occupancy, upload progress or work queues when current backend/UI contract provides that data.
4. Canonical domain components may format/render supplied data but must not calculate authoritative booking totals or introduce state transitions.
5. Runtime/visual claims require captured evidence; source audit alone is not a visual pass.


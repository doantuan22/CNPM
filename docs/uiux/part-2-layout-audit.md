# Egode Phase 2 — Layout & IA Audit

**Baseline:** frontend source at the start of Part 2, after Part 1 token/visual-language work. **Scope:** all registered routes in `frontend/src/routes/AppRoutes.tsx`, page components, `MainLayout`, `DashboardNavigation`, shared controls and domain hooks/services. This is a static source audit; it does not infer unobserved backend behavior.

## Product shape

The app has four distinct workspaces inside one router:

| Actor | User goal | Main navigation/source |
| --- | --- | --- |
| Public visitor | Discover, compare and book a stay | Home, hotel search, hotel detail, sign-in/register |
| Customer | Manage stays, payment, profile, reviews and support | `/bookings`, `/profile`, `/support` |
| Hotel owner/partner | Operate one or more hotels | `DashboardNavigation` owner groups; hotel-specific pages carry `hotelId` |
| Admin | Govern users, properties, transactions and platform issues | `DashboardNavigation` admin groups |

`MainLayout` chooses the dashboard shell from the authenticated role and URL prefix. All other routes share the public navbar/footer, including customer booking screens. The shell switch preserves page route/role guards, but makes customer pages feel like isolated public pages rather than a personal travel center. The profile page has its own side navigation, while bookings/support do not share it.

## Route and actor inventory

The registered path list is authoritative in `AppRoutes.tsx`. Alias paths render the same component rather than redirecting, so copied/bookmarked URLs continue to work but navigation and active-state behavior can diverge.

| Domain / route(s) | Actor / page purpose | Primary task and actions | Pattern / disposition |
| --- | --- | --- | --- |
| `/`, `/home` | Public discovery | Search by destination, dates and guests; open hotel | P01 Discovery; `/` canonical, `/home` alias KEEP |
| `/hotels`, `/search-results` | Public results | Refine query, filter/sort, compare, open a hotel | P02 Results; `/hotels` canonical, alias KEEP |
| `/hotels/:id`, `/hotel-detail/:id` | Public hotel detail + room selection | Review property, dates, room quantities, quote, promo and create booking | P03 + P04; `/hotels/:id` canonical, alias KEEP |
| `/login`, `/register`, `/forgot-password`, `/reset-password` | Public/auth | Authenticate, create customer account, recover credentials | P07; distinct form compositions, KEEP |
| `/partner/apply`, `/register-partner` | Authenticated customer/partner applicant | Submit partner onboarding application | P07; first path canonical, alias KEEP |
| `/profile`, `/account-profile` | Authenticated customer/partner/admin profile | View/update personal details, navigate to bookings/support, sign out | P07 / personal settings; alias KEEP |
| `/bookings`, `/my-bookings` | Customer | Scan stays by status, open a booking | P05 rich travel list; `/bookings` canonical, alias KEEP |
| `/bookings/:id`, `/booking-detail/:id` | Customer | Review stay, payment/refund, cancel, retry refund, review | P06 transaction detail; alias KEEP |
| `/booking/:id/room`, `/booking/:id/confirm`, `/booking/:id/payment`, `/payment/:id` | Authenticated customer | Existing booking summary/review/payment entry | P04 transitional screens; preserve pending route dependency review |
| `/payment/result`, `/payment-result` | Authenticated customer / payment callback | Explain success, failure or pending and next action | P10; backend return URL is `/payment/result`; alias KEEP |
| `/support`, `/support-request` | Authenticated customer | Create support request and scan prior requests | P05 + P07; alias KEEP |
| `/support/:id` | Authenticated customer | Read ticket conversation and respond | P06; KEEP |
| `/write-review/:id` | Authenticated customer | Submit one booking review | P07; KEEP |
| `/owner`, `/partner/dashboard`, `/partner/hotels` | Owner | Overview or scan owned hotels | P08 overview / P05 hotel list; `/partner/dashboard` is the sidebar overview target; `/owner` and `/partner/hotels` share the hotel list; KEEP |
| `/owner/hotels/new`, `/partner/hotels/new`, `/partner/hotel-form` | Owner | Register a hotel | P07; route aliases share form; KEEP |
| `/owner/hotels/:id`, `/partner/hotels/:id` | Owner | Edit hotel, amenities/media, create/edit room types, jump to operations | P06 + P07; hotel context is route param; alias KEEP |
| `/owner/room-types/:id`, `/partner/hotels/:id/room-types` | Owner | Edit room type and rates | P06 + P07; two paths map the same component but parameter semantics need trace; KEEP |
| `/partner/room-types`, `/partner/room-type-form` | Owner | Choose hotel before room-type work | P05 entity selector; aliases currently point to same mode; KEEP pending link audit |
| `/partner/inventory-pricing` | Owner | Choose hotel before inventory/pricing work | P05 selector, then hotel management; no separate calendar route in `AppRoutes` |
| `/owner/hotels/:id/analytics` | Owner | Inspect per-hotel operational/revenue metrics | P09; KEEP |
| `/partner/revenue`, `/partner/reports` | Owner | Choose hotel, open analytics | P05 selector followed by P09; distinct labels share destination |
| `/partner/bookings` | Owner | Choose hotel, open bookings | P05 selector |
| `/owner/hotels/:id/bookings`, `/partner/hotels/:id/bookings` | Owner | Filter and operate on a hotel's bookings | P05 dense list/table; alias KEEP |
| `/owner/hotels/:id/bookings/:bookingId` | Owner | Inspect one guest booking in hotel context | P06; KEEP |
| `/admin` | Admin | Navigate to platform work queues/domains | P08; currently eight equally treated module tiles and an intro panel |
| `/admin/accounts`, `/admin/accounts/new`, `/admin/accounts/:id` | Admin | Search accounts, create account, inspect/update account | P05, P07, P06; KEEP |
| `/admin/partner-applications`, `/admin/onboarding`, `/admin/partner-applications/:id` | Admin | Scan application queue, inspect evidence and decide | P05/P06 decision page; onboarding alias KEEP |
| `/admin/hotels`, `/admin/hotels/:id` | Admin | Scan and inspect properties, moderate state | P05/P06; KEEP |
| `/admin/payments`, `/admin/payments/:id` | Admin | Find transaction, inspect booking/customer/property/refund | P05/P06 financial detail; KEEP |
| `/admin/reviews`, `/admin/reviews/:id` | Admin | Moderate reviews and inspect one review | P05/P06; KEEP |
| `/admin/support`, `/admin/support/:id` | Admin | Scan issues, inspect context/history and resolve | P05/P06; KEEP |
| `/admin/promotions`, `/admin/promotions/new`, `/admin/promotions/:id` | Admin | Manage promotion list and editor | P05/P07; KEEP |
| `/admin/analytics` | Admin | Inspect reports | P09; KEEP |
| `/admin/operations` | Admin | Alias to admin overview; no distinct operation screen | P08 alias KEEP pending external deep-link use |
| `*` | Any | Recover from unavailable path | P11 error/not-found; KEEP |

## Page composition findings

| Finding | Evidence / affected areas | Product impact | Classification |
| --- | --- | --- | --- |
| Shared page shells hide domain intent | `EcodeFlowPages.Frame` makes booking, review, inventory, bookings and revenue share a large rounded icon/header panel; route guard and `MainLayout` are the other shared shells | Task screens inherit a generic product/CRM header regardless of job | RECOMPOSE critical transaction and owner selector screens; retain only shared shell primitives |
| Public search results are filter-first on small screens | HotelListPage stacks full filter controls before results at mobile width; desktop sidebar is sticky; search context bar is sticky too | Mobile users scroll through filters before seeing properties; sticky surfaces can compete | REFINE responsive composition; preserve URL-backed filter behavior |
| Search controls are not fully keyboard-composed | Collapsed search summary uses clickable `div`; filters are always rendered; favorite control has no handler in the page | Discoverability and keyboard behavior are weaker; favorite is not a working in-scope action | REFINE markup where safe; document favorite control as an existing functional gap |
| Hotel detail ordering favors introduction over transaction | Overview precedes room choices; several equally surfaced rounded panels; room block has placeholder image rather than API data; sticky summary is applied at all widths | User must pass overview content before the room decision; room list is the actual booking action | RECOMPOSE section hierarchy while retaining only backend-supplied fields and current quote flow |
| Booking flow has two overlapping representations | HotelDetailPage creates a booking from multi-room quote and goes to `/bookings/:id`; that detail screen holds review/payment/cancel/refund/review actions. `EcodeFlowPages` adds `/booking/:id/room` and `/confirm` display-only steps, which link to each other and payment but have no inbound in-repo CTA from hotel selection | Route names imply a pre-commit stepper, while actual API creation occurs on hotel detail; customers may enter separate flows depending on entry URL | CONSOLIDATE navigation/document actual API boundary; do not move booking creation without a business/API approval |
| Payment callback is the only externally verified result target | Backend VNPay controller redirects to `/payment/result`; `PaymentResultPage` also handles `payment-result` alias. Payment URL creation is handled by payment mutation in booking detail / alternate payment page | Result callback path must remain stable; booking detail is where retry/cancel support actions live | KEEP callback URL; simplify presentation only |
| Customer pages do not share a customer center | `ProfilePage` has local profile/bookings/support side links; bookings and support pages use separate headers and public footer | Travel management lacks persistent location/wayfinding after entering bookings/support | REFINE with a compact, task-specific customer subnav, not dashboard KPIs |
| Owner has two route vocabularies and a hotel-context selector | Sidebar primarily links `/partner/*`; detail links use `/owner/hotels/:id`; inventory/room-type/bookings/report/revenue routes often select a hotel first | Active navigation may be absent on `/owner`; “hotel selector → same management page” hides destination; multi-hotel context is carried only after selecting a hotel | REFINE links/page context. No implicit hotel selector is added inside an API page without a current hotel source |
| Owner overview is also the hotel list page | `OwnerDashboardPage` checks `/partner/dashboard` to show overview title; `/owner` and `/partner/hotels` show same hotel-list content; current sidebar overview and hotel list are therefore separate URLs on one component | Page title/action can be misread if entry route is unclear | REFINE labels and canonical sidebar paths; don't invent new metrics |
| Inventory entry page is a selector, not inventory | `/partner/inventory-pricing` opens `PartnerInventoryPage`, and hotel selection links to `/owner/:id` management; per-day rates live inside room type editor | User must traverse hotel → room type → rates; no route directly opens a rate calendar | KEEP current API surface; improve in-scope navigation and clearly label destination; avoid a fake availability grid |
| Owner tables have no mobile alternative | `OwnerBookingsPage` uses a min-width table with horizontal overflow risk | Guest/date/status/amount/action comparison is difficult on phone | REFINE mobile card/list using same query, pagination and actions |
| Admin list composition is page-local | AdminAccountsPage/AdminHotelsPage and other list screens each implement their own search, filters, table, pagination, empty/error state | Filter/order/pagination patterns vary; several toolbars/panels gain card weight | CONSOLIDATE grammar with shared styles/primitives; preserve each page's filters and columns |
| Admin detail decisions vary by domain | Partner application, payment, support and account details are independent pages | Evidence and action proximity depends on local markup; no repeated detail grammar | REFINE decision/evidence layout on critical details before making a broad abstraction |
| Admin overview is shortcut grid, not a work queue | AdminDashboardPage presents eight equal cards, not real queue counts or follow-up data | Navigation dominates over actionable platform control, but API evidence for a real queue is absent | REFINE to grouped task links; do not add fake metrics/queues |
| Long forms share no width/section grammar | Hotel, room type, partner application, profile and admin editors vary wrappers, max widths, cards and footer actions | Reading line length and submit location are inconsistent | REFINE forms by semantic sections and readable width; preserve handlers/validation |

## Responsive baseline

- Dashboard navigation has a collapsible sidebar/scrim. Owner/admin tables retain desktop minimum widths; mobile behavior is not uniformly re-composed.
- Public search uses breakpoints to stack results and forms, but the mobile filter control has no dedicated collapsed/drawer pattern.
- Hotel detail uses one-column layout below `lg`, but the booking summary's sticky behavior and long overview/amenities scroll are not explicitly mobile-specific.
- Customer booking items already stack under `sm`; detail splits to the shared two-column CSS layout and then collapses.
- Responsive decisions are mostly utility breakpoints rather than written per-page intent; audit target viewports are 375, 430, 768, 1024, 1280 and 1440.

## Scope and safety decisions

- No path is removed in Part 2 without proof that external links, tests and callback URLs have no dependency.
- API contracts and booking mutation timing remain unchanged. Hotel detail stays the room-selection/quote surface; `/bookings/:id` stays the real post-create review/payment/support page.
- Per-room line price on a fetched booking detail cannot be reconstructed from current schema. The UI must use backend booking total and may show room name/quantity only.
- Rate entries are date-based in backend; a continuous display/editor must not imply stored start/end range semantics unless the API actually provides them.
- Phase 1 tokens and “EGODE — CALM TRAVEL COMMERCE” remain the identity baseline.

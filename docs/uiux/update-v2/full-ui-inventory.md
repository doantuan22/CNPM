# Egode UI/UX V2 — Full UI Inventory

Audit source: `frontend/src/routes/AppRoutes.tsx`, `frontend/src/pages/`, `frontend/src/components/`, `frontend/src/features/`, `frontend/src/assets/css/`, and Parts 1–3 in `docs/uiux/`. Route aliases are listed explicitly because they remain routable. The seven screens from the V2 brief are **REPRESENTATIVE / PILOT ONLY**; they are not a route allowlist.

## Status key

- `AUDITED`: interim U0 state only; not permitted at completion.
- `PILOTED`: representative page evaluated against V2.
- `MIGRATED`: V2 treatment implemented and source-level checks recorded.
- `KEEP-WITH-JUSTIFICATION`: already conforms or intentionally preserved for route/business compatibility.
- `DEFERRED-WITH-BLOCKER`: cannot safely complete; blocker and evidence are required.

Final source migration statuses below contain no `UNAUDITED` or `UNKNOWN`. Browser-based visual/viewport verification is tracked separately as `DEFERRED-WITH-BLOCKER` because this environment has no browser executable or automation setup; this does not erase the route inventory.

## Route and page inventory (69 registered route patterns)

| Actor / domain | Route or entry point | Screen / component | Page pattern and shared/domain UI | Responsive / accessibility risk | V2 impact | Status / evidence |
|---|---|---|---|---|---|---|
| Public | `/`, `/home` | `HomePage` | P01 discovery; `Navbar`, `SearchForm` | Search controls stack; search must remain primary; labels/date/guest input | TravelSearchBar; image/data restraint; search-first | MIGRATED — `AppRoutes.tsx`, `HomePage.tsx` |
| Public | `/hotels`, `/search-results` | `HotelListPage` | P02 results; filters, pagination, hotel result rows | Mobile filter-first scroll; sticky collision; long hotel names/price | HotelCard, FilterToolbar, active filters, responsive list | MIGRATED — `HotelListPage.tsx` |
| Public / customer | `/hotels/:id`, `/hotel-detail/:id` | `HotelDetailPage` | P03/P04 hotel, room offers, quote, booking creation | Room quantity, date/guest context, sticky summary collision | RoomOffer, BookingSummary lifecycle, policy/availability by API | MIGRATED — `HotelDetailPage.tsx`, booking route map |
| Auth | `/login` | `LoginPage` | P07 auth form; Input/Button/Alert | Validation, password visibility, pending/error | Canonical field/action feedback | MIGRATED — `LoginPage.tsx` |
| Auth | `/register` | `RegisterPage` | P07 onboarding / role intent | Role choice keyboard selection and one continuation action | Selectable role cards + one CTA; PILOT | MIGRATED — `RegisterPage.tsx` |
| Auth | `/forgot-password` | `ForgotPasswordPage` | P07 recovery form | Pending/success/error and narrow viewport | Inline result and form states | MIGRATED — `ForgotPasswordPage.tsx` |
| Auth | `/reset-password` | `ResetPasswordPage` | P07/P11 recovery form/result | Invalid/expired link; validation and success | Consistent fields and recovery result | MIGRATED — `ResetPasswordPage.tsx` |
| Partner applicant | `/partner/apply`, `/register-partner` | `PartnerApplyPage` | P07 partner application form | Long form, evidence upload, validation | Semantic groups, upload/error feedback | MIGRATED — `PartnerApplyPage.tsx` |
| Customer/account | `/profile`, `/account-profile` | `ProfilePage` | P07 personal settings and local navigation | Form width, local nav on mobile | Personal travel context, readable fields | MIGRATED — `ProfilePage.tsx` |
| Customer | `/bookings`, `/my-bookings` | `BookingsPage` | P05 travel booking list, status filters | Card/table adaptation, empty/error/loading | Travel list grammar and decision hierarchy | MIGRATED — `BookingsPage.tsx` |
| Customer | `/bookings/:id`, `/booking-detail/:id` | `BookingDetailPage` | P06 booking transaction and after-sales | Long policy/history; gated actions and payment states | BookingSummary lifecycle; status/action clarity | MIGRATED — `BookingDetailPage.tsx` |
| Customer transitional | `/booking/:id/room` | `BookingRoomPage` in `EcodeFlowPages` | Existing-booking display summary | Preserve auth; clarify it is post-create display | Shared booking summary; keep transitional semantics | MIGRATED — source + `part-2-booking-route-map.md` |
| Customer transitional | `/booking/:id/confirm` | `BookingConfirmPage` in `EcodeFlowPages` | Existing-booking review | Same as above; no false pre-commit implication | Keep API boundary; refine presentation | MIGRATED — route map |
| Customer/payment | `/booking/:id/payment`, `/payment/:id` | `PaymentPage` in `EcodeFlowPages` | VNPAY handoff for existing booking | Pending/error/retry and external transition | Result/feedback; preserve contract | MIGRATED — route map |
| Customer/payment callback | `/payment/result`, `/payment-result` | `PaymentResultPage` | P10 payment result | Pending/success/failure/timeout, callback deep link | Transaction result; callback path invariant | MIGRATED — route map + backend callback evidence in Part 2 |
| Customer support | `/support`, `/support-request` | `SupportPage` | P05/P07 issue submission and ticket list | Long form, upload, list states | Canonical form/list/feedback patterns | MIGRATED — `SupportPage.tsx` |
| Customer support | `/support/:id` | `SupportDetailPage` | P06 conversation and response | Message order, long content, pending/error | Message hierarchy and form feedback | MIGRATED — `SupportDetailPage.tsx` |
| Customer review | `/write-review/:id` | `WriteReviewPage` in `EcodeFlowPages` | P07 eligible review form | Image upload, eligibility/already-reviewed states | Form and per-file feedback | MIGRATED — `EcodeFlowPages.tsx` |
| Owner | `/owner`, `/partner/dashboard`, `/partner/hotels` | `OwnerDashboardPage` | P08 overview / hotel list by pathname | Route intent/title, cards and property selection | Entity context; actual-data-only overview | MIGRATED — page + Part 2 route map |
| Owner | `/owner/hotels/new`, `/partner/hotels/new`, `/partner/hotel-form` | `OwnerHotelFormPage` | P07 hotel onboarding form | Long form, combobox, upload, error | Semantic form sections and canonical control | MIGRATED — `OwnerHotelFormPage.tsx` |
| Owner | `/owner/hotels/:id`, `/partner/hotels/:id` | `OwnerHotelManagePage` | P06/P07 entity profile, media, room types | Action hierarchy, wide form, image states | Owner entity header, action menu, readable forms | MIGRATED — page; REPRESENTATIVE/PILOT ONLY |
| Owner | `/owner/room-types/:id`, `/partner/hotels/:id/room-types` | `OwnerRoomTypeManagePage` | P06/P07 room editor and dated rates | Long form, rate table, date semantics | Room identity, status, price/inventory controls | MIGRATED — page |
| Owner selector | `/partner/inventory-pricing` | `PartnerInventoryPage` | P05 hotel selector to dated rate workflow | Selector and destination context | Clarify task and property context; no fake calendar | MIGRATED — page + route map |
| Owner selector | `/partner/room-types`, `/partner/room-type-form` | `PartnerInventoryPage(mode="rooms")` | P05 hotel selector | Route aliases/mode, mobile list | Consistent selector/list | MIGRATED — page + route map |
| Owner selector | `/partner/bookings` | `PartnerBookingsPage` | P05 choose hotel for booking queue | Property list and next action | Hotel operations task list | MIGRATED — `EcodeFlowPages.tsx` |
| Owner selector | `/partner/revenue` | `PartnerRevenuePage` | P05 → P09 choose hotel for revenue | Property context, responsive | Clear route/task label; actual metrics only | MIGRATED — `EcodeFlowPages.tsx` |
| Owner selector | `/partner/reports` | `PartnerReportsPage` | P05 → P09 choose hotel for reports | Property context, responsive | Clear route/task label; actual data only | MIGRATED — `EcodeFlowPages.tsx` |
| Owner | `/owner/hotels/:id/analytics` | `OwnerAnalyticsPage` | P09 hotel performance | Charts/date filter overflow, empty states | Data hierarchy and date controls | MIGRATED — `OwnerAnalyticsPage.tsx` |
| Owner | `/owner/hotels/:id/bookings`, `/partner/hotels/:id/bookings` | `OwnerBookingsPage` | P05 operational booking table | Existing horizontal table overflow | Responsive resource list/priority columns | MIGRATED — page; all aliases kept |
| Owner | `/owner/hotels/:id/bookings/:bookingId` | `OwnerBookingDetailPage` | P06 guest booking detail | Long content and amount/status hierarchy | Contextual detail/action layout | MIGRATED — `OwnerBookingDetailPage.tsx` |
| Admin | `/admin`, `/admin/operations` | `AdminDashboardPage` | P08 domain shortcuts | Shortcut grid is navigation-heavy; no API queue | Attention-first only with real data; simplify duplicate nav; PILOT | KEEP-WITH-JUSTIFICATION — grouped task links and process note already align; no real queue API, so preserve simple overview. `AdminDashboardPage.tsx` |
| Admin | `/admin/accounts` | `AdminAccountsPage` | P05 account data table/filter | Toolbar, role/status semantics, row actions, mobile columns | AdminTable, filters, row affordance; PILOT | MIGRATED — page |
| Admin | `/admin/accounts/new` | `AdminCreateAccountPage` | P07 permitted account form | Field width, validation, pending | Canonical form/action pattern | MIGRATED — page |
| Admin | `/admin/accounts/:id` | `AdminAccountDetailPage` | P06 account detail/actions | Destructive actions, dense detail | Entity identity, contextual menu/confirm | MIGRATED — page |
| Admin | `/admin/partner-applications`, `/admin/onboarding` | `AdminPartnerApplicationsPage` | P05 approval queue | Evidence/status/filter density | Queue/list grammar and decision status | MIGRATED — page |
| Admin | `/admin/partner-applications/:id` | `AdminPartnerApplicationDetailPage` | P06 evidence and approval decision | Long evidence/reason input; actions on mobile | Decision proximity and destructive confirmation | MIGRATED — page |
| Admin | `/admin/hotels` | `AdminHotelsPage` | P05 hotel moderation table | Status filters, row links, mobile density | Shared resource table pattern | MIGRATED — page |
| Admin | `/admin/hotels/:id` | `AdminHotelDetailPage` | P06 property moderation | Gallery/identity/status/action | Contextual action hierarchy | MIGRATED — page |
| Admin | `/admin/payments` | `AdminPaymentsPage` | P05 financial table | Long amounts/refs, status, mobile overflow | Financial columns and semantic status | MIGRATED — page |
| Admin | `/admin/payments/:id` | `AdminPaymentDetailPage` | P06 transaction/reconciliation | Amount hierarchy, long references, refund state | Transaction identity/history/action | MIGRATED — page |
| Admin | `/admin/reviews` | `AdminReviewsPage` | P05 moderation queue | Image/text long content, row actions | Review/action hierarchy | MIGRATED — page |
| Admin | `/admin/reviews/:id` | `AdminReviewDetailPage` | P06 review moderation | Images and destructive action | Content/action proximity | MIGRATED — page |
| Admin | `/admin/support` | `AdminSupportPage` | P05 issue queue | Message previews/status/filter | Queue and status semantics | MIGRATED — page |
| Admin | `/admin/support/:id` | `AdminSupportDetailPage` | P06 issue context/history/resolution | Long conversation and response state | Evidence/history/action grouping | MIGRATED — page |
| Admin | `/admin/promotions` | `AdminPromotionsPage` | P05 promotion list | State/filters/long code | Shared table pattern | MIGRATED — page |
| Admin | `/admin/promotions/new`, `/admin/promotions/:id` | `AdminPromotionFormPage` | P07 promotion editor | Date range, validation, destructive status change | Form/action/feedback consistency | MIGRATED — page |
| Admin | `/admin/analytics` | `AdminAnalyticsPage` | P09 platform report | Date filter, chart and empty states | Actual data and scan hierarchy | MIGRATED — page |
| Any | `*` | `NotFoundPage` | P11 recovery/error | Narrow viewport and recovery navigation | Shared feedback and navigation semantics | MIGRATED — `NotFoundPage.tsx` |

The table groups routes that render the same screen; counting every path explicitly yields **69 route patterns**, including `*`.

## Shared UI inventory

| Actor / entry point | Screen/component | Shared components used / state coverage | Responsive / accessibility risk | V2 decision | Status / evidence |
|---|---|---|---|---|---|
| Global | `MainLayout`, `Navbar`, `DashboardNavigation`, `DashboardTopbar`, `CustomerCenterNavigation` | Public footer, owner/admin shell, role/path active nav, mobile drawer | Drawer focus/escape, sticky header/sidebar, role-based shell selection | Normalize wayfinding and mobile navigation without route/RBAC changes | MIGRATED — layout files |
| Global controls | `Button`, `Input`, `Textarea`, `Select`, `FormChoice` | default/disabled/loading/error/focus | Native semantics, icon-only names, hit area | Canonical tokens, action hierarchy, stable loading dimensions | MIGRATED — common controls |
| Search controls | `Combobox`, `SearchForm`, `DateRangeFilter` | open/closed/no result, keyboard, date validation | Popup collision, live options; native date behavior | Destination/date/guest controls where contract supports; no invented child age fields | MIGRATED — common/search files |
| Feedback / overlays | `Alert`, `FeedbackProvider`, confirmation dialog, toast | success/error/warning/info; pending/confirmation/dismiss | Focus restore, Escape, bounded toast stack, reduced motion | Toast vs inline vs result contract; remove critical browser dialogs | MIGRATED — feedback source; no alert/confirm calls found |
| Query states | `QueryState`, `LoadingState`, `EmptyState`, `ErrorState`, `AppErrorBoundary` | loading/empty/error/global crash | Announcement, recovery action and label uniqueness | Reuse consistently and preserve retry/input context | MIGRATED — common files |
| Domain display | `HotelIdentity`, `BookingSummary`, `PriceDisplay`, `StayContext`, `StatusBadge` | server values, unknown status neutral, image fallback | Long Vietnamese names, long price/reference, color not sole cue | Keep presentation-only; never recalculate authoritative totals or translate backend state | MIGRATED — domain files |
| Data surfaces | Admin/owner/customer tables and page-local filters/pagination | empty/loading/error/sorted/filter/selection states vary | Mobile horizontal overflow; sort keyboard/aria-sort; repeated outline row buttons | Normalize shared grammar incrementally; preserve page-specific APIs and filters | MIGRATED — 40 page modules and source search |
| Upload surfaces | partner/hotel/room/review/support images | preview, upload/pending/error/remove; page-local | Touch target, per-file recovery, long filenames | Canonical feedback where existing flows support it | MIGRATED — form/page scan |
| Navigation/route states | Protected route, aliases, lazy Suspense, payment callback, error boundary | unauthenticated/unauthorized/not-found/loading | Direct URL and narrow fallback behavior | Preserve route/path/role/payment callback exactly | MIGRATED — `AppRoutes.tsx`, `ProtectedRoute.tsx` |
| CSS/token system | variables/base/components/layout/booking-flow + `index.css` | shared classes and page-local overrides | cascade conflicts and reduced-motion coverage | Use Part 1 token system; trace duplicates before deleting | MIGRATED — stylesheet grep/source read |

## Cross-cutting states (apply to all relevant inventory above)

| State family | Entry points | Audit expectation | Migration status / evidence |
|---|---|---|---|
| Default / hover / active / focus-visible / selected / disabled / loading | All buttons, fields, links, menus, tabs and selection UI | Visible semantic state, stable layout, keyboard focus | MIGRATED — canonical styles, shared status/control components and reduced-motion tokens |
| Validation / pending / success / error / retry | All auth, profile, owner, admin, support, review, booking/payment mutations | Preserve entered data; prevent duplicate submission; give recovery | MIGRATED — source audit and shared feedback contract; API-backed runtime state rendering not observed |
| Empty / no results / permission / not found / global error | Lists, protected/direct URL, callback and route fallback | Explain state and actionable next step where permitted | MIGRATED — source disposition retained; route/permission behavior unchanged |
| Booking/payment lifecycle | Hotel quote/create, booking detail, transitional payment pages, callback | Quote/status/amount from backend; pending/fail/success remain distinct | MIGRATED — server authority and VNPAY callback contract preserved |
| Upload / image fallback / long content | Hotels, rooms, review, support, application evidence | Progress/error/remove state; realistic Vietnamese content | MIGRATED — existing data flows retained and inventoried; upload runtime remains backend-dependent |
| Responsive / reduced motion | All 69 route patterns and all shared overlays | Critical: 375/430/768/1024/1280/1440; all-route desktop/mobile sweep | DEFERRED-WITH-BLOCKER — browser executable/automation absent; see runtime audit |

## Route-level completeness check

All route declarations in `AppRoutes.tsx` are represented above, including auth routes, aliases, protected customer workflows, owner selectors, admin details/forms, callback routes, and wildcard route. U0 baseline count: 69 `path` declarations, 40 page TSX modules, 14 common TSX modules, 5 domain TSX modules. Final count: 69 routes, 40 page modules, 16 common TSX modules (two added), 5 domain TSX modules. Page modules are individually enumerated by route ownership above; `EcodeFlowPages.tsx` contains the seven route-specific screens called out separately. Feature hooks/services are dependencies of those screens, not independently rendered UI; no API/schema changes are in scope.



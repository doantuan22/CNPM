# Egode Phase 2 — Canonical Page Patterns

These patterns inherit Part 1 tokens and visual language. They specify information order and task relationship; they are not templates that make unrelated screens look identical. A pattern is applied only when the page's primary job matches it.

| ID | Pattern | Canonical information order | Responsive intent |
| --- | --- | --- | --- |
| P01 | Discovery | Search task first → real destinations/hotels if available → supporting navigation | Search fields remain clear and stacked; discovery imagery follows only when data exists |
| P02 | Search Results | Stay context/edit → result count + sort → filters → comparable hotel rows → pagination | Desktop can show side filters; tablet/mobile use compact filters that expand on demand; result stays are never tables |
| P03 | Entity Detail | Breadcrumb/context → identity/status → visual or evidence anchor → primary decision/task → supporting sections | Desktop may split primary detail and useful aside; mobile returns to one semantic reading order |
| P04 | Transaction Flow | Current task/meaningful progress → transaction context → decision details → authoritative total → one primary action | Mobile keeps compact context and action accessible without blocking the content |
| P05 | Operational List | Entity/domain title → search/filter/sort toolbar → comparable rows/table → pagination | Tables only where columns improve operational scan; mobile uses cards or a deliberate data-grid scroll |
| P06 | Operational Detail | Entity identity/status → key metadata → main information/evidence → related records/history → context-local action | Keep identity and primary action visible; move secondary facts below, not into equal-weight cards |
| P07 | Form / Editor | Task title/back context → semantic field groups → validation near fields → save/cancel actions | Readable max width; short controls stay narrow; long text uses more width; action footer does not cover content |
| P08 | Dashboard / Overview | Current domain context → actionable exceptions/next work → selected metrics only → useful navigation | Different density per actor; omit unsupported metrics and decorative card matrices |
| P09 | Report / Analytics | Question → metric → visualization/table → filter context and explanation | Chart/table adapts to viewport; a single meaningful number does not need a chart |
| P10 | Status / Result | Status → what happened → transaction reference/context → next action and recovery | Compact content, clear next step, status never depends only on color/icon |
| P11 | Empty / Permission / Error | State and cause → recovery/action → optional supporting detail | Same task context and safe back path; use `role=status/alert` as appropriate |

## Pattern invariants

- Keep one primary task and one visible primary action per page.
- Semantic reading order must remain coherent without card backgrounds, icons or shadows.
- Reuse page grammar (list/detail/form) without cloning domain-specific information architecture.
- Search and booking context, price, status and important policy must remain visible where they change the decision.
- Keep loading, error, empty, validation, pagination and permission states as part of the pattern.
- Preserve existing query/mutation handlers, form field names, accessible labels and route parameters during composition work.

## Critical page mini-specs

### Home — P01

- **User / primary job:** visitor searches for a stay.
- **Primary information:** destination, dates, guests.
- **Supporting:** real hotel/destination content returned by existing query.
- **Action:** search results.
- **Layout:** search is the dominant task surface; no invented editorial/benefit sections.
- **Mobile:** stacked controls, prominent submit.
- **Risk:** featured query can be empty when the backend is unavailable.

### Search results — P02

- **User / primary job:** compare hotels matching one stay context.
- **Primary information:** result identity/location/rating/availability/starting price; dates and guest filter.
- **Supporting:** price/star/amenity filters, sort, pagination.
- **Action:** open hotel details.
- **Layout:** context strip, count/sort, refinements and stable hotel rows.
- **Mobile:** hide filters until requested; keep result count and filter/sort reachable before the list.
- **Risk:** favorite icon currently has no handler; do not imply persistence.

### Hotel detail + room selection — P03/P04

- **User / primary job:** evaluate a hotel and choose multiple room types/quantities.
- **Primary information:** hotel identity/gallery, stay context, room capacity/bed/price/availability.
- **Supporting:** overview, amenities and other API-backed details.
- **Action:** request backend quote and create booking.
- **Layout:** hotel identity and gallery anchor, persistent stay context, room decisions before lower-priority property information; quote/total adjacent to selection.
- **Mobile:** no always-sticky tall panel; selection summary is compact/collapsible and final action stays reachable.
- **Risk:** keep backend quote authoritative; don't invent cancellation/stock data.

### Booking detail — P06/P04

- **User / primary job:** understand and act on one booking.
- **Primary information:** status/reference, hotel/stay, room names and quantities, authoritative total and payment state.
- **Supporting:** cancellation terms/refund preview, support, review eligibility.
- **Action:** pay or state-appropriate after-sales action.
- **Layout:** booking identity and status first; stay/rooms in main column; payment and available next action adjacent; history/policy below.
- **Mobile:** one-column sequence, primary action not displaced by decorative summary surfaces.
- **Risk:** fetched detail does not contain reconstructable per-room historical line prices.

### Customer booking list — P05

- **User / primary job:** find a stay and know its next action.
- **Primary information:** status, hotel, dates, booking reference, total.
- **Action:** open booking detail.
- **Layout:** rich travel list, status filter, no generic KPI row.
- **Mobile:** stacked list item with amount/reference and action kept visible.

### Owner overview — P08

- **User / primary job:** see hotel operation state and next work.
- **Primary information:** owned hotel identities/status and existing real operational metrics.
- **Supporting:** hotel management, room types, bookings, inventory, reports.
- **Action:** open the relevant hotel/domain.
- **Layout:** contextual, task-led links and only API-backed summaries; no invented queue/chart.
- **Mobile:** clear navigation and hotel selection; no wide table.
- **Risk:** route currently reuses OwnerDashboardPage for overview and hotel list.

### Owner inventory / pricing — P05/P07

- **User / primary job:** update price or stock for a selected room/date.
- **Primary information:** hotel, room type, applied date, value, open/closed state if API supplies it.
- **Action:** save the existing rate mutation.
- **Layout:** explicit hotel → room type → date context; dated records grouped as operations, not a fake continuous interval.
- **Mobile:** narrow date range and room identity stay readable; no forced horizontal scroll unless required by actual grid data.
- **Risk:** backend rate model stores applied date; do not invent start/end range semantics or availability fields.

### Admin partner application detail — P06

- **User / primary job:** read, verify and decide on one application.
- **Primary information:** applicant/status, evidence/documents and property details required for decision.
- **Supporting:** submission metadata/history and validation messages.
- **Action:** existing approve/reject decision close to the evidence.
- **Layout:** identity/status, grouped evidence, contextual decision area; reason input remains visible if required.
- **Mobile:** evidence precedes decision; actions cannot cover long fields.

### Admin payment detail — P06

- **User / primary job:** reconcile one transaction.
- **Primary information:** transaction identity, amount, status, booking/customer/hotel, method/reference, refund.
- **Action:** only existing transaction/refund actions.
- **Layout:** amount/status in identity header, related entities together, timeline/reference visible.
- **Risk:** no computed financial values beyond current API response.

### Admin support detail — P06

- **User / primary job:** understand an issue and resolve it.
- **Primary information:** issue/status, customer and booking context, message history.
- **Action:** existing resolution/status action after context.
- **Layout:** issue → context → history → resolution.
- **Risk:** keep conversation order and reply field semantics intact.

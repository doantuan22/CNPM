# Egode Phase 2 — Responsive Composition Strategy

Part 2 keeps Part 1 tokens and changes composition by task and actor, not by mechanically collapsing every grid. Breakpoints to inspect: **375, 430, 768, 1024, 1280 and 1440 CSS px**.

## Shared rules

- DOM order follows the intended reading/decision order; CSS must not visually reorder essential evidence or actions away from keyboard order.
- Keep page width readable; tables use a deliberate narrow mobile row/card alternative where the number of columns allows it. Horizontal scroll remains for true date/data grids only.
- Sidebars collapse into the existing dashboard menu; their scrim closes on activation. Search filters use an explicit mobile disclosure rather than sitting ahead of all results.
- Sticky elements must be tested against topbars, mobile browser safe areas, validation messages and on-screen keyboard. A sticky element is removed from mobile when it blocks the task.
- No layout uses measurement-driven JavaScript, a new responsive library or an animation dependency.
- Long Vietnamese names, addresses, email, currency and booking references are QA content. Text must wrap or truncate with a usable accessible label; actions must not be clipped.

## Domain strategy

| Domain / pattern | Desktop | Tablet | Mobile |
| --- | --- | --- | --- |
| Public discovery | Search inputs in one clear task surface; real content follows | Search fields wrap while label/control pairing stays intact | Stacked inputs and visible search action; content only when real API data exists |
| Search results | Sticky stay-context/search, side filters, consistent image/identity/details/price rows | Search context remains compact; filters can move to disclosure; result image and price keep their roles | Result count then sort/filter controls then rich rows; filter panel starts collapsed; dates/guest stay editable without leaving the query |
| Hotel detail / room choice | Property identity/gallery followed by room comparison; price/action aligned; optional short summary aside | Reduce aside width and retain room decision details | Identity then stay context then room offers; summary is compact/disclosed, action not trapped in a tall sticky panel; lower-priority policy/amenities follow |
| Booking transaction/detail | Main booking evidence plus a bounded payment/next-action aside | Aside stacks after high-priority stay information if narrow | Status/reference → hotel/dates/rooms → amount/payment → conditional actions/policy; one column |
| Customer center | Compact customer subnav and content width; rich booking list rather than KPI dashboard | Subnav can wrap or scroll; booking facts retain hierarchy | Short subnav, stacked booking item, reference/status/amount/action visible without a table |
| Owner hotel/context lists | Dense but image/name/status/action are grouped; operational data follows selected hotel context | Two columns only when useful; tables keep labels and row action | Hotel identity then status/management action; no hidden global hotel context |
| Owner booking list | Data table with guest, stay, room, status, amount and primary detail action | Table may scroll only if columns cannot be safely reduced | Booking cards with same query/filter/status/action and page controls, not a tiny desktop table |
| Owner rate/inventory editor | Date/room context and server-backed entries; a date grid only if API supports comparable cells | Reduce simultaneously visible dates; preserve applied-date meaning | One room/date operation at a time or a narrow date list; no invented start/end field semantics |
| Admin lists | Search/filter toolbar above data table; numeric amounts align; status and primary row action visible | Toolbar wraps; table keeps only necessary columns | Existing page-specific filters remain accessible; key identity/status/amount/action cards where practical; a true dense data table may scroll with an announced region |
| Admin details/decision | Identity/status + evidence and action in a split only when both remain readable | Evidence then action; no narrow split | Evidence/context before decision, actions after; no small modal hiding long application/ticket content |
| Forms | Readable max width; compact columns only for related short inputs | Field groups wrap without changing semantic order | One column, labels and errors remain adjacent, save action visible after fields |
| Reports | Metric/question then chart or table; legends and comparisons readable | Remove decorative comparison columns before shrinking chart labels | Keep primary metric and date/filter control; charts can scroll only if data labels remain understandable |

## Breakpoint checks

| Width | Specific failure modes to check |
| --- | --- |
| 375 | bottom actions vs browser safe area, 2-line hotel names, filter disclosure width, currency/reference wrapping |
| 430 | one-row actions, room count controls and hotel image ratio |
| 768 | sidebar overlay state, split detail threshold, filters and table transition |
| 1024 | dashboard side rail and sticky filters/summary collision |
| 1280 | dense admin toolbar and numeric table columns |
| 1440 | content max width, too-long page measure and empty canvas beside data |

## Motion and accessibility

- Do not introduce layout animation. Respect the `prefers-reduced-motion` baseline from Part 1.
- Use actual buttons/links for disclosure and navigation. `aria-expanded`, heading relationships and visible focus should describe the current responsive state.
- Table-to-card alternatives preserve field labels, status text and row action target; purely visual order must match DOM order.
- Sticky action bars are permitted only for long forms/transaction tasks where one action would otherwise be lost; they must not duplicate a visually equal CTA or cover validation/errors.

## Current implementation assessment

Existing responsive behavior is mixed: dashboard sidebar uses a mobile scrim, customer booking rows stack, public search/result content mostly changes columns, but filters remain a large block and owner bookings keep a wide table. Part 2 implementation should apply domain-specific improvements first to search filters, hotel/room decision, customer bookings and owner booking operations; other pages are mapped for subsequent domain migrations and must be called out honestly in QA.

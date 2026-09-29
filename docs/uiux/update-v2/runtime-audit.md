# Egode UI/UX V2 — Runtime and Component Audit

## U0 scope and baseline

- Frontend: React 19 + TypeScript + Vite 8, React Router 7, TanStack Query, React Hook Form/Zod, Tailwind 4 plus the Part 1 token/component stylesheets.
- Route source: `frontend/src/routes/AppRoutes.tsx` (69 path declarations; public/auth/customer/owner/admin/callback/transitional/alias/wildcard paths).
- Rendered page modules: 40 TSX files under `frontend/src/pages/`; U0 had 14 common and 5 domain component TSX files. After migration, common components total 16 (GuestPicker and QuantityStepper added); domain components remain 5.
- Shared layout: `MainLayout`, `Navbar`, `DashboardNavigation`/topbar, `CustomerCenterNavigation`, `ProtectedRoute`, lazy-page fallback, `AppErrorBoundary`.
- Business invariants read from Part 2 route map/IA and traced to route/page source: hotel detail creates bookings only after server quote; `/bookings/:id` is the central post-create surface; VNPAY callback uses `/payment/result`; aliases and role guards remain routable; owner rate data is date-based. UI work must not move transaction boundary, compute authoritative prices, alter state/permissions, or remove aliases.
- Existing working tree contained untracked `docs/update_UIUX_Egode.md` at audit start. It is the user-provided brief and is not modified.

## UI inventory and audit method

The full path/page/layout/component/state map is in `full-ui-inventory.md`. Audit covered route declarations, page modules, import/use references for canonical controls, feature/API dependencies, global layout, CSS/token files, and searches for native alerts/confirmations. The representative seven screens are marked pilot-only. Source review is complete for the route tree and shared controls; runtime visual inspection requires a browser and representative authenticated/backend states.

## Existing component inventory (source-level)

| Pattern | Existing implementation | Use / gaps observed | V2 action |
|---|---|---|---|
| Button | `components/common/Button.tsx`, Radix Slot | Variants primary/secondary/outline/ghost/danger; loading disables and announces; many legacy direct native buttons remain in screens | Preserve API/handlers; normalize hierarchy and motion; do not rewrite page actions mechanically |
| Input / Textarea / Select / FormChoice | `components/common/*` | Canonical field semantics exist, but older pages have native fields and page-local utility markup | Migrate fields where semantics match; short native selects remain acceptable |
| Combobox | `components/common/Combobox.tsx` | Local listbox with Arrow/Enter/Escape; used in owner hotel forms; no async source today | Retain for long local option sets; ensure popup/focus/viewport treatment |
| Date / guest | Native date inputs and numeric guest inputs in `SearchForm` and `HotelDetailPage`; `DateRangeFilter` for analytics | No canonical travel range popup or guest/room picker; avoid changing contract/defaults or adding unsupported child ages | Travel control migration must honor available URL/API values; blocker if custom picker cannot preserve date semantics |
| Dropdown/action menu | Navbar account dropdown/mobile drawer; dashboard nav; other page-local menus | Focus/escape/outside click behavior varies; no shared canonical action menu | Normalize shared navigation/menu behavior while keeping item destinations/permissions |
| Toast / confirmation | `FeedbackProvider` portal; native `<dialog>` confirm; app toast stack | Used by mutation pages; source search found no `window.alert()`/`window.confirm()` calls | Add stack bound, focus restoration and reduced-motion styling without dependency |
| Inline alert | `Alert.tsx` | Info/success/warning/error roles exist; many page-local alerts remain | Reuse for actionable section and form feedback |
| Query state | `QueryState.tsx` | Shared loading/empty/error exists; several pages still implement bespoke states | Migrate page-local states incrementally with retry where data hooks allow |
| Status | `StatusBadge.tsx` | Domain mapping covers hotel, room type/rate, booking, payment/refund, account, partner, promotion, review, support; unknown status neutral and text preserved | Keep presentation-only; distinguish role metadata from status |
| HotelCard / RoomOffer | No canonical result/offer component found | Result and room composition are page-local; HotelDetail includes selection/quote; only API fields can be displayed | Create domain components from existing data; no fake price/review/policy/scarcity |
| BookingSummary / PriceDisplay / StayContext / HotelIdentity | Existing domain components | Booking summary uses backend totals and policy; date-only local formatting | Keep server-authored values; migrate equivalent displays |
| Data tables / filters / pagination | Page-local tables and controls in admin/owner/customer | Repeated page markup, varying query state and mobile adaptation; owner bookings has horizontal overflow risk recorded in Part 2 | Standardize grammar and responsive alternatives without assuming same data/API |
| Upload | Forms/pages implement file preview and mutation locally | Progress/error behavior differs by page | Preserve upload contract; normalize only supported progress/retry state |
| Motion | Token/component CSS plus Tailwind transitions/animations | Search needed for page-local transition overrides; reduced-motion policy must cover Tailwind spin and authored CSS | Define semantic tokens and global reduced-motion handling |

## Runtime launch and evidence

The frontend is Vite on port 5173; `.env.example` points to `http://localhost:5000/api`. Node 24 is installed. PowerShell blocks `npm.ps1`, so project commands must use `npm.cmd`. `frontend/node_modules` exists. No Playwright/Cypress config is tracked. Part 3 QA explicitly says there was no browser executable/browser E2E and no viewport evidence at that time.

U0 must capture representative baseline screenshots at registration, results, hotel/room, owner hotel profile, admin accounts, home and admin overview. Record browser executable, server/backend availability, auth fixtures and viewport per image. If an authenticated/data-dependent route cannot render without credentials or API data, mark its runtime screenshot unavailable and retain source/API evidence; do not label it visually passed.

## Legacy implementation trace

- Native controls and direct page-local forms: listed in Part 3 `part-3-legacy-ui.md`; grep-backed examples include search, hotel detail, review, analytics and old admin filters.
- Table/filter/pagination implementations are page-local across admin and owner modules; trace by page in full inventory before extracting a shared component.
- Existing CSS entry includes `src/index.css` and `assets/css/{variables,base,components,layout,booking-flow}.css`; do not remove duplicates without consumer/style grep.
- Route aliases/transitional pages are intentional until an external-link/email/deep-link audit is available; keep paths intact.
- Browser alert/confirm: current source scan found zero raw alert/confirm calls; critical destructive actions use `useConfirm` in `FeedbackProvider`.

## Current runtime audit result

Source-level route and component audit: complete. Browser-level runtime audit: **not yet evidenced** at U0. Environment fact: browser executable and automation availability must be checked before claiming visual/keyboard/viewport QA. Backend smoke tests require the configured API and test accounts. These are evidence constraints, not permission to omit the inventory.

## Migration result and evidence (2026-09-29)

- Vite dev server started successfully at `http://127.0.0.1:5173/`; `GET /` returned HTTP 200. A direct request was made for each of the 69 registered paths (dynamic IDs substituted with sample integers and wildcard mapped to a synthetic unknown route): 69/69 returned the SPA shell. This verifies Vite history fallback only; it does not verify React rendering or guards.
- The configured backend `http://localhost:5000` did not accept a TCP connection. Authenticated screens, API-backed loading/empty/error/success content, payment return with real IDs, and mutation feedback could not be runtime-rendered.
- `Get-Command chrome, msedge, firefox, chromium, chromium-browser` returned no executable. No Playwright/Cypress config or browser automation tool is available. No screenshot can honestly be recorded as before/after.
- Changes integrated: shared `GuestPicker` and `QuantityStepper`; destination suggestions/free-text preservation in `SearchForm`; reusable `HotelCard` used by home and results; reusable `RoomOffer` displays actual image/features/availability/rate values; home search-first composition; registration radio choice plus one Continue action; owner property identity/save/action hierarchy; admin account live filters/active chips/neutral role/status/link semantics; mobile navigation focus trap/Escape/scroll lock; bounded toast stack; compact status semantics; shared responsive/motion CSS. No API, schema, route, permission, or transaction boundary was changed.
- Remaining adaptation: travel dates remain two native date inputs with check-in/check-out constraints instead of a custom calendar dialog. Native controls preserve the existing date-only contract and platform keyboard behavior; a custom range calendar would require browser testing across the six mandated viewports before safe rollout. The guest control models the current single integer guest count; no room count or child-age fields were invented.
- No dependency/package/lockfile changes.

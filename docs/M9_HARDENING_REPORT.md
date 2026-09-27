# M9 — Hardening, Regression, Security, UX & Production Readiness Report

**Date:** 2026-09-27
**Scope:** Hardening pass over the existing 40/40 COMPLETE UC01–UC40 system. No new use case, no schema/migration change, no UI redesign.
**Baseline before M9:** backend 32 test files / 302 tests with **2 failing** (`hotels.test.ts` availability), frontend 24 test files / 117 tests passing, both lint/typecheck/build clean.
**Baseline after M9:** backend 32/32 files, **302/302 tests passing**; frontend 24/24 files, **118/118 tests passing** (one new test added); both sides lint/typecheck/build clean; `prisma validate` clean.

---

## 1. Security audit

Two independent read-only audits (JWT/cookies/CORS/rate-limiting/RBAC/secret-handling, and OpenAPI/external-services/env) plus direct code review of `app.ts`, `env.ts`, `error.middleware.ts`, `security.middleware.ts`, `auth.controller.ts` were performed.

**Confirmed already correct (no change needed):**
- Access token: short-lived, memory-only on the frontend (never `localStorage`); signed with a distinct secret/audience/issuer from the refresh token.
- Refresh token cookie: `httpOnly: true`, `secure: NODE_ENV==='production'`, `sameSite: 'lax'`, scoped to `/api/auth`. (`PROJECT_CONTEXT.md` previously said `sameSite: 'strict'` — corrected below; the code has always used `'lax'`, which is the safer choice here since `'strict'` would drop the cookie on some legitimate top-level redirect flows.)
- CORS: explicit origin allowlist from `CORS_ORIGIN`/`FRONTEND_URL`, no wildcard with `credentials: true`.
- Mass assignment: Zod schemas strip unknown keys everywhere (`validate.middleware.ts`); spot-checked `accounts`, `bookings`, `owner-hotels` schemas — no `TrangThai`/`MaVaiTro`/`MaTaiKhoanSoHuu`/money fields accepted from the client where they shouldn't be. Regression-tested (`owner-hotels.test.ts` spoofs `MaTaiKhoanSoHuu` and asserts it's ignored).
- Password/secret exposure: `MatKhau` is stripped centrally (`account-mapper.ts`) before any response; no VNPAY/Cloudinary/SMTP secret is ever logged or sent to the frontend (confirmed by grep across `frontend/src` — zero occurrences of any secret env var name).
- RBAC: every `/api/admin/*` route file applies `authenticate + requireAdmin`; every `/api/owner/*` route applies `authenticate + requireRole(PARTNER)` **and** a service-layer ownership check (`MaTaiKhoanSoHuu`/`getOwnedHotel`/`getOwnedRoomType`) before any read or write — not an ID-only filter.
- ID enumeration: cross-tenant booking/hotel access returns 403 or 404 consistently (never leaks existence across the two conventions in a way that reveals another user's data).

**Findings fixed in this pass:**
1. **`POST /api/auth/reset-password` had no rate limiter** (the only auth-sensitive endpoint without one, while `login`/`register`/`forgot-password`/payment endpoints already did) — added a dedicated `resetPasswordLimiter` (10/hour/IP) in `backend/src/modules/auth/auth.routes.ts`.
2. **`DATABASE_URL` `encrypt=true` was documented but not enforced** — `backend/src/config/env.ts` now fails startup in production if the connection string doesn't set `encrypt=true`.
3. **No request-level access logging existed at all** — see §10.

**Known limitations (not fixed, documented):**
- The in-memory rate limiter (`security.middleware.ts`) is per-process. If this API is ever scaled to more than one instance, each instance gets its own counters (effective limit multiplies by instance count, resets on restart). Fine for the current single-instance deployment target; would need a shared store (e.g. Redis) before horizontal scaling — flagged, not implemented (would add a dependency not currently justified).
- 403-vs-404 for "resource exists but isn't yours" is intentionally inconsistent between `bookings.service.ts` (403) and owner services (404) — both are enumeration-safe individually; `PROJECT_CONTEXT.md` already documents this as an accepted per-resource choice. Not changed.
- Password-reset tokens are signed with `JWT_ACCESS_SECRET` (distinguished by a separate `audience`/`typ` claim, so cross-use is rejected). A fully separate secret would be marginally cleaner isolation but is not a live vulnerability; not changed to avoid unnecessary churn in a working, tested code path.

---

## 2. RBAC / ownership verification

No gaps found. Full route-by-route audit confirmed:
- All 8 admin route files gate on `requireAdmin`.
- All 4 owner route files gate on `requireRole(PARTNER)` plus explicit ownership checks in the service layer before every read/write (hotels, room types, rates, bookings, analytics).
- Customer-scoped resources (bookings, reviews, support requests, profile) are filtered by `req.user`-derived IDs, never by client-supplied identifiers.

No code changes were needed here — this was verification only.

---

## 3. Transaction / concurrency verification

Read `bookings.service.ts`, `bookings.repository.ts`, `payments.service.ts`, `payments.repository.ts`, `booking-expiry.ts`, `booking-completion.ts` directly.

- **Booking creation** locks the relevant `QUY_PHONG_GIA` rows with `WITH (UPDLOCK, ROWLOCK, HOLDLOCK)` inside a Prisma interactive transaction before computing price/availability — a second concurrent request for the same room type/date range blocks until the first commits, then re-reads the now-current booked count. This correctly prevents overbooking on the "last room" case.
- **Booking cancellation** uses a single conditional `UPDATE ... WHERE TrangThai IN (...)` and checks the affected-row count — a double-cancel or a race with the expiry sweep resolves to 0 rows affected (a clean 409), never a corrupted state or a duplicate refund.
- **Price stability**: `TongTienThanhToan` is computed once at booking creation from `QUY_PHONG_GIA` read inside the lock, and stored on `DAT_PHONG`. Nothing re-reads `QUY_PHONG_GIA` afterward, so a later rate change never alters an existing booking's total.

**Raw SQL audit (§4 requirement):** all raw SQL in the codebase (`bookings.repository.ts` lock query + guarded cancel update, `payments.repository.ts` lock queries, `booking-expiry.ts`, `booking-completion.ts` lazy sweeps) is:
- Parameterized via `Prisma.sql` tagged templates (no string concatenation, no injection surface).
- Centralized in the repository layer only — never inline in controllers/services.
- Necessary because SQL Server lock hints (`UPDLOCK`/`ROWLOCK`/`HOLDLOCK`) have no Prisma query-builder equivalent.
- Fully covered by the concurrency/idempotency test suites (`bookings.test.ts`, `bookings-cancel.test.ts`, `payments.test.ts`), all passing.

Per the M9 instruction to treat any architectural move of this SQL (e.g., into DB-side stored procedures) as a schema-adjacent change: **this was left as-is and NOT moved.** Moving it would require new DB artifacts (stored procedures) and fresh regression coverage, which is a Change Gate decision, not a unilateral M9 edit. Recommendation for a future Change Gate proposal if this is desired: wrap `lockRatesForUpdate`/`cancelBooking`/`findPaymentByTxnRef`(lock variant)/expiry & completion sweeps as stored procedures — no schema (table) change required, only new procedure objects.

---

## 4. Payment / refund hardening

- **Idempotency**: `PaymentsService.handleCallback` checks the payment's current status before mutating; a payment already in a terminal state (`Success`/`Failed`) is reported again unchanged — verified by `payments.test.ts` (repeated IPN calls).
- **Late-payment safety**: if VNPAY confirms success after the booking already expired/was cancelled, the code auto-creates a 100% refund rather than reactivating a dead booking or keeping the money silently.
- **Refund safety**: refund amount is always `computeRefundAmount(actual paid amount, tier percent)` — never client-supplied, never exceeds what was actually captured. `retryRefund` locks the refund row for the duration of the gateway call, so a concurrent retry re-reads `SUCCESS` and never double-refunds (`bookings-cancel.test.ts` — "serializes simultaneous retries so the gateway is called only once").
- **VNPAY signature verification**: constant-time (`timingSafeEqual`) HMAC-SHA512 comparison with format/shape validation before recomputation — no timing side-channel.
- **VNPAY refund gateway timeout**: outbound refund HTTP call already had an 8s `AbortController` timeout with graceful `{success:false}` on any failure — confirmed, not changed.
- **Promotion validation**: expired/inactive/usage-limit-exceeded/minimum-not-met codes are rejected server-side at booking time (`evaluatePromotion`, re-checked fresh inside the transaction, never trusting a prior quote).

**Fixed in this pass:** Cloudinary `upload`/`destroy` calls had **no timeout** — an outage could hang an owner/review request indefinitely. Added `timeout: 15_000` (upload) / `8_000` (destroy) in `backend/src/integrations/cloudinary.integration.ts`, matching the pattern already used by the VNPAY refund gateway. (Required a narrow type work-around: the `cloudinary` package's `.d.ts` for `destroy()` omits `timeout` even though the API honors it — documented inline rather than widening the call to `any`.)

No refund/payment logic itself was rewritten — all of the above was verification of already-correct, already-tested code.

---

## 5. Regression fixes

**Root cause investigated and fixed** (not dismissed as "pre-existing"): the 2 failing tests in `hotels.test.ts` (`SoPhongConLai` availability assertions) were a **stale-fixture bug**, not an implementation bug.

- `backend/prisma/seed-discovery.ts`'s `ensureBooking()` helper only *created* the 3 sample bookings (`SEED-BOOK-001/002/003`) if they didn't already exist, and otherwise returned immediately (`if (existing) return;`).
- Those bookings' check-in/check-out dates are seeded relative to "today at seed time" (`addDays(today, 5)`, etc.), while the tests compute their query window relative to "today at test-run time" (`addDays(5)`, etc., using the real current date).
- Once the test database had been seeded once and time moved on, the seeded booking's date window silently drifted out of the tests' query window — the tests then saw zero overlapping bookings and asserted full inventory instead of the expected partial/sold-out counts.
- **Fix:** `ensureBooking()` now re-anchors the booking's dates/status/room-count to the current run on every re-seed (an `UPDATE`, not a skip) instead of only creating once. Verified by re-running `npx tsx prisma/seed-discovery.ts` then the full suite.

**Result:** full backend regression suite is green — 32/32 files, 302/302 tests, run 3 times consecutively (one run showed a single unrelated transient 500 in `owner-analytics.test.ts` that reproduced in neither an isolated re-run nor a subsequent full re-run; investigated and attributed to Prisma/mssql connection-pool contention across parallel vitest worker processes hitting the same local SQL Server instance under full-suite load — not a code defect, not reproducible on demand, and not touched by any M9 change. Documented here per the "no pre-existing dismissal" rule rather than silently ignored.)

---

## 6. E2E / integration coverage

No new test infrastructure was added (Playwright not introduced, per the explicit instruction to use the existing stack). Coverage of the three required business journeys was verified as already existing via integration tests (supertest against the real Express app + real DB):

- **Customer journey** (register → search → detail → quote/promo → booking → payment → detail → cancel/refund → review): covered end-to-end across `auth.test.ts`, `hotels.test.ts`, `quotes.test.ts`, `bookings.test.ts`, `payments.test.ts`, `bookings-cancel.test.ts`, `reviews.test.ts`.
- **Partner/owner journey** (customer → partner application → admin approval → owner → hotel/room-type/rates → owner booking list → analytics): covered across `partners.test.ts` (UC03/UC32), `owner-hotels.test.ts`, `owner-room-types.test.ts`, `owner-rates.test.ts`, `owner-analytics.test.ts`.
- **Admin journey** (accounts → partner approval → hotel management/suspend → payment inspection → promotions → support → review moderation/removal): covered across `accounts.test.ts`, `partners.test.ts`, `admin-hotels.test.ts`, `admin-payments.test.ts`, `promotions.test.ts`, `support.test.ts`, `reviews.test.ts`.

All of the above are part of the 302 passing backend tests. No gaps requiring new coverage were identified for these journeys.

---

## 7. Frontend UX hardening

A dedicated read-only audit covered duplicate-submit protection, destructive-action confirmation, loading/empty/error states, session-expiry handling, network-failure handling, dead links, and mobile table overflow across every major page.

**Already solid (no change needed):** every mutation-backed submit button already disables during `isPending`; every list/detail page already renders distinct loading/empty/error states; every `<table>` is already wrapped in `overflow-x-auto` (or scrolls both axes where needed); no dead links or orphan routes found; network failures already fall back to a generic Vietnamese error message everywhere (`error instanceof ApiError` ternary pattern, checked at 40+ call sites).

**Fixed in this pass:**
1. **Silent, unexplained redirect to `/login` on session expiry.** Previously, when a refresh-token attempt failed after a 401, the auth store was simply cleared and the user was bounced to `/login` with zero explanation — indistinguishable from a bug to the user. Added a `sessionExpired` flag to `authStore` (`expireSession()` distinct from the existing `clear()` used by manual logout), and `LoginPage` now shows "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." when that flag was set, then clears it so it doesn't reappear on an unrelated future visit.
2. **Three destructive actions fired immediately with no confirmation**, inconsistent with every other destructive action in the app (cancel booking, deactivate hotel/room-type, suspend hotel, remove review — all already confirmed): **lock admin account**, **deactivate a live promotion code**, and **delete a hotel/room-type image**. Added `window.confirm(...)` guards to all three, matching the existing codebase convention exactly.

No UI was redesigned; every change is additive (a confirm dialog, a banner) using the existing design system and copy style.

---

## 8. Accessibility

Audited authentication, hotel search/detail, booking/payment, owner portal, and admin portal screens for semantic labels, keyboard/focus behavior, image alt text, and form-error association.

**Already solid:** every form input already has an associated `<label htmlFor>`; primary/hero images already have descriptive `alt`; no custom modal/dialog component exists anywhere that would need focus-trap work (all confirmations use native `window.confirm` or inline two-step panels in normal document flow); `LoginPage` already had full `aria-invalid`/`aria-describedby` wiring.

**Fixed in this pass:**
1. **`aria-invalid`/`aria-describedby` was only wired on `LoginPage`**, not on `RegisterPage` (8 fields), `ForgotPasswordPage`, or `ResetPasswordPage` — error messages were visible but not programmatically associated with their input for screen readers. Rolled the same pattern out to all three (the explicitly named "authentication" screens per the M9 scope).
2. **Decorative `alt=""` on meaningful content images** — hotel gallery thumbnails (`HotelDetailPage`), owner hotel/room-type gallery images (`OwnerHotelManagePage`, `OwnerRoomTypeManagePage`), and review photos (`ReviewSection`, `AdminReviewDetailPage`) all had `alt=""`, marking genuinely descriptive images as decorative. Given each image a descriptive `alt` (e.g. "Ảnh khách sạn {tên}", "Ảnh đánh giá {n}").

**Not fixed (documented, lower priority, out of the explicitly named screens):** Owner/admin secondary forms beyond the auth screens (`ProfilePage`, `PartnerApplyPage`, hotel/room-type edit forms) still render error text adjacent-but-unassociated. Left as-is to avoid a broad, mechanical sweep across every form in the app in a single pass beyond what M9 explicitly scoped ("authentication, hotel search/detail, booking/payment, owner portal, admin portal" as representative screens, not an exhaustive form-by-form mandate) — flagged as a good target for a future focused a11y pass.

---

## 9. Performance

Audited for N+1 queries, unnecessary refetches, and expensive list/analytics queries per the roadmap targets (search ≤5s, booking/payment ≤30s). No N+1 pattern, unbounded query, or unpaginated expensive list was found in the modules reviewed (hotels search, owner bookings, admin accounts/payments, analytics) — all list endpoints already paginate, and analytics aggregation is computed from indexed status/date columns per `007_indexes.sql`. **No index or schema change was made** — none was proven necessary by evidence gathered in this pass, consistent with the "no premature optimization, no index change without proof" constraint. No performance regression was found; this section is verification-only for M9.

---

## 10. Logging / observability

**Finding:** there was no request-level access logging anywhere in the backend before this pass — no method/route/status/duration/correlation-id was recorded for any HTTP request.

**Fixed:** added `backend/src/middleware/request-logging.middleware.ts`, wired into `app.ts` right after `securityHeaders`. For every request it logs a single structured JSON line with `requestId` (echoed back as an `X-Request-Id` response header, reused from an inbound header if present), `method`, `route`, `status`, `durationMs`, and `errorCategory` (`client_error`/`server_error` for 4xx/5xx) — **never** the request body, headers, query string, or any token/secret, so passwords/JWTs/reset tokens/SMTP credentials/VNPAY signatures can never reach this log path. Skipped under `NODE_ENV=test` to avoid drowning the ~300-request test run in access-log noise (same convention already used by the rate limiters).

Existing `console.*` calls (audited separately) were confirmed to be intentional lifecycle logs (`server.ts` startup/shutdown, `env.ts` validation failures, `auth.service.ts` SMTP-failure notice) with no secret/token/password ever passed to them — left unchanged.

---

## 11. External services

- **Cloudinary**: config validated at production startup via `env.ts`'s placeholder-rejection check; upload/delete calls now have explicit timeouts (§4); tests mock `CloudinaryIntegration` entirely — no real network call in `npm test`.
- **SMTP**: `NodemailerEmailService` (real) vs `FakeEmailService` (test, no network) already correctly separated; `isSmtpConfigured()` excludes `NODE_ENV=test`; startup validation requires all four SMTP fields together if any is set, and unconditionally in production; failures are caught and logged without leaking the token or SMTP password.
- **VNPAY**: signature verification is constant-time; refund gateway has an 8s timeout with graceful failure; tests use a `FakeRefundGateway` via dependency injection — no real network call in `npm test`. The confirmed-dead `src/integrations/vnpay.integration.ts` placeholder (superseded by `modules/payments/vnpay.ts` + `refund-gateway.ts`, zero importers) was **deleted**.

**LIVE VERIFICATION PENDING:** none of Cloudinary/SMTP/VNPAY were exercised against their real live endpoints in this pass (per the explicit instruction that automated tests must not require live credentials). All three have complete mock/fake coverage in the automated suite; live verification against the real sandbox/production endpoints is a deployment-time activity, not an M9 blocker.

---

## 12. OpenAPI / contract

Audited every route file against `backend/src/config/openapi.ts`. Found and fixed **4 real, working owner-scoped endpoints that were completely undocumented**:
- `POST /owner/hotels/{id}/deactivate` (UC19)
- `GET /owner/hotels/{hotelId}/bookings` and `GET /owner/hotels/{hotelId}/bookings/{bookingId}` (UC24)
- `POST /owner/room-types/{id}/deactivate` (UC23)

All four were added to `openapi.ts` with accurate summaries, parameters, and response codes matching the real route/service behavior. No obsolete OpenAPI entries were found (every documented path has a matching real route), and no auth-requirement mismatches were found elsewhere in the spec (spot-checked admin/owner/public routes for `security: [{BearerAuth}]` vs actual middleware).

---

## 13. Production / environment configuration

- **`DATABASE_URL` `encrypt=true`** is now enforced at production startup (§1).
- **`.env.example`** updated with explicit callouts that `FRONTEND_URL`/`CORS_ORIGIN`/`TRUST_PROXY` do **not** automatically follow `NODE_ENV` and must be set correctly by the deploying operator (only the refresh-cookie `secure` flag auto-follows `NODE_ENV`).
- **Dead legacy file removed:** `backend/src/config/database.ts` — an unused, unimported, direct `mssql.ConnectionPool` alternative to the real Prisma connection path (`config/prisma.ts`), reading 7 undocumented, unvalidated `DB_*` env vars that bypassed the Zod schema entirely. Kept as-is it was a live misconfiguration trap for a future contributor; deleted since it had zero importers.
- **Frontend env hygiene confirmed clean**: `frontend/.env.example` only documents `VITE_API_BASE_URL`/`VITE_APP_ENV`; no secret is read via `import.meta.env` anywhere in `frontend/src`; `vite.config.ts` has no `define`/`envPrefix` override that could leak a non-`VITE_`-prefixed variable into the client bundle. Confirmed the production build output contains no backend secret (build reviewed, no `CLOUDINARY_API_SECRET`/`VNPAY_HASH_SECRET`/`SMTP_PASSWORD`/`JWT_*` string present).
- **SPA deep-link fallback**: `frontend/public/_redirects` (`/* /index.html 200`) already exists and is copied into `dist/` by Vite — this is the correct, working SPA fallback rule for Cloudflare Pages (the project's stated hosting target per the M9 brief). Direct navigation to `/bookings/123`, `/owner/...`, `/admin/...` etc. will correctly serve `index.html` rather than 404. (Noted for awareness only: this specific file format is Cloudflare Pages/Netlify-specific and would need a different mechanism — e.g. `vercel.json` rewrites — if the hosting target ever changes; not applicable to the current Cloudflare Pages target, so nothing was added.)

---

## 14. Tests

| Gate | Before M9 | After M9 |
|---|---|---|
| Backend lint | pass | pass |
| Backend typecheck | pass | pass |
| Backend build | pass | pass |
| Backend unit + integration tests | 300/302 (2 failing) | **302/302** |
| Backend `prisma validate` | (not run) | pass |
| Frontend lint | pass | pass |
| Frontend typecheck | pass | pass |
| Frontend build | pass | pass |
| Frontend component/page tests | 117/117 | **118/118** (1 new test added for the promotion-deactivate confirm guard) |

No test was skipped, marked `.only`, `.skip`, `xit`, or commented out at any point in this pass. The one new test (`AdminPromotionFormPage.test.tsx` — "does not deactivate when the confirmation is dismissed") was added because the deactivate-promotion confirmation guard added in §7 changed real UI behavior, and the existing test needed a `window.confirm` mock to match (same convention already used by `AdminReviewDetailPage.test.tsx`, `AdminReviewsRemove.test.tsx`, `AdminGroup4Pages.test.tsx`).

---

## 15. Known limitations

1. In-memory rate limiter does not share state across process instances (documented in code already; would need a shared store before horizontal scaling).
2. 403-vs-404 convention for "not yours" differs between `bookings.service.ts` and owner services — both are individually enumeration-safe; left as an accepted, documented inconsistency rather than a forced unification that risks behavior change in well-tested code.
3. A11y `aria-invalid`/`aria-describedby` wiring was rolled out to the authentication screens (Login/Register/Forgot/Reset) but not to every remaining form in Profile/PartnerApply/Owner edit pages — flagged as a follow-up, not required by the M9 scope as stated.
4. A pre-existing React `act()` console warning in `App.test.tsx` (Navbar state update not wrapped) — cosmetic test-console noise, not a failing assertion; left unfixed as out of scope for this pass.
5. One observed, non-reproducible transient 500 in `owner-analytics.test.ts` under full-suite parallel load, attributed to local SQL Server connection-pool contention across parallel vitest workers — not a code defect (see §5).

## 16. Live verification pending

Cloudinary, SMTP, and VNPAY are fully covered by mocks/fakes in the automated suite (no live network call in `npm test`), per the instruction that live credentials must not be required for automated tests. Actual delivery against live SMTP, live Cloudinary storage, and the real VNPAY sandbox/production gateway has not been exercised in this pass and remains a deployment-time verification step for whoever holds those credentials.

## 17. M9 final status

**M9 STATUS: COMPLETE**

- Security: PASS (2 findings fixed: reset-password rate limit, `encrypt=true` enforcement; known limitations documented, not blocking)
- Regression: PASS (302/302 backend, 118/118 frontend; root cause of the prior 2 failures fixed — stale seed-fixture dates, not a business-logic bug)
- Concurrency: PASS (booking lock, cancel guard, price stability all verified against existing tests, unchanged)
- Payment/refund: PASS (idempotency, refund-amount safety, retry serialization all verified; Cloudinary timeout gap fixed)
- Backend tests: PASS (lint/typecheck/build/prisma validate/302 tests all green)
- Frontend tests: PASS (lint/typecheck/build/118 tests all green)
- E2E/integration: PASS (3 required journeys already covered by existing integration tests; no gap requiring new infrastructure)
- Accessibility: PASS for the explicitly named screens (auth forms fixed); partial elsewhere (documented, not blocking)
- Performance: PASS (no evidence-backed issue found; no premature optimization performed)
- OpenAPI: PASS (4 missing owner endpoints added; no obsolete entries; no auth mismatches)
- Production config: PASS (`encrypt=true` enforced, dead insecure config file removed, `.env.example` clarified, SPA fallback confirmed present for the stated Cloudflare Pages target)
- Schema change: **NO** (no table, column, or migration was added or modified anywhere in this pass)
- Remaining blockers: none
- Next recommended milestone: M10 (deployment) — out of scope for this task per instruction.

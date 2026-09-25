# M1 – IDENTITY Report

Covers DB-1 (seed), BE-1 (Auth/RBAC/Profile/Admin Accounts/Partner foundation), FE-1 (auth UI + admin UI + partner entry), and integration smoke, per the M1 task order (AUDIT → DB-1 → BE-1 auth → BE-1 account/RBAC/profile → OpenAPI → FE-1 → Admin UI → Partner entry → backend tests → frontend tests → integration smoke → report).

## 1. Audit repository trước M1

- `backend/src/modules/health/*` established the module pattern (routes/controller/service/repository/test) — followed exactly for `auth`, `profile`, `accounts`, `partners`.
- `backend/src/common/{errors/app-error.ts, utils/response.ts, types/api-response.ts}` — reused as-is (`AppError`, `sendSuccess`, `sendPaginated`).
- `backend/src/config/env.ts` already had `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` with Zod validation and dev defaults — reused, not changed.
- `backend/package.json` already had `bcrypt` and `jsonwebtoken` installed — reused. `cookie-parser` was missing and added (needed for the refresh-token httpOnly cookie strategy).
- `frontend/src/pages/{LoginPage,RegisterPage,AdminDashboardPage,OwnerDashboardPage}.tsx` existed as TECH‑0 placeholders (no real submit logic) — wired for real in M1.
- `frontend/src/services/apiClient.ts` was a bare `fetch` wrapper with no auth header/cookie handling — extended, not replaced.
- No `REFRESH_TOKEN`/`SESSION`/`CSKH` table existed and none was added (Gate 0 / G0-09 honored).
- `database/DATABASE_SOURCE_CHAPTER_6_7.md`, `data-dictionary.md`, `constraint-checklist.md`, `db0-report.md` were read; DB-1 works only with `VAI_TRO`, `TAI_KHOAN`, `HO_SO_DOI_TAC` as instructed.

## 2. Files đã tạo

Backend:
- `src/common/constants/{roles.ts,account-status.ts}`
- `src/common/utils/{password.ts,jwt.ts,password-reset-token.ts,account-mapper.ts}`
- `src/middleware/auth.middleware.ts`
- `src/modules/roles/roles.repository.ts`
- `src/modules/auth/{auth.schemas,auth.repository,auth.service,auth.controller,auth.routes,auth.test}.ts`
- `src/modules/profile/{profile.schemas,profile.repository,profile.service,profile.controller,profile.routes,profile.test}.ts`
- `src/modules/accounts/{accounts.schemas,accounts.repository,accounts.service,accounts.controller,accounts.routes,accounts.test}.ts`
- `src/modules/partners/{partners.schemas,partners.repository,partners.service,partners.controller,partners.routes,partners.test}.ts`
- `src/test/factories.ts` (test-only account factory, excluded from the production build)

Database:
- `database/seed/001_roles.sql`

Frontend:
- `src/types/auth.ts`
- `src/lib/{roles.ts,jwt.ts,authStore.ts}`
- `src/features/auth/{api,hooks,schemas,useAuthBootstrap}.ts`
- `src/features/partners/{api,hooks,schemas}.ts`
- `src/features/admin/accounts/{api,hooks}.ts`
- `src/components/auth/ProtectedRoute.tsx`
- `src/pages/{ForgotPasswordPage,ResetPasswordPage,ProfilePage,PartnerApplyPage,AdminAccountsPage,AdminAccountDetailPage}.tsx`
- `src/test/{testUtils,LoginPage.test,RegisterPage.test,ProtectedRoute.test}.tsx`

Docs:
- `docs/m1-report.md` (this file)

## 3. Files đã sửa

- `backend/src/app.ts` — added `cookie-parser` middleware.
- `backend/src/routes/index.ts` — mounted `/auth`, `/profile`, `/admin/accounts`, `/partners`.
- `backend/src/middleware/validate.middleware.ts` — **bug fix**, see §13.
- `backend/src/config/openapi.ts` — added all M1 endpoints + schemas.
- `backend/package.json` / `package-lock.json` — added `cookie-parser`, `@types/cookie-parser`.
- `backend/tsconfig.json` — excluded `src/test/**/*` from the production build (test-only factory).
- `frontend/src/services/apiClient.ts` — cookie credentials, Authorization header injection, single-flight 401-refresh-retry.
- `frontend/src/app/providers.tsx` — wired `useAuthBootstrap`.
- `frontend/src/components/common/Navbar.tsx` — auth-aware (login/register vs profile/logout/role dashboard link).
- `frontend/src/routes/AppRoutes.tsx` — added new routes + `ProtectedRoute` guards.
- `frontend/src/pages/{LoginPage,RegisterPage}.tsx` — real submit logic, validation, redirect, customer/partner toggle.
- `frontend/package.json` / `package-lock.json` — added `@hookform/resolvers`.
- `database/scripts/test-constraints.sql`, `database/docs/db0-report.md`, `database/README.md` — see §13 (encoding-bug addendum, unrelated to M1 business logic but found while seeding roles).

## 4. APIs đã triển khai

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | public | Always assigns role `Khách hàng`; client cannot choose a role |
| POST | `/api/auth/login` | public | `identifier` = email or `TenDangNhap` |
| POST | `/api/auth/refresh` | refresh cookie | Rotates access token |
| POST | `/api/auth/logout` | — | Clears the refresh cookie (stateless) |
| POST | `/api/auth/forgot-password` | public | DEV/FOUNDATION — generic response always, token logged server-side only in non-production |
| POST | `/api/auth/reset-password` | public (token) | Stateless, self-expiring token — see §6 |
| GET/PATCH | `/api/profile/me` | Bearer | Whitelisted fields only |
| GET/POST | `/api/admin/accounts` | Bearer + Admin | List (paginated/search/filter) / create |
| GET/PATCH/DELETE | `/api/admin/accounts/:id` | Bearer + Admin | Detail / update / delete-safe |
| POST | `/api/admin/accounts/:id/lock` `/unlock` | Bearer + Admin | |
| POST | `/api/partners/apply` | Bearer | UC03 foundation — creates `HO_SO_DOI_TAC`, role unchanged |
| GET | `/api/partners/me` | Bearer | Latest application status |

Full request/response contracts are in `backend/src/config/openapi.ts` (served at `/api/openapi.json`).

## 5. Auth strategy đã chọn

JWT access + refresh, per the task's own JWT preference. Payload is minimal: `{ sub: MaTaiKhoan, role: TenVaiTro, typ }` (the `typ` claim, `"access"` vs `"refresh"` vs `"pwd_reset"`, stops one token type being replayed as another — not in the original spec but a straightforward hardening with no schema cost). No user object, no password/hash ever touches a token.

## 6. Token/session strategy

- Access token: 15 min, returned in the JSON body, sent as `Authorization: Bearer`, held in memory only (Zustand `authStore`, never `localStorage`).
- Refresh token: 7 days, `httpOnly` + `SameSite=Lax` cookie scoped to `/api/auth`, `Secure` in production. Frontend never reads it.
- **No `REFRESH_TOKEN`/`SESSION` table** (Gate 0 forbids inventing one). Refresh tokens are pure stateless JWTs — logout only clears the cookie; a still-valid refresh JWT copied out of the cookie before logout would remain cryptographically valid until natural expiry. This is a deliberate, documented tradeoff of the "no new table" constraint, not an oversight (§18).
- On app load, `useAuthBootstrap` makes one silent `POST /auth/refresh` call so a page reload doesn't force re-login if the cookie is still valid.
- Password-reset tokens use the same "no new table" constraint: the token embeds a fingerprint of the account's *current* password hash (`sha256(hash).slice(0,32)`), so it self-invalidates the moment the password changes — no persistence needed, effectively single-use (`backend/src/common/utils/password-reset-token.ts`).

## 7. Password hashing strategy

`bcrypt`, 12 salt rounds, via `hashPassword()`/`verifyPassword()` in `common/utils/password.ts`. Used exclusively from `AuthService`/`AccountsService` — no controller ever touches bcrypt directly. Verified by test: `MatKhau` in the DB starts with `$2` and is never equal to the plaintext (`auth.test.ts`). `MatKhau` is stripped from every API response by `toSafeAccount()` (`common/utils/account-mapper.ts`), applied in all three modules that return an account.

## 8. RBAC structure

`backend/src/middleware/auth.middleware.ts`: `authenticate` (verifies the Bearer access token, sets `req.user`), `requireRole(...roles)`, and `requireAdmin` (= `requireRole(ROLE_NAMES.ADMIN)`). Applied once per router (`accountsRoutes.use(authenticate, requireAdmin)`), never as scattered `if (role === ...)` checks in controllers. Frontend `ProtectedRoute` mirrors this for UX only — the backend re-checks on every request (verified by `accounts.test.ts` RBAC tests: customer → 403, admin → 200, no token → 401).

## 9. DB seed đã thêm

`database/seed/001_roles.sql` — idempotent `MERGE` seeding exactly 3 roles into `VAI_TRO`: `Khách hàng`, `Chủ khách sạn`, `Quản trị hệ thống`. No Guest row (anonymous isn't a DB account), no CSKH/Employee/HotelStaff/Moderator role (G0-09). Verified idempotent by running it twice against the test database (second run: 0 rows affected, count stays 3).

## 10. Frontend pages đã hoàn thiện

Login, Register (with the required Customer/Partner toggle — same account fields either way, "Partner" just changes the post-register redirect to the application form), Forgot Password, Reset Password, Profile (view + whitelisted update), Partner Apply (submit/status), Admin Accounts (list/search/filter/paginate), Admin Account Detail (view/edit/lock/unlock/delete-safe). All have loading/error/empty/success/disabled/validation states; Navbar is auth- and role-aware.

## 11. Partner foundation đã làm tới đâu

- Registration UI lets the user choose Customer vs Partner up front (required by the task).
- `POST /api/partners/apply` creates a real `HO_SO_DOI_TAC` row (`TrangThaiDuyet = 'Chờ duyệt'`) for the authenticated account — genuinely persisted, not a stub.
- Role is **not** auto-upgraded to `Chủ khách sạn` on submission — approval workflow is explicitly out of scope for M1 (§16 of the task).
- `TepGiayTo` is a URL/reference string in this phase, not a real file upload — documented as a known limitation (§18), avoids pulling multer/Cloudinary security work into M1.
- No approve/reject endpoint, no hotel creation — not implemented, per scope.

## 12. Tests đã thêm

Backend (36 tests, all against the real `HotelBooking_DB0_Test` SQL Server database via Prisma, not mocked):
- `auth.test.ts` (15): register (valid, hash-not-plaintext, dup username, dup email, invalid input), login (valid, username-as-identifier, wrong password, unknown account, locked account), route protection (no token, invalid token, valid token), logout, forgot-password (no enumeration).
- `profile.test.ts` (4): own profile GET, whitelisted PATCH, mass-assignment guard (role/status/NgayTao ignored), unauthenticated PATCH rejected.
- `accounts.test.ts` (9): RBAC (customer 403 / admin 200 / no-token 401), list pagination, search, update, lock + locked-account-cannot-login, delete-safe hard-delete vs lock-with-history (G0-10).
- `partners.test.ts` (5): unauthenticated rejected, submit application, duplicate-pending rejected, get own status, null when none submitted.
- `health.test.ts` (3, pre-existing, unchanged).

Frontend (15 tests):
- `LoginPage.test.tsx` (5): empty-form validation, API error rendering, loading state, customer redirect, admin redirect.
- `RegisterPage.test.tsx` (3): empty-form validation, password-mismatch validation, partner-intent redirect.
- `ProtectedRoute.test.tsx` (5): bootstrapping spinner, unauthenticated redirect, authenticated pass-through, role-mismatch redirect, role-match pass-through.
- `App.test.tsx` (2, pre-existing, unchanged).

## 13. Kết quả: lint/typecheck/build/test (backend & frontend), Prisma validate/generate

All green — **and this work surfaced three real, pre-existing/newly-introduced bugs that were found and fixed, not just "tests passed":**

1. **Express 5 `req.query` getter bug** (`backend/src/middleware/validate.middleware.ts`): the pre-existing `validateRequest` middleware did `req.query = await schema.parseAsync(...)`, which throws in Express 5 because `req.query` is a getter-only accessor. Never triggered before M1 because no prior route validated query params. Fixed with `Object.defineProperty` to replace the accessor on the request instance. Caught by `accounts.test.ts`'s list/search tests.
2. **SQL Server input-codepage encoding defect carried over from DB-0** (not new to M1, but found while seeding roles): `sqlcmd -i file.sql` without `-f 65001` silently compiles Vietnamese `N'...'` CHECK-constraint literals as mojibake. Root-caused, fixed by rebuilding the test database with the correct flag, and hardened with a new positive test (`test-constraints.sql` TEST 9b) plus a documented requirement in `database/README.md`. Full addendum in `database/docs/db0-report.md`.
3. **Frontend JWT payload UTF‑8 decoding bug** (`frontend/src/lib/jwt.ts`): the first version did `JSON.parse(atob(payload))`, which mojibakes the `role` claim because the backend puts Vietnamese role names (`"Quản trị hệ thống"`) in it. Would have broken admin/partner role-based redirect and any role display in a real browser. Found while writing `LoginPage.test.tsx`'s admin-redirect test, fixed with a proper UTF‑8 re-decode step.

Final results:
- Backend: `tsc --noEmit` ✅, `eslint .` ✅ (0 errors/warnings), `npm run build` ✅, `vitest run` ✅ 36/36, `prisma validate` ✅, `prisma generate` ✅.
- Frontend: `tsc --noEmit` ✅, `eslint .` ✅ (0 errors/warnings), `npm run build` ✅ (`tsc -b && vite build`), `vitest run` ✅ 15/15.

## 14. Integration journeys đã chạy thực tế

Ran against a **live** `tsx src/server.ts` process bound to a real TCP port (not supertest's in-process injection), real SQL Server, real bcrypt, real JWT, real httpOnly cookies — via `curl`:

**Customer journey:** register → `GET /profile/me` → `PATCH /profile/me` → `POST /auth/refresh` (cookie jar) → `POST /auth/logout`. All succeeded with correct data at each step (verified update reflected, refresh issued a new access token, logout cleared the cookie).

**Admin journey:** create a real admin row → login → `GET /admin/accounts` (list) → `GET /admin/accounts?search=...` (found the exact customer account) → `POST /admin/accounts/:id/lock` → re-login with that account's real password → **403 "Tài khoản đã bị khóa"**. Also verified a fresh customer token hitting `/admin/accounts` → **403 forbidden**.

All smoke-test accounts and the temporary admin-creation script were deleted after the run; the dev server process was terminated.

The React leg was exercised via RTL component tests against the real page components/hooks/routing (not a live browser), per §31's explicit allowance ("Không cần Playwright full E2E nếu runner chưa được cấu hình"); no Playwright/browser-automation tool was available in this environment.

## 15. Security checks

- Password hashing: bcrypt/12, verified never-plaintext (test).
- JWT: short-lived access token, `typ` claim prevents cross-use between access/refresh/reset tokens, secrets stay backend-only (`.env`, Zod-validated).
- RBAC: centralized middleware, verified customer→403/admin→200 (test).
- IDOR: `/profile/me` always operates on `req.user.maTaiKhoan` from the verified token, never a client-supplied id; admin account routes require `requireAdmin` first.
- Mass assignment: `updateProfileSchema` is a strict whitelist (Zod strips unknown keys) — verified a client sending `MaVaiTro`/`TrangThai`/`NgayTao` in a profile PATCH has them silently ignored (test).
- Sensitive response: `MatKhau` stripped from every account response (verified).
- Sensitive logging: no password/token is logged; the only server-side log is the DEV-only password-reset token, explicitly gated on `NODE_ENV !== 'production'` and documented as a foundation stopgap for the missing email provider.
- Rate limiting: **not implemented** — no rate-limit middleware existed before M1 and none was added; flagged as a known limitation (§18), not silently skipped.

## 16. Database schema có thay đổi không

**NO.** Zero `CREATE`/`ALTER TABLE` in M1. The only DB write was the idempotent `database/seed/001_roles.sql` seeding rows into the pre-existing `VAI_TRO` table from DB-0. No new table, column, FK, or constraint.

## 17. M1 Design Issues

None new. **Update (post-M1 DDI cleanup):** the two DB-0 Design Issues carried over from the original M1 report (DDI-01 nullability, DDI-02 `QUY_PHONG_GIA` unique) have since been **RESOLVED** per your explicit decision, applied directly to baseline migrations 001–006 (no migration 007). Full details in §21 below and `database/docs/db0-report.md` Addendum 2.

## 18. Known limitations

- No email provider — `forgot-password` logs the reset token server-side in dev only; a real provider integration is deferred.
- `TepGiayTo` (partner document) is a URL/text field, not a real file upload.
- No partner-approval workflow — applications sit at `Chờ duyệt` with no admin action to approve/reject yet (explicitly out of scope).
- No server-side refresh-token revocation — logout is cookie-clear only; a copied-out refresh token remains valid until its 7-day expiry (documented tradeoff of "no new table").
- No rate limiting on `/auth/*`.
- Admin "create account" endpoint exists (per the task's conditional allowance) but sends no welcome email/notification.
- Frontend decodes the JWT role claim only for UX routing/display — this is by design (backend is the authority), not a limitation, but worth restating since it's a slightly unusual pattern.

## 19. M1 Exit Gate

**PASS** — every checklist item verified with a real, running system (not just "code exists"):

- [x] Customer register hoạt động thật (curl smoke + 15 auth tests)
- [x] Password lưu dạng hash (verified in DB row)
- [x] Login hoạt động (curl smoke + tests)
- [x] Locked account không login được (curl smoke: 403 + test)
- [x] Auth middleware hoạt động (401 on missing/invalid token, tested)
- [x] RBAC hoạt động (403 customer→admin route, tested + curl smoke)
- [x] GET/PATCH profile hoạt động (tests + curl smoke)
- [x] Admin account management critical APIs hoạt động (list/search/update/lock/safe-delete, all tested)
- [x] Customer không truy cập Admin APIs (tested + curl smoke)
- [x] React login/register/profile tích hợp backend thật (real fetch calls, mocked only at the component-test layer; full-stack proven via curl)
- [x] Registration UI có lựa chọn Customer/Partner
- [x] OpenAPI cập nhật (`backend/src/config/openapi.ts`)
- [x] Backend lint/typecheck/build/test PASS
- [x] Frontend lint/typecheck/build/test PASS
- [x] Integration smoke PASS (real HTTP, real DB, both journeys)
- [x] Không có schema change ngoài Change Gate (none needed)

## 20. Có đủ điều kiện chuyển sang M2 hay chưa

**Đủ điều kiện, không còn DDI treo.** DDI-01/DDI-02 đã RESOLVED (§21). Chỉ còn các known limitations M1-specific ở §18 (đặc biệt thiếu email provider và file-upload cho hồ sơ đối tác) cần cân nhắc trước khi M2 build tiếp trên đó.

---

## 21. DDI cleanup (post-M1 follow-up task)

Separate follow-up task, run after M1 shipped: the user finalized decisions for DDI-01 and DDI-02 (carried over from DB-0) and asked for the baseline itself to be corrected — **not** a new migration 007, but direct edits to migrations 001–006, followed by a full fresh-database rebuild and M1 regression.

### 21.1 Migration nào đã sửa

- `database/migrations/001_core_identity.sql` — `TAI_KHOAN`: `NgaySinh`, `GioiTinh`, `AnhDaiDien` → `NULL` (`SoDienThoai` unchanged, stays `NOT NULL`).
- `database/migrations/002_hotel_catalog.sql` — `KHACH_SAN.MoTa` → `NULL`; `TIEN_NGHI.BieuTuong` → `NULL`.
- `database/migrations/003_room_inventory.sql` — `LOAI_PHONG.MoTa` → `NULL`; added `CONSTRAINT UQ_QUY_PHONG_GIA_MaLoaiPhong_NgayApDung UNIQUE (MaLoaiPhong, NgayApDung)` to `QUY_PHONG_GIA` (DDI-02).
- `database/migrations/006_payment_after_sales.sql` — `DANH_GIA.NoiDung` → `NULL`.
- No `007_*.sql` created. No other migration touched.

### 21.2 Column nào đổi NULL/NOT NULL (DDI-01)

`TAI_KHOAN.NgaySinh`, `TAI_KHOAN.GioiTinh`, `TAI_KHOAN.AnhDaiDien`, `KHACH_SAN.MoTa`, `LOAI_PHONG.MoTa`, `TIEN_NGHI.BieuTuong`, `DANH_GIA.NoiDung` — all → `NULL`. `TAI_KHOAN.SoDienThoai` stays `NOT NULL` (unchanged, verified by a dedicated rejection test).

### 21.3 UNIQUE constraint được thêm (DDI-02)

`UQ_QUY_PHONG_GIA_MaLoaiPhong_NgayApDung UNIQUE (MaLoaiPhong, NgayApDung)` on `QUY_PHONG_GIA`. `MaQuyPhong` primary key unchanged.

### 21.4 verify-schema.sql result

**PASS** — 14/14 checks, including 2 new: Check 12 (DDI-01 nullability, reads `sys.columns.is_nullable` for all 8 columns incl. `SoDienThoai`) and Check 13 (DDI-02, reads the actual unique-index key columns on `QUY_PHONG_GIA`, not just the constraint name).

### 21.5 constraint tests result

**PASS** — 19/19 in `test-constraints.sql` (10 original + TEST 9b + 8 new): TEST 10–13 cover DDI-02 (first insert succeeds, exact duplicate `(MaLoaiPhong, NgayApDung)` rejected, same room/different date succeeds, different room/same date succeeds); TEST 14–19 cover DDI-01 (NULL accepted for all 7 resolved-nullable columns; `SoDienThoai = NULL` still rejected). Ran in a transaction, rolled back — DB confirmed empty after.

### 21.6 Fresh migration 001→006 result

**PASS.** `HotelBooking_DB0_Test` dropped and recreated, all 6 migrations re-run in order with `sqlcmd ... -f 65001` from empty — no errors, no manual steps, no `NOCHECK`.

### 21.7 Prisma db pull/generate/validate result

All **PASS**. `db pull` re-introspected — confirmed `TAI_KHOAN.NgaySinh/GioiTinh/AnhDaiDien: DateTime?/String?/String?`, `KHACH_SAN.MoTa: String?`, `LOAI_PHONG.MoTa: String?`, `TIEN_NGHI.BieuTuong: String?`, `DANH_GIA.NoiDung: String?`, `SoDienThoai: String` (still required), and `QUY_PHONG_GIA` gained `@@unique([MaLoaiPhong, NgayApDung], map: "UQ_QUY_PHONG_GIA_MaLoaiPhong_NgayApDung")`. No Prisma schema hand-edits.

### 21.8 Số Prisma models

**22** — unchanged, no 23rd model/table.

### 21.9 Backend regression result

**PASS** — lint (0 errors/warnings), `tsc --noEmit`, `npm run build`, `vitest run` **40/40** (36 original + 4 new: register-without-optional-fields, register-still-requires-SoDienThoai, GET /me with all-null fields, PATCH /me filling them in later).

Required real code changes beyond the DB, because the old code assumed these fields were always present: `auth.schemas.ts`/`accounts.schemas.ts` (`NgaySinh`/`GioiTinh` → optional), `auth.service.ts`/`accounts.service.ts` (`AnhDaiDien` default `null` not `''`), `account-mapper.ts` (`SafeAccount` fields → `T | null`), `config/openapi.ts` (`RegisterRequest.required` no longer lists `NgaySinh`/`GioiTinh`; `Account`/`RegisterRequest` schemas marked `nullable: true`).

### 21.10 Frontend regression result

**PASS** — lint, `tsc --noEmit`, `npm run build` (`tsc -b && vite build`), `vitest run` **16/16** (15 original + 1 new: submits successfully without Ngày sinh/Giới tính).

Required real code changes: `types/auth.ts` (`Account.NgaySinh/GioiTinh/AnhDaiDien: T | null`, `RegisterPayload` fields optional), `features/auth/schemas.ts` (dropped a `z.preprocess`-based approach after it broke `tsc -b` — see below — in favor of a plain literal-union `.optional()` schema), `RegisterPage.tsx`/`ProfilePage.tsx`/`AdminAccountDetailPage.tsx` (null-safe `reset()`/submit, empty-string-to-undefined conversion, "(tùy chọn)" labels, empty `<option>` added to gender selects).

**Bug found and fixed along the way:** the first version of the updated Zod schemas used `z.preprocess(emptyToUndefined, ...)` to turn an untouched `<input>`/`<select>`'s `''` into `undefined`. This passed `tsc --noEmit` but failed `tsc -b` (the actual build script) with a resolver type-mismatch — the same class of `--noEmit`-vs-build-mode discrepancy already seen once in the original M1 work. Replaced with a plain literal-union schema (`z.enum([...GENDER_OPTIONS, ''])`) plus explicit `'' → undefined` conversion in each page's submit handler — no function-based type inference, and `npm run build` now passes.

### 21.11 M1 auth smoke/regression result

**PASS**, run against a live `tsx src/server.ts` process (not supertest) over real HTTP: register with `NgaySinh`/`GioiTinh` omitted → account created with those fields `null` → `GET /me` confirms `null` → `PATCH /me` fills in `NgaySinh`/`GioiTinh` (`Nữ`, with diacritics, verified round-tripped correctly) → `POST /auth/refresh` issues a new access token → `POST /auth/logout` clears the cookie. Smoke account deleted, dev server stopped afterward.

### 21.12 DDI-01 status

**RESOLVED.** Decision and full column list in `database/docs/db0-report.md` Addendum 2 and `database/docs/data-dictionary.md` §"Quy ước áp dụng".

### 21.13 DDI-02 status

**RESOLVED.** Decision, migration, and verification in `database/docs/db0-report.md` Addendum 2 and `database/docs/constraint-checklist.md`.

### 21.14 Có tạo migration 007 không

**NO.** All changes applied directly to migrations 001, 002, 003, 006.

### 21.15 Có thay đổi schema nào ngoài hai DDI không

**NO.** No table added/removed/renamed, no column added/renamed beyond the 7 nullability flips, no new FK, no new actor, no refresh-token/password-reset table. Exactly 22 tables, confirmed by `verify-schema.sql` Check 1 and Prisma's 22-model introspection.

### 21.16 Final result

**PASS.**

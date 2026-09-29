# Egode Travel Search Bar: audit and migration plan

## CURRENT

- Routes `/` and `/home` render `HomePage`, which uses `components/hotels/SearchForm.tsx`. Submitting navigates to `/hotels` with `location`, `checkIn`, `checkOut`, and `guests` query params. The featured hotels query is separate and uses fixed page defaults.
- Routes `/hotels` and `/search-results` render `HotelListPage`. `parseParams()` reads the committed query params; `useSearchHotels(params)` is keyed by those params. `updateParams()` retains unrelated filters/sort, resets `page` by default, and `setSearchParams()` enables browser history. Search criteria currently render as summary buttons and a “Sửa tìm kiếm” action. That action swaps the persistent summary for a full `SearchForm`; submit commits all four criteria and closes the editor.
- Routes `/hotels/:id` and `/hotel-detail/:id` render `HotelDetailPage`. `useHotelRooms()` receives date/guest values from the URL. A separate React Hook Form uses `dateGuestSchema`; submit clears selected rooms and quote/booking mutation state, then replaces search params with `checkIn`, `checkOut`, `guests`. Hotel detail does not edit destination because the hotel is fixed.
- `SearchForm` uses `searchFormSchema`: optional trimmed location, required dates, `checkOut > checkIn`, integer guests 1–50. Check-in is constrained to today or later; check-out minimum follows check-in. Locations load through cached `useLocations()`; selecting a suggestion is client-side, not a hotel search request. The existing `Combobox` supports arrow keys, Enter and Escape. `GuestPicker` supports 1–50 and Escape/outside close.
- No date-range picker exists. Home/results use two native date inputs; detail uses two native date inputs without the Home/results minimum-date constraint, while retaining `checkOut > checkIn` validation.
- Related tests are in `components/common/interaction.test.tsx` for Combobox and GuestPicker. Route declarations are in `routes/AppRoutes.tsx`. Mobile styling is in `assets/css/components.css`; the results summary currently stacks on narrow viewports.

## TARGET

- Add one reusable `TravelSearchBar` with `currentSearch`, local `draftSearch`, and one `activeEditor` (`destination | dates | guests | null`). All locations keep criteria visible and directly editable; Search/Check availability remains the explicit commit action.
- Home uses expanded presentation; hotel results use a persistent compact presentation; hotel detail uses the same stay-context presentation with destination omitted. Opening an editor never changes API-driving current state. Commit uses the existing navigation/query handlers, retaining URL keys, filters, sorting, pagination-reset behavior, and room-selection reset behavior.
- Keep location lookup, custom destination values, date constraints and guest bounds. Date editing remains native date controls grouped in one anchored editor, avoiding a new date dependency and retaining native keyboard/mobile date support.
- At small widths, an active editor becomes a full-screen sheet with a backdrop and close action. Escape/outside close; focus returns to the segment trigger. Only one editor may be active.

## FILES

- Add `components/hotels/TravelSearchBar.tsx` as the shared presentation and draft interaction owner.
- Refactor `components/hotels/SearchForm.tsx` into a compatibility wrapper or remove it after all call sites migrate.
- Update `pages/HotelListPage.tsx`, `pages/HomePage.tsx`, and `pages/HotelDetailPage.tsx` to pass committed context and existing commit handlers.
- Update `components/common/GuestPicker.tsx` only as needed for controlled visibility and trigger focus coordination.
- Add scoped search-bar styles in `assets/css/components.css` and interaction coverage alongside existing shared component tests.

## RISKS / QUALITY GATES

- Keep draft edits from changing URL or triggering hotel/room API queries before explicit submit.
- Sync drafts when browser back/forward changes URL criteria.
- Preserve optional/empty destination, date validation differences by page, guest range 1–50, filter/sort preservation, page reset, and Hotel Detail selection/mutation reset.
- Validate keyboard combobox behavior, Escape/outside close and focus return, responsive sheet, invalid dates, and explicit submission. Run the repository's existing typecheck, lint, tests, and build scripts; report browser QA limits if no browser harness is available.

## IMPLEMENTED / QA

- Migrated Home, Search Results, and Hotel Detail to `TravelSearchBar`; removed the old full-form `SearchForm` and results edit/close mode.
- The bar owns `draftSearch` and one `activeEditor`; its `currentSearch` follows URL-backed criteria. Destination edits remain local; date/guest API queries happen only after the existing page submit handlers run.
- Search Results continues through `updateParams()`, preserving other query params and resetting page. Hotel Detail retains its selection and mutation resets before replacing its three query params.
- Added focused component tests for destination selection and custom text, invalid dates, guest commit and max, stay variant, and draft-before-commit behavior.
- Final checks: typecheck, lint, 14 Vitest tests, and production build pass. Headless desktop screenshots were checked for Home and Search Results; mobile Search Results rendered at 390px with document width 390px. Hotel Detail's real route did not reach its search bar because its hotel lookup returned “Không tìm thấy khách sạn” in this environment, so its shared `stay` presentation is covered by component tests. Backend-backed browser flows could not be verified here.

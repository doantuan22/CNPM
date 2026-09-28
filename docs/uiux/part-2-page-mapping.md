# Egode Phase 2 — Page Mapping

This is the current component-to-pattern map and migration disposition. A disposition is about composition, not deleting the route or business use case.

| Page/component | Existing route(s) | Actor | Primary job | Pattern | Disposition |
| --- | --- | --- | --- | --- | --- |
| HomePage | `/`, `/home` | Public | Start a hotel search | P01 | REFINE |
| HotelListPage | `/hotels`, `/search-results` | Public | Compare and refine hotels | P02 | RECOMPOSE responsive filter/result hierarchy |
| HotelDetailPage | `/hotels/:id`, `/hotel-detail/:id` | Public/customer | Evaluate hotel and select room quantities | P03 + P04 | RECOMPOSE, preserve quote/create handlers |
| LoginPage | `/login` | Any | Authenticate | P07 | REFINE |
| RegisterPage | `/register` | Public | Create customer account / partner intent | P07 | REFINE, retain intent steps |
| ForgotPasswordPage | `/forgot-password` | Public | Request reset | P07 | KEEP/REFINE |
| ResetPasswordPage | `/reset-password` | Public | Set new password or recover invalid link | P07 + P11 | KEEP/REFINE |
| PartnerApplyPage | `/partner/apply`, `/register-partner` | Applicant | Submit partner application | P07 | REFINE |
| ProfilePage | `/profile`, `/account-profile` | Authenticated | Manage personal account | P07 | REFINE; share compact customer wayfinding |
| BookingsPage | `/bookings`, `/my-bookings` | Customer | Find a booking and next action | P05 | REFINE as travel list |
| BookingDetailPage | `/bookings/:id`, `/booking-detail/:id` | Customer | Review and manage a booking | P06 + P04 | RECOMPOSE transaction hierarchy; preserve state-gated actions |
| BookingRoomPage | `/booking/:id/room` | Customer | Read existing booking room summary | P04 | TRANSITIONAL/KEEP |
| BookingConfirmPage | `/booking/:id/confirm` | Customer | Review existing booking identity/date/status | P04 | TRANSITIONAL/REFINE |
| PaymentPage | `/booking/:id/payment`, `/payment/:id` | Customer | Start VNPAY payment for an existing booking | P04 | TRANSITIONAL/REFINE |
| PaymentResultPage | `/payment/result`, `/payment-result` | Customer | Read payment outcome and continue | P10 | REFINE; preserve callback path/params |
| WriteReviewPage | `/write-review/:id` | Customer | Submit eligible review | P07 | KEEP/REFINE |
| SupportPage | `/support`, `/support-request` | Customer | Submit issue and find prior tickets | P05 + P07 | REFINE |
| SupportDetailPage | `/support/:id` | Customer | Read/respond to support ticket | P06 | REFINE |
| OwnerDashboardPage | `/owner`, `/partner/dashboard`, `/partner/hotels` | Owner | Overview or scan owned hotels | P08 + P05 | REFINE distinct URL intent and current active nav |
| OwnerHotelFormPage | `/owner/hotels/new`, `/partner/hotels/new`, `/partner/hotel-form` | Owner | Register a hotel | P07 | REFINE semantic field groups |
| OwnerHotelManagePage | `/owner/hotels/:id`, `/partner/hotels/:id` | Owner | Maintain hotel and its room types | P06 + P07 | RECOMPOSE entity context and section order |
| OwnerRoomTypeManagePage | `/owner/room-types/:id`, `/partner/hotels/:id/room-types` | Owner | Edit room, images, amenities and rates | P06 + P07 | RECOMPOSE cautiously; preserve applied-date data model |
| OwnerBookingsPage | `/owner/hotels/:id/bookings`, `/partner/hotels/:id/bookings` | Owner | Scan and open guest bookings | P05 | REFINE mobile alternative, preserve filters/pagination |
| OwnerBookingDetailPage | `/owner/hotels/:id/bookings/:bookingId` | Owner | Inspect booking in hotel context | P06 | REFINE hotel/booking identity |
| OwnerAnalyticsPage | `/owner/hotels/:id/analytics` | Owner | Inspect actual hotel metrics | P09 | REFINE question-to-metric order |
| PartnerInventoryPage | `/partner/inventory-pricing`, `/partner/room-types`, `/partner/room-type-form` | Owner | Choose property for operational task | P05 | REFINE entity selector; keep route outputs |
| PartnerBookingsPage | `/partner/bookings` | Owner | Choose property for booking queue | P05 | REFINE selector into clear task list |
| PartnerRevenuePage | `/partner/revenue` | Owner | Choose property for revenue | P05 → P09 | REFINE selector and label |
| PartnerReportsPage | `/partner/reports` | Owner | Choose property for report | P05 → P09 | REFINE selector and label |
| AdminDashboardPage | `/admin`, `/admin/operations` | Admin | Reach platform work areas | P08 | REFINE shortcuts; no invented work queues |
| AdminAccountsPage | `/admin/accounts` | Admin | Search/manage user accounts | P05 | REFINE shared list grammar |
| AdminCreateAccountPage | `/admin/accounts/new` | Admin | Create permitted account | P07 | REFINE readable field groups |
| AdminAccountDetailPage | `/admin/accounts/:id` | Admin | Inspect/update account | P06 | REFINE entity identity/actions |
| AdminPartnerApplicationsPage | `/admin/partner-applications`, `/admin/onboarding` | Admin | Triage partner application queue | P05 | REFINE queue |
| AdminPartnerApplicationDetailPage | `/admin/partner-applications/:id` | Admin | Verify evidence and decide | P06 | RECOMPOSE decision layout |
| AdminHotelsPage | `/admin/hotels` | Admin | Search/moderate hotels | P05 | REFINE shared list grammar |
| AdminHotelDetailPage | `/admin/hotels/:id` | Admin | Inspect/update hotel moderation state | P06 | REFINE evidence/action context |
| AdminPaymentsPage | `/admin/payments` | Admin | Search/reconcile transactions | P05 | REFINE financial columns |
| AdminPaymentDetailPage | `/admin/payments/:id` | Admin | Reconcile one payment/refund | P06 | RECOMPOSE financial hierarchy |
| AdminReviewsPage | `/admin/reviews` | Admin | Triage/moderate reviews | P05 | REFINE shared list grammar |
| AdminReviewDetailPage | `/admin/reviews/:id` | Admin | Inspect/moderate one review | P06 | REFINE content/action proximity |
| AdminSupportPage | `/admin/support` | Admin | Triage support tickets | P05 | REFINE queue |
| AdminSupportDetailPage | `/admin/support/:id` | Admin | Resolve one issue | P06 | RECOMPOSE issue/context/history/action |
| AdminPromotionsPage | `/admin/promotions` | Admin | Search/manage promotions | P05 | REFINE shared list grammar |
| AdminPromotionFormPage | `/admin/promotions/new`, `/admin/promotions/:id` | Admin | Create/edit promotion | P07 | REFINE form sections |
| AdminAnalyticsPage | `/admin/analytics` | Admin | Read platform reports | P09 | REFINE metric hierarchy |
| NotFoundPage | `*` | Any | Recover from unknown route | P11 | KEEP |

## Migration order

1. Public booking decision path and URL context (P01–P04).
2. Customer booking center (P05/P06/P10) and wayfinding.
3. Owner property context, dated inventory entry and booking operations (P05–P09).
4. Admin list/detail/form grammar, starting with partner application, payment and support decisions.
5. Remaining auth/forms/report screens and broad responsive verification.

The first Part 2 code pass should touch a domain end-to-end and then check build/typecheck/lint. A page listed as `REFINE` is not considered migrated until its handlers, query states and mobile form of composition have been inspected.

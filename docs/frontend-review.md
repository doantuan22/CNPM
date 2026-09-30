# Báo cáo rà soát Frontend (cấu trúc, bố cục, luồng) và đề xuất chỉnh sửa

- Phạm vi: thư mục `frontend/` (React 19, React Router 7, TanStack Query 5, Zustand 5, Tailwind 4, Vite 8).
- Ngày rà soát: 2026-09-30.
- Phương pháp: chỉ **đọc code**, chưa chạy ứng dụng. Các lỗi luồng được suy ra từ code và cần chạy thử để xác nhận trước khi sửa. Các điểm chưa chắc được đánh dấu **[cần xác nhận]**.
- Nguyên tắc cho phần đề xuất: chỉ dùng API/kỹ thuật có trong tài liệu chính thức của thư viện đang dùng (React, React Router, TanStack Query, HTML/WAI-ARIA, CSS, Tailwind). Chỗ nào phụ thuộc thay đổi ở backend thì ghi rõ, không giả định backend đã có.

Mức ưu tiên: **P0** = sai chức năng / rủi ro dữ liệu, **P1** = ảnh hưởng rõ tới trải nghiệm hoặc bảo trì, **P2** = cải thiện, dọn dẹp.

---

## Mục lục

1. [Luồng đang sai](#1-luồng-đang-sai)
2. [Cấu trúc code bất hợp lý](#2-cấu-trúc-code-bất-hợp-lý)
3. [Bố cục và giao diện chưa ổn](#3-bố-cục-và-giao-diện-chưa-ổn)
4. [UI giả (có nút nhưng không có chức năng)](#4-ui-giả-có-nút-nhưng-không-có-chức-năng)
5. [Hệ thống style và thư viện](#5-hệ-thống-style-và-thư-viện)
6. [Các điểm nhỏ khác](#6-các-điểm-nhỏ-khác)
7. [Lộ trình đề xuất](#7-lộ-trình-đề-xuất)

---

## 1. Luồng đang sai

### 1.1. Cache không được làm mới sau khi đặt phòng và thanh toán — P0

**Hiện trạng**

- [queryClient.ts](../frontend/src/lib/queryClient.ts) đặt `staleTime` mặc định 5 phút.
- `useCreateBooking` ([bookings/hooks.ts](../frontend/src/features/bookings/hooks.ts)) không có `onSuccess`, nên không invalidate `['bookings']`. Đơn mới tạo có thể không xuất hiện trong "Đặt phòng của tôi" nếu danh sách đã được tải trước đó.
- Sau khi thanh toán VNPAY, backend redirect về `/payment/result` ([payments.controller.ts:39](../backend/src/modules/payments/payments.controller.ts#L39)). Trang [PaymentResultPage.tsx](../frontend/src/pages/PaymentResultPage.tsx) chỉ đọc khóa `['payment-status', id]` và không invalidate `['bookings', id]`. Bấm "Xem đơn đặt phòng" có thể vẫn thấy dữ liệu cũ (còn "Chờ thanh toán" và nút "Thanh toán ngay") **[cần xác nhận]**.
- `usePaymentStatus` ([payments/hooks.ts](../frontend/src/features/payments/hooks.ts)) có tham số `refetchInterval` nhưng trang kết quả không truyền. Ở nhánh "Đang xử lý kết quả…" trang không tự cập nhật, người dùng phải F5.

**Đề xuất (kỹ thuật chuẩn của TanStack Query v5)**

1. Invalidate theo tiền tố khóa. `invalidateQueries({ queryKey: ['bookings'] })` khớp theo tiền tố nên cũng làm mới `['bookings', id]`.

```ts
export function useCreateBooking(hotelId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingRequest) => createBooking(hotelId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
```

2. Ở trang kết quả, polling có điều kiện bằng dạng hàm của `refetchInterval` (v5 nhận `query`), dừng khi đã có kết quả cuối cùng:

```ts
useQuery({
  queryKey: ['payment-status', bookingId],
  queryFn: () => getPaymentStatus(bookingId),
  refetchInterval: (query) => {
    const d = query.state.data;
    const settled = d?.TrangThaiDatPhong === 'Đã xác nhận' || d?.ThanhToan[0]?.TrangThai === 'Thất bại';
    return settled ? false : 3000;
  },
});
```

   Nên giới hạn tổng thời gian polling (ví dụ 60 giây) rồi hiện thông báo "kiểm tra lại trong đơn đặt phòng".
3. Khi trạng thái chuyển sang cuối cùng, gọi `invalidateQueries({ queryKey: ['bookings'] })` (có thể trong `useEffect` theo `isConfirmed`/`isFailed`).
4. Có thể thêm `refetchOnMount: 'always'` cho `useBookingDetail` để trang chi tiết luôn lấy dữ liệu mới khi mở, thay vì tin vào cache 5 phút.

### 1.2. Đăng xuất / hết phiên không xóa cache dữ liệu người dùng — P0

**Hiện trạng**

- `useLogout` ([auth/hooks.ts:55-59](../frontend/src/features/auth/hooks.ts#L55)) chỉ `removeQueries` cho `me` và `owner`. Các khóa `bookings`, `support`, `admin`, `payment-status`, `hotels`… vẫn còn.
- `expireSession` ([authStore.ts](../frontend/src/lib/authStore.ts)) chỉ xóa token, không xóa cache.
- Nếu tài khoản B đăng nhập trên cùng tab sau tài khoản A, dữ liệu cache của A có thể hiển thị đến 5 phút **[cần xác nhận]**.

**Đề xuất**

- Dùng `queryClient.clear()` (API chính thức, xóa toàn bộ cache) khi đăng xuất và khi phiên hết hạn.
  - `useLogout`: gọi `queryClient.clear()` trong `onSettled`.
  - `expireSession`: `queryClient` là singleton ở [lib/queryClient.ts](../frontend/src/lib/queryClient.ts) nên có thể import và gọi `clear()` trong `apiClient` ngay trước `expireSession()`. Cách này tránh làm `authStore` phụ thuộc ngược vào query layer.
- Đăng nhập thành công cũng nên `clear()` trước khi `setQueryData(meQueryKey, …)` để đảm bảo không lẫn dữ liệu phiên trước.

### 1.3. Tab lọc "Đặt phòng của tôi" map sai trạng thái — P0

**Hiện trạng**

[BookingsPage.tsx:9-19](../frontend/src/pages/BookingsPage.tsx#L9): `getStatusFilterTag` xếp `Đã xác nhận`, `Thành công`, `Hoàn tất` vào tab "Hoàn tất". Hậu quả:

- Đơn đã xác nhận nhưng chưa đến ngày ở bị coi là "Hoàn tất" và hiện nút "Đánh giá" ([dòng 89](../frontend/src/pages/BookingsPage.tsx#L89)).
- Tab "Sắp tới" chỉ còn "Chờ thanh toán" và các trạng thái lạ (nhánh `default`).
- Backend định nghĩa 4 trạng thái riêng: `Chờ thanh toán`, `Đã xác nhận`, `Đã hủy`, `Hoàn tất` (xem `backend/src/common/constants/hotel-status.ts`). Trạng thái `Thành công` là của thanh toán, không phải của đặt phòng.

**Đề xuất**

- Chia tab theo đúng trạng thái backend: "Chờ thanh toán", "Đã xác nhận" (sắp tới), "Hoàn tất", "Đã hủy".
- Đặt hằng số trạng thái vào [features/bookings/status.ts](../frontend/src/features/bookings/status.ts) (file đã có) và dùng chung cho `BookingsPage`, `BookingDetailPage` (`CANCELLABLE`), `ReviewSection` (`isCompleted`), thay vì so sánh chuỗi rải rác.
- Nút "Đánh giá" chỉ hiện khi `TrangThai === 'Hoàn tất'`.
- Với chuỗi trạng thái "mở" (backend ghi "open domain"), nhánh `default` nên hiển thị nhãn gốc chứ không âm thầm gộp vào một tab.

### 1.4. Hai luồng đặt phòng song song, một luồng là code chết — P1

**Hiện trạng**

- Luồng thật: `HotelDetailPage` → tạo booking → `/bookings/:id` (`state.justBooked`) → "Thanh toán ngay" ([BookingDetailPage.tsx](../frontend/src/pages/BookingDetailPage.tsx)).
- Luồng cũ: `/booking/:id/room` → `/booking/:id/confirm` → `/booking/:id/payment` và `/payment/:id`, nằm trong [EcodeFlowPages.tsx](../frontend/src/pages/EcodeFlowPages.tsx). Grep toàn `src/` không thấy link nào trỏ tới các route này.
- Hai UI đánh giá: `WriteReviewPage` (chỉ điểm + nội dung, không upload ảnh, không kiểm tra trạng thái) và `ReviewSection` (đủ ảnh, hiển thị trạng thái). Nút "Đánh giá" ở danh sách dẫn tới bản yếu hơn.

**Đề xuất**

- Quyết định một luồng chính. Vì luồng thực tế đã chạy qua `BookingDetailPage`, nên xóa `BookingRoomPage`, `BookingConfirmPage`, `PaymentPage` và các route liên quan. Nếu cần bước "xác nhận trước khi tạo đơn", đặt bước đó **trước** `createBooking` (trong `HotelDetailPage`), không tạo thêm trang sau khi đơn đã tồn tại.
- Xóa `WriteReviewPage` và route `/write-review/:id`. Nút "Đánh giá" ở danh sách trỏ tới `/bookings/:id#danh-gia` và dùng `ReviewSection` (thêm `id="danh-gia"` để neo).
- Trước khi xóa route, tìm trong toàn repo (email template, backend redirect, tài liệu) để chắc không có nơi nào dùng URL đó. Backend hiện chỉ redirect tới `/payment/result` và `/reset-password`.

### 1.5. Thiếu hạn giữ chỗ và banner "thành công" gây hiểu nhầm — P1

**Hiện trạng**

- Backend tự hủy đơn "Chờ thanh toán" quá `PAYMENT_TIMEOUT_MINUTES` ([booking-expiry.ts](../backend/src/modules/bookings/booking-expiry.ts)), tính từ `NgayTao`. Frontend không hiển thị hạn thanh toán và không giải thích vì sao đơn tự chuyển "Đã hủy".
- Banner "Đặt phòng thành công!" ([BookingDetailPage.tsx:68](../frontend/src/pages/BookingDetailPage.tsx#L68)) phụ thuộc `location.state`. State này mất khi F5 và thông điệp dễ gây hiểu nhầm vì đơn chưa thanh toán.

**Đề xuất**

- Frontend hiện **không biết** giá trị timeout. Cần backend trả thêm một trường hạn thanh toán (ví dụ thời điểm hết hạn tính sẵn) trong `GET /bookings/:id`. Đây là thay đổi API cần thống nhất với backend, không nên hardcode số phút ở frontend.
- Khi có trường đó, hiển thị đếm ngược bằng `setInterval` hoặc so sánh với `Date.now()` (nhớ `clearInterval` trong cleanup của `useEffect`). Hết hạn thì `invalidateQueries` để lấy trạng thái thật.
- Đổi nội dung banner thành thông điệp theo trạng thái thật của đơn: "Đơn đã được tạo, vui lòng thanh toán trước hh:mm". Có thể hiển thị dựa trên `booking.TrangThai === 'Chờ thanh toán'` thay vì `location.state`, để F5 không làm mất.

### 1.6. Điều hướng khi sai quyền / đã đăng nhập không có phản hồi — P2

**Hiện trạng**

- [ProtectedRoute.tsx:32](../frontend/src/components/auth/ProtectedRoute.tsx#L32): sai vai trò thì `<Navigate to="/" replace />` mà không báo lý do.
- `/login`, `/register` không chuyển hướng khi người dùng đã đăng nhập.

**Đề xuất**

- Sai vai trò: có thể dùng một trang "403 – Bạn không có quyền truy cập" (route con) thay vì về `/` âm thầm. Hoặc giữ redirect nhưng truyền `state` và hiển thị toast qua `useToast()` (đã có trong `FeedbackProvider`).
- Thêm một guard đối xứng (ví dụ `GuestOnlyRoute`) cho `/login`, `/register`, `/forgot-password`: nếu `accessToken` tồn tại thì `<Navigate>` về trang chủ theo vai trò (tái sử dụng `roleHome` trong `LoginPage`).
- Chờ `isBootstrapping === false` trước khi quyết định, như `ProtectedRoute` đang làm, để tránh nháy trang.

---

## 2. Cấu trúc code bất hợp lý

### 2.1. Route trùng lặp và route alias — P1

**Hiện trạng** ([AppRoutes.tsx](../frontend/src/routes/AppRoutes.tsx))

- Cùng một component có nhiều URL: `/` và `/home`; `/hotels` và `/search-results`; `/hotels/:id` và `/hotel-detail/:id`; `/profile` và `/account-profile`; `/bookings` và `/my-bookings`; `/bookings/:id` và `/booking-detail/:id`; `/partner/apply` và `/register-partner`; `/payment/result` và `/payment-result`; `/support` và `/support-request`.
- Kèm khoảng 20 alias `/partner/*` và `/owner/hotels/:hotelId/*` cho Owner (đã được xử lý bằng `<Navigate>` trong [OwnerRouteRedirects.tsx](../frontend/src/routes/OwnerRouteRedirects.tsx)).
- Hệ quả: một trang có nhiều URL, menu đánh dấu "active" theo `location.pathname === link.to` sẽ sai với URL alias, và phải bảo trì nhiều đường dẫn.

**Đề xuất**

- Chọn một URL chính cho mỗi trang. Các alias còn giữ (để không làm hỏng link cũ đã phát hành) thì đổi thành `<Navigate replace>` giữ nguyên query string, theo đúng mẫu đã có ở `OwnerRouteRedirects`. Với alias có tham số (`/hotel-detail/:id`) dùng `useParams` như các `Legacy*Route` hiện có.
- Nếu không có link cũ nào cần giữ (kiểm tra trước), xóa hẳn alias.
- Tách các route Owner/Admin/Customer thành module riêng (ví dụ `routes/customerRoutes.tsx`, `ownerRoutes.tsx`, `adminRoutes.tsx`) trả về `<Route>` hoặc dùng cấu hình route dạng đối tượng. Mỗi file ngắn và mỗi `lazy()`/`<Route>` một dòng.

### 2.2. `pages/` phẳng và file đa trang — P1

**Hiện trạng**

- 44 file trong [pages/](../frontend/src/pages/), phân nhóm bằng tiền tố (`Admin*`, `Owner*`).
- [OwnerModulesPage.tsx](../frontend/src/pages/OwnerModulesPage.tsx) chứa 4 trang; [EcodeFlowPages.tsx](../frontend/src/pages/EcodeFlowPages.tsx) chứa 4 trang; "Ecode" là tên cũ không còn ý nghĩa.
- Nhiều dòng JSX bị nén thành một dòng rất dài (OwnerModules, `DashboardTopbar`, `features/owner/hooks.ts`, `features/owner/api.ts`), khó đọc và khó review diff.

**Đề xuất**

- Nhóm theo khu vực: `pages/customer/`, `pages/owner/`, `pages/admin/`, `pages/auth/`. Mỗi trang một file. `OwnerModulesPage` tách thành `OwnerRoomTypesPage`, `OwnerInventoryPricingPage`, `OwnerRevenuePage`, `OwnerReportsPage` (hai trang cuối dùng chung `OwnerAnalyticsModule` để ở `features/owner/components`).
- Bật Prettier (hiện chỉ có ESLint và oxlint) để tự xuống dòng JSX và thống nhất định dạng. Đây là công cụ chuẩn của hệ sinh thái, không đổi hành vi code.
- Đổi tên file theo domain, không theo tên dự án cũ.

### 2.3. Ranh giới `features/` không nhất quán — P2

**Hiện trạng**

- Admin accounts/hotels/payments nằm ở `features/admin/*`, nhưng reviews/support/promotions/partners (cũng có phần admin) nằm ở các thư mục top-level riêng.
- Một `api.ts` trộn API khách và admin (ví dụ [support/api.ts](../frontend/src/features/support/api.ts)).
- `features/owner` chứa cả hotels, room types, rates lẫn bookings.
- [types/auth.ts](../frontend/src/types/auth.ts) chứa cả type admin/partner (`PartnerApplication`, `AccountListQuery`).

**Đề xuất**

- Chọn một quy ước và áp dụng đều. Ví dụ theo domain (`bookings`, `support`, `reviews`…) và trong mỗi domain tách `api.customer.ts` / `api.admin.ts`; hoặc theo vai trò (`features/admin/*`, `features/owner/*`, `features/customer/*`).
- Đưa type về sát domain của chúng, chỉ để `types/api.ts` cho type dùng chung.
- Xóa thư mục rỗng chỉ có `.gitkeep`: `src/contexts`, `src/hooks` (nếu không dùng; hiện có `useDebouncedValue`, `useHealth` thì giữ), `src/utils`, `src/components`.

### 2.4. Khối UI lặp lại thay vì dùng chung — P1

**Hiện trạng**

- Markup spinner tự viết lại ở khoảng 30 trang, dù đã có `LoadingState`, `ErrorState`, `EmptyState`, `QueryState` trong [QueryState.tsx](../frontend/src/components/common/QueryState.tsx). Chỉ `EcodeFlowPages` dùng.
- Bảng, bộ lọc, phân trang của admin (Accounts, Hotels, Payments, Promotions, Reviews, Support) và Owner Bookings viết riêng từng trang; chưa có `DataTable`/`Pagination` dùng chung.
- `OwnerHotelContextSelector` và `OwnerHotelScopeState` được lặp ở mọi module Owner ([OwnerModulesPage.tsx](../frontend/src/pages/OwnerModulesPage.tsx) và các trang Owner khác), kèm khối điều kiện "chọn khách sạn" copy nhiều lần.

**Đề xuất**

- Chuyển các trang sang `<QueryState loading error empty>` và bỏ markup spinner thủ công. Không cần thư viện mới.
- Tạo `Pagination` và (nếu cần) `DataTable` trong `components/common`, dùng thẻ `<table>` với `<caption>` hoặc `aria-label` và `<th scope="col">` theo chuẩn HTML.
- Owner: tạo `OwnerLayout` (route cha dùng `<Outlet context={…}>` hoặc React Context) chứa bộ chọn khách sạn và trạng thái phạm vi một lần; các trang con đọc bằng `useOutletContext()`. Có thể đặt bộ chọn ở topbar dashboard để khớp với mô hình "hotel scope" trong sidebar.

### 2.5. Bootstrap auth trùng logic refresh — P2

**Hiện trạng**

[useAuthBootstrap.ts](../frontend/src/features/auth/useAuthBootstrap.ts) tự `fetch('/auth/refresh')`, trong khi [apiClient.ts](../frontend/src/services/apiClient.ts) đã có `refreshAccessToken` (chia sẻ một promise đang chạy) và `refreshSession`.

**Đề xuất**

- Bootstrap gọi `refreshSession()` từ `apiClient` để chỉ có một nơi biết endpoint refresh và cách xử lý lỗi. `refreshSession` đã dùng chung promise nên tránh hai lần refresh chạy đồng thời (quan trọng nếu refresh token xoay vòng).
- `useAuthStore.setAccessToken` đã được `refreshSession` gọi; bootstrap chỉ cần gọi `finishBootstrap()` trong `finally`.

### 2.6. Test còn mỏng ở luồng quan trọng — P1

**Hiện trạng**: chỉ có 5 file test (search bar, interaction, owner context, owner redirects). Luồng đặt phòng, thanh toán, lọc booking, auth chưa có test.

**Đề xuất**

- Dùng đúng bộ đã cài (Vitest, Testing Library, `user-event`). Ưu tiên: (a) test hàm map trạng thái booking (thuần, dễ), (b) test `useCreateBooking` invalidate `['bookings']` bằng `QueryClient` thật, (c) test `PaymentResultPage` polling bằng fake timers, (d) test `ProtectedRoute`/guard theo vai trò.
- Cân nhắc dùng MSW để giả lập API thay vì mock từng hàm.

---

## 3. Bố cục và giao diện chưa ổn

### 3.1. Bốn hệ container khác nhau — P1

**Hiện trạng**

- `.container` và `.site-header__inner`: `width: 80%` + `max-width: var(--container-max)` (1536px) + padding 24px ([base.css](../frontend/src/assets/css/base.css), [layout.css](../frontend/src/assets/css/layout.css)).
- HotelDetail/HotelList: `max-w-[1440px] mx-auto px-6 lg:px-12`.
- Home: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Profile: `max-w-[1200px]`.
- Trên màn rộng, lề trái/phải của header và nội dung lệch nhau.

**Đề xuất**

- Định nghĩa **một** container duy nhất. Với Tailwind 4 có thể tạo utility bằng `@utility container-page { … }` hoặc một class CSS dựa trên token, rồi dùng cho header, footer và mọi trang. Trong đó dùng `width: min(100% - 2rem, var(--container-max)); margin-inline: auto;` (kỹ thuật CSS chuẩn, không cần `80%` cộng thêm padding).
- Nếu trang cần bề rộng khác (form hẹp, admin rộng), khai báo qua biến thể (`container-page--narrow`) chứ không viết lại số ở từng trang.

### 3.2. `<main>` lồng nhau và layout "đánh nhau" với trang — P1

**Hiện trạng**

- [MainLayout.tsx](../frontend/src/components/layouts/MainLayout.tsx) đã render `<main id="main-content">`, nhưng khoảng 10 trang lại render `<main>` (HotelList, HotelDetail, Register, Forgot/Reset, Profile, PaymentResult, OwnerModules, OwnerBookingDetail, PartnerApply) và `AppErrorBoundary`.
- Nhiều trang phải chèn `!max-w-full !px-0 !py-0` (từ khóa `!important` của Tailwind) để triệt tiêu padding của layout cha.

**Cơ sở chuẩn**: đặc tả HTML quy định một trang chỉ có một phần tử `<main>` hiển thị (không lồng). Landmark trùng lặp làm nhiễu điều hướng bằng trình đọc màn hình.

**Đề xuất**

- Trong `pages/`, thay `<main>` bằng `<div>` hoặc `<section>` (có `aria-labelledby` nếu cần). Chỉ giữ `<main>` ở layout (và `AppErrorBoundary`, vì đó nằm ngoài layout).
- Thống nhất: layout **không** áp padding/max-width cho nội dung; mỗi trang tự bọc bằng container ở 3.1. Khi đó bỏ được toàn bộ `!max-w-full !px-0 !py-0`.
- Trang toàn màn hình (Login, Register) có thể đặt ở một route layout riêng ("AuthLayout") thay vì bọc trong MainLayout rồi triệt tiêu nó.

### 3.3. HotelDetail trên mobile: không thấy tổng tiền và nút đặt — P1

**Hiện trạng** ([HotelDetailPage.tsx](../frontend/src/pages/HotelDetailPage.tsx))

- Lưới `grid-cols-1 lg:grid-cols-12`. Ở màn nhỏ, cột "Chi tiết đặt phòng" nằm dưới Tổng quan và Tiện nghi. Chọn phòng xong người dùng không có phản hồi, phải cuộn hết trang mới thấy nút "Tạo đặt phòng".

**Đề xuất**

- Thêm thanh tóm tắt cố định ở đáy màn hình nhỏ (`position: fixed; bottom: 0`, `padding-bottom: env(safe-area-inset-bottom)` để tránh thanh điều hướng iOS), chỉ hiện khi có phòng được chọn: số phòng, tổng tiền, nút cuộn tới/mở panel đặt phòng.
- Panel đặt phòng đầy đủ có thể mở bằng `<dialog>` (đã dùng trong `FeedbackProvider`) hoặc bottom sheet ở mobile.
- Ẩn thanh này ở `lg:` trở lên (`lg:hidden`) vì đã có cột phải dính (`lg:sticky`).

### 3.4. HotelDetail: thứ tự hiển thị khác thứ tự DOM, tab không phản ánh vị trí — P1

**Hiện trạng**

- Các section dùng `order-1/2/3` ([dòng 240, 263, 295](../frontend/src/pages/HotelDetailPage.tsx#L240)) để đảo thứ tự: DOM là Tổng quan → Loại phòng → Tiện nghi, hiển thị là Loại phòng → Tổng quan → Tiện nghi. Menu tab liệt kê "Tổng quan" trước. Bàn phím và trình đọc màn hình theo DOM nên thứ tự không khớp mắt nhìn (WCAG 1.3.2 Meaningful Sequence và 2.4.3 Focus Order).
- Tab dính có `nav-tab active` cố định, không cập nhật theo vị trí cuộn.
- `top-[4.5rem]` (72px) cho sticky khác `--header-height: 68px`.

**Đề xuất**

- Sắp xếp DOM đúng thứ tự muốn hiển thị, bỏ `order-*`. Thứ tự của menu tab phải khớp thứ tự section.
- Cập nhật tab đang active bằng `IntersectionObserver` (API trình duyệt chuẩn) theo section đang trong viewport, hoặc dùng `aria-current="location"` theo section hiện tại. Dùng `scroll-margin-top` (đã dùng `scroll-mt-36`) theo `--header-height` cộng chiều cao thanh tab.
- Thay các giá trị cứng `4.5rem`, `top-28`, `top-40` bằng biến CSS (`top: var(--header-height)`, `calc(var(--header-height) + …)`).

### 3.5. Suspense đặt ngoài `<Routes>` — P2 **[cần xác nhận]**

**Hiện trạng**: [AppRoutes.tsx:56](../frontend/src/routes/AppRoutes.tsx#L56) đặt `<Suspense>` bao quanh `<Routes>`, trong khi `MainLayout` nằm bên trong `<Routes>`. Khi một trang `lazy()` tải lần đầu và không nằm trong transition, fallback sẽ thay cả cây chứa navbar/sidebar.

**Đề xuất**: đặt `<Suspense>` quanh `<Outlet />` trong `MainLayout` (và layout dashboard), để navbar/sidebar giữ nguyên và chỉ vùng nội dung hiện fallback. Đây là cách dùng chuẩn của `React.lazy`. Chạy thử điều hướng lần đầu tới một trang lazy để xác nhận hiện tượng trước khi sửa.

### 3.6. Admin/Owner vào trang hồ sơ bị rơi khỏi khung dashboard — P1

**Hiện trạng**

- [MainLayout.tsx:11](../frontend/src/components/layouts/MainLayout.tsx#L11): khung dashboard chỉ bật khi vai trò khớp **và** `pathname` bắt đầu bằng `/admin` hoặc `/owner|/partner`.
- Topbar admin trỏ tới `/profile` ([DashboardNavigation.tsx:106](../frontend/src/components/layouts/DashboardNavigation.tsx#L106)); tại đó hiện Navbar khách. Chủ khách sạn có `/owner/profile`, nhưng dropdown ở `Navbar` vẫn trỏ `/profile`.

**Đề xuất**

- Tạo route `/admin/profile` dùng chung `ProfilePage` trong nhánh admin, như đã làm với `/owner/profile`.
- Thay vì suy ra layout bằng `pathname` + vai trò trong một component, dùng **route layout** của React Router: nhánh `/admin/*` bọc `DashboardLayout`, nhánh công khai bọc `PublicLayout`. Khi đó việc chọn layout nằm trong cây route (khai báo), không cần `if` theo đường dẫn.
- Menu dropdown ở Navbar nên trỏ hồ sơ theo vai trò (dùng cùng bảng `profilePath`).

### 3.7. Trang tổng quan Owner/Admin chưa mang tính tổng quan — P2

**Hiện trạng**

- [OwnerDashboardPage.tsx](../frontend/src/pages/OwnerDashboardPage.tsx) `mode="overview"` chỉ đếm số khách sạn theo 3 trạng thái, và dùng chung component với `mode="hotels"`.
- [AdminDashboardPage.tsx](../frontend/src/pages/AdminDashboardPage.tsx) chỉ là danh sách link; `/admin/operations` là alias của cùng trang.

**Đề xuất**

- Tách `OwnerOverviewPage` và `OwnerHotelsPage` (hiện chỉ khác bằng cờ `mode`).
- Bổ sung chỉ số từ API đã có: backend đã có `owner-analytics` và `admin-analytics` ([analytics/hooks.ts](../frontend/src/features/analytics/hooks.ts) đã có hook). Hiển thị đơn cần xử lý, doanh thu kỳ hiện tại, số hồ sơ chờ duyệt, số yêu cầu hỗ trợ mở. Chỉ hiển thị số liệu API thực sự trả về, không dựng số giả.

### 3.8. Quỹ phòng và giá của Owner: ghi đè cả khoảng ngày — P1

**Hiện trạng**: [OwnerModulesPage.tsx](../frontend/src/pages/OwnerModulesPage.tsx) (`OwnerInventoryPricingPage`) hiển thị bảng chỉ đọc; form bên dưới gửi cùng một giá, số lượng, trạng thái cho **mọi ngày** trong khoảng đã chọn. Dễ ghi đè nhầm dữ liệu từng ngày đã thiết lập.

**Đề xuất**

- Trước khi gửi, hiển thị bước xác nhận bằng `useConfirm()` (đã có) nêu rõ số ngày và loại phòng bị ghi đè.
- Cho phép chọn ngày trong tuần (T2–CN) áp dụng, và/hoặc sửa từng dòng trong bảng. Cả hai đều dùng `bulkUpsertRates` hiện có, chỉ khác dữ liệu gửi đi, không cần API mới.
- Hiển thị kết quả sau khi lưu (toast) và làm mới bảng (hook đã `invalidateQueries` cho khóa rates).

---

## 4. UI giả (có nút nhưng không có chức năng)

**Hiện trạng**

| Vị trí | Vấn đề |
| --- | --- |
| [HotelDetailPage.tsx:170-177](../frontend/src/pages/HotelDetailPage.tsx#L170) | Nút "Chia sẻ", "Lưu" không có `onClick`. |
| [HotelDetailPage.tsx:206](../frontend/src/pages/HotelDetailPage.tsx#L206) | "Xem tất cả N ảnh" không có `onClick`; ảnh phụ có `cursor-pointer` nhưng không mở gì. |
| [BookingDetailPage.tsx:101](../frontend/src/pages/BookingDetailPage.tsx#L101) | "Xem trên bản đồ" là `<p>` có `cursor-pointer`, không hành vi (không phải liên kết hay nút). |
| [DashboardNavigation.tsx:107](../frontend/src/components/layouts/DashboardNavigation.tsx#L107) | Ô "Tìm kiếm…" và chuông thông báo (có chấm đỏ) không làm gì. Ô tìm kiếm dùng ký tự `⌕` thay icon. |
| [MainLayout.tsx:49-73](../frontend/src/components/layouts/MainLayout.tsx#L49) | Hầu hết link footer trỏ `/`; social `href="#"`; copyright 2024. |
| [BookingsPage.tsx:60](../frontend/src/pages/BookingsPage.tsx#L60), BookingDetail | Ảnh khách sạn chỉ là ô icon giữ chỗ, dù `AnhDaiDien` có ở nơi khác. |

**Đề xuất**

- Nguyên tắc: phần tử tương tác phải là `<button>` hoặc `<a href>` thật, có hành vi, hoặc bị bỏ. Không để chức năng chưa có hiển thị như đã hoạt động.
- Chia sẻ: dùng `navigator.share()` (Web Share API) khi có, fallback `navigator.clipboard.writeText(location.href)` + toast. Cả hai là API trình duyệt chuẩn, cần kiểm tra `if ('share' in navigator)` và bối cảnh HTTPS.
- Xem tất cả ảnh: `<dialog>` + `showModal()` (như `FeedbackProvider`) hoặc bỏ nút nếu chưa làm gallery.
- Lưu/Yêu thích, thông báo, tìm kiếm trong dashboard: chưa có API tương ứng ở backend (chưa thấy trong module list), nên **ẩn** cho đến khi có hoặc đánh dấu rõ chưa hỗ trợ. Không nên giữ chuông có chấm đỏ giả.
- Bản đồ: nếu địa chỉ có sẵn (`DiaChiChiTiet`), tạo liên kết `<a href="https://www.google.com/maps/search/?api=1&query=…" target="_blank" rel="noopener noreferrer">` (URL tìm kiếm Google Maps chính thức, không cần API key).
- Footer: trỏ đến trang thật hoặc bỏ link chưa có trang; năm bản quyền dùng `new Date().getFullYear()`.
- Ảnh trong danh sách đặt phòng: chỉ hiển thị nếu API danh sách trả về ảnh; nếu không, cần thêm trường ở backend, hoặc bỏ ô placeholder để không gợi ý sai.

---

## 5. Hệ thống style và thư viện

### 5.1. Ba cách style cùng tồn tại; token bị bỏ qua — P1

**Hiện trạng**

- Class Tailwind, CSS viết tay (`.btn`, `.card`, `owner-module__*`, `hotel-card-v2`) và component `<Button>`. `<Button>` ở 8 file, `.btn` ở 14 file, form dùng `Input`/`Textarea` ở một số nơi và `<input>` + chuỗi class dài ở nơi khác ([LoginPage.tsx](../frontend/src/pages/LoginPage.tsx)).
- [variables.css](../frontend/src/assets/css/variables.css) có bộ token ngữ nghĩa và [index.css](../frontend/src/index.css) ánh xạ vào `@theme`, nhưng code vẫn dùng khoảng 1065 lần màu Tailwind thô (`slate/red/emerald/amber/blue-*`) so với khoảng 690 lần dùng token (`text-ink`, `bg-surface-*`, `border-border`…). Thống kê này ước lượng bằng grep, dùng để thấy xu hướng.
- [booking-flow.css](../frontend/src/assets/css/booking-flow.css) "vá" giao diện bằng selector theo class Tailwind (`.booking-flow .bg-white.rounded-2xl`, `.booking-flow .shadow-md`…). Cách này dễ vỡ khi đổi class và làm hành vi utility phụ thuộc vào ngữ cảnh.

**Đề xuất**

- Chọn Tailwind 4 + `@theme` làm nguồn duy nhất. Các token màu trạng thái (success, warning, danger, info) đã có trong `@theme`; thay dần `text-red-700`, `bg-red-50`… bằng `text-danger`, `bg-danger-light`. Có thể thêm quy tắc ESLint (`no-restricted-syntax` hoặc plugin Tailwind) để chặn màu thô mới.
- Các khối lặp (thông báo lỗi, thẻ, ô nhập) đưa vào component dùng chung có sẵn: `Alert`, `Input`, `Select`, `Textarea`, `Button` ([components/common](../frontend/src/components/common/)) thay cho chuỗi class dài. Quản lý biến thể bằng một hàm (đã có `cn` = `clsx` + `tailwind-merge`; có thể thêm `class-variance-authority` là thư viện chuẩn cho việc này).
- Thay `booking-flow.css` bằng chỉnh sửa trực tiếp ở component/token. Xóa dần từng khối và kiểm tra trực quan sau mỗi bước.
- Lộ trình chuyển đổi nên theo trang, không đổi một lượt, vì phạm vi lớn.

### 5.2. Hai bộ icon, một bộ nạp từ CDN bằng `<script>` — P1

**Hiện trạng**

- [index.html:10](../frontend/index.html#L10): `<script src="https://unpkg.com/@phosphor-icons/web"></script>` (không pin phiên bản, không SRI, script đồng bộ trong `<head>`), dùng ở khoảng 43 file qua class `ph ph-*`.
- `lucide-react` dùng ở khoảng 6 file (npm).
- Hệ quả: chặn render nhẹ, phụ thuộc CDN bên ngoài lúc chạy (mất icon khi CDN lỗi/offline), không tree-shake, không kiểm soát phiên bản.

**Đề xuất**

- Dùng một bộ icon cài bằng npm. Vì `lucide-react` đã có và được tree-shake, chuyển dần các `<i className="ph …">` sang component `lucide-react` tương ứng. Nếu muốn giữ bộ Phosphor, dùng gói `@phosphor-icons/react` (component React, có tree-shaking).
- Tối thiểu: nếu tạm giữ script CDN, pin phiên bản cụ thể và thêm `integrity` + `crossorigin="anonymous"` (SRI), và cân nhắc `defer`.
- Icon thuần trang trí cần `aria-hidden="true"`; icon là nút cần `aria-label` (nhiều chỗ đã làm, cần thống nhất).

### 5.3. Ngày hiển thị dạng ISO thô — P1

**Hiện trạng**: Home ("2026-10-01 → 2026-10-02"), HotelList chips, HotelDetail, BookingsPage (`NgayNhanPhong`), BookingDetail hiển thị chuỗi từ API. [lib/utils.ts](../frontend/src/lib/utils.ts) đã có `formatDateVi` và `formatDateTimeVi`, nhưng chỉ `StayContext` dùng. Còn khoảng 30 chỗ gọi `toLocale*String` rải rác.

**Đề xuất**

- Dùng `formatDateVi`/`formatDateTimeVi` cho mọi nơi hiển thị. `formatDateVi` đã xử lý đúng chuỗi `YYYY-MM-DD` (tránh lệch múi giờ do parse UTC).
- Thay các `toLocale*String` rải rác bằng các hàm này để có một định dạng và một nơi sửa.
- Ô `<input type="date">` vẫn dùng `YYYY-MM-DD` (theo chuẩn HTML).

### 5.4. Mặc định số khách không thống nhất — P2

**Hiện trạng**: [HomePage.tsx](../frontend/src/pages/HomePage.tsx) đặt search bar mặc định 2 khách nhưng truy vấn "nổi bật" dùng 1 khách; `HotelListPage` và `HotelDetailPage` mặc định 1.

**Đề xuất**: đưa mặc định (checkIn, checkOut, guests) vào một hàm chung (mở rộng `defaultSearchDates` trong [features/hotels/schemas.ts](../frontend/src/features/hotels/schemas.ts)) và dùng ở mọi nơi.

---

## 6. Các điểm nhỏ khác

| # | Vấn đề | Đề xuất |
| --- | --- | --- |
| 6.1 | Chỉ một `AppErrorBoundary` ở gốc: một trang lỗi làm trắng cả app kể cả menu. | Đặt thêm error boundary ở mức layout/route (React Router hỗ trợ `errorElement` cho route, có thể dùng thay cho class boundary tự viết). Nút "Thử lại" reset trạng thái thay vì chỉ reload. |
| 6.2 | Sidebar dashboard trên mobile không có focus trap và không đóng bằng Escape như drawer của Navbar; dùng chung cờ `isSidebarOpen` với drawer công khai. | Đưa cơ chế focus/Escape của Navbar thành hook dùng chung, hoặc dùng `<dialog>` cho drawer. Tách hai cờ (`isPublicNavOpen`, `isDashboardNavOpen`) để không ảnh hưởng nhau. |
| 6.3 | [ProfilePage.tsx:36](../frontend/src/pages/ProfilePage.tsx#L36): `handleLogout` gọi `logoutMutation.mutate()` rồi `navigate('/login')` ngay, không chờ. | Dùng `mutateAsync` + `await` (như `Navbar`/`DashboardNavigation`), hoặc `onSuccess`/`onSettled` của mutation. |
| 6.4 | [HotelDetailPage.tsx:72-76](../frontend/src/pages/HotelDetailPage.tsx#L72): `useEffect` tự báo giá lại kèm `eslint-disable react-hooks/exhaustive-deps`; báo giá là `useMutation` được dùng như query. | Chuyển báo giá thành `useQuery` với `queryKey` gồm `{ checkIn, checkOut, rooms, promoCode }` và `enabled: rooms.length > 0`, để cache, hủy request cũ và bỏ được `eslint-disable`. Nếu API báo giá là POST, `useQuery` vẫn dùng được (queryFn gọi POST). |
| 6.5 | Tab lọc, sort, phân trang của HotelList và Owner Bookings dùng URL (tốt); các trang danh sách admin (`Admin*Page`) không dùng `useSearchParams` nên bộ lọc/trang mất khi F5 hoặc khi quay lại từ trang chi tiết. | Thống nhất đồng bộ bộ lọc lên URL (`useSearchParams`) để F5 và chia sẻ link giữ nguyên bộ lọc. |
| 6.6 | `PaymentResultPage` hiển thị `booking.MaDatPhong` (id nội bộ) như "mã xác nhận". | Hiển thị `MaXacNhanDatPhong` nếu API trả (danh sách đặt phòng và chi tiết đã dùng trường này). Cần xác nhận `payment-status` có trường đó. |
| 6.7 | Nhánh "thanh toán thất bại" chỉ có nút "Về chi tiết đơn". | Thêm nút "Thử thanh toán lại" (tái dùng `useCreateVnpayPayment`) khi đơn còn "Chờ thanh toán". |
| 6.8 | `Navbar`/Login dùng `style={{…}}` inline và giá trị màu cứng ở vài chỗ ([Navbar.tsx:112,115](../frontend/src/components/common/Navbar.tsx#L112)). | Chuyển sang class/token; inline style chỉ dành cho giá trị động. |

---

## 7. Lộ trình đề xuất

| Giai đoạn | Nội dung | Mục | Ước lượng rủi ro |
| --- | --- | --- | --- |
| 1 — Sửa luồng | Invalidate cache sau tạo đơn và thanh toán, polling trang kết quả, `queryClient.clear()` khi đăng xuất/hết phiên, sửa map trạng thái booking, guard cho `/login` | 1.1, 1.2, 1.3, 1.6 | Thấp; thay đổi nhỏ, nên có test đi kèm (2.6) |
| 2 — Dọn dẹp | Xóa luồng đặt phòng cũ và `WriteReviewPage`; alias route thành `<Navigate>`; bỏ UI giả | 1.4, 2.1, 4 | Thấp–trung bình; cần grep link còn dùng |
| 3 — Layout | Một container chung, bỏ `<main>` lồng, thanh đặt phòng mobile, `OwnerLayout`, route layout thay `pathname` | 3.1–3.8 | Trung bình; nên chụp ảnh trước/sau từng trang |
| 4 — Cấu trúc | Tổ chức lại `pages/` và `features/`, `QueryState`/`Pagination`/`DataTable` dùng chung, Prettier | 2.2–2.5 | Trung bình; đổi đường dẫn import nhiều, làm ngoài giờ cao điểm PR |
| 5 — Nền tảng style | Một bộ icon npm, token thay màu thô, gỡ `booking-flow.css`, ngày định dạng thống nhất | 5.x | Cao về khối lượng; chia nhỏ theo trang |
| 6 — Cần backend | Trường hạn thanh toán, ảnh trong danh sách đặt phòng | 1.5, 4 | Cần thống nhất API |

**Nguyên tắc khi thực hiện**

- Mỗi giai đoạn một nhánh/PR riêng, chạy `npm run lint`, `npm run typecheck`, `npm test` trước khi merge (đã có sẵn trong `package.json`).
- Với thay đổi liên quan hành vi (giai đoạn 1), viết test trước hoặc cùng lúc.
- Thay đổi giao diện (giai đoạn 3, 5) cần kiểm tra thủ công ở ít nhất: mobile (~375px), tablet, desktop rộng (≥1440px), và điều hướng bằng bàn phím.

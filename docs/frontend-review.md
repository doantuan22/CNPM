# Báo cáo rà soát Frontend (cấu trúc, bố cục, luồng) và đề xuất chỉnh sửa

- Phạm vi: thư mục `frontend/` (React 19, React Router 7, TanStack Query 5, Zustand 5, Tailwind 4, Vite 8).
- Ngày rà soát: 2026-09-30. Cập nhật lần cuối: 2026-09-30, sau khi sửa các Giai đoạn 1–4 và một phần Giai đoạn 5, 6 (xem [Tiến độ xử lý](#tiến-độ-xử-lý)).
- Phương pháp: bản rà soát ban đầu chỉ **đọc code**. Khi sửa, từng lỗi được xác nhận bằng test thất bại trước, và các thay đổi giao diện được kiểm tra lại bằng trình duyệt thật (Edge headless, xem phần Tiến độ). Các điểm chưa chắc được đánh dấu **[cần xác nhận]**.
- Nguyên tắc cho phần đề xuất: chỉ dùng API/kỹ thuật có trong tài liệu chính thức của thư viện đang dùng (React, React Router, TanStack Query, HTML/WAI-ARIA, CSS, Tailwind). Chỗ nào phụ thuộc thay đổi ở backend thì ghi rõ, không giả định backend đã có.

Mức ưu tiên: **P0** = sai chức năng / rủi ro dữ liệu, **P1** = ảnh hưởng rõ tới trải nghiệm hoặc bảo trì, **P2** = cải thiện, dọn dẹp.

---

## Tiến độ xử lý

Giai đoạn 1 (sửa luồng), 2 (dọn dẹp), 3 (bố cục), 4 (cấu trúc) và phần lớn mục 5, 6 đã được thực hiện trong 37 commit trên `main` (10 commit đầu đã push; 27 commit sau chưa push tại thời điểm cập nhật này). Mỗi lỗi hành vi được xác nhận bằng test thất bại trước khi sửa. Kết quả hiện tại: `npm run lint`, `npm run typecheck`, `npm test` (45 file / 294 test) và `npm run build` đều pass; backend có thêm test cho trường hạn thanh toán.

**Kiểm tra trên trình duyệt thật** (Edge headless điều khiển bằng CDP, backend và frontend chạy thật): đã chạy các luồng đăng ký/đăng nhập/đăng xuất, redirect của guard, alias, đặt phòng, trang kết quả thanh toán, thư viện ảnh, chia sẻ, drawer mobile, tab cuộn của trang khách sạn, bộ lọc trên URL của trang admin, cập nhật giá theo khoảng ngày. Rà soát bố cục lần cuối trên 4 cỡ màn hình (desktop, tablet, mobile, màn rộng) qua 57 lượt trang: mỗi trang đúng một `<main>`, không tràn ngang, một lề trái duy nhất theo từng cỡ màn hình, không có lỗi console. Việc đổi bố cục ở 3.1, 3.2, 2.2 (tách trang) và 2.4 được so sánh ảnh chụp trước/sau theo từng điểm (md5) và giữ nguyên hiển thị.

| Mục | Trạng thái | Commit |
| --- | --- | --- |
| 1.1 Cache sau đặt phòng và thanh toán | **Xong, có điều chỉnh so với đề xuất ban đầu** (không dùng polling) | `c8da627`, `fddcf64`, `ff75d1c` |
| 1.2 Cache khi đăng xuất/hết phiên | **Xong**, dùng `clearUserCache` (giữ dữ liệu công khai); `useRegister` cũng dọn cache | `7bd88d4`, `3f97ce6`, `441bf11` |
| 1.3 Tab lọc "Đặt phòng của tôi" | **Xong** | `9249e6f` |
| 1.4 Hai luồng đặt phòng, hai UI đánh giá | **Xong**, URL cũ giữ dưới dạng redirect | `db35e15` |
| 1.5 Hạn giữ chỗ, banner "thành công" | **Xong** (backend trả `HanThanhToan`, `SoGiayConLai`; frontend đếm ngược) | `4b032ee` (backend), `68c013d` |
| 1.6 Điều hướng khi đã đăng nhập / sai vai trò | **Xong**, không có trang 403 | `5a8ba04` |
| 2.1 Route trùng lặp | **Xong**: alias thành redirect, route tách module theo khu vực | `9d834e4`, `db35e15`, `5affc61` |
| 2.2 `pages/` phẳng, file đa trang | **Xong**: chia `auth/public/customer/owner/admin`, tách `OwnerModulesPage`, thêm Prettier (chỉ áp cho file mới/sửa) | `da035ca`, `d0c736d` |
| 2.3 Ranh giới `features/` | **Xong một phần**: xóa mã và thư mục giữ chỗ không dùng; chưa sắp xếp lại `features/` | `ca92baf` |
| 2.4 Khối UI lặp | **Xong một phần**: `Pagination`, `PageSpinner`, `OwnerScopeGate`; chưa có `DataTable` | `555cb68`, `2d9c9e3`, `370b569`, `b8430ad` |
| 2.5 Bootstrap auth | **Xong** | `9f07312` |
| 2.6 Test | Mỗi lỗi đã sửa có test đi kèm (131 → 294 test) | — |
| 3.1 Một container | **Xong** | `f74b497` |
| 3.2 `<main>` lồng nhau | **Xong**, kèm luật ESLint chặn `<main>` trong `pages/` | `8dffb42` |
| 3.3 Thanh đặt phòng mobile | **Xong** | `a06b9db` |
| 3.4 Thứ tự DOM và tab theo vị trí cuộn | **Xong** | `173c510` |
| 3.5 Suspense | **Không phải lỗi**, xem bên dưới | — |
| 3.6 Hồ sơ theo vai trò | **Xong** | `a2748aa` |
| 3.7 Trang tổng quan Owner/Admin | Chưa làm | — |
| 3.8 Giá/quỹ phòng theo khoảng ngày | **Xong** | `491c7f6` |
| 4 UI giả | **Xong** (bỏ hoặc làm cho hoạt động thật) | `f834a03`, `36ca0da` |
| 5.1 Một hệ style, token thay màu thô | Chưa làm (lớn, nên theo từng trang) | — |
| 5.2 Icon từ npm thay vì CDN | **Xong** (gói `@phosphor-icons/web`, không đổi giao diện); chưa gộp về một bộ icon | `ef4b2c9` |
| 5.3 Ngày dd/mm/yyyy | **Xong** | `15cb110` |
| 5.4 Số khách mặc định | **Xong** (mặc định 2) | `12f4695` |
| 6.1 – 6.8 | **Xong** cả 8 mục | `3f7997e`, `3696242`, `8affc21`, `d3e846d`, `73e43aa`, `ff75d1c` |

**Những điểm bản rà soát ban đầu sai hoặc lệch so với code thật** (phát hiện khi xác nhận trước khi sửa):

- **Chi tiết đơn bị cũ sau khi thanh toán VNPAY: không tái hiện được.** Chuyển sang cổng thanh toán dùng `window.location.href` (tải lại toàn trang), nên cache của `QueryClient` bị xóa trước khi quay về `/payment/result`.
- **Polling trang kết quả không cần thiết.** `vnpayReturn` gọi `handleCallback` và chỉ redirect sau khi transaction xong, nên khi trang kết quả mở, trạng thái trong DB đã là trạng thái cuối. Các trường hợp trang kẹt ở "Đang xử lý…" có nguyên nhân khác (xem 1.1).
- **Guard `GuestOnlyRoute` cần phức tạp hơn mô tả.** Bản "có token thì redirect" xung đột với `RegisterPage` (tự chuyển sang `/partner/apply`) và `LoginPage` (tự quay về `returnTo`). Xem 1.6.
- **`queryClient.clear()` xóa cả dữ liệu công khai.** Đã thay bằng `clearUserCache` (xem 1.2).
- **Alias và luồng cũ không bị xóa hẳn.** Đề xuất ban đầu là xóa route; tài liệu `docs/uiux/part-2-booking-route-map.md` quy định chỉ bỏ sau khi kiểm tra link ngoài. Phía backend đã kiểm tra (chỉ tạo link `/payment/result` và `/reset-password`) nhưng link người dùng tự lưu thì không kiểm tra được, nên các URL cũ được giữ dưới dạng redirect (xem 1.4, 2.1).
- **`/payment/:id` (alias động) trùng khuôn với `/payment/result` (URL thật mà VNPAY redirect về).** Route tĩnh được ưu tiên hơn route động nên vẫn đúng, nhưng đây là chỗ dễ vỡ nhất; đã có test riêng.
- **Không dựng được link bản đồ.** API chi tiết đơn chỉ trả `MaKhachSan` và tên khách sạn, không có địa chỉ (xem mục 4).
- **3.5 (Suspense ngoài `<Routes>`) không gây hiện tượng mô tả.** Đo trên trình duyệt thật: khi mở trang `lazy()` lần đầu, không quan sát thấy navbar bị thay bằng fallback. Không sửa.
- **Đề xuất `OwnerLayout` dùng `<Outlet context>` (2.4) không cần thiết.** Phần lặp thực chất là khối "chọn khách sạn / chưa có khách sạn"; đã gom bằng hook `useScopedHotels` và `OwnerScopeGate`, không đổi cấu trúc route.
- **Backend: `authLimiter` dùng chung cho `/auth/login` và `/auth/refresh` (10 lượt / 15 phút / IP).** Phát hiện khi chạy trình duyệt thật: mỗi lần tải lại trang đã đăng nhập gọi `/auth/refresh`, nên vài lần F5 hoặc mở nhiều tab có thể chặn cả đăng nhập (HTTP 429). Đây là lỗi thật nhưng **chưa sửa** vì nằm ngoài phạm vi được phép chỉnh backend (chỉ 1.5). Đề xuất: tách limiter riêng cho `/refresh` với hạn mức cao hơn (hoặc không giới hạn theo IP, vì refresh cần cookie hợp lệ), giữ 10 lượt cho `/login`.

**Quyết định đã chọn khi sửa** (có thể đổi nếu sản phẩm muốn khác):

- Số khách mặc định là 2 (trước đây HotelList và HotelDetail mặc định 1).
- Các URL cũ giữ dưới dạng redirect vì tài liệu `docs/uiux/part-2-booking-route-map.md` yêu cầu kiểm tra link ngoài trước khi bỏ.
- Link "Xem trên bản đồ" đổi thành link tới trang khách sạn, vì API đơn không trả địa chỉ.
- Bề rộng container thống nhất còn 1280px (trước đây có 1536/1440/1280/1200).

**Chưa làm, có chủ ý:**

- **3.7** (trang tổng quan Owner/Admin có số liệu thật): cần quyết định sản phẩm về chỉ số nào hiển thị.
- **5.1** (token thay màu thô, gỡ `booking-flow.css`, thống nhất `<Button>`/`.btn`): khối lượng lớn, dễ đổi hình ảnh, nên làm theo từng trang với ảnh chụp trước/sau.
- Chạy Prettier trên toàn repo (sẽ tạo diff rất lớn che lịch sử); Prettier hiện chỉ áp dụng cho file mới/đã sửa.
- Sắp xếp lại `features/` (2.3), `DataTable` dùng chung (2.4), gộp về một bộ icon (5.2), tự host font Inter: bỏ có chủ ý vì diff lớn, rủi ro cao mà giá trị thấp.
- **Lỗi backend chưa sửa** (ngoài phạm vi được phép chỉnh backend, chỉ 1.5): `authLimiter` (10 lượt / 15 phút / IP) dùng chung cho `/auth/login` và `/auth/refresh`. Mỗi lần F5 trang đã đăng nhập gọi `/auth/refresh`, nên vài lần tải lại có thể chặn cả đăng nhập bằng lỗi 429. Đề xuất: tách limiter riêng cho `/refresh` với hạn mức cao hơn, giữ 10 lượt cho `/login`.

---

## Mục lục

0. [Tiến độ xử lý](#tiến-độ-xử-lý)
1. [Luồng đang sai](#1-luồng-đang-sai)
2. [Cấu trúc code bất hợp lý](#2-cấu-trúc-code-bất-hợp-lý)
3. [Bố cục và giao diện chưa ổn](#3-bố-cục-và-giao-diện-chưa-ổn)
4. [UI giả (có nút nhưng không có chức năng)](#4-ui-giả-có-nút-nhưng-không-có-chức-năng)
5. [Hệ thống style và thư viện](#5-hệ-thống-style-và-thư-viện)
6. [Các điểm nhỏ khác](#6-các-điểm-nhỏ-khác)
7. [Lộ trình đề xuất](#7-lộ-trình-đề-xuất)

---

## 1. Luồng đang sai

### 1.1. Cache không được làm mới sau khi đặt phòng và thanh toán — P0 — ĐÃ XỬ LÝ

**Hiện trạng ban đầu**

- [queryClient.ts](../frontend/src/lib/queryClient.ts) đặt `staleTime` mặc định 5 phút.
- `useCreateBooking` ([bookings/hooks.ts](../frontend/src/features/bookings/hooks.ts)) không có `onSuccess`, nên không invalidate `['bookings']`. Đơn mới tạo có thể không xuất hiện trong "Đặt phòng của tôi" nếu danh sách đã được tải trước đó. **Đã xác nhận bằng test.**
- Bản rà soát ban đầu còn nêu hai điểm khác, sau khi đối chiếu code đã thấy **không đúng như mô tả** (xem bên dưới): chi tiết đơn bị cũ sau thanh toán, và trang kết quả cần polling.

**Đã làm**

1. `useCreateBooking` invalidate theo tiền tố khóa. `invalidateQueries({ queryKey: ['bookings'] })` khớp theo tiền tố nên cũng làm mới `['bookings', id]` (commit `c8da627`, có test với `QueryClient` thật):

```ts
export function useCreateBooking(hotelId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBookingRequest) => createBooking(hotelId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['bookings'] }),
  });
}
```

2. Trang kết quả thanh toán [PaymentResultPage.tsx](../frontend/src/pages/PaymentResultPage.tsx) được sửa để xử lý đúng các trường hợp trước đây rơi vào nhánh cuối "Đang xử lý…" (commit `fddcf64`). Logic quyết định là hàm thuần `resolvePaymentResult` trong [features/payments/result.ts](../frontend/src/features/payments/result.ts):
   - **Không có `bookingId`** (`status=unknown`, chữ ký sai): query bị tắt nên trước đây kẹt mãi. Nay hiện "Chưa xác định được kết quả thanh toán" kèm link tới "Đặt phòng của tôi" và hỗ trợ, không khẳng định thành công hay thất bại.
   - **Đơn `Đã hủy` nhưng payment `Thành công`** (đơn hết hạn khi đang thanh toán, backend tự hoàn 100%): trước đây kẹt vì `isConfirmed` và `isFailed` đều sai. Nay hiện "Đơn đặt phòng không được xác nhận" cùng trạng thái hoàn tiền thật: đã hoàn đầy đủ, hoàn một phần (kèm số tiền), đang xử lý, thất bại (trỏ tới nút "Thử lại" trong chi tiết đơn), hoặc chưa ghi nhận (kèm mã đơn).
   - **Request lỗi** (403, 404, mạng): hiện lỗi kèm nút "Thử lại" thay vì "Đang xử lý".

**Vì sao không dùng polling / invalidate khi trạng thái cuối (đề xuất ban đầu)**

- Backend `vnpayReturn` gọi `handleCallback` và chỉ redirect sau khi transaction hoàn tất. Khi `/payment/result?status=success&bookingId=…` mở, DB đã ở trạng thái cuối. Không có kịch bản trạng thái thay đổi sau đó để polling bắt được.
- Các kịch bản "Đang xử lý…" thực tế (không có `bookingId`; payment `Chờ xử lý` do sai số tiền; đơn hết hạn nhưng đã thu tiền) đều không tự thay đổi theo thời gian, nên polling không giúp mà chỉ che lỗi.
- Chuyển sang cổng VNPAY là tải lại toàn trang, cache bị xóa, nên cũng không có "chi tiết đơn bị cũ" để invalidate. `refetchOnMount: 'always'` cho `useBookingDetail` vì vậy cũng không được thêm.

**Còn tồn đọng**

- Không còn tồn đọng. Đơn `Hoàn tất` đã thanh toán được coi là thành công, và trang hiển thị `MaXacNhanDatPhong` thay vì `MaDatPhong` (commit `ff75d1c`, xem 6.6, 6.7).

### 1.2. Đăng xuất / hết phiên không xóa cache dữ liệu người dùng — P0 — ĐÃ XỬ LÝ

**Hiện trạng ban đầu**

- `useLogout` chỉ `removeQueries` cho `me` và `owner`. Các khóa `bookings`, `support`, `admin`, `payment-status`… vẫn còn.
- `expireSession` ([authStore.ts](../frontend/src/lib/authStore.ts)) chỉ xóa token, không xóa cache.
- Nếu tài khoản B đăng nhập trên cùng tab sau tài khoản A, dữ liệu cache của A hiển thị được đến 5 phút. **Đã xác nhận bằng test** (logout, đăng nhập, hết phiên).

**Đã làm** (commit `7bd88d4`, sau đó điều chỉnh ở `3f97ce6`)

Giải pháp đầu tiên dùng `queryClient.clear()` (xóa toàn bộ). Sau đó đổi sang `clearUserCache` ([lib/queryClient.ts](../frontend/src/lib/queryClient.ts)) vì `clear()` cũng xóa cache dữ liệu công khai (danh sách khách sạn, địa điểm, tiện nghi) mà không cần thiết:

- `clearUserCache` gọi `removeQueries({ predicate })` xóa mọi query **trừ** nhóm công khai `hotels`, `locations`, `amenities`, `health`, và xóa mutation cache (nơi còn giữ dữ liệu như thông tin đăng nhập vừa gửi).
- Các endpoint của nhóm công khai không qua `authenticate` (đã kiểm tra `hotels.routes.ts`, `locations.routes.ts`, `amenities.routes.ts`, `health.routes.ts`), dữ liệu giống nhau cho mọi người.
- Đây là **danh sách cho phép** giữ lại, không phải danh sách cấm. Một query mới chưa được khai báo sẽ bị xóa như dữ liệu riêng tư, nên quên đăng ký không thể làm lộ dữ liệu cho người dùng sau. Khi thêm một query công khai mới, cần thêm khóa gốc vào `PUBLIC_QUERY_ROOTS`.
- Điểm gọi: `useLogout` (`onSettled`), `useLogin` (`onSuccess`, trước khi `setQueryData(meQueryKey, …)`), và `apiClient` ngay trước `expireSession()`. `authStore` không import ngược query layer.

**Đã làm thêm**: `useRegister` cũng gọi `clearUserCache` (commit `441bf11`).

### 1.3. Tab lọc "Đặt phòng của tôi" map sai trạng thái — P0 — ĐÃ XỬ LÝ

**Hiện trạng ban đầu**

`getStatusFilterTag` trong [BookingsPage.tsx](../frontend/src/pages/BookingsPage.tsx) xếp `Đã xác nhận`, `Thành công`, `Hoàn tất` vào tab "Hoàn tất". Hậu quả: đơn đã xác nhận nhưng chưa lưu trú xong bị coi là "Hoàn tất" và hiện nút "Đánh giá", trong khi backend chỉ chuyển `Đã xác nhận` sang `Hoàn tất` sau ngày trả phòng (`booking-completion.ts`) và chỉ cho đánh giá khi `Hoàn tất`. Backend định nghĩa 4 trạng thái đặt phòng: `Chờ thanh toán`, `Đã xác nhận`, `Đã hủy`, `Hoàn tất`; `Thành công` là của thanh toán. **Đã xác nhận bằng test.**

**Đã làm** (commit `9249e6f`)

- [features/bookings/status.ts](../frontend/src/features/bookings/status.ts) có `BOOKING_STATUS`, `CANCELLABLE_BOOKING_STATUSES`, `canReviewBooking`, `BOOKING_TABS`, `getBookingTab`, `matchesBookingTab` (hàm thuần, có test).
- `BookingsPage` chia tab theo đúng trạng thái backend: Tất cả, Chờ thanh toán, **Đã xác nhận** (thay cho "Sắp tới"), Hoàn tất, Đã hủy. Trạng thái lạ (chuỗi "mở") chỉ hiện ở "Tất cả" với nhãn gốc.
- Nút "Đánh giá" chỉ hiện khi `canReviewBooking(TrangThai)`.
- `BookingDetailPage` và `ReviewSection` dùng hằng số/hàm chung.

**Còn tồn đọng**

- Một số nơi vẫn so sánh chuỗi trạng thái trực tiếp: `OwnerBookingsPage`, `OwnerBookingDetailPage`, `StatusBadge`, `bookingStatusBadgeClass`. Nút "Đánh giá" đã dẫn tới `ReviewSection` (xem 1.4).

### 1.4. Hai luồng đặt phòng song song, một luồng là code chết — P1 — ĐÃ XỬ LÝ

**Hiện trạng ban đầu**

- Luồng thật: `HotelDetailPage` → tạo booking → `/bookings/:id` → "Thanh toán ngay".
- Luồng cũ: `/booking/:id/room` → `/confirm` → `/payment` và `/payment/:id` trong `EcodeFlowPages.tsx`. Không có link nội bộ nào trỏ tới (đã grep).
- Hai UI đánh giá: `WriteReviewPage` (chỉ điểm và nội dung) và `ReviewSection` (đủ ảnh, trạng thái). Nút "Đánh giá" ở danh sách dẫn tới bản yếu hơn.

**Đã làm** (commit `db35e15`)

- Xóa `EcodeFlowPages.tsx` (`BookingRoomPage`, `BookingConfirmPage`, `PaymentPage`, `WriteReviewPage`), component `BookingSummary` chỉ các trang đó dùng, và CSS `.operation-page`, `.booking-flow-layout`, `.booking-context-summary`.
- **URL cũ vẫn chạy dưới dạng redirect** (bảng `ROUTE_ALIASES`): `/booking/:id/{room,confirm,payment}` và `/payment/:id` về `/bookings/:id`; `/write-review/:id` về `/bookings/:id#danh-gia`. Lý do: tài liệu `docs/uiux/part-2-booking-route-map.md` yêu cầu kiểm tra link ngoài trước khi bỏ route, và link người dùng đã lưu không kiểm tra được.
- Nút "Đánh giá" ở danh sách dẫn tới `/bookings/:id#danh-gia`, dùng `ReviewSection` đầy đủ. `ReviewSection` có `id="danh-gia"`. Vì mục này chỉ tồn tại sau khi đơn tải xong, `BookingDetailPage` tự gọi `scrollIntoView()` khi đơn đã có dữ liệu và URL có `#danh-gia`. `NavigationEffects` không kéo về đầu trang khi URL có `#anchor` (trước đây luôn `scrollTo(0, 0)` và sẽ ghi đè việc cuộn tới neo).
- Có test cho redirect, cuộn tới neo và `NavigationEffects`.

**Còn tồn đọng**

- `docs/uiux/part-2-booking-route-map.md` mô tả các trang này là "TRANSITIONAL/KEEP"; đã thêm ghi chú cập nhật ở đầu tài liệu đó.
- `StayContext`, `PriceDisplay`, `HotelIdentity` không còn nơi nào dùng. Chúng là component dùng chung nên được giữ lại; có thể dọn ở giai đoạn cấu trúc (mục 2.3).
- Bước "xác nhận trước khi tạo đơn" (nếu sản phẩm cần) chưa có; nếu làm thì đặt **trước** `createBooking`, không thêm trang sau khi đơn đã tồn tại.

### 1.5. Thiếu hạn giữ chỗ và banner "thành công" gây hiểu nhầm — P1 — ĐÃ XỬ LÝ

**Đã làm** (backend `4b032ee`, frontend `68c013d`; backend chỉ được sửa ở đúng mục này)

- **Backend**: `GET /bookings/:id` và phản hồi tạo đơn có thêm `HanThanhToan` (thời điểm hết hạn, ISO) và `SoGiayConLai` (giây còn lại tính theo đồng hồ **máy chủ**, làm tròn lên, không âm) khi đơn ở `Chờ thanh toán`; các trạng thái khác trả `null`. Hạn tính bằng cùng công thức với việc tự hủy (`paymentDeadlineOf` trong `booking-expiry.ts`), nên giao diện và cron không thể lệch nhau. Có test cho hàm thuần và cho cả hai endpoint, và mô tả OpenAPI được cập nhật.
- **Frontend**: dùng `SoGiayConLai` (không so `Date.now()` với `HanThanhToan`, để đồng hồ máy khách lệch không làm đếm sai) trong hook `useCountdown` (mốc bắt đầu là `dataUpdatedAt` của query, dọn `setInterval` khi unmount, gọi `onEnd` một lần). Hết giờ thì tải lại đơn (`refetch`) để lấy trạng thái thật. Component `PaymentHoldNotice` hiển thị "Vui lòng thanh toán trước hh:mm" cùng đồng hồ đếm ngược, thay cho banner "Đặt phòng thành công!" (không còn phụ thuộc `location.state`, nên F5 không làm mất).

**Hiện trạng ban đầu**

- Backend tự hủy đơn "Chờ thanh toán" quá `PAYMENT_TIMEOUT_MINUTES` ([booking-expiry.ts](../backend/src/modules/bookings/booking-expiry.ts)), tính từ `NgayTao`. Frontend không hiển thị hạn thanh toán và không giải thích vì sao đơn tự chuyển "Đã hủy".
- Banner "Đặt phòng thành công!" ([BookingDetailPage.tsx:68](../frontend/src/pages/BookingDetailPage.tsx#L68)) phụ thuộc `location.state`. State này mất khi F5 và thông điệp dễ gây hiểu nhầm vì đơn chưa thanh toán.

**Đề xuất**

- Frontend hiện **không biết** giá trị timeout. Cần backend trả thêm một trường hạn thanh toán (ví dụ thời điểm hết hạn tính sẵn) trong `GET /bookings/:id`. Đây là thay đổi API cần thống nhất với backend, không nên hardcode số phút ở frontend.
- Khi có trường đó, hiển thị đếm ngược bằng `setInterval` hoặc so sánh với `Date.now()` (nhớ `clearInterval` trong cleanup của `useEffect`). Hết hạn thì `invalidateQueries` để lấy trạng thái thật.
- Đổi nội dung banner thành thông điệp theo trạng thái thật của đơn: "Đơn đã được tạo, vui lòng thanh toán trước hh:mm". Có thể hiển thị dựa trên `booking.TrangThai === 'Chờ thanh toán'` thay vì `location.state`, để F5 không làm mất.

### 1.6. Điều hướng khi sai quyền / đã đăng nhập không có phản hồi — P2 — ĐÃ XỬ LÝ

**Hiện trạng ban đầu**

- `ProtectedRoute`: sai vai trò thì `<Navigate to="/" replace />` mà không báo lý do.
- `/login`, `/register`, `/forgot-password` không chuyển hướng khi người dùng đã đăng nhập.

**Đã làm** (commit `5a8ba04`)

- **`GuestOnlyRoute`** ([components/auth/GuestOnlyRoute.tsx](../frontend/src/components/auth/GuestOnlyRoute.tsx)) bọc `/login`, `/register`, `/forgot-password`. Người dùng đã có phiên được chuyển về trang theo vai trò (`ROLE_HOME` trong `lib/roles.ts`, chuyển từ `LoginPage`). Chờ `isBootstrapping === false` trước khi quyết định. `/reset-password` cố ý không đưa vào vì link từ email có thể mở khi đang đăng nhập.
- **Chỉ chuyển hướng với phiên có trước khi form hiện ra.** Bản đơn giản "có token thì redirect" xung đột với `RegisterPage` (sau khi đăng ký tự `navigate('/partner/apply')`) và `LoginPage` (tự quay về `returnTo`), vì token được lưu ngay khi form thành công, trước lệnh `navigate` của trang. Test chứng minh xung đột này với bản đơn giản. Bản chốt ghi nhớ ("latch") việc form đã hiện với trạng thái chưa đăng nhập bằng `useState` (cập nhật trong lúc render, đúng mẫu React cho state dẫn xuất) và không redirect với token xuất hiện sau đó.
- **`ProtectedRoute`**: sai vai trò vẫn về `/` nhưng hiện toast "Bạn không có quyền truy cập trang này" qua `useToast()`, đúng một lần kể cả trong StrictMode (dùng `useRef` chống chạy effect hai lần). Không thêm trang 403.
- Có test cho cả hai guard, gồm trường hợp đang bootstrapping.

**Còn tồn đọng**

- Chưa có trang 403 riêng (chủ ý, để giai đoạn sau nếu cần).
- Luồng đăng ký, đăng nhập và redirect của guard đã được chạy lại trên trình duyệt thật, đúng như test.

---

## 2. Cấu trúc code bất hợp lý

### 2.1. Route trùng lặp và route alias — P1 — ĐÃ XỬ LÝ

**Hiện trạng ban đầu**

Cùng một component có nhiều URL: `/` và `/home`; `/hotels` và `/search-results`; `/hotels/:id` và `/hotel-detail/:id`; `/profile` và `/account-profile`; `/bookings` và `/my-bookings`; `/bookings/:id` và `/booking-detail/:id`; `/partner/apply` và `/register-partner`; `/payment/result` và `/payment-result`; `/support` và `/support-request`; `/admin/onboarding` và `/admin/operations` (cùng trang với `/admin/partner-applications` và `/admin`). Menu đánh dấu "active" theo `location.pathname === link.to` sẽ sai với URL alias. Các dòng `lazy()` và `<Route>` ở khu vực admin bị dồn trên một dòng.

**Đã làm** (commit `9d834e4`, mở rộng ở `db35e15`)

- [routes/aliases.tsx](../frontend/src/routes/aliases.tsx): bảng `ROUTE_ALIASES` (cặp `[từ, đến]`) và `aliasRoutes()` sinh mỗi alias một `<Route>`. Component `RedirectAlias` ([routes/RedirectAlias.tsx](../frontend/src/routes/RedirectAlias.tsx)) dùng `<Navigate replace>`, **giữ nguyên query string** (bộ lọc tìm kiếm, tham số callback VNPAY), điền tham số `:id` từ URL và giữ hash (trừ khi đích có hash riêng).
- `AppRoutes` không còn route trùng, chỉ gọi `{aliasRoutes()}` một lần trước route `*`. Các dòng bị dồn được tách ra.
- Test kiểm tra từng alias, giữ query/hash, điền tham số, không có alias trỏ tới alias khác, và route tĩnh `/payment/result` vẫn thắng alias động `/payment/:id`.
- Các alias không bị xóa hẳn vì lý do đã nêu ở mục 1.4.

**Đã làm thêm** (commit `5affc61`): route được tách thành `publicRoutes.tsx`, `customerRoutes.tsx`, `ownerRoutes.tsx`, `adminRoutes.tsx` (mỗi file là một fragment `<Route>`), `AppRoutes.tsx` chỉ ghép lại, thêm Suspense và trang 404. Test `routeTable.test.tsx` kiểm tra không có đường dẫn nào khai báo hai lần giữa các nhóm và guard của từng nhóm (đăng nhập, vai trò Chủ khách sạn, vai trò admin, khách).

**Còn tồn đọng**

- Khoảng 20 alias `/partner/*` và `/owner/hotels/:hotelId/*` của Owner vẫn nằm trong `OwnerRouteRedirects` (đã là `<Navigate>` từ trước), chưa gộp vào bảng chung.
- Khi thật sự chắc không còn link cũ, có thể xóa hẳn các dòng trong `ROUTE_ALIASES`.

### 2.2. `pages/` phẳng và file đa trang — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `da035ca`, `d0c736d`): `pages/` chia thành `auth/`, `public/`, `customer/`, `owner/`, `admin/` (đổi tên bằng `git mv` để giữ lịch sử). `OwnerModulesPage` tách thành `OwnerRoomTypesPage`, `OwnerInventoryPricingPage`, `OwnerRevenuePage`, `OwnerReportsPage` (hai trang cuối dùng chung `OwnerAnalyticsModule`) và hook `useScopedHotels`. Đã thêm Prettier 3 (`.prettierrc.json`, script `format`); **chỉ áp dụng cho file mới/đã sửa**, không format cả repo để không tạo diff khổng lồ che lịch sử. Việc tách được kiểm tra bằng so sánh ảnh chụp trước/sau: giao diện giữ nguyên.

**Hiện trạng ban đầu**

- 44 file trong [pages/](../frontend/src/pages/), phân nhóm bằng tiền tố (`Admin*`, `Owner*`).
- [OwnerModulesPage.tsx](../frontend/src/pages/OwnerModulesPage.tsx) chứa 4 trang; [EcodeFlowPages.tsx](../frontend/src/pages/EcodeFlowPages.tsx) chứa 4 trang; "Ecode" là tên cũ không còn ý nghĩa.
- Nhiều dòng JSX bị nén thành một dòng rất dài (OwnerModules, `DashboardTopbar`, `features/owner/hooks.ts`, `features/owner/api.ts`), khó đọc và khó review diff.

**Đề xuất**

- Nhóm theo khu vực: `pages/customer/`, `pages/owner/`, `pages/admin/`, `pages/auth/`. Mỗi trang một file. `OwnerModulesPage` tách thành `OwnerRoomTypesPage`, `OwnerInventoryPricingPage`, `OwnerRevenuePage`, `OwnerReportsPage` (hai trang cuối dùng chung `OwnerAnalyticsModule` để ở `features/owner/components`).
- Bật Prettier (hiện chỉ có ESLint và oxlint) để tự xuống dòng JSX và thống nhất định dạng. Đây là công cụ chuẩn của hệ sinh thái, không đổi hành vi code.
- Đổi tên file theo domain, không theo tên dự án cũ.

### 2.3. Ranh giới `features/` không nhất quán — P2 — ĐÃ XỬ LÝ MỘT PHẦN

**Đã làm** (commit `ca92baf`): xóa mã không còn dùng và thư mục giữ chỗ chỉ có `.gitkeep`. **Chưa làm**: quy ước chung cho `features/` và tách `api.ts` khách/admin (đổi đường dẫn import trên diện rộng, giá trị thấp so với rủi ro).

**Hiện trạng ban đầu**

- Admin accounts/hotels/payments nằm ở `features/admin/*`, nhưng reviews/support/promotions/partners (cũng có phần admin) nằm ở các thư mục top-level riêng.
- Một `api.ts` trộn API khách và admin (ví dụ [support/api.ts](../frontend/src/features/support/api.ts)).
- `features/owner` chứa cả hotels, room types, rates lẫn bookings.
- [types/auth.ts](../frontend/src/types/auth.ts) chứa cả type admin/partner (`PartnerApplication`, `AccountListQuery`).

**Đề xuất**

- Chọn một quy ước và áp dụng đều. Ví dụ theo domain (`bookings`, `support`, `reviews`…) và trong mỗi domain tách `api.customer.ts` / `api.admin.ts`; hoặc theo vai trò (`features/admin/*`, `features/owner/*`, `features/customer/*`).
- Đưa type về sát domain của chúng, chỉ để `types/api.ts` cho type dùng chung.
- Xóa thư mục rỗng chỉ có `.gitkeep`: `src/contexts`, `src/hooks` (nếu không dùng; hiện có `useDebouncedValue`, `useHealth` thì giữ), `src/utils`, `src/components`.

### 2.4. Khối UI lặp lại thay vì dùng chung — P1 — ĐÃ XỬ LÝ MỘT PHẦN

**Đã làm**: `Pagination` dùng chung cho các trang danh sách admin (`555cb68`); `PageSpinner` thay 33 spinner viết tay (`2d9c9e3`), `QueryState` không còn nơi dùng nên bị xóa (`b8430ad`); `OwnerScopeGate` gom khối "chọn khách sạn / chưa có khách sạn" ở đầu các trang module của Owner (`370b569`). **Chưa làm**: `DataTable` dùng chung (bảng mỗi trang khác cột và hành vi, gom lúc này dễ làm hỏng hiển thị).

**Hiện trạng ban đầu**

- Markup spinner tự viết lại ở khoảng 30 trang, dù đã có `LoadingState`, `ErrorState`, `EmptyState`, `QueryState` trong [QueryState.tsx](../frontend/src/components/common/QueryState.tsx). Chỉ `EcodeFlowPages` dùng.
- Bảng, bộ lọc, phân trang của admin (Accounts, Hotels, Payments, Promotions, Reviews, Support) và Owner Bookings viết riêng từng trang; chưa có `DataTable`/`Pagination` dùng chung.
- `OwnerHotelContextSelector` và `OwnerHotelScopeState` được lặp ở mọi module Owner ([OwnerModulesPage.tsx](../frontend/src/pages/OwnerModulesPage.tsx) và các trang Owner khác), kèm khối điều kiện "chọn khách sạn" copy nhiều lần.

**Đề xuất**

- Chuyển các trang sang `<QueryState loading error empty>` và bỏ markup spinner thủ công. Không cần thư viện mới.
- Tạo `Pagination` và (nếu cần) `DataTable` trong `components/common`, dùng thẻ `<table>` với `<caption>` hoặc `aria-label` và `<th scope="col">` theo chuẩn HTML.
- Owner: tạo `OwnerLayout` (route cha dùng `<Outlet context={…}>` hoặc React Context) chứa bộ chọn khách sạn và trạng thái phạm vi một lần; các trang con đọc bằng `useOutletContext()`. Có thể đặt bộ chọn ở topbar dashboard để khớp với mô hình "hotel scope" trong sidebar.

### 2.5. Bootstrap auth trùng logic refresh — P2 — ĐÃ XỬ LÝ

**Đã làm** (commit `9f07312`): `useAuthBootstrap` gọi `refreshSession()` của `apiClient` (dùng chung promise đang chạy) và `finishBootstrap()` trong `finally`.

**Hiện trạng**

[useAuthBootstrap.ts](../frontend/src/features/auth/useAuthBootstrap.ts) tự `fetch('/auth/refresh')`, trong khi [apiClient.ts](../frontend/src/services/apiClient.ts) đã có `refreshAccessToken` (chia sẻ một promise đang chạy) và `refreshSession`.

**Đề xuất**

- Bootstrap gọi `refreshSession()` từ `apiClient` để chỉ có một nơi biết endpoint refresh và cách xử lý lỗi. `refreshSession` đã dùng chung promise nên tránh hai lần refresh chạy đồng thời (quan trọng nếu refresh token xoay vòng).
- `useAuthStore.setAccessToken` đã được `refreshSession` gọi; bootstrap chỉ cần gọi `finishBootstrap()` trong `finally`.

### 2.6. Test còn mỏng ở luồng quan trọng — P1

**Hiện trạng ban đầu**: chỉ có 5 file test (search bar, interaction, owner context, owner redirects). Luồng đặt phòng, thanh toán, lọc booking, auth chưa có test.

**Cập nhật**: mỗi lỗi/tính năng ở các mục trên đều có test đi kèm, hiện 45 file / 294 test (dùng Vitest và Testing Library, `QueryClient` thật thay vì mock từng hàm). Chưa dùng MSW.

**Đề xuất**

- Dùng đúng bộ đã cài (Vitest, Testing Library, `user-event`). Ưu tiên: (a) test hàm map trạng thái booking (thuần, dễ), (b) test `useCreateBooking` invalidate `['bookings']` bằng `QueryClient` thật, (c) test `PaymentResultPage` polling bằng fake timers, (d) test `ProtectedRoute`/guard theo vai trò.
- Cân nhắc dùng MSW để giả lập API thay vì mock từng hàm.

---

## 3. Bố cục và giao diện chưa ổn

### 3.1. Bốn hệ container khác nhau — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `f74b497`): một class `.page-container` duy nhất, `width: min(100% - 2 * var(--gutter), var(--container-max))` với `--container-max: 1280px` và `--gutter` 16/24/32px theo breakpoint; dùng cho header, footer và mọi trang. Đo trên 4 cỡ màn hình: mỗi cỡ chỉ còn một lề trái (desktop 80, tablet 24, mobile 16, màn rộng 320px). Lưu ý: bề rộng nội dung đổi nhẹ so với trước (các giá trị cũ là 1536/1440/1280/1200) vì phải chọn một số duy nhất.

**Hiện trạng ban đầu**

- `.container` và `.site-header__inner`: `width: 80%` + `max-width: var(--container-max)` (1536px) + padding 24px ([base.css](../frontend/src/assets/css/base.css), [layout.css](../frontend/src/assets/css/layout.css)).
- HotelDetail/HotelList: `max-w-[1440px] mx-auto px-6 lg:px-12`.
- Home: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- Profile: `max-w-[1200px]`.
- Trên màn rộng, lề trái/phải của header và nội dung lệch nhau.

**Đề xuất**

- Định nghĩa **một** container duy nhất. Với Tailwind 4 có thể tạo utility bằng `@utility container-page { … }` hoặc một class CSS dựa trên token, rồi dùng cho header, footer và mọi trang. Trong đó dùng `width: min(100% - 2rem, var(--container-max)); margin-inline: auto;` (kỹ thuật CSS chuẩn, không cần `80%` cộng thêm padding).
- Nếu trang cần bề rộng khác (form hẹp, admin rộng), khai báo qua biến thể (`container-page--narrow`) chứ không viết lại số ở từng trang.

### 3.2. `<main>` lồng nhau và layout "đánh nhau" với trang — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `8dffb42`): trang trong `pages/` dùng `<div>`/`<section>`; chỉ `MainLayout` giữ `<main>`. Bỏ các class `!max-w-full !px-0 !py-0` vô tác dụng. Thêm luật ESLint `no-restricted-syntax` chặn `<main>` trong `src/pages/**/*.tsx` để không tái phát. Đo trên 57 lượt trang: mỗi trang đúng một `<main>`. Việc bỏ padding xung đột làm đổi Login và HotelDetail; đã được phát hiện bằng so sánh ảnh và chỉnh lại để giữ nguyên hiển thị.

**Hiện trạng ban đầu**

- [MainLayout.tsx](../frontend/src/components/layouts/MainLayout.tsx) đã render `<main id="main-content">`, nhưng khoảng 10 trang lại render `<main>` (HotelList, HotelDetail, Register, Forgot/Reset, Profile, PaymentResult, OwnerModules, OwnerBookingDetail, PartnerApply) và `AppErrorBoundary`.
- Nhiều trang phải chèn `!max-w-full !px-0 !py-0` (từ khóa `!important` của Tailwind) để triệt tiêu padding của layout cha.

**Cơ sở chuẩn**: đặc tả HTML quy định một trang chỉ có một phần tử `<main>` hiển thị (không lồng). Landmark trùng lặp làm nhiễu điều hướng bằng trình đọc màn hình.

**Đề xuất**

- Trong `pages/`, thay `<main>` bằng `<div>` hoặc `<section>` (có `aria-labelledby` nếu cần). Chỉ giữ `<main>` ở layout (và `AppErrorBoundary`, vì đó nằm ngoài layout).
- Thống nhất: layout **không** áp padding/max-width cho nội dung; mỗi trang tự bọc bằng container ở 3.1. Khi đó bỏ được toàn bộ `!max-w-full !px-0 !py-0`.
- Trang toàn màn hình (Login, Register) có thể đặt ở một route layout riêng ("AuthLayout") thay vì bọc trong MainLayout rồi triệt tiêu nó.

### 3.3. HotelDetail trên mobile: không thấy tổng tiền và nút đặt — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `a06b9db`): thanh tóm tắt cố định ở đáy (`.hotel-mobile-bar`) hiện khi đã chọn phòng, có số phòng, tổng tiền và nút cuộn tới `#dat-phong`; dùng `env(safe-area-inset-bottom)` cùng `viewport-fit=cover` trong `index.html`; ẩn từ `lg:` trở lên; tự ẩn khi panel đặt phòng đang trong màn hình (`IntersectionObserver`).

**Hiện trạng ban đầu** ([HotelDetailPage.tsx](../frontend/src/pages/HotelDetailPage.tsx))

- Lưới `grid-cols-1 lg:grid-cols-12`. Ở màn nhỏ, cột "Chi tiết đặt phòng" nằm dưới Tổng quan và Tiện nghi. Chọn phòng xong người dùng không có phản hồi, phải cuộn hết trang mới thấy nút "Tạo đặt phòng".

**Đề xuất**

- Thêm thanh tóm tắt cố định ở đáy màn hình nhỏ (`position: fixed; bottom: 0`, `padding-bottom: env(safe-area-inset-bottom)` để tránh thanh điều hướng iOS), chỉ hiện khi có phòng được chọn: số phòng, tổng tiền, nút cuộn tới/mở panel đặt phòng.
- Panel đặt phòng đầy đủ có thể mở bằng `<dialog>` (đã dùng trong `FeedbackProvider`) hoặc bottom sheet ở mobile.
- Ẩn thanh này ở `lg:` trở lên (`lg:hidden`) vì đã có cột phải dính (`lg:sticky`).

### 3.4. HotelDetail: thứ tự hiển thị khác thứ tự DOM, tab không phản ánh vị trí — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `173c510`): DOM theo đúng thứ tự hiển thị (phòng, tổng quan, tiện nghi), bỏ `order-*`, menu tab cùng thứ tự. Hook `useActiveSection` (`IntersectionObserver`) đánh dấu tab theo vị trí cuộn với `aria-current="location"`; hai quy tắc bổ sung phát hiện được khi chạy trình duyệt thật: cuộn tới cuối trang thì chọn mục cuối, và bấm tab thì giữ mục đó cho tới khi cuộn xong. `sticky` dùng `top: var(--header-height)` thay cho giá trị cứng.

**Hiện trạng ban đầu**

- Các section dùng `order-1/2/3` ([dòng 240, 263, 295](../frontend/src/pages/HotelDetailPage.tsx#L240)) để đảo thứ tự: DOM là Tổng quan → Loại phòng → Tiện nghi, hiển thị là Loại phòng → Tổng quan → Tiện nghi. Menu tab liệt kê "Tổng quan" trước. Bàn phím và trình đọc màn hình theo DOM nên thứ tự không khớp mắt nhìn (WCAG 1.3.2 Meaningful Sequence và 2.4.3 Focus Order).
- Tab dính có `nav-tab active` cố định, không cập nhật theo vị trí cuộn.
- `top-[4.5rem]` (72px) cho sticky khác `--header-height: 68px`.

**Đề xuất**

- Sắp xếp DOM đúng thứ tự muốn hiển thị, bỏ `order-*`. Thứ tự của menu tab phải khớp thứ tự section.
- Cập nhật tab đang active bằng `IntersectionObserver` (API trình duyệt chuẩn) theo section đang trong viewport, hoặc dùng `aria-current="location"` theo section hiện tại. Dùng `scroll-margin-top` (đã dùng `scroll-mt-36`) theo `--header-height` cộng chiều cao thanh tab.
- Thay các giá trị cứng `4.5rem`, `top-28`, `top-40` bằng biến CSS (`top: var(--header-height)`, `calc(var(--header-height) + …)`).

### 3.5. Suspense đặt ngoài `<Routes>` — P2 — ĐÃ XÁC NHẬN: KHÔNG PHẢI LỖI

**Kết quả kiểm tra**: đo trên trình duyệt thật, không quan sát thấy navbar/sidebar bị thay bằng fallback khi mở trang `lazy()` lần đầu, nên không sửa. Phần dưới là mô tả ban đầu.

**Hiện trạng**: [AppRoutes.tsx:56](../frontend/src/routes/AppRoutes.tsx#L56) đặt `<Suspense>` bao quanh `<Routes>`, trong khi `MainLayout` nằm bên trong `<Routes>`. Khi một trang `lazy()` tải lần đầu và không nằm trong transition, fallback sẽ thay cả cây chứa navbar/sidebar.

**Đề xuất**: đặt `<Suspense>` quanh `<Outlet />` trong `MainLayout` (và layout dashboard), để navbar/sidebar giữ nguyên và chỉ vùng nội dung hiện fallback. Đây là cách dùng chuẩn của `React.lazy`. Chạy thử điều hướng lần đầu tới một trang lazy để xác nhận hiện tượng trước khi sửa.

### 3.6. Admin/Owner vào trang hồ sơ bị rơi khỏi khung dashboard — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `a2748aa`): thêm `/admin/profile`; `lib/roles.ts` có `PROFILE_PATH` và `profilePathFor(role)`, dùng ở `Navbar`, `DashboardNavigation` và `ProfilePage`; liên kết "Đặt phòng của tôi" chỉ hiện với khách. Chưa chuyển sang route layout của React Router (đề xuất thứ hai bên dưới): khung dashboard vẫn suy ra từ đường dẫn, vì hồ sơ đã có route dưới `/admin` và `/owner` nên điều kiện đó không còn sai.

**Hiện trạng**

- [MainLayout.tsx:11](../frontend/src/components/layouts/MainLayout.tsx#L11): khung dashboard chỉ bật khi vai trò khớp **và** `pathname` bắt đầu bằng `/admin` hoặc `/owner|/partner`.
- Topbar admin trỏ tới `/profile` ([DashboardNavigation.tsx:106](../frontend/src/components/layouts/DashboardNavigation.tsx#L106)); tại đó hiện Navbar khách. Chủ khách sạn có `/owner/profile`, nhưng dropdown ở `Navbar` vẫn trỏ `/profile`.

**Đề xuất**

- Tạo route `/admin/profile` dùng chung `ProfilePage` trong nhánh admin, như đã làm với `/owner/profile`.
- Thay vì suy ra layout bằng `pathname` + vai trò trong một component, dùng **route layout** của React Router: nhánh `/admin/*` bọc `DashboardLayout`, nhánh công khai bọc `PublicLayout`. Khi đó việc chọn layout nằm trong cây route (khai báo), không cần `if` theo đường dẫn.
- Menu dropdown ở Navbar nên trỏ hồ sơ theo vai trò (dùng cùng bảng `profilePath`).

### 3.7. Trang tổng quan Owner/Admin chưa mang tính tổng quan — P2 — CHƯA LÀM

**Lý do chưa làm**: cần quyết định sản phẩm về chỉ số nào cần hiển thị.

**Hiện trạng**

- [OwnerDashboardPage.tsx](../frontend/src/pages/OwnerDashboardPage.tsx) `mode="overview"` chỉ đếm số khách sạn theo 3 trạng thái, và dùng chung component với `mode="hotels"`.
- [AdminDashboardPage.tsx](../frontend/src/pages/AdminDashboardPage.tsx) chỉ là danh sách link; `/admin/operations` là alias của cùng trang.

**Đề xuất**

- Tách `OwnerOverviewPage` và `OwnerHotelsPage` (hiện chỉ khác bằng cờ `mode`).
- Bổ sung chỉ số từ API đã có: backend đã có `owner-analytics` và `admin-analytics` ([analytics/hooks.ts](../frontend/src/features/analytics/hooks.ts) đã có hook). Hiển thị đơn cần xử lý, doanh thu kỳ hiện tại, số hồ sơ chờ duyệt, số yêu cầu hỗ trợ mở. Chỉ hiển thị số liệu API thực sự trả về, không dựng số giả.

### 3.8. Quỹ phòng và giá của Owner: ghi đè cả khoảng ngày — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `491c7f6`): checkbox chọn thứ trong tuần (`features/owner/rate-range.ts`: `WEEKDAYS`, `countDays`, `buildRatePayload`, có test), hộp xác nhận `useConfirm` "Ghi đè giá và quỹ phòng?" nêu số ngày và loại phòng, toast khi lưu xong. Vẫn dùng `bulkUpsertRates` hiện có, không thêm API. Chưa có sửa từng dòng trong bảng.

**Hiện trạng**: [OwnerModulesPage.tsx](../frontend/src/pages/OwnerModulesPage.tsx) (`OwnerInventoryPricingPage`) hiển thị bảng chỉ đọc; form bên dưới gửi cùng một giá, số lượng, trạng thái cho **mọi ngày** trong khoảng đã chọn. Dễ ghi đè nhầm dữ liệu từng ngày đã thiết lập.

**Đề xuất**

- Trước khi gửi, hiển thị bước xác nhận bằng `useConfirm()` (đã có) nêu rõ số ngày và loại phòng bị ghi đè.
- Cho phép chọn ngày trong tuần (T2–CN) áp dụng, và/hoặc sửa từng dòng trong bảng. Cả hai đều dùng `bulkUpsertRates` hiện có, chỉ khác dữ liệu gửi đi, không cần API mới.
- Hiển thị kết quả sau khi lưu (toast) và làm mới bảng (hook đã `invalidateQueries` cho khóa rates).

---

## 4. UI giả (có nút nhưng không có chức năng) — ĐÃ XỬ LÝ

**Hiện trạng ban đầu và cách xử lý** (commit `f834a03` và `36ca0da`):

| Vị trí | Vấn đề ban đầu | Đã làm |
| --- | --- | --- |
| `HotelDetailPage`, "Chia sẻ" | Không có `onClick` | Hoạt động thật qua [lib/share.ts](../frontend/src/lib/share.ts): dùng `navigator.share` khi có, không thì `navigator.clipboard.writeText` và toast "Đã sao chép liên kết". Nếu người dùng đóng khung chia sẻ thì không báo gì; nếu không dùng được cả hai (ví dụ nguồn không an toàn) thì báo lỗi và hướng dẫn sao chép từ thanh địa chỉ. |
| `HotelDetailPage`, "Lưu" | Không có `onClick`, chưa có API yêu thích | **Bỏ nút.** |
| `HotelDetailPage`, ảnh và "Xem tất cả N ảnh" | Không có `onClick`; ảnh có `cursor-pointer` | Ảnh là `<button>` thật, mở [HotelGalleryDialog](../frontend/src/components/hotels/HotelGalleryDialog.tsx) dùng thẻ `<dialog>` native với `showModal()` (khóa focus, Esc để đóng, nền bị vô hiệu do trình duyệt lo). Cuộn tới ảnh được chọn. Bỏ nút lồng trong nút. |
| `BookingDetailPage`, "Xem trên bản đồ" | `<p>` có `cursor-pointer`, không hành vi | Đổi thành link "Xem thông tin khách sạn" tới `/hotels/:MaKhachSan`. **Không dựng được link bản đồ**: API chi tiết đơn chỉ trả `MaKhachSan` và tên khách sạn, không có địa chỉ, nên URL tìm kiếm Google Maps chỉ dựa vào tên sẽ không chính xác. Muốn có bản đồ thật thì backend cần trả thêm địa chỉ. |
| `BookingsPage` và `BookingDetailPage`, ảnh khách sạn | Chỉ là ô icon giữ chỗ | **Bỏ ô giữ chỗ**: API không trả ảnh. Muốn hiển thị ảnh thì backend cần trả thêm. |
| `DashboardTopbar`, ô "Tìm kiếm" và chuông thông báo (chấm đỏ) | Không làm gì | **Bỏ cả hai** và CSS đi kèm; chưa có API tìm kiếm hay thông báo. |
| Footer | Hầu hết link trỏ `/`, social `href="#"`, năm 2024 | Bỏ cột "Về Egode" và các link chưa có trang (Tuyển dụng, Báo chí, Blog, Chính sách bảo mật, Điều khoản, Liên hệ, Giải pháp doanh nghiệp), bỏ link mạng xã hội. Chỉ giữ link tới trang thật (`/support`, `/partner/apply`, `/login`); lưới còn 3 cột. Năm bản quyền lấy từ `new Date().getFullYear()`. |

**Còn tồn đọng**

- Khi backend có API yêu thích, thông báo, tìm kiếm trong dashboard, địa chỉ và ảnh trong danh sách đặt phòng, các tính năng trên có thể được thêm lại.
- Cần có các trang thật (chính sách bảo mật, điều khoản, giới thiệu) và tài khoản mạng xã hội thật thì mới nên thêm lại link vào footer.
- Nhãn "Đăng nhập Partner" ở footer được giữ nguyên (không thuộc phạm vi).
- **Cần kiểm tra trên trình duyệt:** thư viện ảnh (`showModal`, Esc, cuộn tới ảnh), nút chia sẻ (cần HTTPS hoặc localhost), cuộn tới `#danh-gia`, bố cục footer 3 cột và topbar dashboard sau khi bỏ ô tìm kiếm.

## 5. Hệ thống style và thư viện

### 5.1. Ba cách style cùng tồn tại; token bị bỏ qua — P1 — CHƯA LÀM

**Lý do chưa làm**: phạm vi rất lớn (khoảng 1000 chỗ dùng màu thô) và dễ đổi hình ảnh; nên làm theo từng trang, mỗi bước có ảnh chụp trước/sau.

**Hiện trạng**

- Class Tailwind, CSS viết tay (`.btn`, `.card`, `owner-module__*`, `hotel-card-v2`) và component `<Button>`. `<Button>` ở 8 file, `.btn` ở 14 file, form dùng `Input`/`Textarea` ở một số nơi và `<input>` + chuỗi class dài ở nơi khác ([LoginPage.tsx](../frontend/src/pages/LoginPage.tsx)).
- [variables.css](../frontend/src/assets/css/variables.css) có bộ token ngữ nghĩa và [index.css](../frontend/src/index.css) ánh xạ vào `@theme`, nhưng code vẫn dùng khoảng 1065 lần màu Tailwind thô (`slate/red/emerald/amber/blue-*`) so với khoảng 690 lần dùng token (`text-ink`, `bg-surface-*`, `border-border`…). Thống kê này ước lượng bằng grep, dùng để thấy xu hướng.
- [booking-flow.css](../frontend/src/assets/css/booking-flow.css) "vá" giao diện bằng selector theo class Tailwind (`.booking-flow .bg-white.rounded-2xl`, `.booking-flow .shadow-md`…). Cách này dễ vỡ khi đổi class và làm hành vi utility phụ thuộc vào ngữ cảnh.

**Đề xuất**

- Chọn Tailwind 4 + `@theme` làm nguồn duy nhất. Các token màu trạng thái (success, warning, danger, info) đã có trong `@theme`; thay dần `text-red-700`, `bg-red-50`… bằng `text-danger`, `bg-danger-light`. Có thể thêm quy tắc ESLint (`no-restricted-syntax` hoặc plugin Tailwind) để chặn màu thô mới.
- Các khối lặp (thông báo lỗi, thẻ, ô nhập) đưa vào component dùng chung có sẵn: `Alert`, `Input`, `Select`, `Textarea`, `Button` ([components/common](../frontend/src/components/common/)) thay cho chuỗi class dài. Quản lý biến thể bằng một hàm (đã có `cn` = `clsx` + `tailwind-merge`; có thể thêm `class-variance-authority` là thư viện chuẩn cho việc này).
- Thay `booking-flow.css` bằng chỉnh sửa trực tiếp ở component/token. Xóa dần từng khối và kiểm tra trực quan sau mỗi bước.
- Lộ trình chuyển đổi nên theo trang, không đổi một lượt, vì phạm vi lớn.

### 5.2. Hai bộ icon, một bộ nạp từ CDN bằng `<script>` — P1 — ĐÃ XỬ LÝ MỘT PHẦN

**Đã làm** (commit `ef4b2c9`): gỡ `<script>` từ unpkg; cài `@phosphor-icons/web@2.1.2` (pin phiên bản) và import các kiểu `regular`, `fill`, `bold`, `duotone` trong `main.tsx`. Class `ph ph-*` giữ nguyên nên không phải sửa 43 file, và không còn phụ thuộc CDN lúc chạy. **Chưa làm**: gộp về một bộ icon (Phosphor và `lucide-react` vẫn cùng tồn tại) và tree-shaking.

**Hiện trạng**

- [index.html:10](../frontend/index.html#L10): `<script src="https://unpkg.com/@phosphor-icons/web"></script>` (không pin phiên bản, không SRI, script đồng bộ trong `<head>`), dùng ở khoảng 43 file qua class `ph ph-*`.
- `lucide-react` dùng ở khoảng 6 file (npm).
- Hệ quả: chặn render nhẹ, phụ thuộc CDN bên ngoài lúc chạy (mất icon khi CDN lỗi/offline), không tree-shake, không kiểm soát phiên bản.

**Đề xuất**

- Dùng một bộ icon cài bằng npm. Vì `lucide-react` đã có và được tree-shake, chuyển dần các `<i className="ph …">` sang component `lucide-react` tương ứng. Nếu muốn giữ bộ Phosphor, dùng gói `@phosphor-icons/react` (component React, có tree-shaking).
- Tối thiểu: nếu tạm giữ script CDN, pin phiên bản cụ thể và thêm `integrity` + `crossorigin="anonymous"` (SRI), và cân nhắc `defer`.
- Icon thuần trang trí cần `aria-hidden="true"`; icon là nút cần `aria-label` (nhiều chỗ đã làm, cần thống nhất).

### 5.3. Ngày hiển thị dạng ISO thô — P1 — ĐÃ XỬ LÝ

**Đã làm** (commit `15cb110`): `formatDateTimeVi` xuất `dd/mm/yyyy` kèm giờ, thêm `formatDateRangeVi`, `formatCountdown`; các trang Home, HotelList, HotelDetail, Bookings, BookingDetail và các trang khác dùng chúng, có test.

**Hiện trạng**: Home ("2026-10-01 → 2026-10-02"), HotelList chips, HotelDetail, BookingsPage (`NgayNhanPhong`), BookingDetail hiển thị chuỗi từ API. [lib/utils.ts](../frontend/src/lib/utils.ts) đã có `formatDateVi` và `formatDateTimeVi`, nhưng chỉ `StayContext` dùng. Còn khoảng 30 chỗ gọi `toLocale*String` rải rác.

**Đề xuất**

- Dùng `formatDateVi`/`formatDateTimeVi` cho mọi nơi hiển thị. `formatDateVi` đã xử lý đúng chuỗi `YYYY-MM-DD` (tránh lệch múi giờ do parse UTC).
- Thay các `toLocale*String` rải rác bằng các hàm này để có một định dạng và một nơi sửa.
- Ô `<input type="date">` vẫn dùng `YYYY-MM-DD` (theo chuẩn HTML).

### 5.4. Mặc định số khách không thống nhất — P2 — ĐÃ XỬ LÝ

**Đã làm** (commit `12f4695`): mặc định 2 khách ở mọi trang (`DEFAULT_GUESTS`, `parseGuests`). Đây là quyết định sản phẩm nhỏ: trước đây HotelList/HotelDetail mặc định 1.

**Hiện trạng**: [HomePage.tsx](../frontend/src/pages/HomePage.tsx) đặt search bar mặc định 2 khách nhưng truy vấn "nổi bật" dùng 1 khách; `HotelListPage` và `HotelDetailPage` mặc định 1.

**Đề xuất**: đưa mặc định (checkIn, checkOut, guests) vào một hàm chung (mở rộng `defaultSearchDates` trong [features/hotels/schemas.ts](../frontend/src/features/hotels/schemas.ts)) và dùng ở mọi nơi.

---

## 6. Các điểm nhỏ khác — ĐÃ XỬ LÝ CẢ 8 MỤC

Commit: 6.1 `3f7997e`; 6.2, 6.8 `3696242`; 6.3 `8affc21`; 6.4 `d3e846d`; 6.5 `73e43aa`; 6.6, 6.7 `ff75d1c`. Bảng dưới giữ nguyên mô tả ban đầu. Chi tiết đã làm: error boundary theo từng trang trong `MainLayout` (có `resetKey`); hook `useDrawerBehavior` (focus trap, Escape, khóa cuộn, trả focus, `inert`) cho cả Navbar và sidebar dashboard, hai drawer tách trạng thái; `useSignOut` chờ đăng xuất xong rồi mới điều hướng và không bao giờ reject; báo giá là `useQuery` theo (ngày, phòng, mã khuyến mãi) và bỏ `eslint-disable`; bộ lọc và trang của các danh sách admin nằm trong URL (`useListParams`, `useUrlSearchInput`); trang kết quả thanh toán hiển thị mã xác nhận đúng và có nút "Thử thanh toán lại".

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
| 1 — Sửa luồng | **ĐÃ XONG**: cache sau tạo đơn, trang kết quả thanh toán, `clearUserCache`, map trạng thái, guard, hạn giữ chỗ (có sửa backend) | 1.1–1.6 | Đã có test đi kèm |
| 2 — Dọn dẹp | **ĐÃ XONG**: bỏ luồng đặt phòng cũ, alias thành redirect, UI giả, tách route thành module | 1.4, 2.1, 4 | Đã có test đi kèm |
| 3 — Layout | **ĐÃ XONG** (trừ 3.7): một container, một `<main>`, thanh đặt phòng mobile, thứ tự DOM, hồ sơ theo vai trò, cập nhật giá theo ngày | 3.1–3.6, 3.8 | Đã kiểm tra trên trình duyệt thật ở 4 cỡ màn hình |
| 4 — Cấu trúc | **ĐÃ XONG MỘT PHẦN**: `pages/` theo khu vực, tách trang Owner, `Pagination`, `PageSpinner`, `OwnerScopeGate`, bootstrap auth, Prettier. Chưa làm: `features/`, `DataTable` | 2.2–2.5 | Đã so sánh ảnh trước/sau |
| 5 — Nền tảng style | **ĐÃ XONG MỘT PHẦN**: icon từ npm, ngày dd/mm/yyyy, số khách mặc định. Chưa làm: 5.1 (token thay màu thô, gỡ `booking-flow.css`), gộp về một bộ icon | 5.2–5.4 | 5.1 cao về khối lượng; chia nhỏ theo trang |
| 6 — Cần backend | Hạn thanh toán **đã xong** (1.5). Chưa làm: ảnh và địa chỉ trong danh sách/chi tiết đặt phòng; tách rate limiter của `/auth/refresh` khỏi `/auth/login` | 1.5, 4 | Cần thống nhất API |

**Việc còn lại đề xuất**: (1) tách `authLimiter` cho `/auth/refresh` (lỗi thật, xem phần Tiến độ); (2) 3.7 sau khi chốt chỉ số cần hiển thị; (3) 5.1 theo từng trang; (4) API ảnh/địa chỉ nếu muốn lại ảnh khách sạn và link bản đồ.

**Nguyên tắc khi thực hiện**

- Mỗi giai đoạn một nhánh/PR riêng, chạy `npm run lint`, `npm run typecheck`, `npm test` trước khi merge (đã có sẵn trong `package.json`).
- Với thay đổi liên quan hành vi (giai đoạn 1), viết test trước hoặc cùng lúc.
- Thay đổi giao diện (giai đoạn 3, 5) cần kiểm tra thủ công ở ít nhất: mobile (~375px), tablet, desktop rộng (≥1440px), và điều hướng bằng bàn phím.

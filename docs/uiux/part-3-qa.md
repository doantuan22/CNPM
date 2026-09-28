# Part 3 — QA record

## Kiểm tra tự động

Đã chạy trong `frontend/` sau thay đổi:

| Lệnh | Kết quả |
|---|---|
| `npm.cmd run typecheck` | Pass |
| `npm.cmd run lint` | Pass, 0 lỗi; còn 4 cảnh báo Fast Refresh ở hai module export cả component và hook/helper |
| `npm.cmd test` | Pass: 1 file, 6 tests |
| `npm.cmd run build` | Pass: Vite production build |

Tests tương tác kiểm tra button loading/disabled, input accessible error, unknown status neutral, combobox lọc/chọn bằng keyboard, cancel confirmation, và toast live role.

## Browser/manual QA

Chưa chạy browser E2E hoặc visual viewport QA. Môi trường không có browser executable/Playwright hiện hữu; không cài package mới vì ràng buộc Part 3 cấm thêm dependency. Vì vậy viewport 375, 430, 768, 1024, 1280, 1440 px, thao tác screen reader, focus trên browser thực và backend smoke test chưa được xác nhận.

Các flow AUTH, search, booking, customer, owner, admin được kiểm tra qua source/component integration ở mức thay đổi này; đây không phải xác nhận end-to-end với backend đang chạy. Không có backend/API/DB thay đổi.

## Cần QA trực quan khi có môi trường browser

- Xác nhận form register/login và form hồ sơ ở desktop/mobile, lỗi tại field và submit pending.
- Lọc địa phương bằng gõ, ArrowUp/Down, Enter, Escape và kiểm tra focus khi lỗi validation.
- Xác nhận dialog bằng Escape, hủy, confirm, focus trả về trigger.
- Toast không che nút/field, đóng được và live announcement phù hợp.
- Kiểm tra admin/owner/customer list empty/error/loading và table overflow ở mọi breakpoint đã nêu.
- Smoke test booking/checkout/payment với backend để xác nhận luồng cũ giữ nguyên.

## Quyết định

Đợt Part 3 hoàn tất component nền và tích hợp đại diện; trang còn legacy đã đánh dấu rõ ở `part-3-legacy-ui.md`. Chưa bắt đầu Part 4.

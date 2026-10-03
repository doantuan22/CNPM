# Bug Audit Log — Promotion Race Condition

| Trường | Nội dung |
|---|---|
| **ID** | BUG-001 |
| **Phát hiện** | 2026-10-01 (via concurrency integration test) |
| **Mức độ** | 🔴 **HIGH** — vi phạm business rule tài chính |
| **Module** | `backend/src/modules/bookings/` |
| **Trạng thái** | **OPEN** — chưa được fix |
| **Phát hiện bởi** | Race condition test `concurrency.test.ts` |

---

## Mô tả

Khi nhiều khách hàng đồng thời đặt phòng sử dụng cùng một mã khuyến mãi có `SoLuongGioiHan > 0`, **giới hạn lượt dùng bị vi phạm**. Số lượng booking được apply promo có thể vượt quá `SoLuongGioiHan`, gây thất thoát doanh thu.

**Ví dụ thực tế bị reproduce bởi test:**

```
Promo: SoLuongGioiHan = 2
Concurrent requests: 5
Kết quả thực tế: 3 booking được apply promo ← vi phạm
Kết quả mong đợi: ≤ 2 booking được apply promo
```

---

## Root Cause

### Code flow

```
bookings.service.ts: createBooking()
└── repository.runInTransaction(async (tx) => {
      ...
      // L186 — ĐỌC SỐ LẦN ĐÃ DÙNG
      const usedCount = await this.repository.countPromotionUsage(tx, promo.MaKhuyenMai);
      //                                       ^^^^^^^^^^^^^^^^^^^
      //                                       BUG NẰM Ở ĐÂY

      const evalResult = evaluatePromotion(..., usedCount);
      if (!evalResult.valid) throw AppError.badRequest(...);  // usedCount >= SoLuongGioiHan → reject

      // ... sau đó INSERT booking với MaKhuyenMai
      await this.repository.insertBooking(tx, { maKhuyenMai, ... });
    });
```

### Hàm lỗi

**File:** [`bookings.repository.ts` — dòng 113–115](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/bookings/bookings.repository.ts#L113-L115)

```typescript
// HIỆN TẠI — LỖI
async countPromotionUsage(tx: Prisma.TransactionClient, maKhuyenMai: number): Promise<number> {
  return tx.dAT_PHONG.count({
    where: { MaKhuyenMai: maKhuyenMai, TrangThai: { not: BOOKING_STATUS.CANCELLED } }
  });
  // tx.dAT_PHONG.count() → Prisma gọi SELECT COUNT(*) FROM DAT_PHONG
  // KHÔNG có WITH (UPDLOCK, ROWLOCK)
  // → nhiều transaction cùng đọc count mà không block nhau
}
```

### Cơ chế lỗi (Race Window)

```
T0: Transaction A bắt đầu đặt phòng với promoCode="SUMMER20"
T0: Transaction B bắt đầu đặt phòng với promoCode="SUMMER20"
T0: Transaction C bắt đầu đặt phòng với promoCode="SUMMER20"

T1: A đọc countPromotionUsage → 0  ← SoLuongGioiHan=2, 0 < 2 → PASS
T1: B đọc countPromotionUsage → 0  ← 0 < 2 → PASS  (A chưa commit!)
T1: C đọc countPromotionUsage → 0  ← 0 < 2 → PASS  (A,B chưa commit!)

T2: A INSERT booking với MaKhuyenMai  → commit
T2: B INSERT booking với MaKhuyenMai  → commit
T2: C INSERT booking với MaKhuyenMai  → commit

Kết quả: 3 booking có MaKhuyenMai dù SoLuongGioiHan = 2
```

### So sánh với cơ chế đã bảo vệ đúng

```typescript
// lockRatesForUpdate() trong cùng file — BẢO VỆ ĐÚNG
async lockRatesForUpdate(tx, maLoaiPhongIds, checkIn, checkOut) {
  return tx.$queryRaw<LockedRateRow[]>(Prisma.sql`
    SELECT MaLoaiPhong, NgayApDung, GiaPhong, SoLuongPhong
    FROM QUY_PHONG_GIA WITH (UPDLOCK, ROWLOCK, HOLDLOCK)  ← có lock
    WHERE ...
  `);
}
// → Transaction thứ hai block tại bước này cho đến khi thứ nhất commit
```

`countPromotionUsage` **thiếu `WITH (UPDLOCK)`** nên window race không bị serialized.

---

## Bằng chứng

### Test output (`concurrency.test.ts`)

```
✓ Race: 2 customers cùng dùng promo SoLuongGioiHan = 1
  → limit=1 được giữ (test với 2 requests — ít va chạm hơn)

✓ Race: N=5 dùng cùng promo SoLuongGioiHan = 2 [BUG DOCUMENTATION]
  ⚠ [PROMOTION RACE BUG CONFIRMED]
    Promo "TEST_..." (SoLuongGioiHan=2)
    được sử dụng 3 lần trong race.
    Fix: thêm UPDLOCK vào countPromotionUsage() trong bookings.repository.ts
```

> **Lưu ý:** Test với `SoLuongGioiHan=1` pass vì window race với 2 requests
> nhỏ hơn và ít va chạm hơn. Không thể kết luận limit=1 an toàn vì production
> có latency cao hơn và nhiều concurrent users hơn.

---

## Đánh giá ảnh hưởng

| Khía cạnh | Chi tiết |
|---|---|
| **Doanh thu** | Mỗi lần promo bị dùng vượt giới hạn = 1 lần giảm giá không được phép |
| **Xác suất xảy ra** | Thấp trong điều kiện bình thường, **tăng mạnh khi có flash sale** hoặc promo hot |
| **Phát hiện sau thực tế** | Khó — cần so sánh SoLuongGioiHan với COUNT(DAT_PHONG) thủ công |
| **Tự phục hồi** | Không — booking đã commit, discount đã áp dụng |
| **Customer impact** | Không ảnh hưởng trực tiếp (họ được lợi), chỉ ảnh hưởng doanh thu |

---

## Các phương án fix

### Phương án 1 — Raw SQL với UPDLOCK *(Khuyến nghị)*

**File:** [`bookings.repository.ts` — dòng 113](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/bookings/bookings.repository.ts#L113)

```typescript
// TRƯỚC (lỗi)
async countPromotionUsage(tx: Prisma.TransactionClient, maKhuyenMai: number): Promise<number> {
  return tx.dAT_PHONG.count({
    where: { MaKhuyenMai: maKhuyenMai, TrangThai: { not: BOOKING_STATUS.CANCELLED } }
  });
}

// SAU (fix)
async countPromotionUsage(tx: Prisma.TransactionClient, maKhuyenMai: number): Promise<number> {
  // UPDLOCK + HOLDLOCK: transaction thứ 2 block tại đây cho đến khi
  // transaction thứ 1 commit/rollback, sau đó re-read count đã cập nhật.
  const rows = await tx.$queryRaw<[{ cnt: number }]>(Prisma.sql`
    SELECT COUNT(*) AS cnt
    FROM DAT_PHONG WITH (UPDLOCK, ROWLOCK, HOLDLOCK)
    WHERE MaKhuyenMai = ${maKhuyenMai}
      AND TrangThai != ${BOOKING_STATUS.CANCELLED}
  `);
  return Number(rows[0]?.cnt ?? 0);
}
```

**Ưu điểm:** Nhất quán với pattern đã dùng cho `lockRatesForUpdate` và `findPaymentByTxnRef`. Serializes các transaction ngay tại bước đọc.

**Nhược điểm:** Tăng contention trên bảng `DAT_PHONG` khi nhiều promo phổ biến cùng lúc (chấp nhận được).

---

### Phương án 2 — DB-level UNIQUE constraint

Thêm constraint `UNIQUE(MaDatPhong)` không giải quyết được vấn đề này. Thay vào đó:

```sql
-- Tạo bảng trung gian KHUYEN_MAI_SU_DUNG với khóa phức
-- và dùng INSERT thay vì COUNT → UPDATE trong một atomic operation
-- → Phức tạp, không phù hợp với schema hiện tại
```

**Không khuyến nghị** — thay đổi schema lớn, không cần thiết.

---

### Phương án 3 — Application-level pessimistic lock (Redis)

```typescript
// Dùng Redis SETNX để lock theo promoCode
const lockKey = `promo_lock:${promo.MaCode}`;
const locked = await redis.set(lockKey, '1', 'NX', 'PX', 5000);
if (!locked) throw AppError.tooManyRequests('Vui lòng thử lại');
```

**Không khuyến nghị** — thêm dependency Redis, phức tạp, không cần thiết khi SQL lock đủ mạnh.

---

## Quyết định khuyến nghị

> ✅ **Dùng Phương án 1** — thay `tx.dAT_PHONG.count()` bằng raw SQL với `UPDLOCK, HOLDLOCK` trong `countPromotionUsage()`.
>
> Đây là thay đổi nhỏ nhất, nhất quán với pattern toàn codebase, và không cần thay đổi schema hay thêm dependency.

---

## Checklist sau khi fix

- [ ] Thay đổi `countPromotionUsage()` trong `bookings.repository.ts`
- [ ] Cập nhật test `concurrency.test.ts`: đổi assertion `[BUG DOCUMENTATION]` thành `expect(bookingsWithPromo).toBeLessThanOrEqual(2)`
- [ ] Chạy lại `vitest run --no-file-parallelism` toàn bộ suite
- [ ] Verify không có regression trong `bookings.test.ts`

---

## Files liên quan

| File | Dòng | Ghi chú |
|---|---|---|
| [`bookings.repository.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/bookings/bookings.repository.ts#L113-L115) | 113–115 | **Vị trí cần sửa** |
| [`bookings.service.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/bookings/bookings.service.ts#L186) | 186 | Caller của `countPromotionUsage` |
| [`concurrency.test.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/bookings/concurrency.test.ts#L426) | 426–490 | Test tài liệu hóa bug |

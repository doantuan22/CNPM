# Bug Audit Log — Orphaned Cloudinary Images on Race Condition

| Trường | Nội dung |
|---|---|
| **ID** | BUG-005 |
| **Phát hiện** | 2026-10-03 (phân tích luồng `createReview`) |
| **Mức độ** | 🟠 **MEDIUM** — Resource leak trên Cloudinary, chi phí lưu trữ không kiểm soát |
| **Module** | `backend/src/modules/reviews/reviews.service.ts` |
| **Trạng thái** | ✅ **FIXED** — Đã sửa ngày 2026-10-03 |
| **Phát hiện bởi** | Phân tích flow `createReview()` — upload trước, insert DB sau |

---

## Mô tả

Hàm `createReview()` trong [`reviews.service.ts`](file:///c:/Users/Asus%20Tuf%20A15%20FX507/Documents/Courses/Courses/CNPM/Project/CNPM/backend/src/modules/reviews/reviews.service.ts) thực hiện **upload ảnh lên Cloudinary TRƯỚC**, sau đó mới **insert vào database**. Nếu bước insert thất bại do race condition (vi phạm UNIQUE constraint `UQ_DANH_GIA_MaDatPhong` — hai khách bấm nút đánh giá đồng thời), các ảnh đã upload lên Cloudinary **không bao giờ được xóa**.

```
Timeline của race condition:
  Request A: upload 3 ảnh → [OK]
  Request B: upload 3 ảnh → [OK] 
  Request A: DB insert → [COMMIT] ← thắng
  Request B: DB insert → [P2002 FAIL] ← thua, 3 ảnh bị orphan
```

---

## Root Cause

### Code trước khi fix

```typescript
// reviews.service.ts L39-63 (cũ)
const imageUrls: string[] = [];
for (const dataUri of input.hinhAnh ?? []) {
  const uploaded = await CloudinaryIntegration.uploadImage(dataUri, REVIEW_IMAGE_FOLDER);
  imageUrls.push(uploaded.url);  // ← ảnh đã lên cloud
}

try {
  return await this.repository.create(..., imageUrls);
} catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    // ❌ Không có cleanup! imageUrls bị bỏ lại trên Cloudinary mãi mãi
    throw AppError.conflict('Đặt phòng này đã được đánh giá');
  }
  throw err;
}
```

---

## Ảnh hưởng

| Khía cạnh | Chi tiết |
|---|---|
| **Chi phí** | Mỗi race condition để lại ảnh trên Cloudinary, tích lũy theo thời gian → tăng storage bill |
| **Xác suất** | Thấp trong thực tế nhưng không zero — xảy ra khi user double-click nút "Gửi đánh giá" hoặc mạng retry |
| **Hậu quả phụ** | Nếu `imageUrls.length > 0` nhưng P2002, tất cả N ảnh của request "thua" là rác vĩnh viễn |

---

## Fix đã thực hiện

Thêm cleanup Cloudinary ngay trong `catch` block trước khi throw lại:

```typescript
// reviews.service.ts (mới)
} catch (err) {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    // Xóa các ảnh đã upload lên Cloudinary trước khi DB constraint fail
    if (imageUrls.length > 0) {
      const { extractCloudinaryPublicId } = await import('../../common/utils/cloudinary-url');
      await Promise.allSettled(
        imageUrls.map((url) => {
          const publicId = extractCloudinaryPublicId(url);
          return publicId ? CloudinaryIntegration.deleteImage(publicId) : Promise.resolve();
        })
      );
    }
    throw AppError.conflict('Đặt phòng này đã được đánh giá');
  }
  throw err;
}
```

- Dùng `Promise.allSettled()` để không chặn lỗi cleanup che giấu lỗi P2002 gốc.
- `extractCloudinaryPublicId` được import động (`await import`) để tránh phải thêm dependency ở level module.

---

## Checklist sau khi fix

- [x] Fix code trong `reviews.service.ts`
- [ ] Test case tích hợp: gửi 2 reviews đồng thời cho cùng booking, verify Cloudinary cleanup được gọi (cần mock CloudinaryIntegration)

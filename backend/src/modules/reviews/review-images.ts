/**
 * Pure validation for review image uploads (M7 §2) — no I/O, checked before
 * ever calling CloudinaryIntegration. Mirrors the "data URI in JSON body"
 * convention already used by owner hotel/room-type images (M3), but M3
 * never validated type/size at all — M7 adds that here rather than
 * retrofitting M3 (out of this task's scope).
 */
import { AppError } from '../../common/errors/app-error';

export const MAX_REVIEW_IMAGES = 6;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

const DATA_URI_RE = /^data:image\/(png|jpe?g|webp|gif);base64,([A-Za-z0-9+/]+=*)$/i;

/** Throws AppError.badRequest on the first invalid image; a valid/empty list passes silently. */
export const validateReviewImages = (images: string[] | undefined): void => {
  if (!images || images.length === 0) return;
  if (images.length > MAX_REVIEW_IMAGES) {
    throw AppError.badRequest(`Tối đa ${MAX_REVIEW_IMAGES} ảnh cho mỗi đánh giá`);
  }
  for (const image of images) {
    const match = image.match(DATA_URI_RE);
    if (!match) {
      throw AppError.badRequest('Ảnh phải là data URI base64 hợp lệ (JPEG/PNG/WEBP/GIF)');
    }
    // Base64 decodes to ~3/4 of its encoded length — good enough to reject oversized payloads without a real decode.
    const approxBytes = Math.floor((match[2].length * 3) / 4);
    if (approxBytes > MAX_IMAGE_BYTES) {
      throw AppError.badRequest('Kích thước mỗi ảnh tối đa 5MB');
    }
  }
};

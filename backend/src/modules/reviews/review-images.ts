/**
 * Pure validation for review image uploads (M7 §2) — no I/O, checked before
 * ever calling CloudinaryIntegration. Mirrors the "data URI in JSON body"
 * convention already used by owner hotel/room-type images (M3), but M3
 * never validated type/size at all — M7 adds that here rather than
 * retrofitting M3 (out of this task's scope).
 */
import { AppError } from '../../common/errors/app-error';
import { MAX_IMAGE_BYTES, validateImageDataUri } from '../../common/utils/image-upload';

export const MAX_REVIEW_IMAGES = 6;
export { MAX_IMAGE_BYTES };

/** Throws AppError.badRequest on the first invalid image; a valid/empty list passes silently. */
export const validateReviewImages = (images: string[] | undefined): void => {
  if (!images || images.length === 0) return;
  if (images.length > MAX_REVIEW_IMAGES) {
    throw AppError.badRequest(`Tối đa ${MAX_REVIEW_IMAGES} ảnh cho mỗi đánh giá`);
  }
  for (const image of images) {
    validateImageDataUri(image);
  }
};

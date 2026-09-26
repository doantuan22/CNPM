/**
 * The schema only stores the image URL (HINH_ANH_KHACH_SAN.URL /
 * HINH_ANH_LOAI_PHONG.URL — no separate Cloudinary public_id column, and
 * M3 must not change the schema). To delete an asset from Cloudinary we
 * derive its public_id from the URL Cloudinary itself returned on upload:
 * https://res.cloudinary.com/<cloud>/image/upload/v<version>/<folder>/<public_id>.<ext>
 *
 * Returns null for any URL that doesn't look like a Cloudinary upload URL
 * (e.g. seed data placeholder images) — callers should treat that as
 * "nothing to delete remotely" and only remove the DB row.
 */
export const extractCloudinaryPublicId = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z0-9]+)?$/);
  return match ? match[1] : null;
};

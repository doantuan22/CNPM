import { z } from 'zod';

const timeOfDay = z
  .string()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ phải theo định dạng HH:MM')
  .transform((val) => new Date(`1970-01-01T${val}:00Z`));

// TrangThai/MaTaiKhoanDuyet/NgayDuyet/MaTaiKhoanSoHuu are intentionally
// excluded — owners cannot self-approve or reassign ownership (M3 §5).
export const createHotelSchema = z.object({
  TenKhachSan: z.string().min(2, 'Tên khách sạn ít nhất 2 ký tự').max(255),
  DiaChiChiTiet: z.string().min(5, 'Địa chỉ chi tiết ít nhất 5 ký tự').max(500),
  HangSao: z.coerce.number().int().min(1).max(5),
  MoTa: z.string().max(4000).optional(),
  GioNhanPhong: timeOfDay,
  GioTraPhong: timeOfDay,
  MaDiaPhuong: z.coerce.number().int().positive(),
});
export type CreateHotelInput = z.infer<typeof createHotelSchema>;

export const updateHotelSchema = z
  .object({
    TenKhachSan: z.string().min(2).max(255),
    DiaChiChiTiet: z.string().min(5).max(500),
    HangSao: z.coerce.number().int().min(1).max(5),
    MoTa: z.string().max(4000),
    GioNhanPhong: timeOfDay,
    GioTraPhong: timeOfDay,
    MaDiaPhuong: z.coerce.number().int().positive(),
  })
  .partial();
export type UpdateHotelInput = z.infer<typeof updateHotelSchema>;

export const hotelIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const hotelImageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  imageId: z.coerce.number().int().positive(),
});

export const replaceAmenitiesSchema = z.object({
  amenityIds: z.array(z.coerce.number().int().positive()).default([]),
});
export type ReplaceAmenitiesInput = z.infer<typeof replaceAmenitiesSchema>;

export const uploadImageSchema = z.object({
  // Data URI (base64) — see docs/m3-report.md for why this avoids adding
  // multer/multipart parsing while still reusing the existing Cloudinary
  // integration exactly as-is (CloudinaryIntegration.uploadImage accepts a
  // file path OR a base64 string).
  image: z.string().min(1, 'Thiếu dữ liệu ảnh'),
});
export type UploadImageInput = z.infer<typeof uploadImageSchema>;

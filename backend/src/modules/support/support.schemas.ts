import { z } from 'zod';
import { SUPPORT_TYPE, SUPPORT_STATUS } from '../../common/constants/support';

export const supportIdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const createSupportSchema = z.object({
  loaiYeuCau: z.enum([SUPPORT_TYPE.SUPPORT, SUPPORT_TYPE.COMPLAINT]),
  tieuDe: z.string().trim().min(1, 'Cần nhập tiêu đề').max(255),
  noiDung: z.string().trim().min(1, 'Cần nhập nội dung'),
  maDatPhong: z.coerce.number().int().positive().optional(),
});
export type CreateSupportInput = z.infer<typeof createSupportSchema>;

export const adminUpdateSupportSchema = z
  .object({
    trangThai: z.enum([SUPPORT_STATUS.IN_PROGRESS, SUPPORT_STATUS.RESOLVED]),
    ketQuaXuLy: z.string().trim().min(1).max(5000).optional(),
  })
  .refine((d) => d.trangThai !== SUPPORT_STATUS.RESOLVED || !!d.ketQuaXuLy, {
    message: 'Cần nhập kết quả xử lý khi đánh dấu "Đã xử lý"',
    path: ['ketQuaXuLy'],
  });
export type AdminUpdateSupportInput = z.infer<typeof adminUpdateSupportSchema>;

export const adminListSupportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  trangThai: z.string().max(30).optional(),
  loaiYeuCau: z.string().max(20).optional(),
});
export type AdminListSupportQuery = z.infer<typeof adminListSupportQuerySchema>;

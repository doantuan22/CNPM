import { z } from 'zod';
import { ROOM_TYPE_STATUS } from '../../common/constants/hotel-status';

export const createRoomTypeSchema = z.object({
  TenLoaiPhong: z.string().min(2, 'Tên loại phòng ít nhất 2 ký tự').max(150),
  SoGiuong: z.coerce.number().int().min(1),
  SucChua: z.coerce.number().int().min(1),
  DienTich: z.coerce.number().positive(),
  LoaiGiuong: z.string().min(1).max(50),
  MoTa: z.string().max(4000).optional(),
});
export type CreateRoomTypeInput = z.infer<typeof createRoomTypeSchema>;

export const updateRoomTypeSchema = z
  .object({
    TenLoaiPhong: z.string().min(2).max(150),
    SoGiuong: z.coerce.number().int().min(1),
    SucChua: z.coerce.number().int().min(1),
    DienTich: z.coerce.number().positive(),
    LoaiGiuong: z.string().min(1).max(50),
    MoTa: z.string().max(4000),
    TrangThai: z.enum([ROOM_TYPE_STATUS.ACTIVE, ROOM_TYPE_STATUS.DISCONTINUED]),
  })
  .partial();
export type UpdateRoomTypeInput = z.infer<typeof updateRoomTypeSchema>;

export const hotelIdParamSchema = z.object({ hotelId: z.coerce.number().int().positive() });
export const roomTypeIdParamSchema = z.object({ id: z.coerce.number().int().positive() });
export const roomTypeImageIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
  imageId: z.coerce.number().int().positive(),
});

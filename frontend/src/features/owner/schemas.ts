import { z } from 'zod';

const timeSchema = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Giờ phải theo định dạng HH:MM');

export const hotelFormSchema = z.object({
  TenKhachSan: z.string().min(2, 'Tên khách sạn ít nhất 2 ký tự').max(255),
  DiaChiChiTiet: z.string().min(5, 'Địa chỉ chi tiết ít nhất 5 ký tự').max(500),
  HangSao: z.coerce.number().int().min(1, 'Chọn hạng sao').max(5),
  MoTa: z.string().max(4000).optional(),
  GioNhanPhong: timeSchema,
  GioTraPhong: timeSchema,
  MaDiaPhuong: z.coerce.number().int().positive('Chọn địa phương'),
});
export type HotelFormSchemaValues = z.infer<typeof hotelFormSchema>;

export const roomTypeFormSchema = z.object({
  TenLoaiPhong: z.string().min(2, 'Tên loại phòng ít nhất 2 ký tự').max(150),
  SoGiuong: z.coerce.number().int().min(1, 'Ít nhất 1 giường'),
  SucChua: z.coerce.number().int().min(1, 'Ít nhất 1 khách'),
  DienTich: z.coerce.number().positive('Diện tích phải lớn hơn 0'),
  LoaiGiuong: z.string().min(1, 'Nhập loại giường').max(50),
  MoTa: z.string().max(4000).optional(),
});
export type RoomTypeFormSchemaValues = z.infer<typeof roomTypeFormSchema>;

export const rateBulkFormSchema = z
  .object({
    from: z.string().min(1, 'Chọn ngày bắt đầu'),
    to: z.string().min(1, 'Chọn ngày kết thúc'),
    giaPhong: z.coerce.number().min(0, 'Giá không được âm'),
    soLuongPhong: z.coerce.number().int().min(0, 'Số lượng không được âm'),
  })
  .refine((d) => d.to >= d.from, { message: 'Ngày kết thúc phải sau ngày bắt đầu', path: ['to'] });
export type RateBulkFormValues = z.infer<typeof rateBulkFormSchema>;

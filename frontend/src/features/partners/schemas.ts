import { z } from 'zod';

export const applyPartnerSchema = z.object({
  SoCCCD: z.string().min(9, 'Số CCCD không hợp lệ'),
  SoGiayPhepKinhDoanh: z.string().min(1, 'Vui lòng nhập số giấy phép kinh doanh'),
  MaSoThue: z.string().min(1, 'Vui lòng nhập mã số thuế'),
  TepGiayTo: z.string().url('Vui lòng nhập đường dẫn hợp lệ (URL) tới tệp giấy tờ'),
});
export type ApplyPartnerFormValues = z.infer<typeof applyPartnerSchema>;

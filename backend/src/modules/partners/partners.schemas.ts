import { z } from 'zod';

export const applyPartnerSchema = z.object({
  SoCCCD: z.string().min(9, 'Số CCCD không hợp lệ').max(20),
  SoGiayPhepKinhDoanh: z.string().min(1, 'Vui lòng nhập số giấy phép kinh doanh').max(50),
  MaSoThue: z.string().min(1, 'Vui lòng nhập mã số thuế').max(20),
  // M1 foundation: a URL/reference to the uploaded document rather than a
  // real file upload pipeline (Cloudinary wiring is deferred to a later
  // phase — see M1 report "known limitations").
  TepGiayTo: z.string().min(1, 'Vui lòng cung cấp đường dẫn tệp giấy tờ').max(500),
});
export type ApplyPartnerInput = z.infer<typeof applyPartnerSchema>;

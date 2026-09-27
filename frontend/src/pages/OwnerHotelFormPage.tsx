import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { useCreateHotel } from '../features/owner/hooks';
import { useLocations } from '../features/locations/hooks';
import { hotelFormSchema, HotelFormSchemaValues } from '../features/owner/schemas';
import { ApiError } from '../services/apiClient';
import { cn } from '../lib/utils';

export default function OwnerHotelFormPage() {
  const navigate = useNavigate();
  const createMutation = useCreateHotel();
  const locationsQuery = useLocations();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<HotelFormSchemaValues>({
    resolver: zodResolver(hotelFormSchema),
    defaultValues: { GioNhanPhong: '14:00', GioTraPhong: '12:00', HangSao: 3 },
  });

  const onSubmit = async (values: HotelFormSchemaValues) => {
    try {
      const hotel = await createMutation.mutateAsync(values);
      navigate(`/owner/hotels/${hotel.MaKhachSan}`, { replace: true });
    } catch {
      // handled
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1080px] mx-auto w-full">
      <Link to="/owner" className="breadcrumb w-fit">
        <i className="ph ph-arrow-left"></i>
        <span>Quay lại danh sách khách sạn</span>
      </Link>

      <div className="flex justify-between items-center flex-wrap gap-3 bg-white border border-border rounded-[14px] px-6 py-4">
        <div>
          <h1 className="text-[20px] font-bold text-heading mb-0.5">Thêm khách sạn mới</h1>
          <p className="text-[13px] text-muted">Điền thông tin chi tiết của cơ sở lưu trú để gửi hồ sơ kiểm duyệt tới hệ thống.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex gap-3 items-center text-[13px] text-blue-800">
        <span className="text-[18px]">ℹ️</span>
        <div>
          <strong>Quy trình phê duyệt:</strong> Sau khi hoàn tất và nhấn <em>"Đăng ký khách sạn"</em>, quản trị viên sẽ thẩm định hồ sơ trước khi cấp phép hoạt động. Bạn có thể bổ sung tiện nghi và hình ảnh sau khi tạo hồ sơ.
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {createMutation.isError && (
          <div role="alert" className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {createMutation.error instanceof ApiError ? createMutation.error.message : 'Đăng ký thất bại, vui lòng thử lại'}
          </div>
        )}

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">🏢 Thông tin cơ bản</h2>
            <p className="text-sm text-muted">Tên thương mại, tiêu chuẩn sao và địa chỉ hiển thị với du khách</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className="form-label">Tên cơ sở khách sạn / Resort <span className="text-red-500">*</span></label>
              <input type="text" className={cn("input", errors.TenKhachSan && "border-red-500")} placeholder="Ví dụ: Grand Palace Saigon Hotel & Spa" {...register('TenKhachSan')} />
              {errors.TenKhachSan && <p className="text-xs text-red-500 mt-1">{errors.TenKhachSan.message}</p>}
            </div>

            <div>
              <label className="form-label">Xếp hạng sao tiêu chuẩn <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className={cn("select", errors.HangSao && "border-red-500")} {...register('HangSao', { valueAsNumber: true })}>
                  <option value="">-- Chọn xếp hạng sao --</option>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <option key={s} value={s}>{s} Sao</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              </div>
            </div>

            <div>
              <label className="form-label">Tỉnh / Thành phố <span className="text-red-500">*</span></label>
              <div className="relative">
                <select className={cn("select", errors.MaDiaPhuong && "border-red-500")} defaultValue="" {...register('MaDiaPhuong', { valueAsNumber: true })}>
                  <option value="" disabled>-- Chọn tỉnh thành --</option>
                  {locationsQuery.data?.map((loc) => (
                    <option key={loc.MaDiaPhuong} value={loc.MaDiaPhuong}>{loc.TenThanhPho}</option>
                  ))}
                </select>
                <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"></i>
              </div>
              {errors.MaDiaPhuong && <p className="text-xs text-red-500 mt-1">{errors.MaDiaPhuong.message}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="form-label">Địa chỉ chi tiết <span className="text-red-500">*</span></label>
              <input type="text" className={cn("input", errors.DiaChiChiTiet && "border-red-500")} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." {...register('DiaChiChiTiet')} />
              {errors.DiaChiChiTiet && <p className="text-xs text-red-500 mt-1">{errors.DiaChiChiTiet.message}</p>}
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">⏱️ Quy định vận hành & Khung giờ</h2>
            <p className="text-sm text-muted">Thiết lập thời gian nhận và trả phòng tiêu chuẩn</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="form-label">Giờ nhận phòng tiêu chuẩn (Check-in) <span className="text-red-500">*</span></label>
              <input type="time" className={cn("input", errors.GioNhanPhong && "border-red-500")} {...register('GioNhanPhong')} />
              {errors.GioNhanPhong && <p className="text-xs text-red-500 mt-1">{errors.GioNhanPhong.message}</p>}
            </div>
            <div>
              <label className="form-label">Giờ trả phòng tiêu chuẩn (Check-out) <span className="text-red-500">*</span></label>
              <input type="time" className={cn("input", errors.GioTraPhong && "border-red-500")} {...register('GioTraPhong')} />
              {errors.GioTraPhong && <p className="text-xs text-red-500 mt-1">{errors.GioTraPhong.message}</p>}
            </div>
          </div>
        </section>

        <section className="bg-white border border-border rounded-[16px] p-7 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-heading flex items-center gap-2 mb-1">📝 Giới thiệu tổng quan</h2>
            <p className="text-sm text-muted">Đoạn văn ngắn làm nổi bật vị trí, phong cách kiến trúc và dịch vụ vượt trội</p>
          </div>
          <div>
            <textarea rows={4} className={cn("textarea", errors.MoTa && "border-red-500")} placeholder="Mô tả khách sạn..." {...register('MoTa')}></textarea>
          </div>
        </section>

        <div className="flex justify-between items-center flex-wrap gap-3 bg-white border border-border rounded-[14px] px-6 py-4 shadow-sm">
          <span className="text-[13px] text-muted flex items-center gap-1.5">
            <i className="ph ph-info"></i> Hãy kiểm tra kỹ trước khi gửi đăng ký
          </span>
          <div className="flex gap-3">
            <Link to="/owner" className="btn btn-secondary">Hủy bỏ</Link>
            <button type="submit" disabled={isSubmitting || createMutation.isPending} className="btn btn-primary">
              {isSubmitting || createMutation.isPending ? 'Đang xử lý...' : 'Gửi đăng ký duyệt'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useCreateHotel } from '../features/owner/hooks';
import { useLocations } from '../features/locations/hooks';
import { hotelFormSchema, HotelFormSchemaValues } from '../features/owner/schemas';
import { ApiError } from '../services/apiClient';

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
      // surfaced via createMutation.isError below
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/owner">
          <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại bảng điều khiển
        </Link>
      </Button>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Đăng ký khách sạn mới</h1>
        <p className="text-sm text-slate-500">Hồ sơ sẽ ở trạng thái "Chờ duyệt" cho đến khi quản trị viên phê duyệt.</p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
        {createMutation.isError && (
          <div role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {createMutation.error instanceof ApiError ? createMutation.error.message : 'Đăng ký thất bại, vui lòng thử lại'}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label htmlFor="TenKhachSan" className="block text-sm font-medium text-slate-700">Tên khách sạn</label>
            <input
              id="TenKhachSan"
              {...register('TenKhachSan')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.TenKhachSan && <p className="mt-1 text-xs text-red-600">{errors.TenKhachSan.message}</p>}
          </div>

          <div>
            <label htmlFor="DiaChiChiTiet" className="block text-sm font-medium text-slate-700">Địa chỉ chi tiết</label>
            <input
              id="DiaChiChiTiet"
              {...register('DiaChiChiTiet')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {errors.DiaChiChiTiet && <p className="mt-1 text-xs text-red-600">{errors.DiaChiChiTiet.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="MaDiaPhuong" className="block text-sm font-medium text-slate-700">Địa phương</label>
              <select
                id="MaDiaPhuong"
                {...register('MaDiaPhuong')}
                defaultValue=""
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="" disabled>Chọn địa phương</option>
                {locationsQuery.data?.map((loc) => (
                  <option key={loc.MaDiaPhuong} value={loc.MaDiaPhuong}>
                    {loc.TenThanhPho}
                  </option>
                ))}
              </select>
              {errors.MaDiaPhuong && <p className="mt-1 text-xs text-red-600">{errors.MaDiaPhuong.message}</p>}
            </div>
            <div>
              <label htmlFor="HangSao" className="block text-sm font-medium text-slate-700">Hạng sao</label>
              <select
                id="HangSao"
                {...register('HangSao')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <option key={s} value={s}>{s} sao</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="GioNhanPhong" className="block text-sm font-medium text-slate-700">Giờ nhận phòng</label>
              <input
                id="GioNhanPhong"
                type="time"
                {...register('GioNhanPhong')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.GioNhanPhong && <p className="mt-1 text-xs text-red-600">{errors.GioNhanPhong.message}</p>}
            </div>
            <div>
              <label htmlFor="GioTraPhong" className="block text-sm font-medium text-slate-700">Giờ trả phòng</label>
              <input
                id="GioTraPhong"
                type="time"
                {...register('GioTraPhong')}
                className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              {errors.GioTraPhong && <p className="mt-1 text-xs text-red-600">{errors.GioTraPhong.message}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="MoTa" className="block text-sm font-medium text-slate-700">Mô tả (tùy chọn)</label>
            <textarea
              id="MoTa"
              rows={4}
              {...register('MoTa')}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting || createMutation.isPending}>
            {isSubmitting || createMutation.isPending ? 'Đang đăng ký...' : 'Đăng ký khách sạn'}
          </Button>
        </form>
      </div>
    </div>
  );
}

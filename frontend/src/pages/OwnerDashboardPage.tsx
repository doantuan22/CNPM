import { Link } from 'react-router-dom';
import { Building2, MapPin, Plus, Star } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useMyHotels } from '../features/owner/hooks';
import { ApiError } from '../services/apiClient';

const statusBadge: Record<string, string> = {
  'Hoạt động': 'bg-green-50 text-green-700',
  'Chờ duyệt': 'bg-amber-50 text-amber-700',
  'Đình chỉ': 'bg-red-50 text-red-700',
};

export default function OwnerDashboardPage() {
  const hotelsQuery = useMyHotels();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bảng điều khiển chủ khách sạn</h1>
          <p className="text-sm text-slate-500">Quản lý cơ sở lưu trú, danh mục phòng và giá/quỹ phòng</p>
        </div>
        <Button asChild>
          <Link to="/owner/hotels/new">
            <Plus className="mr-1.5 h-4 w-4" /> Đăng ký khách sạn mới
          </Link>
        </Button>
      </div>

      {hotelsQuery.isLoading ? (
        <div className="flex justify-center py-16" role="status" aria-live="polite">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
        </div>
      ) : hotelsQuery.isError ? (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-6 py-10 text-center text-sm text-red-700">
          {hotelsQuery.error instanceof ApiError ? hotelsQuery.error.message : 'Không thể tải danh sách khách sạn'}
        </div>
      ) : hotelsQuery.data && hotelsQuery.data.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">Bạn chưa có khách sạn nào</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Đăng ký khách sạn đầu tiên để bắt đầu quản lý loại phòng, giá và quỹ phòng.
          </p>
          <Button className="mt-4" asChild>
            <Link to="/owner/hotels/new">
              <Plus className="mr-1.5 h-4 w-4" /> Đăng ký khách sạn
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {hotelsQuery.data?.map((hotel) => (
            <Link
              key={hotel.MaKhachSan}
              to={`/owner/hotels/${hotel.MaKhachSan}`}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
            >
              <div className="h-36 bg-slate-200">
                {hotel.HINH_ANH_KHACH_SAN[0] ? (
                  <img src={hotel.HINH_ANH_KHACH_SAN[0].URL} alt={hotel.TenKhachSan} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-slate-400">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
              </div>
              <div className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {hotel.HangSao} sao
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[hotel.TrangThai] ?? 'bg-slate-100 text-slate-600'}`}>
                    {hotel.TrangThai}
                  </span>
                </div>
                <h2 className="font-semibold text-slate-900">{hotel.TenKhachSan}</h2>
                <p className="flex items-center text-xs text-slate-500">
                  <MapPin className="mr-1 h-3.5 w-3.5" /> {hotel.DIA_PHUONG.TenThanhPho}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

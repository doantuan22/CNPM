import { Link } from 'react-router-dom';
import { Hotel, MapPin, Star } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function HotelListPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Danh sách khách sạn</h1>
          <p className="text-sm text-slate-500">Khám phá các điểm lưu trú chất lượng cao trên toàn quốc</p>
        </div>
      </div>

      {/* Placeholder foundation content */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((id) => (
          <div key={id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md">
            <div className="h-44 bg-slate-200 flex items-center justify-center text-slate-400">
              <Hotel className="h-10 w-10" />
            </div>
            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  4.8 (120 đánh giá)
                </span>
                <span className="text-xs text-slate-500">Khách sạn 5 sao</span>
              </div>
              <h2 className="text-lg font-semibold text-slate-900">Grand Luxury Hotel #{id}</h2>
              <p className="flex items-center text-xs text-slate-500">
                <MapPin className="mr-1 h-3.5 w-3.5" /> Quận 1, TP. Hồ Chí Minh
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div>
                  <span className="text-xs text-slate-500">Giá chỉ từ</span>
                  <p className="text-base font-bold text-blue-600">1.250.000 đ <span className="text-xs font-normal text-slate-500">/đêm</span></p>
                </div>
                <Button size="sm" asChild>
                  <Link to={`/hotels/${id}`}>Xem chi tiết</Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

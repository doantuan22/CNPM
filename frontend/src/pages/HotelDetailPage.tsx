import { useParams, Link } from 'react-router-dom';
import { MapPin, Star, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';

export default function HotelDetailPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/hotels">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách
          </Link>
        </Button>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Grand Luxury Hotel #{id}</h1>
            <p className="flex items-center text-sm text-slate-500 mt-1">
              <MapPin className="mr-1 h-4 w-4 text-slate-400" /> 123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
            </p>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-amber-700">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
            <span className="font-bold">4.8</span>
            <span className="text-xs text-amber-600">(Tuyệt vời)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-72 rounded-2xl bg-slate-200 flex items-center justify-center text-slate-400">
            Hình ảnh khách sạn (Cloudinary integration)
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-xl font-semibold text-slate-900">Giới thiệu khách sạn</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Khách sạn tọa lạc ngay tại trung tâm thành phố, cung cấp trải nghiệm nghỉ dưỡng tiêu chuẩn 5 sao quốc tế
              với đầy đủ các tiện ích: hồ bơi vô cực, nhà hàng ẩm thực Á - Âu, spa cao cấp và phòng hội nghị hiện đại.
            </p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Wi-Fi tốc độ cao miễn phí
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Bữa sáng buffet phong phú
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Lễ tân 24/7
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Đưa đón sân bay
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-semibold text-slate-900">Đặt phòng ngay</h2>
            <p className="text-xs text-slate-500">Chức năng đặt phòng sẽ được mở trong phase tiếp theo.</p>
            <Button className="w-full" disabled>
              Chọn loại phòng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('Đà Nẵng');
  const [checkIn, setCheckIn] = useState('15 Thg 10 2024');
  const [checkOut, setCheckOut] = useState('18 Thg 10 2024');
  const [guests, setGuests] = useState('2 người lớn, 1 phòng');

  const handleSearch = () => {
    navigate(`/hotels?location=${encodeURIComponent(location)}&checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}&guests=${encodeURIComponent(guests)}`);
  };

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    alert('Đăng ký nhận bản tin thành công!');
  };

  return (
    <div className="booking-flow">
      {/* Hero Section */}
      <section className="bg-surface-secondary pt-28 pb-32 lg:pt-36 lg:pb-40 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
          {/* Hero Text */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.15] mb-6 text-ink">
              Khám phá nơi lưu trú <span className="text-primary">phù hợp</span> với bạn
            </h1>
            <p className="text-lg text-ink-muted mb-8 leading-relaxed">
              Tìm kiếm và đặt phòng khách sạn, resort, và homestay tuyệt vời nhất với giá ưu đãi. Trải nghiệm kỳ nghỉ đáng nhớ cùng Egode.
            </p>
            <div className="flex items-center gap-4 text-sm font-medium text-ink-muted">
              <div className="flex items-center gap-1.5"><i className="ph-fill ph-check-circle text-primary text-lg"></i> Hơn 10,000+ chỗ nghỉ</div>
              <div className="flex items-center gap-1.5"><i className="ph-fill ph-check-circle text-primary text-lg"></i> Giá tốt nhất</div>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative hidden lg:block">
            <img src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80" alt="Resort cao cấp" className="rounded-2xl object-cover h-[450px] w-full shadow-xl" />
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-lg flex items-center gap-4">
              <div className="bg-yellow-100 p-2 rounded-full"><i className="ph-fill ph-star text-yellow-500 text-xl"></i></div>
              <div>
                <p className="font-bold text-ink">4.9/5</p>
                <p className="text-xs text-ink-muted">Đánh giá xuất sắc</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Search Box */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-24 z-20">
        <div className="bg-white rounded-2xl shadow-lg p-4 lg:p-6 border border-border flex flex-col lg:flex-row items-center gap-4 lg:gap-0 divide-y lg:divide-y-0 lg:divide-x divide-border">
          <div className="flex-1 w-full lg:px-4 py-2 lg:py-0 group cursor-pointer">
            <div className="flex items-center gap-3">
              <i className="ph ph-map-pin text-2xl text-ink-muted group-hover:text-primary transition-colors"></i>
              <div className="flex flex-col w-full">
                <label className="text-xs font-semibold text-ink mb-1">Địa điểm</label>
                <input type="text" placeholder="Bạn muốn đi đâu?" className="text-sm text-ink-muted outline-none w-full bg-transparent placeholder-ink-muted" value={location} onChange={(e) => setLocation(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex-1 w-full lg:px-4 py-3 lg:py-0 group cursor-pointer">
            <div className="flex items-center gap-3">
              <i className="ph ph-calendar-blank text-2xl text-ink-muted group-hover:text-primary transition-colors"></i>
              <div className="flex flex-col w-full">
                <label className="text-xs font-semibold text-ink mb-1">Ngày nhận phòng</label>
                <input type="text" placeholder="Thêm ngày" className="text-sm text-ink-muted outline-none w-full bg-transparent" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex-1 w-full lg:px-4 py-3 lg:py-0 group cursor-pointer">
            <div className="flex items-center gap-3">
              <i className="ph ph-calendar-check text-2xl text-ink-muted group-hover:text-primary transition-colors"></i>
              <div className="flex flex-col w-full">
                <label className="text-xs font-semibold text-ink mb-1">Ngày trả phòng</label>
                <input type="text" placeholder="Thêm ngày" className="text-sm text-ink-muted outline-none w-full bg-transparent" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="flex-1 w-full lg:px-4 py-3 lg:py-0 group cursor-pointer">
            <div className="flex items-center gap-3">
              <i className="ph ph-users text-2xl text-ink-muted group-hover:text-primary transition-colors"></i>
              <div className="flex flex-col w-full">
                <label className="text-xs font-semibold text-ink mb-1">Khách & phòng</label>
                <input type="text" placeholder="Thêm khách" className="text-sm text-ink-muted outline-none w-full bg-transparent" value={guests} onChange={(e) => setGuests(e.target.value)} />
              </div>
            </div>
          </div>
          <div className="lg:pl-6 w-full lg:w-auto pt-4 lg:pt-0">
            <button type="button" onClick={handleSearch} className="w-full bg-primary hover:bg-primary-700 text-white font-medium text-lg lg:text-base py-3 lg:py-4 px-8 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2">
              <i className="ph ph-magnifying-glass lg:hidden text-xl"></i> Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {/* Popular Destinations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-bold text-ink mb-2">Điểm đến phổ biến</h2>
            <p className="text-ink-muted text-lg">Khám phá những điểm đến được yêu thích nhất tại Việt Nam</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/hotels?location=TP.HCM" className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-md">
              <img src="https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=600&q=80" alt="TP.HCM" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">TP. Hồ Chí Minh</h3>
                <p className="text-sm text-gray-200">2,450 chỗ nghỉ</p>
              </div>
            </Link>
            <Link to="/hotels?location=Đà Lạt" className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-md">
              <img src="https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80" alt="Đà Lạt" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">Đà Lạt</h3>
                <p className="text-sm text-gray-200">1,230 chỗ nghỉ</p>
              </div>
            </Link>
            <Link to="/hotels?location=Đà Nẵng" className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-md">
              <img src="https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&q=80" alt="Đà Nẵng" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">Đà Nẵng</h3>
                <p className="text-sm text-gray-200">1,890 chỗ nghỉ</p>
              </div>
            </Link>
            <Link to="/hotels?location=Nha Trang" className="group relative rounded-2xl overflow-hidden aspect-[4/5] block shadow-md">
              <img src="https://images.unsplash.com/photo-1583417646197-09a800bb347c?auto=format&fit=crop&w=600&q=80" alt="Nha Trang" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6 text-white">
                <h3 className="text-2xl font-bold mb-1">Nha Trang</h3>
                <p className="text-sm text-gray-200">950 chỗ nghỉ</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section id="deals" className="py-20 bg-surface-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row justify-between items-end gap-4 text-center sm:text-left">
            <div>
              <h2 className="text-3xl font-bold text-ink mb-2">Khách sạn nổi bật</h2>
              <p className="text-ink-muted text-lg">Những lựa chọn lưu trú đẳng cấp với đánh giá tốt nhất</p>
            </div>
            <Link to="/hotels" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
              Xem tất cả <i className="ph ph-arrow-right"></i>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <HotelCard id={1} name="InterContinental Danang Sun Peninsula Resort" rating={4.9} location="Sơn Trà, Đà Nẵng" price="8.500.000 đ" img="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80" amenities={['Hồ bơi', 'Spa', 'Bãi biển riêng']} />
            <HotelCard id={2} name="Hotel de la Coupole - MGallery" rating={4.8} location="Sapa, Lào Cai" price="3.200.000 đ" img="https://images.unsplash.com/photo-1551882547-ff40c0d509af?auto=format&fit=crop&w=600&q=80" amenities={['Bể bơi nước nóng', 'Spa']} />
            <HotelCard id={3} name="Mia Resort Nha Trang" rating={4.7} location="Cam Lâm, Khánh Hòa" price="4.100.000 đ" img="https://images.unsplash.com/photo-1542314831-c6a4d14d8c53?auto=format&fit=crop&w=600&q=80" amenities={['Villa hồ bơi', 'Yoga', 'Nhà hàng']} />
            <HotelCard id={4} name="Six Senses Ninh Van Bay" rating={5.0} location="Ninh Hòa, Khánh Hòa" price="12.000.000 đ" img="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80" amenities={['Eco-friendly', 'Spa', 'Gym']} />
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ink">Tại sao chọn Egode?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <BenefitCard icon="ph-shield-check" title="Đặt phòng an toàn" desc="Hệ thống thanh toán bảo mật tuyệt đối, bảo vệ thông tin cá nhân của bạn." />
            <BenefitCard icon="ph-magnifying-glass-plus" title="Tìm kiếm dễ dàng" desc="Bộ lọc thông minh giúp bạn tìm được chỗ nghỉ ưng ý trong vài giây." />
            <BenefitCard icon="ph-lightning" title="Xác nhận nhanh" desc="Nhận email xác nhận ngay lập tức sau khi hoàn tất đặt phòng." />
            <BenefitCard icon="ph-headset" title="Hỗ trợ khi cần" desc="Đội ngũ CSKH tận tâm sẵn sàng hỗ trợ bạn 24/7 trong suốt chuyến đi." />
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-white border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-surface-secondary p-8 rounded-2xl border border-border">
            <p className="text-lg font-semibold text-ink mb-2 flex items-center justify-center gap-2">
              <i className="ph-fill ph-envelope-simple text-primary"></i> Đăng ký nhận bản tin
            </p>
            <p className="text-sm text-ink-muted mb-5">Nhận ưu đãi độc quyền và khuyến mãi mới nhất qua email</p>
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 justify-center">
              <input type="email" required placeholder="Email của bạn" className="w-full sm:w-72 bg-white border border-border text-sm px-4 py-2.5 rounded-lg outline-none focus:border-primary" />
              <button type="submit" className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-700 text-sm font-medium transition-colors">Gửi</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function HotelCard({ id, name, rating, location, price, img, amenities }: any) {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-border shadow-md hover:shadow-lg transition-shadow flex flex-col h-full">
      <div className="relative h-48 w-full">
        <img src={img} alt={name} className="w-full h-full object-cover" />
        <div className="absolute top-3 right-3 bg-white p-1.5 rounded-full text-ink-muted hover:text-red-500 cursor-pointer transition-colors shadow-sm">
          <i className="ph ph-heart text-xl"></i>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2 gap-2">
          <h3 className="font-bold text-lg text-ink leading-tight line-clamp-2">{name}</h3>
          <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-md text-sm font-semibold whitespace-nowrap">
            <i className="ph-fill ph-star"></i> {rating}
          </div>
        </div>
        <p className="text-ink-muted text-sm mb-4 flex items-start gap-1">
          <i className="ph-fill ph-map-pin text-primary mt-0.5"></i> {location}
        </p>
        <div className="flex flex-wrap gap-2 mb-6">
          {amenities.map((a: string) => <span key={a} className="bg-gray-100 text-ink-muted text-xs px-2.5 py-1 rounded-lg">{a}</span>)}
        </div>
        <div className="mt-auto flex items-end justify-between">
          <div>
            <p className="text-xs text-ink-muted mb-0.5">Bắt đầu từ</p>
            <p className="font-bold text-lg text-primary">{price} <span className="text-sm font-normal text-ink-muted">/ đêm</span></p>
          </div>
          <Link to={`/hotels/${id}`} className="text-primary font-semibold text-sm hover:underline">Xem chi tiết</Link>
        </div>
      </div>
    </div>
  );
}

function BenefitCard({ icon, title, desc }: any) {
  return (
    <div className="text-center p-6">
      <div className="w-16 h-16 mx-auto bg-surface-secondary rounded-2xl flex items-center justify-center text-3xl text-primary mb-6 shadow-sm">
        <i className={`ph ${icon}`}></i>
      </div>
      <h3 className="font-bold text-lg mb-2 text-ink">{title}</h3>
      <p className="text-ink-muted text-sm">{desc}</p>
    </div>
  );
}


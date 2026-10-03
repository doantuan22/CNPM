import { Link } from 'react-router-dom';
import type { HotelSearchItem } from '../../features/hotels/types';
import { formatCurrencyVND } from '../../lib/utils';
import { RemoteImage } from '../common/RemoteImage';

const HOTEL_TAGS = [
  'Bãi biển riêng',
  'Bãi đỗ xe',
  'Ban công',
  'Bồn tắm',
  'Bữa sáng miễn phí',
  'Cho phép thú cưng',
  'Điều hòa nhiệt độ',
  'Đưa đón sân bay',
  'Hồ bơi',
  'Wi-Fi miễn phí',
  'Nhà hàng',
  'Spa & Massage',
] as const;

function getHotelTags(hotelId: number) {
  const count = 2 + (hotelId % 2); // 2-3 tags per hotel
  const tags: string[] = [];
  let index = Math.abs((hotelId * 7 + 3) % HOTEL_TAGS.length);
  const step = 5;

  while (tags.length < count) {
    const tag = HOTEL_TAGS[index % HOTEL_TAGS.length];
    if (!tags.includes(tag)) tags.push(tag);
    index += step;
  }

  return tags;
}

/** Search result card with resilient remote-image rendering and booking-focused information. */
export function HotelCard({ hotel, search }: { hotel: HotelSearchItem; search: string }) {
  const detailUrl = `/hotels/${hotel.MaKhachSan}?${search}`;
  const hotelTags = getHotelTags(hotel.MaKhachSan);
  const locationText = [hotel.DiaPhuong.TenThanhPho, hotel.DiaPhuong.TenTinh]
    .filter((value, index, values) => value && values.indexOf(value) === index)
    .join(', ');

  const imageFallback = (
    <span className="hotel-card-v2__fallback" aria-label="Không tải được ảnh khách sạn">
      <i className="ph ph-image-broken" aria-hidden="true" />
      <small>Ảnh đang được cập nhật</small>
    </span>
  );

  return (
    <article className="hotel-card-v2">
      <Link className="hotel-card-v2__media" to={detailUrl} aria-label={`Xem phòng tại ${hotel.TenKhachSan}`}>
        <RemoteImage
          src={hotel.AnhDaiDien}
          alt={`Ảnh ${hotel.TenKhachSan}`}
          width={360}
          height={250}
          loading="lazy"
          decoding="async"
          fallback={imageFallback}
        />
        {hotel.HangSao > 0 && (
          <span className="hotel-card-v2__star-badge" aria-label={`${hotel.HangSao} sao`}>
            <i className="ph-fill ph-star" aria-hidden="true" />
            {hotel.HangSao} sao
          </span>
        )}
      </Link>

      <div className="hotel-card-v2__identity">
        <div className="hotel-card-v2__title-row">
          <h2><Link to={detailUrl}>{hotel.TenKhachSan}</Link></h2>
        </div>

        <p className="hotel-card-v2__location">
          <i className="ph ph-map-pin" aria-hidden="true" />
          <span>{locationText}</span>
        </p>

        <p className="hotel-card-v2__address" title={hotel.DiaChiChiTiet}>
          {hotel.DiaChiChiTiet}
        </p>

        <div className="hotel-card-v2__tags" aria-label="Tiện nghi nổi bật">
          {hotelTags.map((tag) => (
            <span key={tag} className="hotel-card-v2__tag">{tag}</span>
          ))}
        </div>

        <div className={`hotel-card-v2__availability ${hotel.ConPhong ? 'is-available' : 'is-unavailable'}`}>
          <i className={`ph ${hotel.ConPhong ? 'ph-check-circle' : 'ph-minus-circle'}`} aria-hidden="true" />
          <span>{hotel.ConPhong ? 'Còn phòng trong ngày bạn chọn' : 'Hết phòng trong ngày bạn chọn'}</span>
        </div>
      </div>

      <div className="hotel-card-v2__commercial">
        <div className="hotel-card-v2__price-block">
          <span className="hotel-card-v2__price-label">Giá từ / đêm</span>
          {hotel.GiaTuDauTu !== null ? (
            <strong>{formatCurrencyVND(hotel.GiaTuDauTu)}</strong>
          ) : (
            <strong className="hotel-card-v2__price-empty">Chưa có giá</strong>
          )}
          <span className="hotel-card-v2__price-note">1 phòng · 1 đêm</span>
        </div>

        <Link to={detailUrl} className="hotel-card-v2__action">
          {hotel.ConPhong ? 'Xem phòng' : 'Xem khách sạn'}
          <i className="ph ph-arrow-right" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

import { formatDateVi } from '../../lib/utils';

export function StayContext({ location, checkIn, checkOut, guests, roomCount, compact = false }: {
  location?: string;
  checkIn: string;
  checkOut: string;
  guests?: number;
  roomCount?: number;
  compact?: boolean;
}) {
  return (
    <dl className={`stay-context${compact ? ' stay-context--compact' : ''}`}>
      {location && <div><dt>Điểm đến</dt><dd>{location}</dd></div>}
      <div><dt>Nhận phòng</dt><dd>{formatDateVi(checkIn)}</dd></div>
      <div><dt>Trả phòng</dt><dd>{formatDateVi(checkOut)}</dd></div>
      {typeof guests === 'number' && <div><dt>Khách</dt><dd>{guests}</dd></div>}
      {typeof roomCount === 'number' && <div><dt>Phòng</dt><dd>{roomCount}</dd></div>}
    </dl>
  );
}

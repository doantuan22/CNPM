import { Button } from '../../common/Button';

interface MobileBookingBarProps {
  roomCount: number;
  /** Already-formatted total, or the status text while there is no total yet. */
  total: string;
  onOpenPanel: () => void;
}

/** Fixed summary of the selected rooms on small screens, where the booking panel is at the bottom of the page. */
export function MobileBookingBar({ roomCount, total, onOpenPanel }: MobileBookingBarProps) {
  return (
    <div className="hotel-mobile-bar lg:hidden" role="region" aria-label="Tóm tắt lựa chọn phòng">
      <div className="min-w-0">
        <p className="text-xs text-ink-muted">{roomCount} phòng</p>
        <p className="truncate text-base font-bold text-ink">{total}</p>
      </div>
      <Button type="button" className="shrink-0" onClick={onOpenPanel}>Xem chi tiết & đặt phòng</Button>
    </div>
  );
}

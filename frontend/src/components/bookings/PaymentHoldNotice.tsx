import { Clock } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import { formatCountdown, formatDateTimeVi } from '../../lib/utils';

/**
 * Tells the customer that a booking is created but NOT yet paid, until when the room is held and how long
 * is left. `secondsLeft` (server clock) and `deadline` come from the booking; `startedAt` is when that data
 * arrived. At 0 it calls `onExpire` so the page can fetch the real status (the server cancels an unpaid booking
 * when it is next read).
 */
export function PaymentHoldNotice({ deadline, secondsLeft, startedAt, justBooked = false, onExpire }: {
  deadline: string;
  secondsLeft: number;
  startedAt: number;
  justBooked?: boolean;
  onExpire: () => void;
}) {
  const remaining = useCountdown(secondsLeft, startedAt, onExpire) ?? secondsLeft;
  const expired = remaining <= 0;

  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-labelledby="payment-hold-title">
      <div className="flex items-start gap-4">
        <span className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-full bg-amber-100 text-amber-700"><Clock className="h-5 w-5" aria-hidden="true" /></span>
        <div className="min-w-0 flex-1">
          <h2 id="payment-hold-title" className="text-lg font-bold text-ink">{justBooked ? 'Đã tạo đơn đặt phòng' : 'Đơn đang chờ thanh toán'}</h2>
          {expired ? (
            <p className="mt-1 text-sm text-ink-muted" role="status">Đã hết thời gian giữ chỗ. Đang cập nhật trạng thái đơn…</p>
          ) : (
            <>
              <p className="mt-1 text-sm text-ink-muted">Phòng đang được giữ cho bạn. Vui lòng thanh toán trước {formatDateTimeVi(deadline)} để hoàn tất đặt phòng.</p>
              <p className="mt-3 flex items-baseline gap-2 text-sm text-ink-muted">
                <span>Thời gian giữ chỗ còn lại</span>
                <span role="timer" className="text-2xl font-bold tabular-nums text-amber-700">{formatCountdown(remaining)}</span>
              </p>
              <p className="mt-2 text-xs text-ink-muted">Quá hạn, đơn sẽ tự hủy và phòng được trả lại.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

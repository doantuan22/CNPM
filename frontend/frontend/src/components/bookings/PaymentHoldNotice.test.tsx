import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PaymentHoldNotice } from './PaymentHoldNotice';

const T0 = new Date('2030-01-01T10:00:00.000Z').getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(T0);
});
afterEach(() => vi.useRealTimers());

const deadline = '2030-01-01T10:15:00.000Z';

describe('PaymentHoldNotice', () => {
  it('tells the customer the room is held, until when, and how long is left', () => {
    render(<PaymentHoldNotice deadline={deadline} secondsLeft={900} startedAt={T0} onExpire={() => undefined} />);

    expect(screen.getByRole('timer')).toHaveTextContent('15:00');
    expect(screen.getByText(/Vui lòng thanh toán trước/)).toHaveTextContent(/2030/);
    expect(screen.getByText(/đơn sẽ tự hủy/)).toBeInTheDocument();
  });

  it('counts down on screen', () => {
    render(<PaymentHoldNotice deadline={deadline} secondsLeft={900} startedAt={T0} onExpire={() => undefined} />);

    act(() => { vi.advanceTimersByTime(61_000); });

    expect(screen.getByRole('timer')).toHaveTextContent('13:59');
  });

  it('is not a success message: the booking is created but not paid', () => {
    render(<PaymentHoldNotice deadline={deadline} secondsLeft={900} startedAt={T0} justBooked onExpire={() => undefined} />);

    expect(screen.getByRole('heading', { name: 'Đã tạo đơn đặt phòng' })).toBeInTheDocument();
    expect(screen.queryByText(/thành công/i)).not.toBeInTheDocument();
  });

  it('uses a plain heading when the customer comes back to the booking later', () => {
    render(<PaymentHoldNotice deadline={deadline} secondsLeft={900} startedAt={T0} onExpire={() => undefined} />);
    expect(screen.getByRole('heading', { name: 'Đơn đang chờ thanh toán' })).toBeInTheDocument();
  });

  it('when time runs out it asks for the real status once and says so', () => {
    const onExpire = vi.fn();
    render(<PaymentHoldNotice deadline={deadline} secondsLeft={2} startedAt={T0} onExpire={onExpire} />);

    act(() => { vi.advanceTimersByTime(2000); });

    expect(onExpire).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Đã hết thời gian giữ chỗ/)).toBeInTheDocument();
  });
});

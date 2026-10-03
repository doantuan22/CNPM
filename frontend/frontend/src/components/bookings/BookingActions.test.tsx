import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { BookingActions, type BookingActionsProps } from './BookingActions';

const base = (patch: Partial<BookingActionsProps> = {}): BookingActionsProps => ({
  canPay: false, canCancel: false, onPay: vi.fn(), isPaying: false, payError: null,
  onCancel: vi.fn(), isCancelling: false, cancelError: null, refundPreview: { paid: 0, percent: 0, amount: 0 }, ...patch,
});

describe('BookingActions', () => {
  it('renders nothing when the booking can be neither paid nor cancelled', () => {
    const { container } = render(<BookingActions {...base()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('offers payment for a booking waiting for it', async () => {
    const props = base({ canPay: true, canCancel: true });
    render(<BookingActions {...props} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Thanh toán ngay' }));

    expect(props.onPay).toHaveBeenCalledOnce();
    expect(screen.getByRole('button', { name: 'Hủy đặt phòng này' })).toBeInTheDocument();
  });

  it('only offers cancellation for a confirmed booking', () => {
    render(<BookingActions {...base({ canCancel: true })} />);
    expect(screen.queryByRole('button', { name: 'Thanh toán ngay' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hủy đặt phòng này' })).toBeInTheDocument();
  });

  it('shows the refund the cancellation would give before asking to confirm, and sends the reason', async () => {
    const props = base({ canCancel: true, refundPreview: { paid: 1000000, percent: 50, amount: 500000 } });
    render(<BookingActions {...props} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Hủy đặt phòng này' }));
    expect(screen.getByText('Dự kiến hoàn (50%):')).toBeInTheDocument();
    expect(props.onCancel).not.toHaveBeenCalled();

    await user.type(screen.getByLabelText('Lý do hủy (không bắt buộc)'), '  Đổi lịch  ');
    await user.click(screen.getByRole('button', { name: 'Xác nhận hủy' }));
    expect(props.onCancel).toHaveBeenCalledWith('Đổi lịch', expect.any(Function));
  });

  it('says there is no refund for an unpaid booking, and "Không hủy" goes back without cancelling', async () => {
    const props = base({ canCancel: true });
    render(<BookingActions {...props} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Hủy đặt phòng này' }));
    expect(screen.getByText('Đơn này chưa thanh toán nên sẽ không có hoàn tiền.')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Không hủy' }));

    expect(props.onCancel).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Hủy đặt phòng này' })).toBeInTheDocument();
  });

  it('closes the confirmation once the page reports the cancellation went through', async () => {
    const onCancel = vi.fn((_note: string | undefined, onDone: () => void) => onDone());
    render(<BookingActions {...base({ canCancel: true, onCancel })} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Hủy đặt phòng này' }));
    await user.click(screen.getByRole('button', { name: 'Xác nhận hủy' }));

    expect(screen.queryByText('Xác nhận hủy đặt phòng?')).not.toBeInTheDocument();
  });
});

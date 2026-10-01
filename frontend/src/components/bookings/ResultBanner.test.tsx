import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResultBanner } from './ResultBanner';

describe('ResultBanner', () => {
  it('announces success and pending as a status, with the title as the page heading', () => {
    const { rerender } = render(<ResultBanner tone="success" title="Thanh toán thành công!" description="Cảm ơn bạn." />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Thanh toán thành công!' })).toBeInTheDocument();

    rerender(<ResultBanner tone="pending" title="Đang xử lý" />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('leaves the announcement of an error to its own message, so it is read out once', () => {
    render(
      <ResultBanner tone="error" title="Thanh toán không thành công" actions={<a href="/bookings/1">Về chi tiết đơn</a>}>
        <p role="alert">Số dư không đủ</p>
      </ResultBanner>
    );

    expect(screen.getAllByRole('alert')).toHaveLength(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Về chi tiết đơn' })).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { KpiCard } from './KpiCard';

describe('KpiCard', () => {
  it('shows the figure and how it moved against the previous period', () => {
    render(<KpiCard label="Công suất phòng" value="62%" change={{ text: '+4 điểm % so với kỳ trước', tone: 'good' }} />);
    expect(screen.getByText('62%')).toBeInTheDocument();
    expect(screen.getByText('+4 điểm % so với kỳ trước')).toHaveClass('text-success-ink');
  });

  it('colours a bad move as a warning and says so when there is nothing to compare with', () => {
    const { rerender } = render(<KpiCard label="ADR" value="600.000 đ" change={{ text: '−10% so với kỳ trước', tone: 'bad' }} />);
    expect(screen.getByText('−10% so với kỳ trước')).toHaveClass('text-danger-ink');

    rerender(<KpiCard label="ADR" value="600.000 đ" change={null} note="Ước tính" />);
    expect(screen.getByText('Chưa có dữ liệu kỳ trước')).toBeInTheDocument();
    expect(screen.getByText('Ước tính')).toBeInTheDocument();
  });
});

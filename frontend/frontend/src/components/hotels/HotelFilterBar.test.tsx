import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HotelFilterBar } from './HotelFilterBar';

const amenities = [{ MaTienNghi: 1, TenTienNghi: 'Hồ bơi', BieuTuong: null }, { MaTienNghi: 2, TenTienNghi: 'Bữa sáng', BieuTuong: null }];
const handlers = () => ({ onPriceChange: vi.fn(), onStarChange: vi.fn(), onAmenityToggle: vi.fn(), onReset: vi.fn() });

describe('HotelFilterBar', () => {
  it('marks the filters that are on and offers a reset only then', () => {
    const { rerender } = render(<HotelFilterBar values={{}} amenities={amenities} {...handlers()} />);
    expect(screen.queryByRole('button', { name: /Đặt lại/ })).not.toBeInTheDocument();

    rerender(<HotelFilterBar values={{ starRating: 4, amenities: [2] }} amenities={amenities} {...handlers()} />);
    expect(screen.getByRole('button', { name: /^4\s*sao$/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /^5\s*sao$/ })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Bữa sáng' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /Đặt lại/ })).toBeInTheDocument();
  });

  it('picks and clears a star rating', async () => {
    const h = handlers();
    const { rerender } = render(<HotelFilterBar values={{}} amenities={undefined} {...h} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /^5\s*sao$/ }));
    expect(h.onStarChange).toHaveBeenLastCalledWith(5);

    rerender(<HotelFilterBar values={{ starRating: 5 }} amenities={undefined} {...h} />);
    await user.click(screen.getByRole('button', { name: /^5\s*sao$/ }));
    expect(h.onStarChange).toHaveBeenLastCalledWith(undefined);
  });

  it('toggles an amenity', async () => {
    const h = handlers();
    render(<HotelFilterBar values={{}} amenities={amenities} {...h} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Hồ bơi' }));
    expect(h.onAmenityToggle).toHaveBeenCalledWith(1);
  });

  it('commits a price bound on blur or Enter, and an emptied box clears it', async () => {
    const h = handlers();
    render(<HotelFilterBar values={{ maxPrice: 900000 }} amenities={undefined} {...h} />);
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Giá tối thiểu'), '500000{Enter}');
    expect(h.onPriceChange).toHaveBeenLastCalledWith('minPrice', '500000');

    await user.clear(screen.getByLabelText('Giá tối đa'));
    await user.tab();
    expect(h.onPriceChange).toHaveBeenLastCalledWith('maxPrice', undefined);
  });
});

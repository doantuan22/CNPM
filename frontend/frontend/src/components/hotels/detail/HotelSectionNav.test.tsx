import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HotelSectionNav } from './HotelSectionNav';

const sections = [{ id: 'loai-phong', label: 'Phòng' }, { id: 'tien-nghi', label: 'Tiện nghi' }];

describe('HotelSectionNav', () => {
  it('links to each section and marks only the active one as the current location', () => {
    render(<HotelSectionNav sections={sections} activeId="tien-nghi" onSelect={vi.fn()} />);

    expect(screen.getByRole('link', { name: 'Phòng' })).toHaveAttribute('href', '#loai-phong');
    expect(screen.getByRole('link', { name: 'Phòng' })).not.toHaveAttribute('aria-current');
    expect(screen.getByRole('link', { name: 'Tiện nghi' })).toHaveAttribute('aria-current', 'location');
  });

  it('reports the section that was clicked', async () => {
    const onSelect = vi.fn();
    render(<HotelSectionNav sections={sections} activeId="loai-phong" onSelect={onSelect} />);

    await userEvent.setup().click(screen.getByRole('link', { name: 'Tiện nghi' }));

    expect(onSelect).toHaveBeenCalledWith('tien-nghi');
  });
});

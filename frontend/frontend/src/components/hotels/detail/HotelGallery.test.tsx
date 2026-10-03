import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HotelGallery } from './HotelGallery';

const images = (count: number) => Array.from({ length: count }, (_, i) => ({ MaHinhAnh: i + 1, URL: `/img-${i + 1}.jpg`, AnhDaiDien: i === 0 }));

describe('HotelGallery', () => {
  it('says so when the hotel has no photos', () => {
    render(<HotelGallery hotelName="Khách sạn thử" images={[]} onOpen={vi.fn()} />);
    expect(screen.getByText('Chưa có hình ảnh')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('shows a single photo without the small ones or a "see all" button', () => {
    render(<HotelGallery hotelName="Khách sạn thử" images={images(1)} onOpen={vi.fn()} />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Xem ảnh lớn 1' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Xem \d+ ảnh/ })).not.toBeInTheDocument();
  });

  it('shows one large and up to four small photos, without "see all" while all of them fit', () => {
    render(<HotelGallery hotelName="Khách sạn thử" images={images(3)} onOpen={vi.fn()} />);
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: /Xem tất cả/ })).not.toBeInTheDocument();
  });

  it('puts "Xem tất cả N ảnh" on the last small photo when there are more than five', () => {
    render(<HotelGallery hotelName="Khách sạn thử" images={images(8)} onOpen={vi.fn()} />);
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Xem tất cả 8 ảnh' })).toBeInTheDocument();
  });

  it('opens the viewer on the photo that was clicked', async () => {
    const onOpen = vi.fn();
    render(<HotelGallery hotelName="Khách sạn thử" images={images(8)} onOpen={onOpen} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Xem ảnh lớn 3' }));
    expect(onOpen).toHaveBeenLastCalledWith(2);
    await user.click(screen.getByRole('button', { name: 'Xem tất cả 8 ảnh' }));
    expect(onOpen).toHaveBeenLastCalledWith(4);
    await user.click(screen.getByRole('button', { name: 'Xem ảnh lớn 1' }));
    expect(onOpen).toHaveBeenLastCalledWith(0);
  });
});

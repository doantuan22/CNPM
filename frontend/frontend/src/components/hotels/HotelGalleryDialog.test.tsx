import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { HotelGalleryDialog } from './HotelGalleryDialog';

const images = [
  { MaHinhAnh: 1, URL: 'https://img.test/1.jpg' },
  { MaHinhAnh: 2, URL: 'https://img.test/2.jpg' },
  { MaHinhAnh: 3, URL: 'https://img.test/3.jpg' },
];

describe('HotelGalleryDialog', () => {
  it('stays closed until an image index is given', () => {
    render(<HotelGalleryDialog hotelName="Khách sạn thử" images={images} startIndex={null} onClose={vi.fn()} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens as a labelled dialog listing every photo', () => {
    render(<HotelGalleryDialog hotelName="Khách sạn thử" images={images} startIndex={1} onClose={vi.fn()} />);

    const dialog = screen.getByRole('dialog', { name: 'Ảnh Khách sạn thử' });
    expect(dialog).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Ảnh 2 / 3' })).toHaveAttribute('src', 'https://img.test/2.jpg');
  });

  it('scrolls the chosen photo into view', () => {
    Element.prototype.scrollIntoView = vi.fn();
    render(<HotelGalleryDialog hotelName="Khách sạn thử" images={images} startIndex={2} onClose={vi.fn()} />);

    return vi.waitFor(() => {
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
      expect(vi.mocked(Element.prototype.scrollIntoView).mock.contexts[0]).toBe(screen.getByRole('img', { name: 'Ảnh 3 / 3' }).closest('li'));
    });
  });

  it('reports closing from the close button', async () => {
    const onClose = vi.fn();
    render(<HotelGalleryDialog hotelName="Khách sạn thử" images={images} startIndex={0} onClose={onClose} />);

    await userEvent.setup().click(screen.getByRole('button', { name: 'Đóng thư viện ảnh' }));

    expect(onClose).toHaveBeenCalled();
  });
});

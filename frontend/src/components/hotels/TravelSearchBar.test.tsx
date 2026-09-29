import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../../test/testUtils';
import { TravelSearchBar } from './TravelSearchBar';

vi.mock('../../features/locations/hooks', () => ({
  useLocations: () => ({ data: [{ TenThanhPho: 'Hà Nội' }, { TenThanhPho: 'Đà Nẵng' }] }),
}));

describe('TravelSearchBar', () => {
  const currentSearch = { location: 'Hà Nội', checkIn: '2099-05-01', checkOut: '2099-05-03', guests: 2 };
  let onSearch: ReturnType<typeof vi.fn>;

  beforeEach(() => { onSearch = vi.fn(); });

  it('keeps edits as draft until explicit search and submits the selected destination', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelSearchBar currentSearch={currentSearch} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: /Điểm đến Hà Nội/i }));
    const destination = screen.getByRole('combobox', { name: 'Điểm đến' });
    await user.clear(destination);
    await user.type(destination, 'Đà');
    await user.click(await screen.findByRole('option', { name: 'Đà Nẵng' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: /Điểm đến Đà Nẵng/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Tìm kiếm/i }));
    expect(onSearch).toHaveBeenCalledWith({ ...currentSearch, location: 'Đà Nẵng' });
  });

  it('rejects invalid dates and leaves committed search unchanged', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelSearchBar currentSearch={currentSearch} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: /Ngày lưu trú/i }));
    fireEvent.change(screen.getByLabelText('Trả phòng'), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Vui lòng chọn ngày trả phòng');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('keeps a typed custom destination in draft when switching editors', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelSearchBar currentSearch={currentSearch} onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: /Điểm đến Hà Nội/i }));
    await user.clear(screen.getByRole('combobox', { name: 'Điểm đến' }));
    await user.type(screen.getByRole('combobox', { name: 'Điểm đến' }), 'Địa điểm riêng');
    await user.click(screen.getByRole('button', { name: /Ngày lưu trú/i }));
    expect(screen.getByRole('button', { name: /Điểm đến Địa điểm riêng/i })).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('keeps guest adjustments local until submit and preserves the 1–50 limit', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelSearchBar currentSearch={currentSearch} onSearch={onSearch} />);

    await user.click(screen.getByRole('button', { name: /Số khách 2 khách/i }));
    await user.click(screen.getByRole('button', { name: 'Tăng khách' }));
    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText('3', { selector: 'output' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/i }));
    expect(onSearch).toHaveBeenCalledWith({ ...currentSearch, guests: 3 });
  });

  it('does not allow the guest count to exceed 50', async () => {
    const user = userEvent.setup();
    renderWithProviders(<TravelSearchBar currentSearch={{ ...currentSearch, guests: 50 }} onSearch={onSearch} />);
    await user.click(screen.getByRole('button', { name: /Số khách 50 khách/i }));
    expect(screen.getByRole('button', { name: 'Tăng khách' })).toBeDisabled();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('uses the stay variant without editing the fixed hotel destination', async () => {
    const user = userEvent.setup();
    const staySearch = { checkIn: '2099-05-01', checkOut: '2099-05-03', guests: 2 };
    renderWithProviders(<TravelSearchBar variant="stay" currentSearch={staySearch} onSearch={onSearch} />);
    expect(screen.queryByRole('button', { name: /Điểm đến/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Kiểm tra phòng/i }));
    expect(onSearch).toHaveBeenCalledWith(staySearch);
  });
});

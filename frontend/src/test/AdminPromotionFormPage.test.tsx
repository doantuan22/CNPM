import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { renderWithProviders } from './testUtils';
import AdminPromotionFormPage from '../pages/AdminPromotionFormPage';
import * as promotionsApi from '../features/promotions/api';
import { ApiError } from '../services/apiClient';
import type { PromotionDetail } from '../features/promotions/types';

vi.mock('../features/promotions/api');

beforeEach(() => {
  vi.clearAllMocks();
});

const renderCreatePage = () =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/promotions/new" element={<AdminPromotionFormPage />} />
      <Route path="/admin/promotions/:id" element={<AdminPromotionFormPage />} />
    </Routes>,
    { route: '/admin/promotions/new' }
  );

const renderEditPage = (id = '1') =>
  renderWithProviders(
    <Routes>
      <Route path="/admin/promotions/:id" element={<AdminPromotionFormPage />} />
    </Routes>,
    { route: `/admin/promotions/${id}` }
  );

const sampleDetail: PromotionDetail = {
  MaKhuyenMai: 1,
  MaCode: 'SALE10',
  LoaiGiamGia: 'Phần trăm',
  GiaTriGiam: 10,
  GiaTriDonToiThieu: 100000,
  MucGiamToiDa: 50000,
  SoLuongGioiHan: 100,
  NgayBatDau: '2026-01-01T00:00:00.000Z',
  NgayKetThuc: '2026-12-31T00:00:00.000Z',
  PhamViApDung: 'Toàn hệ thống',
  TrangThai: 'Hoạt động',
  SoLuongDaSuDung: 3,
};

describe('AdminPromotionFormPage — create', () => {
  it('creates a promotion and navigates to its detail page', async () => {
    const user = userEvent.setup();
    vi.mocked(promotionsApi.createPromotion).mockResolvedValueOnce({ ...sampleDetail, MaKhuyenMai: 42 });
    vi.mocked(promotionsApi.getPromotion).mockResolvedValue({ ...sampleDetail, MaKhuyenMai: 42 }); // the post-create navigation mounts the edit page
    renderCreatePage();

    await user.type(screen.getByLabelText(/mã khuyến mãi/i), 'newcode');
    await user.type(screen.getByLabelText(/ngày bắt đầu/i), '2026-01-01');
    await user.type(screen.getByLabelText(/ngày kết thúc/i), '2026-12-31');
    await user.click(screen.getByRole('button', { name: /^tạo mã$/i }));

    await waitFor(() =>
      expect(promotionsApi.createPromotion).toHaveBeenCalledWith(
        expect.objectContaining({ MaCode: 'NEWCODE', NgayBatDau: '2026-01-01', NgayKetThuc: '2026-12-31' })
      )
    );
  });

  it('shows an error message when creation fails', async () => {
    const user = userEvent.setup();
    vi.mocked(promotionsApi.createPromotion).mockRejectedValueOnce(new ApiError('Mã khuyến mãi đã tồn tại', 409));
    renderCreatePage();

    await user.type(screen.getByLabelText(/mã khuyến mãi/i), 'dup');
    await user.type(screen.getByLabelText(/ngày bắt đầu/i), '2026-01-01');
    await user.type(screen.getByLabelText(/ngày kết thúc/i), '2026-12-31');
    await user.click(screen.getByRole('button', { name: /^tạo mã$/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/đã tồn tại/i);
  });
});

describe('AdminPromotionFormPage — edit', () => {
  it('shows a loading state', () => {
    vi.mocked(promotionsApi.getPromotion).mockReturnValueOnce(new Promise(() => undefined) as never);
    renderEditPage();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('shows an error state for a non-existent promotion', async () => {
    vi.mocked(promotionsApi.getPromotion).mockRejectedValueOnce(new ApiError('Không tìm thấy mã khuyến mãi', 404));
    renderEditPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/không tìm thấy/i);
  });

  it('pre-fills the form and shows usage count + status badge', async () => {
    vi.mocked(promotionsApi.getPromotion).mockResolvedValueOnce(sampleDetail);
    renderEditPage();

    expect(await screen.findByDisplayValue('SALE10')).toBeInTheDocument();
    expect(screen.getByText(/đã sử dụng: 3 lượt/i)).toBeInTheDocument();
    expect(screen.getByText('Hoạt động')).toBeInTheDocument();
  });

  it('saves changes via update', async () => {
    const user = userEvent.setup();
    vi.mocked(promotionsApi.getPromotion).mockResolvedValue(sampleDetail);
    vi.mocked(promotionsApi.updatePromotion).mockResolvedValueOnce({ ...sampleDetail, GiaTriGiam: 20 });
    renderEditPage();

    await screen.findByDisplayValue('SALE10');
    await user.clear(screen.getByLabelText(/giá trị giảm/i));
    await user.type(screen.getByLabelText(/giá trị giảm/i), '20');
    await user.click(screen.getByRole('button', { name: /lưu thay đổi/i }));

    await waitFor(() => expect(promotionsApi.updatePromotion).toHaveBeenCalledWith(1, expect.objectContaining({ GiaTriGiam: 20 })));
  });

  it('toggles status via the "Tắt mã"/"Bật mã" button', async () => {
    const user = userEvent.setup();
    vi.mocked(promotionsApi.getPromotion).mockResolvedValue(sampleDetail);
    vi.mocked(promotionsApi.deactivatePromotion).mockResolvedValueOnce({ ...sampleDetail, TrangThai: 'Ngừng' });
    renderEditPage();

    await user.click(await screen.findByRole('button', { name: /tắt mã/i }));
    await waitFor(() => expect(promotionsApi.deactivatePromotion).toHaveBeenCalledWith(1));
  });
});

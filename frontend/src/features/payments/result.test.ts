import { describe, expect, it } from 'vitest';
import { resolvePaymentResult } from './result';
import type { PaymentStatusResponse } from './types';
import type { PaymentView, RefundView } from '../bookings/types';

const refund = (TrangThai: string, SoTienHoan = 100000): RefundView =>
  ({ MaHoanTien: 1, SoTienHoan, LyDoHoanTien: '', TrangThai, NgayYeuCau: '', NgayHoanTien: null }) as RefundView;

const payment = (TrangThai: string, HoanTien: RefundView[] = [], SoTien = 100000): PaymentView =>
  ({ MaThanhToan: 1, SoTien, PhuongThucThanhToan: 'VNPAY', TrangThai, ThoiGianGiaoDich: '', HoanTien }) as PaymentView;

const status = (TrangThaiDatPhong: string, ThanhToan: PaymentView[]): PaymentStatusResponse =>
  ({ MaDatPhong: 1, MaXacNhanDatPhong: 'EGD-1', TrangThaiDatPhong, ThanhToan });

describe('resolvePaymentResult', () => {
  it('confirmed booking is a success', () => {
    expect(resolvePaymentResult(status('Đã xác nhận', [payment('Thành công')]))).toEqual({ kind: 'confirmed' });
  });

  it('a completed stay whose payment succeeded still reads as a paid booking (link opened again later)', () => {
    expect(resolvePaymentResult(status('Hoàn tất', [payment('Thành công')]))).toEqual({ kind: 'confirmed' });
  });

  it('a completed booking without a successful payment is not reported as paid', () => {
    expect(resolvePaymentResult(status('Hoàn tất', []))).toEqual({ kind: 'processing' });
  });

  it('a failed latest payment is a failure', () => {
    expect(resolvePaymentResult(status('Chờ thanh toán', [payment('Thất bại')]))).toEqual({ kind: 'failed' });
  });

  it('a pending payment on a pending booking is still processing', () => {
    expect(resolvePaymentResult(status('Chờ thanh toán', [payment('Chờ xử lý')]))).toEqual({ kind: 'processing' });
    expect(resolvePaymentResult(status('Chờ thanh toán', []))).toEqual({ kind: 'processing' });
  });

  describe('booking cancelled although a payment succeeded (expired while paying)', () => {
    it('reports a completed full refund', () => {
      expect(resolvePaymentResult(status('Đã hủy', [payment('Thành công', [refund('Thành công')])]))).toEqual({
        kind: 'cancelled-paid', paid: 100000, refunded: 100000, refund: 'refunded',
      });
    });

    it('reports a refund still being processed', () => {
      expect(resolvePaymentResult(status('Đã hủy', [payment('Thành công', [refund('Chờ xử lý')])]))).toMatchObject({ kind: 'cancelled-paid', refunded: 0, refund: 'pending' });
    });

    it('reports a failed refund', () => {
      expect(resolvePaymentResult(status('Đã hủy', [payment('Thành công', [refund('Thất bại')])]))).toMatchObject({ kind: 'cancelled-paid', refund: 'failed' });
    });

    it('reports that no refund was recorded', () => {
      expect(resolvePaymentResult(status('Đã hủy', [payment('Thành công')]))).toMatchObject({ kind: 'cancelled-paid', paid: 100000, refunded: 0, refund: 'none' });
    });

    it('reports a partial refund with the amounts actually refunded', () => {
      expect(resolvePaymentResult(status('Đã hủy', [payment('Thành công', [refund('Thành công', 60000)])]))).toEqual({
        kind: 'cancelled-paid', paid: 100000, refunded: 60000, refund: 'refunded',
      });
    });
  });

  it('a cancelled booking whose payment never succeeded is not reported as paid', () => {
    expect(resolvePaymentResult(status('Đã hủy', [payment('Thất bại')]))).toEqual({ kind: 'failed' });
    expect(resolvePaymentResult(status('Đã hủy', [payment('Chờ xử lý')]))).toEqual({ kind: 'processing' });
  });
});

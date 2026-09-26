import type { PaymentView } from '../bookings/types';

export interface CreatePaymentResponse {
  maThanhToan: number;
  maGiaoDichDoiTac: string;
  paymentUrl: string;
}

export interface PaymentStatusResponse {
  MaDatPhong: number;
  MaXacNhanDatPhong: string;
  TrangThaiDatPhong: string;
  ThanhToan: PaymentView[];
}

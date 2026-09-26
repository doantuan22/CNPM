import { randomBytes } from 'node:crypto';
import { BookingsRepository } from './bookings.repository';
import { enumerateNights, priceRoomLine, buildBookedByDate, toDateKey, type NightlyRate } from '../hotels/availability';
import { evaluatePromotion } from '../quotes/promotion-pricing';
import { AppError } from '../../common/errors/app-error';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';
import type { CreateBookingInput } from './bookings.schemas';

const toNumber = (value: unknown): number => Number(value);

const generateConfirmationCode = (): string => {
  const stamp = Date.now().toString(36).toUpperCase();
  const rand = randomBytes(3).toString('hex').toUpperCase();
  return `BK${stamp}${rand}`; // well under DAT_PHONG.MaXacNhanDatPhong VARCHAR(20)
};

export interface BookingRoomLine {
  MaLoaiPhong: number;
  TenLoaiPhong: string;
  SoLuong: number;
  GiaTheoDem: number | null;
  ThanhTien: number | null;
}

export interface BookingResponse {
  MaDatPhong: number;
  MaXacNhanDatPhong: string;
  MaKhachSan: number;
  NgayNhanPhong: string;
  NgayTraPhong: string;
  SoDem: number;
  ChiTietPhong: BookingRoomLine[];
  TongTienPhong: number;
  KhuyenMai: { MaKhuyenMai: number; MaCode: string; LoaiGiamGia: string; GiaTriGiam: number } | null;
  SoTienGiam: number;
  TongTienThanhToan: number;
  TrangThai: string;
  GhiChu: string | null;
  ChinhSachHuy: {
    MaChinhSachHuy: number;
    TenChinhSach: string;
    MoTa: string;
    ChiTiet: Array<{ SoGioTruocNhanPhong: number; TyLeHoanTien: number }>;
  };
  NgayTao: string;
}

export class BookingsService {
  constructor(private readonly repository: BookingsRepository = new BookingsRepository()) {}

  async createBooking(
    maKhachSan: number,
    maTaiKhoanKhachHang: number,
    input: CreateBookingInput
  ): Promise<BookingResponse> {
    const hotel = await this.repository.findActiveHotel(maKhachSan);
    if (!hotel) throw AppError.notFound('Không tìm thấy khách sạn');

    const nightKeys = enumerateNights(input.checkIn, input.checkOut);
    const requestedIds = input.rooms.map((r) => r.maLoaiPhong);
    const roomTypes = await this.repository.findActiveRoomTypesByIds(maKhachSan, requestedIds);

    const foundIds = new Set(roomTypes.map((rt) => rt.MaLoaiPhong));
    const missing = requestedIds.filter((id) => !foundIds.has(id));
    if (missing.length > 0) {
      throw AppError.badRequest(
        `Loại phòng không hợp lệ hoặc không thuộc khách sạn này: ${missing.join(', ')}`
      );
    }

    return this.repository.runInTransaction(async (tx) => {
      // Everything below is computed fresh from the DB, inside the locked
      // transaction — the client's prior quote (if any) is never trusted.
      const rateRows = await this.repository.lockRatesForUpdate(tx, requestedIds, input.checkIn, input.checkOut);
      const bookedRows = await this.repository.findBookedQuantities(tx, requestedIds, input.checkIn, input.checkOut);

      const ratesByRoomType = new Map<number, Map<string, NightlyRate>>();
      for (const row of rateRows) {
        if (!ratesByRoomType.has(row.MaLoaiPhong)) ratesByRoomType.set(row.MaLoaiPhong, new Map());
        ratesByRoomType.get(row.MaLoaiPhong)!.set(toDateKey(row.NgayApDung), {
          giaPhong: toNumber(row.GiaPhong),
          soLuongPhong: row.SoLuongPhong,
        });
      }

      const bookedByRoomType = new Map<number, Map<string, number>>();
      const bookedRowsByRoomType = new Map<number, typeof bookedRows>();
      for (const row of bookedRows) {
        if (!bookedRowsByRoomType.has(row.MaLoaiPhong)) bookedRowsByRoomType.set(row.MaLoaiPhong, []);
        bookedRowsByRoomType.get(row.MaLoaiPhong)!.push(row);
      }
      for (const [maLoaiPhong, rows] of bookedRowsByRoomType) {
        bookedByRoomType.set(
          maLoaiPhong,
          buildBookedByDate(rows.map((r) => ({ ngayNhanPhong: r.NgayNhanPhong, ngayTraPhong: r.NgayTraPhong, soLuongPhong: r.SoLuongPhong })))
        );
      }

      const chiTietPhong = input.rooms.map((line) => {
        const roomType = roomTypes.find((rt) => rt.MaLoaiPhong === line.maLoaiPhong)!;
        const ratesByDate = ratesByRoomType.get(line.maLoaiPhong) ?? new Map();
        const bookedByDate = bookedByRoomType.get(line.maLoaiPhong) ?? new Map();
        const pricing = priceRoomLine(nightKeys, ratesByDate, bookedByDate, line.soLuong);
        return {
          maLoaiPhong: line.maLoaiPhong,
          tenLoaiPhong: roomType.TenLoaiPhong,
          soLuong: line.soLuong,
          ...pricing,
        };
      });

      const unavailable = chiTietPhong.filter((l) => !l.duPhong || !l.coGiaDayDu);
      if (unavailable.length > 0) {
        const names = unavailable.map((l) => l.tenLoaiPhong).join(', ');
        throw AppError.conflict(`Không còn đủ phòng hoặc thiếu giá cho: ${names}. Vui lòng thử lại với lựa chọn khác.`);
      }

      const tongTienPhong = chiTietPhong.reduce((sum, l) => sum + (l.thanhTien ?? 0), 0);

      let khuyenMai: BookingResponse['KhuyenMai'] = null;
      let soTienGiam = 0;

      if (input.promoCode) {
        const promo = await this.repository.findPromotionByCode(tx, input.promoCode);
        if (!promo) throw AppError.badRequest('Mã khuyến mãi không tồn tại');

        const usedCount = await this.repository.countPromotionUsage(tx, promo.MaKhuyenMai);
        const evalResult = evaluatePromotion(
          {
            MaKhuyenMai: promo.MaKhuyenMai,
            MaCode: promo.MaCode,
            LoaiGiamGia: promo.LoaiGiamGia,
            GiaTriGiam: toNumber(promo.GiaTriGiam),
            GiaTriDonToiThieu: toNumber(promo.GiaTriDonToiThieu),
            MucGiamToiDa: toNumber(promo.MucGiamToiDa),
            SoLuongGioiHan: promo.SoLuongGioiHan,
            NgayBatDau: promo.NgayBatDau,
            NgayKetThuc: promo.NgayKetThuc,
            TrangThai: promo.TrangThai,
          },
          tongTienPhong,
          new Date(),
          usedCount
        );

        // Unlike Quote's soft-fail (which just informs the caller), Booking
        // rejects outright: silently completing at a different total than a
        // promo code the customer explicitly typed would be a surprise charge.
        if (!evalResult.valid) {
          throw AppError.badRequest(evalResult.reason ?? 'Mã khuyến mãi không hợp lệ');
        }

        khuyenMai = {
          MaKhuyenMai: promo.MaKhuyenMai,
          MaCode: promo.MaCode,
          LoaiGiamGia: promo.LoaiGiamGia,
          GiaTriGiam: toNumber(promo.GiaTriGiam),
        };
        soTienGiam = evalResult.discount;
      }

      const tongTienThanhToan = tongTienPhong - soTienGiam;

      const policy = await this.repository.findActiveCancellationPolicy(tx);
      if (!policy) {
        throw AppError.internal('Chưa có chính sách hủy nào đang hoạt động trong hệ thống');
      }

      const maXacNhanDatPhong = generateConfirmationCode();
      const booking = await this.repository.insertBooking(tx, {
        maXacNhanDatPhong,
        maTaiKhoanKhachHang,
        maKhachSan,
        maKhuyenMai: khuyenMai?.MaKhuyenMai ?? null,
        maChinhSachHuy: policy.MaChinhSachHuy,
        ngayNhanPhong: input.checkIn,
        ngayTraPhong: input.checkOut,
        tongTienPhong,
        soTienGiam,
        tongTienThanhToan,
        ghiChu: input.ghiChu ?? null,
      });

      await this.repository.insertBookingLines(
        tx,
        booking.MaDatPhong,
        chiTietPhong.map((l) => ({ maLoaiPhong: l.maLoaiPhong, soLuong: l.soLuong }))
      );

      return {
        MaDatPhong: booking.MaDatPhong,
        MaXacNhanDatPhong: booking.MaXacNhanDatPhong,
        MaKhachSan: maKhachSan,
        NgayNhanPhong: input.checkIn.toISOString().slice(0, 10),
        NgayTraPhong: input.checkOut.toISOString().slice(0, 10),
        SoDem: nightKeys.length,
        ChiTietPhong: chiTietPhong.map((l) => ({
          MaLoaiPhong: l.maLoaiPhong,
          TenLoaiPhong: l.tenLoaiPhong,
          SoLuong: l.soLuong,
          GiaTheoDem: l.giaTheoDem,
          ThanhTien: l.thanhTien,
        })),
        TongTienPhong: tongTienPhong,
        KhuyenMai: khuyenMai,
        SoTienGiam: soTienGiam,
        TongTienThanhToan: tongTienThanhToan,
        TrangThai: BOOKING_STATUS.PENDING_PAYMENT,
        GhiChu: booking.GhiChu,
        ChinhSachHuy: {
          MaChinhSachHuy: policy.MaChinhSachHuy,
          TenChinhSach: policy.TenChinhSach,
          MoTa: policy.MoTa,
          ChiTiet: policy.CHI_TIET_CHINH_SACH_HUY.map((c) => ({
            SoGioTruocNhanPhong: c.SoGioTruocNhanPhong,
            TyLeHoanTien: toNumber(c.TyLeHoanTien),
          })),
        },
        NgayTao: booking.NgayTao.toISOString(),
      };
    });
  }
}

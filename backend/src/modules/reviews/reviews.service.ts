import { ReviewsRepository } from './reviews.repository';
import { CloudinaryIntegration } from '../../integrations/cloudinary.integration';
import { validateReviewImages } from './review-images';
import { completeFinishedBookings } from '../bookings/booking-completion';
import { getPrismaClient } from '../../config/prisma';
import { Prisma } from '../../generated/prisma/client';
import { AppError } from '../../common/errors/app-error';
import { BOOKING_STATUS } from '../../common/constants/hotel-status';
import { REVIEW_STATUS } from '../../common/constants/review';
import type { ApiPaginationMeta } from '../../common/types/api-response';
import type { CreateReviewInput, AdminListReviewsQuery } from './reviews.schemas';

const REVIEW_IMAGE_FOLDER = 'hotel-booking/reviews';

export class ReviewsService {
  constructor(private readonly repository: ReviewsRepository = new ReviewsRepository()) {}

  /** Ownership + eligibility (RB9: booking must actually be "Hoàn tất") — never trusted from the client. */
  private async assertOwnedCompletedBooking(maDatPhong: number, customerId: number) {
    await completeFinishedBookings(getPrismaClient());
    const booking = await this.repository.findBookingForReview(maDatPhong);
    if (!booking) throw AppError.notFound('Không tìm thấy đặt phòng');
    if (booking.MaTaiKhoanKhachHang !== customerId) {
      throw AppError.forbidden('Bạn không có quyền thao tác trên đặt phòng này');
    }
    return booking;
  }

  async createReview(maDatPhong: number, customerId: number, input: CreateReviewInput) {
    const booking = await this.assertOwnedCompletedBooking(maDatPhong, customerId);
    if (booking.TrangThai !== BOOKING_STATUS.COMPLETED) {
      throw AppError.badRequest('Chỉ có thể đánh giá sau khi đặt phòng đã hoàn tất thời gian lưu trú');
    }

    const existing = await this.repository.findByBookingId(maDatPhong);
    if (existing) throw AppError.conflict('Đặt phòng này đã được đánh giá');

    validateReviewImages(input.hinhAnh);
    const imageUrls: string[] = [];
    for (const dataUri of input.hinhAnh ?? []) {
      const uploaded = await CloudinaryIntegration.uploadImage(dataUri, REVIEW_IMAGE_FOLDER);
      imageUrls.push(uploaded.url);
    }

    try {
      return await this.repository.create(
        {
          maDatPhong,
          maKhachHang: customerId,
          maKhachSan: booking.MaKhachSan,
          diemDanhGia: input.diemDanhGia,
          noiDung: input.noiDung ?? null,
          trangThai: REVIEW_STATUS.PENDING,
        },
        imageUrls
      );
    } catch (err) {
      // RB26 (UQ_DANH_GIA_MaDatPhong) — guards the same-instant double-submit race the findByBookingId check above can't fully close.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
        throw AppError.conflict('Đặt phòng này đã được đánh giá');
      }
      throw err;
    }
  }

  /** null when the customer hasn't reviewed this booking yet — not an error (same convention as GET /partners/me). */
  async getMyReview(maDatPhong: number, customerId: number) {
    await this.assertOwnedCompletedBooking(maDatPhong, customerId);
    return this.repository.findByBookingId(maDatPhong);
  }

  async adminList(query: AdminListReviewsQuery) {
    const { items, total } = await this.repository.listAdmin(query);
    const pagination: ApiPaginationMeta = {
      page: query.page,
      limit: query.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
    return { items, pagination };
  }

  async adminGetById(maDanhGia: number) {
    const review = await this.repository.findByIdAdmin(maDanhGia);
    if (!review) throw AppError.notFound('Không tìm thấy đánh giá');
    return review;
  }

  /** Customer can never reach this — no TrangThai field exists anywhere in the customer-facing create schema, and this action is admin-only routed. */
  async moderate(maDanhGia: number, trangThai: string) {
    const review = await this.repository.findByIdAdmin(maDanhGia);
    if (!review) throw AppError.notFound('Không tìm thấy đánh giá');
    return this.repository.updateStatus(maDanhGia, trangThai);
  }
}

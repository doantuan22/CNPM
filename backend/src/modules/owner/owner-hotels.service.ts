import { OwnerHotelsRepository } from './owner-hotels.repository';
import { AppError } from '../../common/errors/app-error';
import { CloudinaryIntegration } from '../../integrations/cloudinary.integration';
import { extractCloudinaryPublicId } from '../../common/utils/cloudinary-url';
import type { CreateHotelInput, UpdateHotelInput } from './owner-hotels.schemas';
import type { KHACH_SAN } from '../../generated/prisma/client';

const HOTEL_IMAGE_FOLDER = 'hotel-booking/hotels';

export class OwnerHotelsService {
  constructor(private readonly repository: OwnerHotelsRepository = new OwnerHotelsRepository()) {}

  /** Loads a hotel and asserts it belongs to ownerId — 404 if it doesn't exist, 403 if someone else's. */
  async getOwnedHotel(ownerId: number, maKhachSan: number): Promise<KHACH_SAN> {
    const hotel = await this.repository.findById(maKhachSan);
    if (!hotel) throw AppError.notFound('Không tìm thấy khách sạn');
    if (hotel.MaTaiKhoanSoHuu !== ownerId) {
      throw AppError.forbidden('Bạn không có quyền truy cập khách sạn này');
    }
    return hotel;
  }

  async listMine(ownerId: number) {
    return this.repository.listByOwner(ownerId);
  }

  async create(ownerId: number, input: CreateHotelInput) {
    const diaPhuongOk = await this.repository.diaPhuongExists(input.MaDiaPhuong);
    if (!diaPhuongOk) throw AppError.badRequest('Địa phương không tồn tại');

    const now = new Date();
    return this.repository.create(ownerId, {
      TenKhachSan: input.TenKhachSan,
      DiaChiChiTiet: input.DiaChiChiTiet,
      HangSao: input.HangSao,
      MoTa: input.MoTa ?? null,
      GioNhanPhong: input.GioNhanPhong,
      GioTraPhong: input.GioTraPhong,
      MaDiaPhuong: input.MaDiaPhuong,
      // Never owner-approved — an admin approval workflow is a later phase
      // (same documented gap as "no partner-approval endpoint" from M1).
      TrangThai: this.repository.hotelStatusDefault(),
      NgayDangKy: now,
      NgayCapNhat: now,
    });
  }

  async update(ownerId: number, maKhachSan: number, input: UpdateHotelInput) {
    await this.getOwnedHotel(ownerId, maKhachSan);

    if (input.MaDiaPhuong !== undefined) {
      const ok = await this.repository.diaPhuongExists(input.MaDiaPhuong);
      if (!ok) throw AppError.badRequest('Địa phương không tồn tại');
    }

    return this.repository.update(maKhachSan, { ...input, NgayCapNhat: new Date() });
  }

  async replaceAmenities(ownerId: number, maKhachSan: number, amenityIds: number[]) {
    await this.getOwnedHotel(ownerId, maKhachSan);
    const ok = await this.repository.amenitiesExist(amenityIds);
    if (!ok) throw AppError.badRequest('Một hoặc nhiều tiện nghi không tồn tại');
    await this.repository.replaceAmenities(maKhachSan, amenityIds);
    return this.repository.findById(maKhachSan);
  }

  async addImage(ownerId: number, maKhachSan: number, base64Image: string) {
    await this.getOwnedHotel(ownerId, maKhachSan);
    const uploaded = await CloudinaryIntegration.uploadImage(base64Image, HOTEL_IMAGE_FOLDER);
    const isFirst = (await this.repository.countImages(maKhachSan)) === 0;
    return this.repository.addImage(maKhachSan, uploaded.url, isFirst);
  }

  async removeImage(ownerId: number, maKhachSan: number, maHinhAnh: number) {
    await this.getOwnedHotel(ownerId, maKhachSan);
    const image = await this.repository.findImage(maKhachSan, maHinhAnh);
    if (!image) throw AppError.notFound('Không tìm thấy hình ảnh');

    const publicId = extractCloudinaryPublicId(image.URL);
    if (publicId) {
      await CloudinaryIntegration.deleteImage(publicId).catch(() => undefined);
    }
    await this.repository.deleteImage(maHinhAnh);
  }

  async setPrimaryImage(ownerId: number, maKhachSan: number, maHinhAnh: number) {
    await this.getOwnedHotel(ownerId, maKhachSan);
    const image = await this.repository.findImage(maKhachSan, maHinhAnh);
    if (!image) throw AppError.notFound('Không tìm thấy hình ảnh');
    await this.repository.setPrimaryImage(maKhachSan, maHinhAnh);
    return this.repository.findById(maKhachSan);
  }
}

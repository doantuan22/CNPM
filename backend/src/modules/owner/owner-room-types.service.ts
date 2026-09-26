import { OwnerRoomTypesRepository } from './owner-room-types.repository';
import { OwnerHotelsService } from './owner-hotels.service';
import { AppError } from '../../common/errors/app-error';
import { CloudinaryIntegration } from '../../integrations/cloudinary.integration';
import { extractCloudinaryPublicId } from '../../common/utils/cloudinary-url';
import type { CreateRoomTypeInput, UpdateRoomTypeInput } from './owner-room-types.schemas';

const ROOM_IMAGE_FOLDER = 'hotel-booking/room-types';

export class OwnerRoomTypesService {
  constructor(
    private readonly repository: OwnerRoomTypesRepository = new OwnerRoomTypesRepository(),
    private readonly hotelsService: OwnerHotelsService = new OwnerHotelsService()
  ) {}

  /** 404 if the room type doesn't exist, 403 if its hotel belongs to someone else. */
  async getOwnedRoomType(ownerId: number, maLoaiPhong: number) {
    const roomType = await this.repository.findByIdWithHotel(maLoaiPhong);
    if (!roomType) throw AppError.notFound('Không tìm thấy loại phòng');
    if (roomType.KHACH_SAN.MaTaiKhoanSoHuu !== ownerId) {
      throw AppError.forbidden('Bạn không có quyền truy cập loại phòng này');
    }
    return roomType;
  }

  async listForHotel(ownerId: number, maKhachSan: number) {
    await this.hotelsService.getOwnedHotel(ownerId, maKhachSan);
    return this.repository.listForHotel(maKhachSan);
  }

  async create(ownerId: number, maKhachSan: number, input: CreateRoomTypeInput) {
    await this.hotelsService.getOwnedHotel(ownerId, maKhachSan);
    return this.repository.create(maKhachSan, {
      TenLoaiPhong: input.TenLoaiPhong,
      SoGiuong: input.SoGiuong,
      SucChua: input.SucChua,
      DienTich: input.DienTich,
      LoaiGiuong: input.LoaiGiuong,
      MoTa: input.MoTa ?? null,
      TrangThai: this.repository.defaultStatus(),
    });
  }

  async update(ownerId: number, maLoaiPhong: number, input: UpdateRoomTypeInput) {
    await this.getOwnedRoomType(ownerId, maLoaiPhong);
    return this.repository.update(maLoaiPhong, input);
  }

  async replaceAmenities(ownerId: number, maLoaiPhong: number, amenityIds: number[]) {
    await this.getOwnedRoomType(ownerId, maLoaiPhong);
    const ok = await this.repository.amenitiesExist(amenityIds);
    if (!ok) throw AppError.badRequest('Một hoặc nhiều tiện nghi không tồn tại');
    await this.repository.replaceAmenities(maLoaiPhong, amenityIds);
    return this.repository.findByIdWithHotel(maLoaiPhong);
  }

  async addImage(ownerId: number, maLoaiPhong: number, base64Image: string) {
    await this.getOwnedRoomType(ownerId, maLoaiPhong);
    const uploaded = await CloudinaryIntegration.uploadImage(base64Image, ROOM_IMAGE_FOLDER);
    const isFirst = (await this.repository.countImages(maLoaiPhong)) === 0;
    return this.repository.addImage(maLoaiPhong, uploaded.url, isFirst);
  }

  async removeImage(ownerId: number, maLoaiPhong: number, maHinhAnh: number) {
    await this.getOwnedRoomType(ownerId, maLoaiPhong);
    const image = await this.repository.findImage(maLoaiPhong, maHinhAnh);
    if (!image) throw AppError.notFound('Không tìm thấy hình ảnh');

    const publicId = extractCloudinaryPublicId(image.URL);
    if (publicId) {
      await CloudinaryIntegration.deleteImage(publicId).catch(() => undefined);
    }
    await this.repository.deleteImage(maHinhAnh);
  }

  async setPrimaryImage(ownerId: number, maLoaiPhong: number, maHinhAnh: number) {
    await this.getOwnedRoomType(ownerId, maLoaiPhong);
    const image = await this.repository.findImage(maLoaiPhong, maHinhAnh);
    if (!image) throw AppError.notFound('Không tìm thấy hình ảnh');
    await this.repository.setPrimaryImage(maLoaiPhong, maHinhAnh);
    return this.repository.findByIdWithHotel(maLoaiPhong);
  }
}
